#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs|json|md|plist|xcprivacy)$/.test(entry.name)) files.push(full);
  }
}
walk(root);
const source = files.filter((file) => /\.(ts|tsx|js|mjs)$/.test(file));
let lines = 0;
for (const file of source) lines += fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).length;
const report = {
  generatedAt: new Date().toISOString(),
  files: files.length,
  sourceFiles: source.length,
  nonEmptySourceLines: lines,
  targetPagesAt50Lines: Math.ceil(lines / 50),
  targetPagesAt60Lines: Math.ceil(lines / 60),
};
fs.writeFileSync(path.join(root, 'release-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
