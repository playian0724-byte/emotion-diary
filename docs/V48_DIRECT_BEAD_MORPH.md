# V48 — direct bead pinch & product-style navigation polish

## Corrected pinch architecture
V47 presented two whole date grids at partially crossfaded opacity. Only a small bounded set of cloned circles moved directly, leaving transient pale gaps and jumps.

V48 keeps the old real calendar date circles fully opaque and physically translates/scales each shared date toward its exact counterpart in the new grid as fingers move. Shared destinations are hidden in the staged field until the gesture commits; dates entering or exiting the range alone use low-key opacity. Hand-off uses FLIP on the new date circles starting at the actual last gesture positions. This avoids using whole-grid opacity to simulate bead travel.

Responsive 1-, 3-, 6-, 12-month chronological walls, grey month tokens, single-finger scrolling and named records are preserved. Reduced-motion preferences still bypass animation through the existing zoom fallback.

## Editorial details
- Double-open inspected bead: only a 1px outline with 1px separation; passive selected bead no longer has a strong outer ring.
- Month navigation: black, slim, backgroundless chevrons in place of circular controls.
- Dictionary objects: names and saved definition only, without OBJECT / NN serial on the card.
- My: settings shortcut removed (Settings remains reachable from the main drawer), plus flat ALL TIME / 30 DAYS typography with a black underline for selection.

## Verification
JS syntactic validation and structural file checks are run before committing. The physical iPhone Safari pinch frame rate and accidental double-tap gesture interaction remain to be tested in the app.
