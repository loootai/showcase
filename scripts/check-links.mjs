// Checks dist/index.html: every local href/src exists. With --external, every https link answers below 400.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]);
const bad = [];
const external = new Set();
for (const r of refs) {
  if (/^https?:\/\//.test(r)) external.add(r);
  else if (!/^(mailto:|data:)/.test(r) && !existsSync(join(dist, r))) bad.push(r);
}
if (process.argv.includes("--external")) {
  for (const u of external) {
    if (u.startsWith("https://loootai.github.io/showcase")) continue;
    let ok = false;
    for (const method of ["HEAD", "GET"]) {
      try {
        const res = await fetch(u, { method, redirect: "follow" });
        if (res.status < 400) { ok = true; break; }
      } catch {}
    }
    if (!ok) bad.push(u);
  }
}
console.log(`checked ${refs.length} references (${external.size} external)`);
if (bad.length) { console.error("broken:\n" + bad.join("\n")); process.exit(1); }
console.log("no broken links");
