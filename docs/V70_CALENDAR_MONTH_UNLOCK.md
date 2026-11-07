# V70 — Calendar month first zoom milestone

- First unlock to 3-month Archive: elapsed ≥30 days OR current calendar month later than first-used month (year-aware, including December→January).
- Other milestones unchanged: 6 months after 90 days, 12 months after 180 days.
- Existing firstUsedAt migration already selects the earlier of stored metadata or oldest recorded date. No records are edited or removed.
- V68-gallery.js stays isolated and unmodified.
- Verification includes 7 chronological test cases: October 10→October 30 still locked; October 10→November 1 unlocked, also November 7; December→January rollover; 90/180-day larger zoom milestones.
