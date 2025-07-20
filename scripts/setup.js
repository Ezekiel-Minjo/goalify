const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Smart Goal Planner...");

// Create directories if they don't exist
const directories = [
  "src/css",
  "src/js",
  "src/assets/icons",
  "docs/screenshots",
];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('✨ Setup complete! Run "npm run dev" to start the application.');
