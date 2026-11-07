# V72 pre-release smoke tests (production app)

## Automated source validations
- Syntax: `new Function(app.js)` succeeds
- Custom emotion: `db.custom` is rolled back when `saveDB()` fails
- Daily save: `try/finally` clears saving state and removes flight ghost after a display failure
- Real records: no synthetic demo generator in production, Archive and My both use `db.records`
- Week focus: V67 pinch-date selection retained; no modal click for 650 ms after completed pinch
- Zoom access: 3-month unlock after 30 days OR calendar month rollover; 6/12-month remain 90/180 days
- No changes to V68 gallery files or to users' stored record format

## Manual device checklist before inviting beta testers

1. On the **same iPhone Safari context** with actual records, record an emotion on Today; check today's bead in Archive and My (ALL TIME + 30 DAYS).
2. Reload, close/reopen Safari, confirm the saved emotion and note persist.
3. With internet turned off *after the app has loaded*, verify existing records remain visible, and note failures honestly (no offline support promise).
4. With current-day edit expiry still valid, edit emotions in the archive. Check Archive/My consistency and reload; after expiry, confirm editing is blocked.
5. On first day without an entry, My should show an empty map, not synthetic data.
6. In Archive, pinch week → month → (if entitled) quarter and pinch inward over different dates to open their exact Monday-Sunday week; no unintended modal.
7. Test both ALL TIME/30 DAYS; selecting a My node shows its actual recording dates; selecting it again removes the caption.
8. Verify side-drawer navigation, safe areas and viewport dimensions on iPhone Safari. Also test home-screen mode separately if used.
9. Deliberately block storage in a disposable test profile: daily and custom emotion save must **not** claim success or create a phantom entry.
10. In two tabs of the same origin, save in one; verify the other reflects changes. Cross-device and other browser storage are **not** synced.

## Deployment policy
No real user records are seeded, rewritten to demos, or deleted. Keep production page on GitHub Pages and separate V68 test page isolated. A passing code review does not replace an actual iPhone test.
