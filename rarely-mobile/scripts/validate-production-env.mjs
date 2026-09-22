#!/usr/bin/env node
const required = [
  'RARELY_API_URL',
  'RARELY_IOS_BUNDLE_ID',
  'RARELY_PRIVACY_URL',
  'RARELY_SUPPORT_URL',
  'RARELY_TERMS_URL',
];
const errors = [];
for (const key of required) {
  if (!process.env[key]) errors.push(`${key} is missing`);
}
if (process.env.RARELY_MOCK_PURCHASES === 'true') errors.push('RARELY_MOCK_PURCHASES must be false in production');
if (process.env.NODE_ENV !== 'production') errors.push('NODE_ENV must be production for the production validation command');
console.log(errors.length ? errors.join('\n') : 'Production environment variables look structurally valid.');
process.exitCode = errors.length ? 1 : 0;
