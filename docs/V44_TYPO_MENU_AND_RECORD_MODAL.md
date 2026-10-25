# V44 — typographic navigation, pigment-only zoom, record popover

## Design
- Replaces the small slide menu with a full-bleed five-line uppercase editorial menu: TODAY / ARCHIVE / DICTIONARY / MY / SETTINGS. The current view is marked exclusively by a right-aligned black dot, which glides to the next row before navigation and retains keyboard/Escape interaction.
- The page beneath transitions in softly; reduced-motion settings disable animations. The original SUIT product-studio aesthetic, emotion palette, orb geometries, water lab, and settings are retained.
- At one month, a bead retains its date caption below the circle; at three, six and twelve months, captions are hidden so only colors and month names remain. Zoom animation retains its existing date keys.
- Every view accepts double-click or touch double-tap on a bead to open an overlay with date, emotion names and optional memo. Keyboard Enter / Space can open the same overlay; backdrop, close button and Escape close it. Existing edit window and record editor are preserved in the overlay.
- The old below-calendar record explanation box is removed entirely. The original 'gyeol-v2' localStorage record format is unchanged; demo records remain in-memory only.

## Checks
- Source JS parsed successfully; required HTML ids and V44 listeners present.
- Both actual and staged zoom-3/6/12 layouts hide only date captions.
- Actual iPhone Safari gesture and rendering validation remains recommended.

Live: https://playian0724-byte.github.io/emotion-diary/?v=44
Sample: https://playian0724-byte.github.io/emotion-diary/?v=44&demo=1&view=month
