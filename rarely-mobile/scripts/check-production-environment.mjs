const required = ["EXPO_PUBLIC_API_URL", "EXPO_PUBLIC_REVENUECAT_APPLE_KEY", "EXPO_PUBLIC_PRIVACY_POLICY_URL", "EXPO_PUBLIC_TERMS_URL"];
const forbiddenFragments = ["localhost", "127.0.0.1", "CHANGE_ME", "example.com"];
const failures = [];
for (const key of required) {
  const value = process.env[key];
  if (!value) failures.push(`${key} is missing`);
  else if (forbiddenFragments.some((part) => value.includes(part))) failures.push(`${key} contains a development/placeholder value`);
}
if (String(process.env.RARELY_ENABLE_MOCKS).toLowerCase() === "true") failures.push("RARELY_ENABLE_MOCKS=true is forbidden for production");
if (String(process.env.RARELY_ENABLE_OPTIONAL_ANALYTICS).toLowerCase() === "true" && String(process.env.ALLOW_OPTIONAL_ANALYTICS) !== "true") failures.push("Optional analytics are enabled without explicit release approval");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Production environment guard passed.");
