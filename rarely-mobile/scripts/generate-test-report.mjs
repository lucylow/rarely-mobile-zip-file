import fs from "node:fs";
import path from "node:path";

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/test\.ts$/.test(entry.name)) files.push(file);
  }
}
walk("tests/release");
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), tests: files.map((file) => ({ file, lines: fs.readFileSync(file,"utf8").split(/\n/).length })) }, null, 2));
