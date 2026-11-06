# GeoX 0.1.04 / Admin 2.1.1 — membership usability

Implemented 2026-11-06. Approved for website and APK publication; the membership backend changes below are live.

## Behavior

- GeoX accepts the existing username or registered Gmail in the same login field. Both resolve to the same membership and password. Existing usernames, expiry, trial start and latest-device sessions remain unchanged. The app stores the canonical username returned after password verification for its drawer, rather than displaying the entered Gmail as a username.
- Login retains the legacy `username` request field for older APKs and additionally accepts `identifier`. Both aliases share the same per-account login rate limit. Email is returned only after successful password verification.
- Registration and Firebase Auth require at least six characters. Numeric-only six-character passwords are permitted. Existing passwords remain valid and are not reset. Usernames remain available for existing and new accounts.
- Admin find accepts `{query}` containing a full username or Gmail (trimmed, case insensitive). The legacy `{email}` field remains supported. Main/Admin apps and both existing member pages use the new search behavior.
- New `admin.html` is the member roster entry point. It uses Google sign-in and `adminMemberIdentity`, then retrieves up to 50 members per page with a document-ID cursor. It lists username/email, ban state, remaining time and expiry. Exact username/Gmail search and member management are available without changing trial/device sessions. Account pages link to the roster for admins.
- `adminMemberList` checks the same server-side three-email allowlist, verified email and real Google provider as other admin operations. Its response excludes device keys, device IDs, session IDs and credentials. Client rendering uses text nodes. Signing out clears the visible roster and closes member details.

## Dialog theme

All app-owned Material dialog builders explicitly use the GeoX dark/lime overlay. The overlay and base theme now define surface-container and control colors as well as text/background colors. Favorite/about content is inflated using the dialog context. AndroidX numeric preferences now use Material dialogs with input validation; map selection uses the same themed single-choice dialog instead of a separate spinner popup. The login screen also uses the dark/lime palette. OS permission, Google account and package-installation dialogs are controlled by Android/Google and are not restyled.

## Live backend changes

- Updated `memberLogin` and `adminMemberFind`; created `adminMemberList`, all asia-southeast1. Deployment completed successfully.
- Firebase password policy changed from minimum 12 to minimum 6 with enforcement still enabled. No password or membership records were reset.
- Production unauthenticated requests to admin identity/list/find each returned HTTP 403 / ADMIN_REQUIRED.
- Firebase setup verification passed: email/password, Google provider, authorized Vercel domain, six-character policy and unchanged signing key.

## Validation and artifacts

- Android full release + Admin release build passed. Main: 0.1.04-full / versionCode 25. Admin: 2.1.1 / versionCode 6.
- Android JVM: 43 tests, zero failures/errors/skipped.
- Backend: 24 tests passed, including both login aliases, shared rate limits, banned/unregistered users, both search aliases, roster pagination, input bounds, authorization and response minimization.
- Real Firebase Auth/Firestore emulators passed transactional management, roster cursors, alias lookup and both username/Gmail password logins with a six-digit test password. No production test accounts were created.
- Web: 17 tests passed; admin module syntax checked. Local browser at 390px showed no horizontal overflow, no console errors, and no roster before authentication.
- No ADB device connected. The new Android dialogs and real-device Gmail login still need manual device validation; browser Google/admin-login end-to-end was not performed using a real account.
- Candidate APKs are in `maintenance/logs/geox-0.1.04/`. Website APK release: 0.1.04. GeoX Admin APK remains privately distributed.
