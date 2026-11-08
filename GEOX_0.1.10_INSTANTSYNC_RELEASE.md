# GeoX 0.1.10 Modern — InstantSync release

Published at owner's request after 0.1.10-test device evaluation on vivo V2408A (Android 15).

## Release metadata
- Application ID: `io.github.phantom.gps`
- Version: `0.1.10-full`, versionCode `31`
- Modern libxposed API 102 / LSPosed 2.2.1.
- Signed APK: `web/dist/downloads/PHANToM-GPS-v0.1.10.apk`.
- SHA-256: `10571da2d97a08515e3998f3f884abed3d61440edfda5deffc16fe163ff3ce27`.
- Signing certificate SHA-256: `2b3d3efff71526168656b137a2df5625c08bf488a0656ddacfbd54a0ff286a74`.

## Scope
- InstantSync opportunistically dispatches fresh synthetic fixes to registered Android LocationListener and supported Fused LocationCallback handlers on refresh.
- Existing read-time hooks remain available as fallback.
- No LSPosed configuration changes, membership backend deployment, or installer/Admin release is included.
- Exact same package ID and signing certificate as 0.1.09 and 0.1.10-test: confirmed adb install -r to replace test without uninstalling (retains app data).
- The prior 0.1.10-test versionCode 31 can be overwritten by signed 0.1.10 production, also versionCode 31.

## Verification
- Gradle `:app:testFullReleaseUnitTest :app:assembleFullRelease -PgeoxModern=true`: successful (45 unit tests).
- Web tests: 17/17 passed.
- Physical phone ADB install -r: Success; dumpsys package reports versionCode 31 and versionName 0.1.10-full, active state preference retained.
- Application warm launch succeeds and sampled logcat shows no GeoX fatal crash.
- User previously observed immediate location movement in Google Maps and Lalamove Driver with the same InstantSync logic on 0.1.10-test.
- No independent millisecond location propagation benchmark was measured.

## Known limitations
- Queued callbacks are not cancelled if removed while pending; rapidly changing locations may queue older callbacks.
- Fused LocationCallback registered with Executor is not always dispatched using that Executor.
- Stopping the spoofed location does not explicitly push a new real-location callback to every hooked target.
- Scope depends on injected hooks and device configuration, and target application behavior may differ.
- These items remain documented rather than changed silently in the production promotion.
- Source derivative patch exported and independently reconstructed using maintenance/export_release_source.py; upstream credits and license retained.
