# V56 — fixed-size Emotion lab palette

When a user added the first pigment drop, the app appended a new DOM badge into its palette tile and changed an initially empty count line into visible text. This could make the palette appear to expand or shift, especially on Safari.

Changes:
- Always keep a four-column grid with responsive fixed row heights (85–93 px). Each emotion card occupies exactly its own grid cell, with controlled overflow.
- All eight drop counter elements are created once with the grid. Drops change only the badges' text/visibility; no new elements are appended at drop time.
- Removing one drop updates the existing badges rather than re-rendering all palette buttons.
- The summary line reserves its own 18 px line from initial load to prevent its first nonempty text from shifting the palette.
- Accessible card labels include the added pigment count. Pigment blending, undo/reset, and permanent data are unchanged.

The revised standalone page `v56.html` has fresh CSS/JS query versioning to avoid earlier browser cache surprises.
