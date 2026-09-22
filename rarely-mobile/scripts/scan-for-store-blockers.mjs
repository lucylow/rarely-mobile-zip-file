#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const patterns = [
  { name: 'placeholder privacy URL', regex: /example\.com\/privacy|yourdomain\.com\/privacy/gi },
  { name: 'placeholder bundle id', regex: /com\.yourcompany\.rarely/gi },
  { name: 'production mock purchase switch', regex: /RARELY_MOCK_PURCHASES\s*=\s*true/gi },
  { name: 'production mock gateway wiring', regex: /new\s+DemoStoreKitGateway\s*\(|gateway\s*=\s*DemoStoreKitGateway/gi },
  { name: 'hardcoded secret', regex: /(sk-[A-Za-z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,})/g },
];
const roots = ['app', 'components', 'lib', 'src', 'server', 'patches'];
const skipped = [/mockGateway\.ts$/, /\.example$/, /\.md$/, /package\.json\.additions/];
const hits = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs|json|plist|xcprivacy)$/.test(entry.name) && !skipped.some((r) => r.test(full))) {
      const text = fs.readFileSync(full, 'utf8');
      for (const pattern of patterns) { pattern.regex.lastIndex = 0; if (pattern.regex.test(text)) hits.push({ file: full, issue: pattern.name }); }
    }
  }
}
roots.forEach(walk);
console.log(JSON.stringify({ ok: hits.length === 0, hits, note: 'Template examples and development-only mock gateways are intentionally excluded; validate actual production env separately.' }, null, 2));
process.exitCode = hits.length ? 1 : 0;
