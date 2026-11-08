# GeoX additions and GeoX Admin

The current website APK is GeoX 0.1.12 Modern for libxposed API 102, adding seamless background membership verification and a compact Checking indicator in the map header while preserving InstantSync, continuous Random Location, and Joystick movement. See [the Modern handoff](GEOX_0.1.07_MODERN_HANDOFF.md) for device results and Full Lock/Gozza integration.

GeoX (formerly PHANToM GPS) publishes its Admin module and a derivative patch for the Android application. The firebase/ directory retains legacy service additions; the hosted membership service is managed separately. It does not contain the complete GPS Setter application tree or its Git history.

See PROVENANCE.md for source references, scope, and retained licensing information.

## Build Installer

Requires JDK 17 and Android SDK 34. Set ANDROID_HOME or provide an untracked local.properties containing sdk.dir.

Windows: `gradlew.bat :installer:assembleDebug`

GeoX Admin uses the hosted membership APIs configured in installer/build.gradle; only server-authorized administrators can search or renew members. This repository does not publish a complete GPS APK by itself.

## Reconstruct the app locally

Use a separate checkout of the exact upstream base revision listed in PROVENANCE.md. Replace any legacy Mapbox secret token matching `(?<![A-Za-z0-9_])(?:sk|pk)\.[A-Za-z0-9_.-]{20,}` in app/src/main/AndroidManifest.xml with REMOVED_LEGACY_SECRET, then apply:

`git apply --unidiff-zero /path/to/patches/phantom-gps.patch`

Copy installer/ and firebase/ from this repository into that checkout. Keep the base checkout's original README credits, LICENSE, Gradle wrapper, and other unmodified source files. Configure your own Firebase project, Android service configuration, and signing credentials locally before building or deploying.

The root Gradle files in this repository build only the standalone Installer. The patch modifies the upstream Gradle files for the complete app; do not overwrite those patched files with this repository's Installer-only root files.

## Public website and updates

PHANToM GPS 0.0.16 includes website release checks, update notifications, and a manual check in settings. The website source is in web/ and distributes only the full GPS APK.

Website: https://geox-azure.vercel.app/
Download: https://geox-azure.vercel.app/download.html

Install version 0.0.15 once to enable the new update source; older installed versions cannot learn the new endpoint automatically.

## Deploy on Vercel

Import this GitHub repository with Root Directory set to the repository root (`./`) and Framework Preset **Other**. The root vercel.json declares the build check and static output directory web/dist. No environment variables or dependencies are required for the website. Assign the production domain https://geox-azure.vercel.app/ to match the Android update endpoint.

Only web/dist is published. Android source, Firebase code, Installer files, and repository metadata are outside the website output.

The previous Sites deployment has owner-only access and is no longer publicly accessible. Publication and production deployment on Vercel are managed by the repository owner.

## Clipboard message selection

In Settings, open **Clipboard monitor** and expand **รูปแบบข้อความที่ต้องการอ่าน**. Five independent switches control numeric coordinates, coordinate links, Plus Codes, place/address text, and place-search links. All are enabled by default to preserve existing support. Turn off the other four to read only numeric coordinate pairs outside URLs. Turning every switch off ignores clipboard input. Auto-start remains a separate choice.

## Clipboard latency and activation verification

Version 0.0.15 uses a direct local clipboard queue, merges duplicate system/service deliveries, and refreshes scoped hooks after committing coordinates. Existing-license verification hides activation input and submit controls; a failed check offers a separate verification retry. The main switch is named Clipboard monitor with a Thai description.

Reboot once after this module update to load the changed hooks. See PERFORMANCE.md for timing stages and device validation instructions.

## Full Lock direct Intent integration

Version 0.0.15 receives native Double latitude/longitude through an explicit Intent from com.fulllock.app. It commits coordinates, requests Hook refresh, and replies with APPLIED before notification work. Optional target-package confirmation produces HOOK_LOADED only after that Hook loads the matching request snapshot. This channel is independent of Clipboard monitor and does not execute su or ADB commands.

See [INTENT_LOCATION_BRIDGE.md](INTENT_LOCATION_BRIDGE.md) for the complete protocol, Java client helper, authentication token, result semantics, and integration test steps for the Full Lock agent.

## Full Lock Binder integration

Version 0.0.16 adds authenticated root-relay sessions. See BINDER_LOCATION_BRIDGE.md for bootstrap, Parcel order, heartbeat/reconnection and callback statuses. Disable Clipboard monitor when using Full Lock; the sender should not copy coordinates after Intent/Binder submission. Physical device/HMA integration remains to be verified.

## GeoX 0.0.18 testing release

The GitHub release is marked pre-release and does not replace latest. The website/download metadata and APK remain at 0.0.16. Source patch reconstruction is verified against the sanitized base; see VALIDATION.txt. Full Lock compatibility and remaining device checks are in GEOX_FULL_LOCK_HANDOFF.md. Package IDs, signing identity and IPC contracts are unchanged.

Version 0.0.18 updates the Android website URL to geox-azure.vercel.app. Version 0.0.16 and the earlier 0.0.17 test build still embed phantom-gps.vercel.app; retain that old domain as a Vercel alias if those web links must keep working. This does not promote a new public APK update.
