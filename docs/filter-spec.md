# Advanced Filter — the real design

Captured from the live system, 25 Aug 2026, from two screenshots supplied by the
reviewer. The literal strings are NOT in the shipped bundle — they resolve from a
runtime translation resource — so the screenshots are the evidence.

**Rule for the rebuild: the LAYOUT may change, the CONTENT and PURPOSE may not.**

---

## A. Inline filter panel — on the list screen

Sits under the screen title, above the grid. Tinted panel.

**Toolbar row**
| Position | Control |
|---|---|
| Left | `Add New` — the create action |
| Right | `Select View` dropdown · funnel icon · gear icon |

- **Select View** — loads a saved view.
- **Funnel** — shows/hides this filter panel.
- **Gear** — opens *View Setting* (section B).

**Filter fields — all visible at once, no operators**

| Label | Control | Placeholder |
|---|---|---|
| Priority | picker | Select Priority |
| No | picker | Select No |
| Project Name | picker | Select Project Name |
| Customer Name | picker | Select Customer Name |
| Status | picker | Select Status |
| Date Needed From | date | month/day/year |
| Date Needed To | date | month/day/year |
| Created Date From | date | month/day/year |
| Created Date To | date | month/day/year |
| Last Updated Date From | date | month/day/year |
| Last Updated Date To | date | month/day/year |

**`Clear all`** at the foot of the panel.

### What this means structurally
- **There are NO operators.** A field is a value, and a date is an explicit
  From/To pair. Any "contains / is not / greater than" model is invented.
- **Every field is visible at once.** There is no add-a-condition flow.
- Which fields appear is a property of the **View**, not of the session — see B.

---

## B. View Setting — modal

Title: `Request For Quotation - View Setting`

**Toolbar:** `Save` · `Discard` · `Delete`

**Form**
- `New View` — checkbox
- `View Name` — text, placeholder `Enter view name`
- `Set as my default view` — checkbox

**Three tabs: `Filter` · `Column` · `Sort`**

### Filter tab
Heading `FILTER OPTIONS`, hint `ⓘ Add or remove columns.`

A list of the fields currently in the view. Each row is:
`[ Field label ]  [ Select value ]  [ 🗑 remove ]`

Date fields render as a `Start` / `End` pair on one row with a single remove
control.

This is where the field set of panel A is chosen — which reconciles the two
screens: the panel shows what the view includes, the modal decides what that is.

### Column tab
Not captured. By name and by the review's phrase "some other display
customizations", this is column selection — which supersedes the standalone
Columns popover currently in the prototype.

### Sort tab
Not captured. Sort order for the view.

---

## What the prototype had wrong

| Built | Real |
|---|---|
| Add-a-condition stack | All view fields shown at once |
| Field + operator + value | Field + value only |
| Date operators (before/after/between/last N days) | Explicit From / To pairs |
| Filter state is transient | Filter state is a named, savable **View** |
| Separate Columns popover in the toolbar | `Column` tab inside View Setting |
| No sort control | `Sort` tab inside View Setting |
| No default-view concept | `Set as my default view` |
