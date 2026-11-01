# V66 — Real data integration

Archive/weekly Stack and My/Map both use db.records keyed YYYY-MM-DD. Never fabricate dates or mood choices. Empty days show only a neutral placeholder without a recorded emotion.

Removed demo generation, test weekly mood sources, demo links and unrecorded synthetic custom emotion choices. Backward-compatible legacy sample IDs remain visible only if referenced in genuine saved records; no localStorage record is purged.

Added firstUsedAt migration (earliest saved day or actual first open), preserving db fields. Unlock 3/6/12 month zoom after 30/90/180 elapsed calendar days, respectively, independent of streaks.

The saved-day flight now targets the weekly orb. Real data remains device/browser localStorage and will not automatically sync across devices.
