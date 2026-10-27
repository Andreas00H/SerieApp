const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEFAULT_TEST_URL = "postgresql://serieapp:serieapp@localhost:5432/serieapp_test";

function loadEnvFile(file) {
  const full = path.join(__dirname, "..", file);
  if (!fs.existsSync(full)) return;
  const lines = fs.readFileSync(full, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

module.exports = async () => {
  loadEnvFile(".env.test");
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = DEFAULT_TEST_URL;
  }
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (result.status !== 0) {
    throw new Error("prisma migrate deploy failed against the test database");
  }
};
