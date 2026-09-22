#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const candidates = process.argv.slice(2).filter(Boolean);
const packagePath = candidates[0] || (fs.existsSync('package.json') ? 'package.json' : 'rarely-mobile/package.json');
if (!fs.existsSync(packagePath)) {
  console.error(JSON.stringify({ ok: false, error: 'package-json-not-found', tried: [packagePath, 'package.json', 'rarely-mobile/package.json'] }, null, 2));
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const raw = String(pkg.dependencies?.expo ?? pkg.devDependencies?.expo ?? '');
const match = raw.match(/(?:^|[^0-9])(5[4-7])(?:\.|$)/);
const sdk = match ? Number(match[1]) : 0;
const result = {
  packagePath,
  expo: raw,
  sdk,
  minimumSdkGate: 55,
  targetSdk: 57,
  storeCompatibleByPackGate: sdk >= 55,
  targetReached: sdk >= 57,
  recommendation: sdk >= 57 ? 'continue with Xcode/iOS SDK validation' : 'upgrade Expo one major version at a time until the target SDK is reached',
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = sdk >= 55 ? 0 : 1;
