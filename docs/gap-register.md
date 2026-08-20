# GAP register

Every deviation from stock Kendo, and the decision behind it.

Custom CSS in this repo must reference a GAP number in a comment. A rule with no GAP number is
a bug — either it belongs to a token, or it was never approved.

| ID | Screen | Need | Recommendation | Status |
| --- | --- | --- | --- | --- |
| GAP-01 | Quotations, Part Master | Constant-width status column | (b) fixed-width slot | **Pending approval** — code written, one line to revert |
| GAP-02 | Quotations | Compact density in a row containing a Rating | (b) tighten rating padding | **Pending approval** — not written |

---

## GAP-01 — constant-width status column

**Need.** In a status column, `Badge` labels of different lengths ("New" beside "In-Progress")
leave a ragged left edge that makes the column hard to scan vertically.

**Why Kendo doesn't ship it.** `Badge` sizes to its content by design —
`.k-badge { white-space: nowrap; display: inline-flex }` — and exposes no width prop.

**Options**
- **(a)** Accept variable width. Zero custom CSS; the column stays ragged.
- **(b)** Wrap the stock `Badge` in a fixed-width inline-flex slot. One CSS rule, one token
  (`--vy-status-slot-w: 104px`). The Badge itself is untouched.
- **(c)** Give the whole grid column `text-align: center`. No extra CSS, but it centres the
  label rather than aligning it, which scans worse.

**Recommended: (b).** Implemented in `app.css` as `.vy-status-slot`, commented with this GAP
number. If you reject it, deleting that one rule restores stock behaviour.

## GAP-02 — compact density with a Rating in the row

**Need.** Quotations defaults to compact density (28px rows) because sales/estimating work this
queue daily. The Priority column renders a Kendo `Rating`.

**Measured.** `.k-rating` renders **32px** tall (`.k-rating-item` carries 4px padding around a
24px glyph). With 2px cell padding the row floor is **36px**, so compact and comfortable render
identically on this screen. The density control currently promises something it cannot deliver.

**Options**
- **(a)** Accept 36px as the floor here, and hide the Compact option on screens containing a
  Rating so the control never lies. No custom CSS.
- **(b)** Reduce `.k-rating-item` padding to 0 under `[data-density="compact"]` — about 3 lines,
  but it reaches into a Kendo internal class, which the working agreement treats as a gap
  rather than a solution.
- **(c)** Render priority as a compact glyph (●●○) in compact density and the full `Rating` in
  comfortable/relaxed. No Kendo override, but two representations of one value.

**Recommended: (b)** — smallest change, and the padding is a documented theme part rather than a
private hook. **Not written; awaiting your decision.** Until then Quotations renders 36px rows
in compact mode, and that is what the screen currently does.
