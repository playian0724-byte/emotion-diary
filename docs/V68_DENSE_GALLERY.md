# V68 dense archive visual test

Standalone test route `v68-gallery.html` ships a separate immutable code copy `v68-gallery.js`. Production `index.html`, `app.js`, `styles.css` remain byte-for-byte unchanged.

Test initialization fills an ephemeral `db.records` with deterministic date-derived emotion combinations spanning the previous calendar year through today, roughly 85–90% occupancy and occasional deliberate breaks. It never calls `loadDB`; its `DEMO_MODE` flag disables all `saveDB` writes and edits, including existing controls. The default is a three-month archive, from which pinch can reach week, month, 6 months and year. My Map uses exactly the same in-memory records.

Important: Users' real diary entries saved in `gyeol-v2` are neither accessed nor changed. No fake records are added to production.
