"use strict";

let goals = [];
let currentEditId = null;

// Load initial data
document.addEventListener("DOMContentLoaded", function () {
  const saved = localStorage.getItem("goals");
  if (saved) {
    goals = JSON.parse(saved);
  } else {
    // Preload sample data once
    goals = [
      {
        id: "1",
        name: "Travel Fund - Japan",
        targetAmount: 5000,
        savedAmount: 3400,
        category: "Travel",
        deadline: "2025-12-31",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Emergency Fund",
        targetAmount: 10000,
        savedAmount: 7500,
        category: "Emergency",
        deadline: "2026-06-30",
        createdAt: "2023-05-01",
      },
      {
        id: "3",
        name: "New Laptop",
        targetAmount: 1500,
        savedAmount: 1500,
        category: "Electronics",
        deadline: "2024-07-20",
        createdAt: "2024-03-10",
      },
      {
        id: "4",
        name: "Down Payment - House",
        targetAmount: 50000,
        savedAmount: 12000,
        category: "Real Estate",
        deadline: "2027-12-31",
        createdAt: "2024-02-01",
      },
      {
        id: "5",
        name: "Car Maintenance",
        targetAmount: 800,
        savedAmount: 600,
        category: "Vehicle",
        deadline: "2025-09-15",
        createdAt: "2024-06-01",
      },
      {
        id: "6",
        name: "Education Fund",
        targetAmount: 20000,
        savedAmount: 5000,
        category: "Education",
        deadline: "2028-01-01",
        createdAt: "2024-04-20",
      },
      {
        id: "7",
        name: "Holiday Gifts",
        targetAmount: 1000,
        savedAmount: 200,
        category: "Shopping",
        deadline: "2024-08-10",
        createdAt: "2024-07-01",
      },
      {
        id: "8",
        name: "New Phone",
        targetAmount: 1200,
        savedAmount: 200,
        category: "Electronics",
        deadline: "2025-01-31",
        createdAt: "2024-07-10",
      },
      {
        id: "9",
        name: "Retirement Savings",
        targetAmount: 100000,
        savedAmount: 15000,
        category: "Retirement",
        deadline: "2035-01-01",
        createdAt: "2023-01-01",
      },
      {
        id: "10",
        name: "Home Renovation",
        targetAmount: 7500,
        savedAmount: 1000,
        category: "Home",
        deadline: "2025-03-31",
        createdAt: "2024-05-15",
      },
    ];
    saveToLocalStorage();
  }
  renderGoals();
  updateOverview();
  updateDepositGoalOptions();
});

// Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

// Render goals
function renderGoals() {
  const container = document.getElementById("goalsContainer");
  if (goals.length === 0) {
    container.innerHTML =
      '<p style="text-align: center;">No goals yet. Create your first goal!</p>';
    return;
  }
  container.innerHTML = goals.map((goal) => createGoalCard(goal)).join("");
}

// Create card HTML
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
            <span class="category-badge">${goal.category}</span>
            <span class="deadline ${deadlineInfo.class}">📅 ${
    deadlineInfo.text
  }</span>
          </div>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-info">
          <span>Ksh.${goal.savedAmount.toLocaleString()} / Ksh.${goal.targetAmount.toLocaleString()}</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(
            100,
            progress
          )}%"></div>
        </div>
        <div style="margin-top:8px;">${
          isCompleted
            ? "🎉 Goal Completed!"
            : `Ksh.${remaining.toLocaleString()} remaining`
        }</div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-secondary" onclick="editGoal('${
          goal.id
        }')">✏️ Edit</button>
        <button class="btn btn-danger" onclick="deleteGoal('${
          goal.id
        }')">🗑️ Delete</button>
      </div>
    </div>
  `;
}

function getDeadlineInfo(deadline, isCompleted) {
  if (isCompleted) return { text: "Completed", class: "completed" };
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: "Overdue", class: "overdue" };
  if (diffDays <= 30)
    return { text: `${diffDays} days left`, class: "warning" };
  return { text: deadlineDate.toLocaleDateString(), class: "" };
}

function updateOverview() {
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const completedGoals = goals.filter(
    (g) => g.savedAmount >= g.targetAmount
  ).length;
  document.getElementById("totalGoals").textContent = totalGoals;
  document.getElementById(
    "totalSaved"
  ).textContent = `Ksh.${totalSaved.toLocaleString()}`;
  document.getElementById("completedGoals").textContent = completedGoals;
  document.getElementById("activeGoals").textContent =
    totalGoals - completedGoals;
}

function updateDepositGoalOptions() {
  const select = document.getElementById("depositGoal");
  const incompleteGoals = goals.filter((g) => g.savedAmount < g.targetAmount);
  select.innerHTML =
    '<option value="">Choose a goal...</option>' +
    incompleteGoals
      .map(
        (g) =>
          `<option value="${g.id}">${g.name} (Ksh.${g.savedAmount}/Ksh.${g.targetAmount})</option>`
      )
      .join("");
}

function openAddGoalModal() {
  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Goal";
  document.getElementById("goalName").value = "";
  document.getElementById("targetAmount").value = "";
  document.getElementById("goalCategory").value = "";
  document.getElementById("goalDeadline").value = "";
  document.getElementById("goalModal").style.display = "block";
}

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

function closeModal() {
  document.getElementById("goalModal").style.display = "none";
  currentEditId = null;
}

function saveGoal(event) {
  event.preventDefault();
  const goalData = {
    name: document.getElementById("goalName").value,
    targetAmount: parseFloat(document.getElementById("targetAmount").value),
    category: document.getElementById("goalCategory").value,
    deadline: document.getElementById("goalDeadline").value,
  };
  if (currentEditId) {
    const index = goals.findIndex((g) => g.id === currentEditId);
    goals[index] = { ...goals[index], ...goalData };
  } else {
    goalData.id = Date.now().toString();
    goalData.savedAmount = 0;
    goals.push(goalData);
  }
  saveToLocalStorage();
  closeModal();
  renderGoals();
  updateOverview();
  updateDepositGoalOptions();
}

function deleteGoal(goalId) {
  goals = goals.filter((g) => g.id !== goalId);
  saveToLocalStorage();
  renderGoals();
  updateOverview();
  updateDepositGoalOptions();
}

function makeDeposit(event) {
  event.preventDefault();
  const goalId = document.getElementById("depositGoal").value;
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if (!goalId || amount <= 0) return;
  const goal = goals.find((g) => g.id === goalId);
  goal.savedAmount += amount;
  saveToLocalStorage();
  document.getElementById("depositAmount").value = "";
  document.getElementById("depositGoal").value = "";
  renderGoals();
  updateOverview();
  updateDepositGoalOptions();
}

window.onclick = function (event) {
  const modal = document.getElementById("goalModal");
  if (event.target === modal) closeModal();
};
