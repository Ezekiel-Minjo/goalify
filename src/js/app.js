"use strict";
const API_URL = "http://localhost:3000/goals";
let goals = [];
let currentEditId = null;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadGoals();
});

// Load goals from json-server
async function loadGoals() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch goals");

    goals = await response.json();
    renderGoals();
    updateOverview();
    updateDepositGoalOptions();
  } catch (error) {
    console.error("Error loading goals:", error);
    document.getElementById(
      "goalsContainer"
    ).innerHTML = `<div class="error">Error loading goals. Please make sure json-server is running on port 3000.</div>`;
  }
}

// Render all goals
function renderGoals() {
  const container = document.getElementById("goalsContainer");

  if (goals.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No goals yet. Create your first goal!</p>';
    return;
  }

  container.innerHTML = goals.map((goal) => createGoalCard(goal)).join("");
}

// Create individual goal card HTML
function createGoalCard(goal) {
  const progress =
    goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isCompleted = goal.savedAmount >= goal.targetAmount;

  const deadlineInfo = getDeadlineInfo(goal.deadline, isCompleted);

  return `
                <div class="goal-card">
                    <div class="goal-header">
                        <div class="goal-info">
                            <h3>${goal.name}</h3>
                            <div class="goal-meta">
                                <span class="category-badge">${
                                  goal.category
                                }</span>
                                <span class="deadline ${deadlineInfo.class}">
                                    📅 ${deadlineInfo.text}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>Ksh.${goal.savedAmount.toLocaleString()} / Ksh.${goal.targetAmount.toLocaleString()}</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(
                              100,
                              progress
                            )}%"></div>
                        </div>
                        <div style="margin-top: 8px; font-size: 0.9rem; color: #666;">
                            ${
                              isCompleted
                                ? "🎉 Goal Completed!"
                                : `Ksh.${remaining.toLocaleString()} remaining`
                            }
                        </div>
                    </div>
                    
                    <div class="goal-actions">
                        <button class="btn btn-secondary" onclick="editGoal('${
                          goal.id
                        }')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteGoal('${
                          goal.id
                        }', '${goal.name}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
}

// Get deadline status information
function getDeadlineInfo(deadline, isCompleted) {
  if (isCompleted) {
    return { text: "Completed", class: "completed" };
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Overdue", class: "overdue" };
  } else if (diffDays <= 30) {
    return { text: `${diffDays} days left`, class: "warning" };
  } else {
    return { text: deadlineDate.toLocaleDateString(), class: "" };
  }
}

// Update overview statistics
function updateOverview() {
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const completedGoals = goals.filter(
    (goal) => goal.savedAmount >= goal.targetAmount
  ).length;
  const activeGoals = totalGoals - completedGoals;

  document.getElementById("totalGoals").textContent = totalGoals;
  document.getElementById(
    "totalSaved"
  ).textContent = `Ksh.${totalSaved.toLocaleString()}`;
  document.getElementById("completedGoals").textContent = completedGoals;
  document.getElementById("activeGoals").textContent = activeGoals;
}

// Update deposit goal options
function updateDepositGoalOptions() {
  const select = document.getElementById("depositGoal");
  const incompleteGoals = goals.filter(
    (goal) => goal.savedAmount < goal.targetAmount
  );

  select.innerHTML =
    '<option value="">Choose a goal...</option>' +
    incompleteGoals
      .map(
        (goal) =>
          `<option value="${goal.id}">${
            goal.name
          } (Ksh.${goal.savedAmount.toLocaleString()}/Ksh.${goal.targetAmount.toLocaleString()})</option>`
      )
      .join("");
}

// Open add goal modal
function openAddGoalModal() {
  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Goal";
  document.getElementById("goalName").value = "";
  document.getElementById("targetAmount").value = "";
  document.getElementById("goalCategory").value = "";
  document.getElementById("goalDeadline").value = "";
  document.getElementById("goalModal").style.display = "block";
}

// Edit existing goal
function editGoal(goalId) {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  currentEditId = goalId;
  document.getElementById("modalTitle").textContent = "Edit Goal";
  document.getElementById("goalName").value = goal.name;
  document.getElementById("targetAmount").value = goal.targetAmount;
  document.getElementById("goalCategory").value = goal.category;
  document.getElementById("goalDeadline").value = goal.deadline;
  document.getElementById("goalModal").style.display = "block";
}

// Close modal
function closeModal() {
  document.getElementById("goalModal").style.display = "none";
  currentEditId = null;
}

// Save goal (add or update)
async function saveGoal(event) {
  event.preventDefault();

  const goalData = {
    name: document.getElementById("goalName").value,
    targetAmount: parseFloat(document.getElementById("targetAmount").value),
    category: document.getElementById("goalCategory").value,
    deadline: document.getElementById("goalDeadline").value,
  };

  try {
    let response;

    if (currentEditId) {
      // Update existing goal
      response = await fetch(`${API_URL}/${currentEditId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
    } else {
      // Create new goal
      goalData.savedAmount = 0;
      goalData.createdAt = new Date().toISOString().split("T")[0];

      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
    }

    if (!response.ok) throw new Error("Failed to save goal");

    closeModal();
    loadGoals(); // Reload all goals
  } catch (error) {
    console.error("Error saving goal:", error);
    alert("Error saving goal. Please try again.");
  }
}

// Delete goal
async function deleteGoal(goalId, goalName) {
  if (!confirm(`Are you sure you want to delete "${goalName}"?`)) return;

  try {
    const response = await fetch(`${API_URL}/${goalId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete goal");

    loadGoals(); // Reload all goals
  } catch (error) {
    console.error("Error deleting goal:", error);
    alert("Error deleting goal. Please try again.");
  }
}

// Make deposit to a goal
async function makeDeposit(event) {
  event.preventDefault();

  const goalId = document.getElementById("depositGoal").value;
  const amount = parseFloat(document.getElementById("depositAmount").value);

  if (!goalId || amount <= 0) return;

  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  try {
    const newSavedAmount = goal.savedAmount + amount;

    const response = await fetch(`${API_URL}/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedAmount: newSavedAmount }),
    });

    if (!response.ok) throw new Error("Failed to make deposit");

    // Clear form
    document.getElementById("depositAmount").value = "";
    document.getElementById("depositGoal").value = "";

    loadGoals(); // Reload all goals
  } catch (error) {
    console.error("Error making deposit:", error);
    alert("Error making deposit. Please try again.");
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("goalModal");
  if (event.target === modal) {
    closeModal();
  }
};
