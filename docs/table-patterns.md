# Standard table patterns

The specification behind `src/components/StandardGrid.tsx`. Every list screen in the ERP should
be this component with a different column spec.

## The problem being solved

Measured on `/inventory-management/part-mst`, 19 August 2026, at a 1600px viewport:

| Column | Width | Header clipped | Cells clipped | Cells empty |
| --- | --- | --- | --- | --- |
| PART NUMBER | 108px | yes | **85%** | 0% |
| CUSTOMER NAME | 108px | yes | **100%** | 0% |
| REV | 108px | no | 0% | 20% |
| DESCRIPTION | 108px | no | 60% | 0% |
| PART SOURCE | 108px | yes | 0% | 0% |
| PART CLASS | 108px | no | 0% | 55% |
| PART TYPE | 108px | no | 0% | 55% |
| ABC | 108px | no | 0% | **100%** |
| UOM | 108px | no | 0% | 10% |
| LAST CHANGE | 108px | yes | **100%** | 0% |
| STATUS | 108px | no | 0% | 0% |

Every column is the same width. The consequence is not cosmetic: the part number is the value
people quote in email, on the shop floor and to suppliers, and it is unreadable in 85% of rows —
while a column with nothing in it at all is given identical space.

`/sales-management/so-mst` shows the same pattern at 77px, clipping five of its eight headers.

## Rule 1 — Width follows role, never uniform

| Role | Width | Truncates | Alignment | Notes |
| --- | --- | --- | --- | --- |
| `ident` | 240px | never | left | Monospaced, tabular. The record's name. |
| `text` | 280px | yes | left | The only truncatable role. Full value in `title`. |
| `code` | 96px | never | left | Sized to the longest enum member. |
| `number` | 104px | never | right | `font-variant-numeric: tabular-nums`. |
| `money` | 124px | never | right | Currency-aware, always two decimals. |
| `date` | 150px | never | right | Sized to the full rendered format. |
| `status` | 128px | never | left | One badge, never free text. |

If the roles do not sum to the viewport width, **the grid scrolls horizontally**. Squeezing every
column to fit is precisely what produces the uniform 108px column being replaced.

## Rule 2 — Sparse columns are hidden, not shrunk

A column empty in more than half its rows is hidden by default and offered in the column chooser
**with the reason stated** ("Empty in 100% of records"). This makes the decision auditable rather
than arbitrary, and it returns ~25% of the Part Master's width to columns that were truncating.

## Rule 3 — Density is a user setting

| Density | Row height | Rows visible at 800px |
| --- | --- | --- |
| Compact | 28px | 16 |
| Comfortable | 36px | 12 |
| Relaxed | 44px | 10 |

Production is fixed at 50px with a 21px header — the header, the element that tells you what a
column means, is the least prominent thing in it. The standard pattern inverts that: 11px
uppercase headers with a strong bottom rule, over shorter rows.

## Rule 4 — The identifier is the affordance, not the row

Production reserves a 60px leading column for an eye icon because rows are not clickable.

This pattern first said "make the row open the record" — one fewer column, one fewer pointer
trip. **That was wrong, and the customer caught it.** People copy values out of these grids
every day: part numbers into emails, customer names into search. A drag to select text ends in
mouseup on the row, which fires the row's click handler and navigates away, so copying was
effectively impossible.

The identifier is already the record's name. Making *it* the link:

- costs no extra column, so the eye icon still does not come back

**Standing against a client document, knowingly.** The customer's Testing
Guideline lists a leading "View Detail" column, and the live system has one. It
was built to match on 27 Aug and removed the same day, once it was clear the
column is a KendoReact command-column default rather than a design decision —
and that the customer's own notes plan a SECOND row action ("duplicate record
(clone)", replacing Historical RFQ). A leading icon column does not survive a
second icon. Raised as question 1 in `docs/open-questions.md`; if they want it
back, it comes back.
- leaves every other cell as inert, selectable text
- reads as an affordance without needing to be explained
- renders as a real anchor where the record has a URL, so middle-click,
  open-in-new-tab and copy-link-address all work

Rows keep their hover highlight — useful for reading across 1,700px of columns — but are no
longer controls and do not claim the pointer.

**The general lesson:** saving a click is worth less than not breaking a task people perform
daily. Density and economy are worth having, but not at the cost of selection.

## Rule 5 — Loading, empty and error are three states

Production renders "No records available" while the loading spinner is still running. The
standard pattern separates them, and the empty state names the cause and offers the way out
("No parts match 'X' — clear the search to see all 2,000").

## Rule 6 — Toolbar order is fixed

Search first and always labelled, then a spacer, then view controls (density, columns), then
record actions. Production places an unlabelled search box between four buttons and a dropdown,
in a different order on each screen.

## Rule 7 — One status vocabulary

Six tokens — `draft`, `open`, `progress`, `done`, `blocked`, `cancelled` — that every module maps
its own lifecycle onto. Production renders every Part Master status as the same green pill, which
makes the column decorative rather than informative.
