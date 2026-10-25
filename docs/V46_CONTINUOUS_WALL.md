# V46 — single-field emotion archive and persistent navigation

## Behavior
- Clicking TODAY / ARCHIVE / DICTIONARY / MY / SETTINGS updates the page behind the drawer without closing the drawer. Closing requires the drawer's X or tapping outside; Escape also closes it.
- A single row-major chronological bead wall replaces grouped months at 3, 6 and 12 months. At each month boundary, a two-digit index 01–12 occupies precisely one grid position, matching bead diameter. Month lines, sections and separate headings are removed.
- Single month preserves its date numbers beneath beads.
- JS computes responsive columns / orb dimensions from visible viewport width and height, available archive height, calendar scale and actual total day count. This is a one-viewport fit, including on a long year field where beads must be small.
- Finger pinch keeps date-identity orb transitions: all scales now use the poster-composite / ghost-bead morph, with the previous one-month date captions fading as part of their old poster, and new captions fading in with the incoming poster.
- Existing colors, concentric orb shapes, diary, editor, map, lab and double-tap record dialog are untouched.

## QA
- JS parsed; root HTML element IDs and local storage key unchanged.
- Calendar wall generated with month markers and all day buttons for each scale.
- iPhone Safari actual animation/gesture performance and minimum legibility at 12 months require device verification.

Preview: https://playian0724-byte.github.io/emotion-diary/?v=46&demo=1&view=year
