# PHANToM GPS additions and Installer

This repository contains the PHANToM Installer, Firebase additions, and a patch for PHANToM app changes. It does not contain the complete GPS Setter application tree or its Git history.

See PROVENANCE.md for source references, scope, and retained licensing information.

## Build Installer

Requires JDK 17 and Android SDK 34. Set ANDROID_HOME or provide an untracked local.properties containing sdk.dir.

Windows: `gradlew.bat :installer:assembleDebug`

The Installer retains the existing PHANToM release and activation endpoints in installer/build.gradle. This repository does not publish a complete GPS APK by itself.

## Reconstruct the app locally

Use a separate checkout of the exact upstream base revision listed in PROVENANCE.md. Replace any legacy Mapbox secret token matching `(?:sk|pk)\.[A-Za-z0-9_.-]+` in app/src/main/AndroidManifest.xml with REMOVED_LEGACY_SECRET, then apply:

`git apply --unidiff-zero /path/to/patches/phantom-gps.patch`

Copy installer/ and firebase/ from this repository into that checkout. Keep the base checkout's original README credits, LICENSE, Gradle wrapper, and other unmodified source files. Configure your own Firebase project, Android service configuration, and signing credentials locally before building or deploying.

The root Gradle files in this repository build only the standalone Installer. The patch modifies the upstream Gradle files for the complete app; do not overwrite those patched files with this repository's Installer-only root files.
