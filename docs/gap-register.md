# GAP register

Every deviation from stock Kendo, and the decision behind it.

Custom CSS in this repo must reference a GAP number in a comment. A rule with no GAP number is
a bug — either it belongs to a token, or it was never approved.

| ID | Screen | Need | Decision | Status |
| --- | --- | --- | --- | --- |
| GAP-01 | Quotations, Part Master | Constant-width status column | (b) fixed-width slot | **Retired** 22 Aug 2026 — now a token |
| GAP-02 | Quotations | Compact density in a row containing a Rating | (b) tighten rating padding under compact | **Retired** 22 Aug 2026 — no library to fight |

---

## GAP-01 — constant-width status column

**Need.** In a status column, `Badge` labels of different lengths ("New" beside "In-Progress")
leave a ragged left edge that makes the column hard to scan vertically.

**Why Kendo doesn't ship it.** `Badge` sizes to its content by design —
`.k-badge { white-space: nowrap; display: inline-flex }` — and exposes no width prop.

**Options considered**
- **(a)** Accept variable width. Zero custom CSS; the column stays ragged.
- **(b)** Wrap the stock `Badge` in a fixed-width inline-flex slot. One CSS rule, one token
  (`--vy-status-slot-w: 104px`). The Badge itself is untouched.
- **(c)** Centre the whole grid column. No extra CSS, but it centres the label rather than
  aligning it, which scans worse.

**Approved: (b)**, 21 Aug 2026. Implemented in `app.css` as `.vy-status-slot`.
No Kendo class is overridden — the rule styles a wrapper this repo owns.

## GAP-02 — compact density with a Rating in the row

**Need.** Quotations defaults to compact density because sales/estimating work this queue daily.
The Priority column renders a Kendo `Rating`.

**Measured before.** `.k-rating` renders 32px tall (`.k-rating-item` carries 4px padding around
a 24px glyph). With 2px cell padding the row floor was **36px**, so compact and comfortable
rendered identically and the density control promised something it could not deliver.

**Options considered**
- **(a)** Accept 36px and hide Compact on screens containing a Rating.
- **(b)** Reduce `.k-rating-item` padding to 0 under `[data-density="compact"]`.
- **(c)** Render a compact glyph in compact density and the full `Rating` otherwise — no Kendo
  override, but two representations of one value.

**Approved: (b)**, 21 Aug 2026. Implemented in `app.css`.

> This is the **only rule in the repo that reaches into a Kendo internal class.** It is scoped
> to `[data-density="compact"] .k-grid .k-rating-item`, so `Rating` is stock everywhere else.
> If Kendo restructures the Rating internals in a future major, this is the one rule to re-check.

**Measured after.** Compact row **28px** (Rating 24px, padding 0) — exactly the token value,
15 rows visible where 9 fit before. Comfortable and relaxed correctly revert to Kendo's 32px.

### Residual — CLOSED 5 September 2026

The note here said `comfortable` rendered 44px on screens with a **Rating** and
36px on Part Master, and proposed reducing that density's padding.

**Both halves were wrong by the time anyone came back to it.**

`Rating` is no longer rendered anywhere — it survives only as a file and two
comments. And the drift was not padding: measured, Project Requirement ran
**38 / 46 / 54** against Part Master's **24 / 32 / 40** — a flat **14px** at
every level, so "comfortable" on one screen was taller than "relaxed" on the
other. Reducing padding would have papered over it at one density and left the
other two wrong.

**The cause was one wrapped chip.** Three `code` columns were each a few pixels
too narrow, so their widest value wrapped to a second line and set the row
height floor:

| column | widest chip | content space it had | needed |
|---|---|---|---|
| Application | 131px | 126px | 155px |
| RFQ Type | 125px | 116px | 149px |
| Order Type | 78px | 72px | 102px |

Every one of them was sized to the **text** and none to the **cell**, which
spends 24px on padding. The RFQ Type note is the one to read: it had already
diagnosed the fault exactly — *"wraps it and makes the row taller than every
other"* — measured the text at 127px, set 140, and still came up nine pixels
short. A correct diagnosis and a wrong number, which is a more dangerous
combination than being wrong twice, because the note reads as settled.

Widened to 160 / 156 / 108. Project Requirement now measures **24 / 32 / 40** —
identical to Part Master, and no cell wraps on either.

A guard came with it: `.vy-grid-k .k-grid td .vy-code { white-space: nowrap }`.
A value longer than its column now clips at the cell edge, which someone sees,
instead of quietly making one screen's rows taller than another's. Zero chips
clip today.

## Both gaps retired, 22 Aug 2026

The customer removed the single-library constraint, so the component layer moved
to headless primitives (TanStack Table, Radix) styled entirely from our tokens.

Both gaps existed **only because a third-party component would not do what the
design needed**:

- **GAP-01** wanted a constant-width status pill; `Badge` sized to its content
  and exposed no width prop. Our own badge takes a width token. No workaround.
- **GAP-02** wanted 28px compact rows; `Rating` carried 4px of internal padding
  that forced a 36px floor, and the fix reached into a Kendo internal class.
  Our own `Rating` inherits the row height. Measured after the migration:
  **29px compact rows with a rating in them.**

Worth keeping as history: this is the clearest measure of what the constraint
was costing. Two approved deviations, one of them touching a library internal,
both of which simply stopped existing when the library did.

The register stays in force — a GAP is now raised whenever a design needs
something a **headless primitive** cannot express, or whenever a rule would
reach into Radix's or TanStack's internals.
