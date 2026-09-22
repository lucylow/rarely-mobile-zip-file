# Current platform notes used by this pack

Apple's current App Store Connect documentation says iOS submissions require privacy information, including App Privacy details and a privacy policy URL. Apple also requires data practices of integrated third-party partners to be represented accurately.

Apple's privacy-manifest documentation describes `PrivacyInfo.xcprivacy` as the file that records collected data types and required-reason API reasons for the app or SDK.

Apple's account-deletion guidance says apps that support account creation must let users initiate account deletion in the app and should delete the account and associated data that is not legally required to be retained.

Expo's current guidance for EAS uses named build profiles. Development builds are for developer tooling, preview builds are for production-like internal testing, and production builds are for store distribution.

For iOS, EAS Submit sends the binary to TestFlight; promotion into App Review remains an App Store Connect step.

This document records platform facts separately from product decisions. Do not treat placeholder URLs, product IDs, or Bundle IDs in the source as real production values until they are replaced.
