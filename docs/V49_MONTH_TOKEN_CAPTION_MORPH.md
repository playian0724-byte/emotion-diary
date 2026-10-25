# V49 — disappearing date captions & physical month token morph

## Why
V48 preserved continuous movement of dated orbs, but separate UI artifacts remained static: the one-month date captions were only hidden when the incoming period committed, and the two-digit month tokens `01`, `02`, ... were absent from the FLIP mapping. During pinch-out this looked like unchanged month circles that vanished abruptly at release.

## Gesture frame calculations
- Each month token now carries stable `data-month="YYYY-MM"` identity.
- In staging, tokens shared by both chronological layouts move directly between their original and destination **centers** while their diameter scales continuously.
- Tokens leaving the destination period travel toward their month’s first-day circle while reducing opacity with the gesture; for months outside the target date window, they shrink toward their own existing first-day bead rather than teleporting.
- Incoming tokens transition from the source’s matching day-one bead toward the destination month token, blending size and opacity. If that month has no existing source day, it grows from 72% at its destination.
- At touch release, matched and entering tokens complete their remaining FLIP translation, scaling, and opacity. Departing tokens finish as lightweight fixed-position clones that dissolve within 245 ms.

## One-month date captions
- The one-month captions use inherited `--v49-caption-opacity` synchronized with pinch progress.
- When zooming **1 → 3**, captions gradually fade from 1 to 0 while existing colored orbs remain fully pigmented. When zooming **3 → 1**, captions gradually fade from 0 to 1.
- On release, 1 → 3 captures label-only fading clones (never duplicate orbs) for their remaining 235 ms; 3 → 1 continues captions from their actual pinch-frame opacity for 255 ms. This prevents last-frame snapping.
- The full calendar never fades to white; underlying date orb motion remains V48.

## Preservation
Existing month/year page header, compact month discs, responsive 1/3/6/12 wall, double-tap highlight/modal, saved custom emotion details and localStorage `gyeol-v2` are unchanged.

## QA
JavaScript syntax tested and all referenced date/month classes and versioned assets checked. Physical iPhone Safari pinch interactions still require device review. Reduced motion preference disables animation.
