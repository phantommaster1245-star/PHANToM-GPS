# GeoX 0.1.11 Modern — Continuous Location Release

## Production artifact
- Package ID: `io.github.phantom.gps`
- Version: `0.1.11-full` (versionCode `32`)
- APK: `web/dist/downloads/PHANToM-GPS-v0.1.11.apk`
- SHA-256: `4c03c28976908499e35890b6a66ca6c027bbff2337d1a4195ab4447c47ead44c`
- Signing certificate SHA-256: `2b3d3efff71526168656b137a2df5625c08bf488a0656ddacfbd54a0ff286a74` (unchanged)

## Changes
- Random Location now computes smooth, bounded, time-dependent drift and sends a refresh approximately every second from the existing foreground heartbeat service.
- Joystick now uses time-based movement, serializes preference writes, limits publisher scheduling to approximately five times a second, and flushes the last point on release.
- The existing InstantSync hook and release's Modern LSPosed API 102 behavior are retained.

## Validation
- Gradle release build: successful.
- Existing Android unit tests: 45 passed, none failed.
- Web distribution tests: 17 passed, none failed.
- Physical device: installed over 0.1.11-test-full using `adb install -r` (Success), with identical package/signing certificate and versionCode 32.
- Prior private-build physical QA: 7 queued Google Maps callbacks in 7 seconds with random mode, joystick moved about 3.44 m in a simulated 1.8 s input, STOP yielded zero random callbacks in observed four-second window, no observed crash.
- No comprehensive long-run or battery endurance test was performed. Existing InstantSync callback lifecycle limitations remain documented in the 0.1.10 release notes.

## Distribution
- Latest public download metadata and channels now point at v0.1.11. The prior APK remains in download artifacts for rollback by uninstalling; Android does not allow in-place downgrades with lower versionCode unless special options/device policies are used.
- The public repository contains a sanitized derivative patch, not the proprietary local credentials or unfiltered private project directory.
