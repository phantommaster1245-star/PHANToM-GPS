# GeoX 0.1.03 candidate — LSPosed and notifications

Date: 2026-11-06. Android versionCode: 24. Approved for website publication as 0.1.03. Physical-device validation limits below remain applicable.

## Findings and limits

- The affected tester reported GeoX 0.0.19. Their Android version, exact LSPosed build/fork, target application and diagnostic results are unavailable. A specific device root cause is not established.
- The old Active indicator represented a local START preference, not confirmation that a scoped process loaded the hook or accepted the signed lease.
- GeoX caught MODE_WORLD_READABLE failures and silently used private preferences. A successful local write therefore did not establish cross-process readability. START now requires the shared-preferences channel; STOP remains available. The diagnostic dialog reports the app-side channel separately from target-side responses.
- Official LSPosed 1.9.2 release notes explicitly fix the wrong new XSharedPreferences path, remote preference listeners in system_server, some missing onPackageLoad callbacks, and Android 14 hook issues. These are plausible framework-side explanations for some 1.9.1 failures, not proof about this tester.
- XSharedPreferences.java is byte-identical in the inspected official v1.9.1, v1.9.2 and master snapshots (SHA-256 31287c9d21662528c059f2ffeeecdad7ea3e1f3a43a427ff81b41c3cf27f043a). The surrounding framework implementation differs; this comparison does not establish compatibility of all builds or forks.
- Prior boot-count retry and targeted diagnostics remain intact. Signed-lease, boot binding, caller authentication and coordinate checks are not bypassed.

Sources:
- https://github.com/LSPosed/LSPosed/releases/tag/v1.9.2
- https://github.com/LSPosed/LSPosed/wiki/New-XSharedPreferences
- https://developer.android.com/develop/background-work/services/fgs/launch
- https://developer.android.com/develop/background-work/services/fgs/service-types#special-use

## Notification behavior

| State | Location notification | Ongoing | Sound |
| --- | --- | --- | --- |
| Idle, no candidate | None | No | No |
| Candidate found, automatic start disabled | START | No | Yes |
| Automatic start enabled | Active / STOP after applying | Yes | Yes |
| Active with a new manual candidate | START and STOP on the same location card | Yes | Yes |
| STOP with no pending candidate | Removed | No | No |
| Membership invalidation | Separate dismissible membership card | No | No |

Membership and clipboard monitoring have no idle foreground-service notification. Only the active location engine runs a foreground service, using the location card and STOP action. License renewal remains in the foreground app, active engine, or authenticated bound Full Lock session. A clipboard event after a long idle period can require renewal before processing. Background clipboard capture requires the existing LSPosed Android System clipboard hook; the ordinary Android listener is only a foreground fallback. No continuous idle service is promised when Android terminates the process.

The active service uses Android's specialUse foreground-service type. An authenticated module refresh in the system hook can promote an already validated active engine when the app's background launch is restricted. This does not authorize a location command. No promotion occurs from the diagnostic endpoint. This path needs physical-device verification.

START/STOP events use a new default-importance sound channel; heartbeat and reverse-geocoding label updates are silent. User notification settings and Do Not Disturb still apply. Reverse-geocoding label updates preserve a newer pending candidate. The existing low-time membership popup and daily suppression remain separate.

## UI

Drawer: icon on the left; username 20sp bold and remaining time 14sp bold on its right; expiry below the row. Website member/download targets share an 88px by 44px box and centered text.

## Verification

- Full release assembly passed, including release shrinker and vital lint.
- Android JVM: 43 passed, 0 failures/errors/skipped.
- Web: 16 passed.
- Local browser at 390px and 360px: both navigation targets measured 88 by 44, y=11.5; at 360px there was no horizontal overflow.
- ADB lists no connected devices. Actual notification sound, Android/OEM foreground-service behavior, Binder reconnect, cold clipboard capture and target-app location effects have not been verified on a physical device for this candidate.

For the affected tester, collect Android version, exact LSPosed version/build/fork, target package and the Settings hook diagnostic result from that target after reopening it. READY means the hook accepted settings and lease; it does not establish that the target consumed a location callback. Do not request account passwords or raw signed leases.
