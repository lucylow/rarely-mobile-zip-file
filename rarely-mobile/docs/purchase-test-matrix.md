# RARELY Purchase Test Matrix

Run on a physical iOS development/TestFlight build with StoreKit products configured.

| Case | Expected result | Evidence |
| --- | --- | --- |
| Monthly purchase succeeds | Premium entitlement becomes active once | Transaction and entitlement state |
| Annual purchase succeeds | Premium entitlement becomes active once | Transaction and entitlement state |
| User cancels purchase sheet | No premium access; retry remains available | Cancelled state |
| Store unavailable | Free app remains usable; show retry-safe error | Error code and screen |
| Network loss during purchase | No duplicate transaction; recovery remains pending or retryable | Pending queue |
| Pending transaction on relaunch | Recovery resumes and resolves exactly once | Recovery log |
| Restore active subscription | Existing entitlement is restored | Restore result |
| Restore with no subscription | User remains free with clear feedback | Empty restore result |
| Expired entitlement | Premium access is removed after refresh | Entitlement snapshot |
| Refunded or revoked transaction | Premium access is removed after refresh | Entitlement snapshot |
| Fresh install with active subscription | Restore recovers access without purchase | Fresh-install run |
| Repeated purchase taps | One serialized transaction is created | Purchase coordinator trace |

Record build number, device, iOS version, StoreKit environment, product ID, and outcome for every run.