# Provenance and scope

PHANToM GPS is derived from https://github.com/jqssun/android-gps-setter.
Base revision: `0577d8e8a3a0fea7d0e421509be8506c760080ba`.
PHANToM snapshot reference: `4c63de488ea272c6a0d7d630134dc5386d158aa9`. No original Git history is included.

Included:
- installer/: the PHANToM installer module added after the base revision.
- firebase/: backend and administration additions; deployment project selection is omitted.
- patches/phantom-gps.patch: app and integration changes against the base, including package renames, additions, edits, and removals.
- Gradle wrapper and properties: build tooling retained from the source project.
- LICENSE: retained GNU GPL version 3 text.

The patch is a derivative delta, not a claim that all its lines are independently authored. Applicable upstream credits, copyright notices, and license terms remain applicable. This package does not establish legal clearance for publication or explain any account suspension.

Excluded: unchanged upstream application files, upstream README and store metadata, original workflows, original Git history, APKs, screenshots, signing keys, local configuration, and Firebase deployment project selection.

The patch has zero context to reduce unchanged content. Removal lines and rename metadata are retained where necessary. Legacy Mapbox secret values in the patch have been replaced with REMOVED_LEGACY_SECRET; sanitize the base manifest the same way before applying.

See VALIDATION.txt for patch reconstruction verification. Android release build and unit tests passed for 0.0.10. No backend deployment was performed.
