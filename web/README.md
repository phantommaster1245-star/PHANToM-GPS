# GeoX website

Public Thai landing and download pages, styled for GeoX. The static output is dist/. No Installer APK is distributed here.

The Android application reads downloads/version.json from the production origin configured in app/build.gradle. The website and app require the same package, filename, version, versionCode, byte count, and SHA-256 contract.

For a new release:
1. Bump the application's tagName and versionCode and build :app:assembleFullRelease with the same signing identity.
2. Run node tools/publish-apk.mjs ABSOLUTE_APP_APK ABSOLUTE_OUTPUT_METADATA_JSON.
3. Run node --test tests/release.test.mjs, commit and push the updated dist/ assets and metadata to this GitHub repository. The owner deploys through Vercel.

Development preview: python -m http.server 4187 --bind 127.0.0.1 --directory dist

The coordinate preview is illustrative and does not change device location. Original source attribution and license remain linked in the footer.

## Vercel setup

- Import the GitHub repository; keep Root Directory at `./` (repository root).
- Framework Preset: Other.
- Build Command: `node --test web/tests/*.test.mjs`.
- Output Directory: `web/dist`.
- Production URL: https://geox-azure.vercel.app/.

The repository-root vercel.json sets these build/output values and the APK/metadata response headers. It publishes only the public static directory. There is no Sites hosting configuration in this website source.

The 0.0.16 APK checks https://phantom-gps.vercel.app/downloads/version.json and opens https://phantom-gps.vercel.app/download.html for updates. Deploy to that domain before distributing the APK. Older APKs that use a previous host require a one-time manual update.

## Membership website

register.html and account.html provide Google-first Gmail registration, PHANToM username/password setup, member status, an aggregate member count, and server-authorized admin lookup/renewal. Website registration does not start the 7-day trial or replace an app session. The trial starts on first successful login in the new membership-capable app. This website-first release keeps the downloadable APK and version.json at 0.0.16, which still uses legacy activation.

GeoX is the current public brand. Downloads remain at PHANToM GPS 0.0.16 while GeoX 0.0.18 is a GitHub pre-release for testing. Keep the legacy host, package and APK filename contracts.

GeoX 0.0.18 uses geox-azure.vercel.app. The Google sign-in authorized domains include the new hostname. Keep phantom-gps.vercel.app as an alias for older clients if required; downloads/version.json stays at 0.0.16 on the new site too.

Public website download updated to GeoX 0.0.18 on 2026-11-05, authorized by the project owner. The current version.json supersedes the earlier website-first hold at 0.0.16.

2026-11-05: Public download now serves GeoX 0.0.19 with the new mascot launcher icon.

2026-11-05: Public download updated to GeoX 0.0.20 with redesigned map home.

2026-11-05: Website APK advanced to GeoX 0.0.21. Admin web now supports 1/7/30 day renewal, time reduction and ban/unban through the deployed authorized management API.

2026-11-06: Public download is GeoX 0.0.22 with monochrome Favorites icon and targeted hook diagnostics.
