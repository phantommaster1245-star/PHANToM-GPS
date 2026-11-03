# Clipboard latency and activation verification (0.0.13)

Clipboard service input now enters the same in-process queue as the broadcast receiver. System clipboard hooks dispatch off the system clipboard method thread. One shared receiver gate suppresses duplicate deliveries within 300 ms without delaying different input, and allows a deliberate same-text retry afterward.

Coordinates are committed before either UI broadcasts or notifications. Auto-start creates the active-location notification once, after committing and signalling hooks; manual confirmation keeps the pending-location prompt.

Hook refresh receivers accept only senders granted the module's signature permission. The refresh intent carries no coordinates. Each scoped process reloads the committed module preferences on a dedicated handler; the existing throttled preference reads remain the fallback. Registration loads the latest snapshot once to cover a signal sent before registration.

## Collect measurements on a connected test device

After updating the APK, reboot once to load the changed Xposed code. Enable Clipboard monitor, coordinate/Plus Code input, and Auto start. With the module enabled for the target app, run:

    adb logcat -v threadtime -s PhantomClipboardPerf:I

Copy a plain coordinate pair, then a different pair or Plus Code. Correlate the same trace ID across app/system/target-process PIDs. Stages are received, parsed_offline (or geocoded), committed, refresh_sent, hook_loaded, hook_first_read, and notification_posted. All elapsed_ms values use the source capture timestamp; differences between stages identify the queue/parser/write/refresh/consumer delay. duplicate_ignored is an extra delivery that did not restart work. refresh_unavailable indicates that polling remains in use.

Logs contain trace IDs, fixed stage names and elapsed durations only. They do not contain clipboard text, coordinates, activation codes or license data. The target application still controls when it requests/reads a location, so a late hook_first_read need not mean a slow parser.

No connected Android device was available during this change; no end-to-end speedup or latency percentile has been claimed. Release build and unit tests validate code and state transitions, not physical-device timing.

## Activation screen

A retained ViewModel owns the pending request. Existing-license checking and verification failures never expose a code-entry or activation-submit action. Verification failure offers a separate retry-check action. A new activation immediately transitions to SUBMITTING and refuses further submit calls until completion, including across configuration changes. The initial XML keeps activation inputs hidden to avoid a first-frame flash.
