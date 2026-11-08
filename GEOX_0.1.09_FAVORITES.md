# GeoX 0.1.09 Modern — Favorites usability release

- Android applicationId: `io.github.phantom.gps`; versionName `0.1.09`, versionCode `30`.
- The existing Favorites database, add/select/delete logic, module, and login behavior are unchanged.
- The popup uses a dark green rounded surface, lime accent, bookmark header, close button, and a prominent add button.
- Every list row is a full-width, 64dp selection target independent of address length. Long addresses are truncated visually with an ellipsis; stored data remains intact.
- Delete controls are consistently right-aligned with a 48dp target and remain independent from selection.
- RecyclerView remains scrollable when a user has many saved locations; the visible list height responds to the screen size.
- DiffUtil now compares the persistent favorite ID rather than the address so duplicate names behave correctly.

Verification:
- `:app:assembleFullRelease -PgeoxModern=true` succeeded.
- Website Node tests passed: 17/17.
- Android APK SHA-256: `d308e5db7dce1c1e5d9762721d2a2cab16817b7ff84dc2d18d3d4a7ad7303b96`.
- APK signing certificate matches the previous 0.1.08 release.
- Source derivative patch exported by the repository's sanitized source export tool and reconstruction verified (tree `762161098aaa7420d1443dd417801a0fd6faa1fc`).
- No device-side visual instrumentation or installation was completed during this release.

The upstream GPL license and provenance remain intact. No new backend release is required for this UI-only change.
