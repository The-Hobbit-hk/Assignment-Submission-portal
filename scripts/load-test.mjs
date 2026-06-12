/**
 * Simple HTTP load test for public pages.
 *
 * Usage:
 *   node scripts/load-test.mjs
 *   node scripts/load-test.mjs --url https://rotaractweb.vercel.app --connections 100 --duration 30
 */
import autocannon from "autocannon";

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const baseUrl = readArg("--url", "https://rotaractweb.vercel.app").replace(/\/$/, "");
const connections = Number(readArg("--connections", "100"));
const duration = Number(readArg("--duration", "30"));
const pipelining = Number(readArg("--pipelining", "1"));

const paths = (readArg(
  "--paths",
  "/,/calendar,/clubs,/events,/login"
) || "/")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

if (!Number.isFinite(connections) || connections < 1) {
  console.error("Invalid --connections value");
  process.exit(1);
}

console.log(`Load test: ${connections} concurrent users for ${duration}s`);
console.log(`Target: ${baseUrl}`);
console.log(`Paths: ${paths.join(", ")}\n`);

async function runPath(path) {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections,
        duration,
        pipelining,
        headers: {
          "user-agent": "joineazy-load-test/1.0",
        },
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ path, result });
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

const results = [];

for (const path of paths) {
  console.log(`\n--- ${path} ---`);
  results.push(await runPath(path));
}

console.log("\n========== SUMMARY ==========\n");

for (const { path, result } of results) {
  const errors = result.errors + result.timeouts + result.non2xx;
  const p975 = result.latency.p97_5 ?? result.latency.p99 ?? 0;
  const p99 = result.latency.p99 ?? 0;

  console.log(path);
  console.log(`  Requests:     ${result.requests.total}`);
  console.log(`  Throughput:   ${result.requests.average} req/s (avg)`);
  console.log(`  Latency avg:  ${result.latency.mean} ms`);
  console.log(`  Latency p97:  ${p975} ms`);
  console.log(`  Latency p99:  ${p99} ms`);
  console.log(`  Errors:       ${errors}`);
  console.log(`  Timeouts:     ${result.timeouts}`);
  console.log(`  Non-2xx:      ${result.non2xx}`);
  console.log("");
}
