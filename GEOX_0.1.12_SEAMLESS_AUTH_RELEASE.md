# GeoX 0.1.12 Modern — Seamless Authentication

## Release
- Package: `io.github.phantom.gps`; versionName `0.1.12-full`; versionCode `33`.
- Android package signing certificate SHA-256 remains `2b3d3efff71526168656b137a2df5625c08bf488a0656ddacfbd54a0ff286a74` for in-place upgrade from 0.1.11.
- Artifact `web/dist/downloads/PHANToM-GPS-v0.1.12.apk` SHA-256 `b46760436279bbaf1ddbefd6ed38b86d8f0f9629138c9cd950b58dea623b59ae`.

## Behavior
- When the launcher opens with an existing signed-in user and no active license lock, immediately transition to the map rather than waiting for server renewal on the Restore screen.
- On app foreground, continue membership verification against the backend. UI uses a compact indeterminate spinner with `Checking` in the existing right-side status chip.
- When verification completes, the header returns to the existing Ready/Active/LSPosed? status. Stop control remains available.
- Any location-start operation remains guarded by the existing AppIntegrity, Membership, LicenseStore, and signed local lease validation. With no valid lease, START is disabled while verification is pending.
- Invalid signed-in session ultimately routes to the existing Locked screen; a user without a signed-in account sees Login. Explicit account screen continues to work.
- No changes to the modern location hook, InstantSync, random/joystick engine, or server authentication protocol.

## Validation
- Gradle `:app:testFullReleaseUnitTest :app:assembleFullRelease -PgeoxModern=true`: successful.
- Existing Android JVM unit tests: 45/45 passed.
- Release web/metadata tests: 17/17 passed.
- Distribution patch rebuilt and independently reconstructed with credentials omitted.
- An ADB device was unavailable during the v0.1.12 release build (previously connected device disconnected); no claim of live physical-device acceptance tests for v0.1.12.
- Prior stable v0.1.11 physical-device testing did not include this new seamless-auth flow. The online account verification and failure transitions should be observed on a connected test device for additional confidence.

## Known limitations
- Foreground checks are not skipped; merely run behind the map. On slow networks the Checking chip may persist.
- Transient network problems defer to an existing valid signed lease; invalid or revoked local lease remains blocked.
- Full cold-start UI performance and background service lifecycle need further instrumented device measurements.
