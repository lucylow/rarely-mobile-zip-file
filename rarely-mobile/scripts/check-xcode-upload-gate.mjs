#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
const readVersion = (command, args) => { try { return execFileSync(command, args, { encoding: 'utf8' }).trim(); } catch { return ''; } };
const xcode = process.env.XCODE_VERSION || readVersion('xcodebuild', ['-version']).split('\n').find((line) => /^Xcode\s/.test(line))?.replace(/^Xcode\s+/,'') || '';
const sdk = process.env.IOS_SDK_VERSION || readVersion('xcrun', ['--sdk','iphoneos','--show-sdk-version']);
const major = (v) => Number((String(v).match(/^\d+/) || ['0'])[0]);
const result = {
  xcode,
  sdk,
  minimumXcode: 26,
  minimumIosSdk: 26,
  pass: major(xcode) >= 26 && major(sdk) >= 26,
  source: { xcode: process.env.XCODE_VERSION ? 'env' : 'xcodebuild', sdk: process.env.IOS_SDK_VERSION ? 'env' : 'xcrun' },
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.pass ? 0 : 1;
