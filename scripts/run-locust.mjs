/**
 * Start Locust web UI using the project venv in load-test/.
 *
 * Usage:
 *   node scripts/run-locust.mjs
 *   node scripts/run-locust.mjs --headless
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loadTestDir = path.join(root, "load-test");
const locustBin =
  process.platform === "win32"
    ? path.join(loadTestDir, ".venv", "Scripts", "locust.exe")
    : path.join(loadTestDir, ".venv", "bin", "locust");

const host =
  process.env.LOAD_TEST_HOST ?? "https://rotaractweb.vercel.app";
const headless = process.argv.includes("--headless");

if (!existsSync(locustBin)) {
  console.error("Locust venv not found. One-time setup:\n");
  console.error("  cd load-test");
  console.error("  python -m venv .venv");
  console.error(
    process.platform === "win32"
      ? "  .venv\\Scripts\\activate"
      : "  source .venv/bin/activate"
  );
  console.error("  pip install -r requirements.txt\n");
  process.exit(1);
}

const args = [
  "-f",
  "locustfile.py",
  `--host=${host}`,
];

if (headless) {
  args.push("--headless", "-u", "100", "-r", "10", "-t", "60s", "--html", "report.html");
  console.log(`Headless run: 100 users for 60s → load-test/report.html`);
} else {
  console.log(`Locust UI → http://localhost:8089`);
  console.log(`Target: ${host}`);
  console.log("Set users to 100, spawn rate to 10, then Start.\n");
}

const child = spawn(locustBin, args, {
  cwd: loadTestDir,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
