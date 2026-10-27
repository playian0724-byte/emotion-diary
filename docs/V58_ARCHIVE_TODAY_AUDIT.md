# V58 — Archive / Today targeted code audit

Scope: inspect pinch, multi-span calendar, selection, edit window, save, demo overlay, and screen transitions. No UI redesign.

Two concrete fixes:
1. `saveDay()` checks `saveDB()` and restores the previous in-memory record (or removes the attempted new one) if browser persistence fails. The save animation no longer falsely claims success.
2. After successful saving, archive anchor is aligned by `CAL_SPANS[calendarZoom]` (1/3/6/12 months), following the same period boundaries as view initialization. The selected date uses the captured day instead of computing it again.

Inspected, preserved: touch pinch gesture and stage logic, single-finger archive scroll, current emotion selection cap, separate in-memory demo data, and editing-expiration checks.

Checks: JS syntax compile, exact patch matches, one save button, URLs. Physical iPhone Safari behavior not reproduced in this environment.

Live: https://playian0724-byte.github.io/emotion-diary/v58.html
