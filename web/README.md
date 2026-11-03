# PHANToM GPS website

Public Thai landing and download pages, styled for PHANToM GPS. The static output is dist/. No Installer APK is distributed here.

The Android application reads downloads/version.json from the production origin configured in app/build.gradle. The website and app require the same package, filename, version, versionCode, byte count, and SHA-256 contract.

For a new release:
1. Bump the application's tagName and versionCode and build :app:assembleFullRelease with the same signing identity.
2. Run node tools/publish-apk.mjs ABSOLUTE_APP_APK ABSOLUTE_OUTPUT_METADATA_JSON.
3. Run node --test tests/release.test.mjs and deploy the same dist/ assets and metadata together using the existing Site identity in .openai/hosting.json.

Development preview: python -m http.server 4187 --bind 127.0.0.1 --directory dist

The coordinate preview is illustrative and does not change device location. Original source attribution and license remain linked in the footer.
