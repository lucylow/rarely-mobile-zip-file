import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "app.config.ts",
  "package.json",
  "eas.json",
];
const errors = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
}
const env = ["EXPO_PUBLIC_REVENUECAT_APPLE_KEY", "RARELY_PLUS_ENTITLEMENT_ID", "PRIVACY_POLICY_URL"];
for (const key of env) {
  if (process.env[key]?.includes("CHANGE_ME")) errors.push(`${key} still has placeholder value`);
}
const config = fs.existsSync(path.join(root, "app.config.ts")) ? fs.readFileSync(path.join(root, "app.config.ts"), "utf8") : "";
if (!/ios:\s*\{[\s\S]*bundleIdentifier/.test(config)) errors.push("iOS bundle identifier not found in app.config.ts");
if (!/ITSAppUsesNonExemptEncryption/.test(config)) errors.push("Encryption export-compliance key not present; confirm whether it is needed for your final build.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("RARELY iOS release config: baseline checks passed.");
