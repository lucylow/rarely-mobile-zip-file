#!/usr/bin/env node
import fs from 'node:fs';
const file = process.argv[2] || '.env.production';
if (!fs.existsSync(file)) { console.error(JSON.stringify({ ok:false, error:'env-file-not-found', file }, null, 2)); process.exit(1); }
const text = fs.readFileSync(file, 'utf8');
const required = ['RARELY_API_URL','RARELY_IOS_BUNDLE_ID','RARELY_PRIVACY_URL','RARELY_TERMS_URL','RARELY_SUPPORT_URL','RARELY_REVENUECAT_APPLE_API_KEY','RARELY_REVENUECAT_ENTITLEMENT'];
const placeholders = ['YOUR_','yourdomain.com','example.com','xxxxxxxx','REPLACE_','com.yourcompany.'];
const missing = required.filter((key) => !new RegExp(`^${key}\\s*=`, 'm').test(text));
const hits = placeholders.filter((needle) => text.includes(needle));
const result = { ok: missing.length === 0 && hits.length === 0, file, missing, placeholders: hits };
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
