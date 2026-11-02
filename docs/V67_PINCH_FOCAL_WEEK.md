# V67 — Position-aware month → week pinch

Changes live Archive gestures:

1. On two-finger touchstart, record the gesture midpoint in viewport pixels and its closest actual month bead's `data-date` via DOM bounding rectangles.
2. When pinching **out** while viewing a single month, compute the Monday of that date and the relative week offset. A Stack containing that date opens, rather than the old remembered or current week.
3. Set the chosen weekday as the focused bead, keeping the existing bead-to-bead FLIP animation.
4. When pinching between 1/3/6/12 months, forward midpoint to existing monthly zoom logic, maintaining its focal month.
5. Desktop ctrl/trackpad wheel zoom likewise chooses the date nearest the cursor.
6. Normalize week starts with UTC-day arithmetic so daylight-saving and month/year boundaries do not shift the week.
7. The week → month transition uses the currently selected weekday rather than a hardcoded Friday.
8. Touch cancellation resets pinch presentation without triggering a zoom.

Actual `gyeol-v2` records, My stats, personal notes and stored preferences are not modified.
