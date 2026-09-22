#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const required = [
  'ios/PrivacyInfo.xcprivacy',
  'README.md',
  'patches/app.config.production.ts',
  'patches/eas.production.json',
  'patches/storekit-products.json',
  'docs/app-store-submission-v2.md',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`missing:${rel}`);
}
const envExample = fs.readFileSync(path.join(root, 'patches', 'production.env.example'), 'utf8');
for (const key of ['RARELY_API_URL', 'RARELY_IOS_BUNDLE_ID', 'RARELY_PRIVACY_URL', 'RARELY_TERMS_URL', 'RARELY_SUPPORT_URL']) {
  if (!envExample.includes(key)) warnings.push(`env-example-missing:${key}`);
}
console.log(JSON.stringify({ ok: failures.length === 0, failures, warnings }, null, 2));
process.exitCode = failures.length ? 1 : 0;
