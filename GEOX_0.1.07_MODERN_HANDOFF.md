# GeoX 0.1.07 — Full Lock and Gozza handoff

## Release and framework

- Public APK: GeoX 0.1.07 Modern, Android versionCode 28, package `io.github.phantom.gps`.
- Use a framework that reports libxposed API 102. Enable GeoX and select the required scope, then restart the affected processes or reboot when testing Android System.
- The Modern APK is a complete installation. Its entry is `META-INF/xposed/java_init.list`. Build it with `gradlew.bat :app:assembleFullRelease -PgeoxModern=true`.
- The existing package ID and APK signing identity allow updates over earlier official GeoX builds. The Legacy source build is retained separately for older framework testing.
- Tested on vivo V2408A, Android 15, LSPosed 2.2.1 build 7912. LSPosed 2.3.0 requires its own runtime validation when available.

## Hook and IPC changes

- Modern replaces New XSharedPreferences with libxposed Remote Preferences. A single snapshot carries coordinates, START/STOP, request ID, hook settings and the signed lease. The hook validates the lease before using a fix.
- Android Location hooks cover last location and callback results. Fused Location covers scoped client results and has a Google Play Services process hook for system mode. GNSS callbacks can report a synthetic satellite set on Android 11+. NMEA position sentences GGA, RMC and GLL are generated from the active fix.
- The existing Full Lock Binder and Intent wire contracts are unchanged. `APPLIED` reports a committed GeoX snapshot. `HOOK_LOADED` reports that the target hook has loaded the matching request ID. Neither status requires Full Lock to wait for a fresh location callback.
- No changes are needed to the Full Lock request flow. GeoX still accepts double-precision coordinates and the existing request ID.

## Device evidence and cache behavior

The Android 15 ADB probe used an app outside the GeoX scope with Android System scoped. Android Location and Fused callbacks matched the chosen coordinates. GNSS reported the expected eight synthetic satellite IDs. Captured RMC had a valid checksum and differed from the target by 0.09 m. After STOP, fresh callbacks returned to the device location.

The first Fused reads after START returned cached values. A matching callback arrived about 2.5 seconds into that sample. After STOP, cached reads initially retained the previous GeoX fix until a fresh callback arrived. This is an observation for one device, not a timing guarantee. Fused API output was verified through Android System scope. Direct injection into `com.google.android.gms` remains a separate runtime check.

## Login changes

- The login screen uses the GeoX dark/lime design and a password visibility control. Password reset opens the existing web account page.
- On cold launch with a saved session, GeoX shows an indeterminate spinner while verifying membership. A successful check opens the map. A failed check opens the login form with the reason.
- Signing out revokes local session state while retaining the chosen remembered credentials. A successful login replaces the encrypted credential record when remember is selected. A failed attempt leaves that record intact. The explicit forget action and successful opt-out remain available.
- The server authentication, lease signature checks and device binding remain in place. Remembered passwords stay in a separate Android Keystore-encrypted private store.

## Source references for both teams

- `app/src/modern/` contains the module entry, location/clipboard hooks, GNSS/NMEA logic and remote snapshot transport.
- `app/src/main/java/io/github/phantom/gps/utils/` contains the existing request/response, preferences and membership checks.
- `BINDER_LOCATION_BRIDGE.md` and `INTENT_LOCATION_BRIDGE.md` describe the interfaces Full Lock already uses.
- The owner authorizes both Full Lock and Gozza teams to study this source. Use the published derivative patch and respect the upstream GPL notices. A separate product should configure its own signing, service credentials and authorized callers.
