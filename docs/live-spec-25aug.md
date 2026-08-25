# Live system specification — Project Requirements

Read directly from `erp.linhlongengineering.com`, 25 Aug 2026, signed in.
Everything below is copied from the live DOM. Nothing is inferred.

Read-only session: no record was saved, no view was created or deleted.

---

## 1. List screen — `/sales-management/quotation`

Title: **Project Requirements** · Browser title: *Request for Quotation*

### Toolbar
| Control | Real tooltip |
|---|---|
| `Add New` | Add New |
| `Select View` combobox | — |
| funnel icon | **Show filter toolbar** |
| gear icon | **Setup View Template** |
| per-row eye icon | View |

### Grid — 11 columns, in this order
`Priority` · `No` · `Project Name` · `Customer Name` · `Application` ·
`RFQ Type` · `OrderType` · `Status` · `Date Needed` · `Created Date` ·
`Last Updated Date`

> Two live data defects: **`OrderType`** has no space, and **`Created Date `**
> carries a trailing space. Both are in the column definitions, not the display.

### Pager
`1 2 3 4 … 20` · `items per page` · **`1 - 20 of 336 items`**
Default page size **20**.

### Filter toolbar — hidden by default, toggled by the funnel
All fields visible at once. **No operators anywhere.**

| Label | Placeholder |
|---|---|
| Priority | Select Priority |
| No | Select No |
| Project Name | Select Project Name |
| Customer Name | Select Customer Name |
| Status | Select Status |
| Date Needed From / Date Needed To | month/day/year |
| Created Date From / Created Date To | month/day/year |
| Last Updated Date From / Last Updated Date To | month/day/year |

`Clear all` at the foot.

---

## 2. View Setting dialog — the gear

Title: **`Request For Quotation - View Setting`**
Toolbar: `Save` · `Discard` · `Delete`
Form: `New View` checkbox · `View Name` (*Enter view name*) · `Set as my default view`
Tabs: **`Filter`** · **`Column`** · **`Sort`**

### Filter tab
Heading `FILTER OPTIONS` — hint *"Add or remove columns."*
Rows of `field · Select value · 🗑`. Dates render as `Start` / `End` on one row.
Button: **`Add more filter(s)`**

### Column tab
Heading `COLUMN OPTIONS`
Hint: *"Add or remove columns. To change the column order, drag and drop a field."*
Table headed **`Column Name`** and **`Width`**.

Each row: drag handle `⋮⋮` · **editable Column Name text input** · **Width number
input** · required marker.

> **The column NAME is editable.** A user can rename a column inside their own
> view. Nothing in the prototype anticipated this.

Required (cannot be removed): Priority, No, Project Name, Customer Name,
Date Needed, Last Updated Date.
Optional: Application, RFQ Type, OrderType, Status, Created Date.

Button: `Add a column`

### Sort tab
Heading `SORTING OPTIONS` · drag handle · field · **`Sort Descending`** toggle ·
`Add a column`. Multi-level, reorderable.

> Two live copy defects: the Sort tab reuses the Column tab's hint verbatim
> ("Add or remove **columns** … drag and drop a field"), and its add button says
> **"Add a column"** on a sorting panel.

---

## 3. Record — opens as a dialog, but has its own URL

Dialog title **`Project Requirement Details`** · heading is the RFQ number,
e.g. `RFQ0000000364` · URL `/sales-management/quotation/<guid>`

Buttons: `Edit` · `BoM Comparison` · `Run Quotation` · **`Cancel`**

### Tabs — verbatim
1. **Specific Requirements**
2. **Checklists & Assignment**
3. **Quotation Result**
4. **Conversations**
5. **Activity Logs**

### Header fields — 11, with `(*)` required markers
`Customer(*)` · `Customer Contact` · `Project Name(*)` · `ITAR` · `Project Type` ·
`Order Type(*)` · `Customer Type(*)` · `Due Date(*)` · `Assigned To(*)` ·
`Created Date` · `Priority(*)`

> **`Due Date`** confirmed — not "Date Needed", which is the *grid column* name.
> **RFQ Type and Historical RFQ are NOT on this form.** RFQ Type is a grid column
> only; Historical RFQ appears nowhere on the record.

### Specific Requirements tab — four sections, verbatim
**QUOTE CONFIGURATION**
`Quote Focus(*)` · `Material Package Type(*)` · `Markup(*)` ·
`Acceptable LeadTime In Day(*)` · `Item Ant Quantities To Quote(*)`

**TECHNICAL SPECIFICATIONS**
`Build Requirement(*)` · `Test Requirements(*)` · `Assembly Turn Time` ·
`Excess and MOQ(*)` · `Net Consigned Inventory(*)` · `Rocket Consigned Inventory(*)`

**SPECIAL REQUIREMENTS & OPTIONS**
`Conformal Coating` · `Provide Alt Aml For Out Stock` · `Broker`

**ADDITIONAL NOTES**
`Customer specific needs` · `Internal notes`

### Option values — read from the rendered radio groups
| Field | Real options |
|---|---|
| Excess and MOQ | **None · Low · OK** |
| Net Consigned Inventory | **No · Yes-No Charge** |
| Rocket Consigned Inventory | **No · Yes-No Charge · Yes-Charge** |

These render as **inline radio groups**, not dropdowns.

### Checklists & Assignment
`ASSIGNEE`: `Program Manager(*)` · `Buyer(*)` · `Engineer`
`PROGRAM CHECKLISTS` (collapsible): Assembly Drive · BoM Scrub · FAB Drive ·
**Polumeric Required** · Quoting Report
`ENGINEERING CHECKLISTS` (collapsible): DFM Report · Document validation ·
Engineer Test · SMT · Tooling/Stencil Review
Task grid: `Type` · `Document Name` · `Uploaded By` · `Uploaded Date` ·
`Assignee` · `Status`

### Quotation Result
`Part Number` · `Part Rev` · `Description` · `Build Qty` · `Cost/Board` ·
`Total Amt` · `Total w-Markup` · `Last Run By` · `Last Run Date` ·
`Last Run Version` · `BoM File` — empty state `No records available`

### Conversations
A `Comment` / `Send Email` choice, then a **rich text editor** (undo, redo, bold,
italic, underline, strikethrough, ordered and unordered lists, indent/outdent).
Empty state: `No comments yet. Be the first to comment!`

### Activity Logs
Grouped by **year**. Entry format:
`Linh Tran 1 - 08/25/2026 17:08:17` · `Create 1` · `Message: - Create RFQ was created`

---

## 4. Home

`Quotation Request` chart with a metric selector (`# of Orders`), a bar/pie
toggle, a period picker (`3 Months`), and a customer select. Y axis
`Number of RFQs`, X axis `Months`. Stacked by status — Completed, Quoted,
Cancelled, In-Progress, New — with the total labelled above each bar.

The `World Population by Broad Age Groups` demo pie chart is still live below it.
