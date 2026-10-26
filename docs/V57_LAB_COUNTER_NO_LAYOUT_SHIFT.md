# V57 — fixed Emotion lab stage counter (no vertical shifts)

V56 kept the counter in the document flow. An earlier `#mix-summary:empty{display:none!important}` rule meant the first drop introduced a new line despite reserving a minimum height, moving the palette down.

V57 reparents the existing `#mix-summary` live region INTO `#mix-stage`. It is now a small, right-aligned, absolutely positioned informational label in the studio stage, next to the static `GYEOL / COLOR STUDY` legend. The count/status never takes vertical layout space. Empty text stays hidden.

The actual 4x2 emotion palette is unchanged, and all its fixed-size cards, drop counters, mixing animation, undo/reset, saving and localStorage data are untouched.

Preview: https://playian0724-byte.github.io/emotion-diary/v57.html?view=lab
