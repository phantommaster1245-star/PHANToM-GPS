# Provenance and scope

GeoX (formerly PHANToM GPS) is derived from https://github.com/jqssun/android-gps-setter.
Base revision: `0577d8e8a3a0fea7d0e421509be8506c760080ba`.
PHANToM snapshot reference: `5cf3e9736a0bf325a1a7c8a1f376aac4bbad48ea`. No original Git history is included.

Included:
- installer/: the GeoX Admin module added after the base revision.
- firebase/: backend and administration additions; deployment project selection is omitted.
- patches/phantom-gps.patch: app and integration changes against the base, including package renames, additions, edits, and removals.
- Gradle wrapper and properties: build tooling retained from the source project.
- LICENSE: retained GNU GPL version 3 text.

The patch is a derivative delta, not a claim that all its lines are independently authored. Applicable upstream credits, copyright notices, and license terms remain applicable. This package does not establish legal clearance for publication or explain any account suspension.

Excluded: unchanged upstream application files, upstream README and store metadata, original workflows, original Git history, APKs, screenshots, signing keys, local configuration, and Firebase deployment project selection.

The patch has zero context to reduce unchanged content. Removal lines and rename metadata are retained where necessary. Legacy Mapbox secret values in the patch have been replaced with REMOVED_LEGACY_SECRET; sanitize the base manifest the same way before applying.

See VALIDATION.txt for patch reconstruction verification. Android release build and 40 JVM tests passed for 0.0.18. This release operation does not redeploy backend services.

Local modules live under phantom-gps/. Exported patch retains canonical app/ paths and root Gradle mapping; no local workspace/reference directories are required. See BINDER_LOCATION_BRIDGE.md for Binder integration.

GeoX 0.0.18 canonical source export: 544e98f5e6c708fc7b4e7db79612749a211aeb09. This represents the current working source, including changes after the historical PHANToM snapshot reference above. The verified patch plus installer source are the client reconstruction inputs; hosted membership backend implementation is not included in this publication. No upstream Git history or complete unchanged application tree is included. Previously published 0.0.16 APK remains under web/dist/downloads; the new APK is a GitHub pre-release asset only.
