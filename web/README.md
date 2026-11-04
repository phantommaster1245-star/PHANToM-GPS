# PHANToM GPS website

Public Thai landing and download pages, styled for PHANToM GPS. The static output is dist/. No Installer APK is distributed here.

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
- Build Command: `node --test web/tests/release.test.mjs`.
- Output Directory: `web/dist`.
- Production URL: https://phantom-gps.vercel.app/.

The repository-root vercel.json sets these build/output values and the APK/metadata response headers. It publishes only the public static directory. There is no Sites hosting configuration in this website source.

The 0.0.16 APK checks https://phantom-gps.vercel.app/downloads/version.json and opens https://phantom-gps.vercel.app/download.html for updates. Deploy to that domain before distributing the APK. Older APKs that use a previous host require a one-time manual update.
