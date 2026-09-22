import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib", "server"];
const patterns = [
  { label: "empty catch", regex: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g },
  { label: "console.log", regex: /console\.log\s*\(/g },
  { label: "hard-coded RevenueCat secret", regex: /sk_[A-Za-z0-9]{12,}/g },
  { label: "hard-coded production URL in source", regex: /https:\/\/(?!localhost)[A-Za-z0-9.-]+\/api\//g },
];
const findings = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
      const text = fs.readFileSync(file, "utf8");
      for (const pattern of patterns) {
        if (pattern.regex.test(text)) findings.push(`${pattern.label}: ${file}`);
        pattern.regex.lastIndex = 0;
      }
    }
  }
}
roots.forEach(walk);
for (const finding of findings) console.log(finding);
if (findings.length > 40) process.exit(1);
console.log(`Risk scan complete: ${findings.length} finding(s).`);
