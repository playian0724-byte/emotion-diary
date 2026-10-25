# V55 — Emotion lab minimal action icons

Replace the two large bordered controls beneath the Emotion lab palette with a clean right-aligned pair of icon-only buttons:

- `mix-undo`: the typographic minus sign (−), for undoing the most recent pigment drop.
- `mix-reset`: an outlined counterclockwise reset arrow, for clearing the mixture.

The buttons have no visible outer border, rectangular fill, or shadow. Keep accessible Korean labels and titles for VoiceOver/tooltips and 44 × 44 px touch targets with keyboard focus visibility.

Existing IDs and JS onclick handlers (`undoDrop()`, `resetMix()`) are unchanged. No changes to saved data, color rendering, mixing, archive gestures, Dictionary, or other app screens.

Preview: https://playian0724-byte.github.io/emotion-diary/v55.html?view=lab
