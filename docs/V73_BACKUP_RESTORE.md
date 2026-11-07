# V73 — backup & restore smoke tests

The Settings page offers a data-archive section styled as plain restrained rows.

Format:
```json
{"format":"gyeol-backup","version":1,"exportedAt":"ISO date","data":{"records":{},"custom":[],"settings":{},"firstUsedAt":"ISO date"}}
```

Import safety:
- JSON only and file <=5MiB, strict format/version, object shapes, valid ISO dates, 1–4 emotion IDs per diary date, custom definitions, reasonable caps.
- Read and preview before any mutation.
- Merge defaults to keeping current entries for overlapping calendar dates; combines custom definitions by ID with current definition prevailing, preserves settings, and retains the oldest known first-use date.
- Full replacement requires a separate second click and clearly warns about overwriting.
- If localStorage write fails, restores the prior in-memory object and shows failure.
- Restoring updates Today/Archive/My/Dictionary/Settings on the same page without reload.
- Does not rewrite or clear data when only exporting, choosing a file, or cancelling.
- Only local browser APIs; no server uploads.

Manual mobile checks:
1. Export on iOS Safari, verify downloaded .json file via Files/Downloads.
2. Import a file and inspect counts; cancel, verify no changes.
3. Merge across overlapping dates: existing entry wins, missing file-only dates appear.
4. Confirm replace requires two clicks; import then verify My/Archive and Settings.
5. Import malformed JSON, oversized files, invalid dates. Verify no record loss.
6. Disable storage in disposable browser and verify rollback.
7. Repeat with latest saved diary on same origin, and check cross-tab sync.
8. Check narrow phone and reduced-motion presentation.
