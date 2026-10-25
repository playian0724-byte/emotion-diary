# V54 — realistic 2026 year-to-date emotion archive preview

## Data and privacy
- Demo parameter `demo=1` synthesizes emotion records from January 1 through the visitor's current local date, for the currently viewed year. For October 25, 2026, this covers 2026-01-01–2026-10-25.
- **No samples are written to localStorage.** Preview uses `demoRecords` in memory, and the regular app's persisted diary and any previously saved emotions are unchanged.
- Dates after the current day are not populated.

## Human rhythm
- Omit isolated days, 2–3 day sequences, and occasional 4–7 day breaks to resemble forgotten diary entries.
- Create pseudo-random but **deterministic** colors and blank spaces for a given year. The data is stable across screen zoom changes, reloads and screenshots.
- Carry predominant moods across successive days, interspersed with other original eight base emotions; approximately 29% of recorded entries contain two to four colours, demonstrating orb splits.
- All missing entries remain empty beads. All records use existing `BASE` pigment palette and normal orb renderer.

## Preview
- [Year overview](https://playian0724-byte.github.io/emotion-diary/v54.html?demo=1&view=year)
- [Six months](https://playian0724-byte.github.io/emotion-diary/v54.html?demo=1&view=half)
- [One month](https://playian0724-byte.github.io/emotion-diary/v54.html?demo=1&view=month)

Nothing is imported into a real user's diary.
