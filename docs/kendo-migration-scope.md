# Scoping the KendoReact migration

Written 31 Aug 2026, at An's request, **before** any code is changed. Nothing in
this document has been done. It exists so the decision — open question 2 — can be
taken on numbers rather than on impression.

The licence key is installed and proven: `/kendo-check` renders a licensed Grid
with no watermark and Vercel builds clean. That settles **can we**. This document
is about **should we**, and **what it costs**.

---

## 1. What is actually there today

Measured, not estimated.

| | Count |
|---|---|
| JSX usages of our own UI components | **358**, across the app |
| Distinct `.vy-` classes | **493** |
| Design tokens | **160** |
| Stylesheet lines | **3,427** across six files |
| Radix primitives in use | 9 |
| Grid code that Kendo Grid would replace | 979 lines (`DataGrid`, `MiniTable`, `Overlays`, `column-model`) |

The 358 usages are heavily concentrated, which is the single most important fact
for planning:

| Component | Uses | Files | Kendo equivalent |
|---|---:|---:|---|
| `Button` | 109 | 29 | `Button` |
| `FieldRow` | 63 | 6 | *none — ours* (see §4) |
| `TextField` | 40 | 12 | `Input` / `NumericTextBox` / `DatePicker` |
| `Select` | 37 | 14 | `DropDownList` / `ComboBox` |
| `Dialog` | 21 | 12 | `Dialog` / `Window` |
| `ReadValue` | 19 | 2 | *none — ours* |
| `MiniTable` | 16 | 11 | `Grid` |
| `RadioGroup`, `Tabs`, `Checkbox` | 19 | — | `RadioGroup`, `TabStrip`, `Checkbox` |
| `DataGrid` | 3 | 3 | `Grid` |
| everything else | 32 | — | mixed |

**Four components are 209 of the 358.** Button, TextField, Select and Dialog
alone are 58% of the work, and all four are mechanical swaps. That is the good
news in this table.

---

## 2. What adoption actually buys

Not "looks like Kendo" — these are capability gains, each traceable to a
customer requirement or a recorded gap.

1. **Per-column filter cells.** `k-filtercell` — "Contains, Does not contain, Is
   [not] equal to, Starts/Ends with, Is null". The Testing Guideline asks for
   this on the BoM Components tab and it is **the one real gap**
   `live-component-sweep.md` found. It ships with Kendo Grid and would otherwise
   be hand-built.
2. **ExcelExport.** Export is specified in three places (Part Master, quotation
   results, row-selection export) and currently reports what it would do. Kendo
   supplies it.
3. **Upload.** `k-upload` ships live; we have no file input at all, and three
   separate flows need one (Create BoM, Import parts, Update BOM).
4. **DateRangePicker, TimePicker, MultiViewCalendar.** All confirmed in the live
   bundle; we use native inputs.
5. **Visual parity with the live system**, which matters for a change-management
   argument across 51 screens.

---

## 3. What adoption costs

### 3.1 The stylesheet is the real number

493 `.vy-` classes and 160 tokens are written against **our** DOM. Kendo renders
its own `.k-` structure. Every rule targeting a component's internals stops
applying the moment that component is swapped.

This is not a find-and-replace. Three sub-problems:

- **Theme.** Kendo ships `@progress/kendo-theme-default`. Matching our tokens to
  it means either re-skinning Kendo with our 160 variables, or abandoning them
  and accepting Kendo's defaults. The first is a real piece of work; the second
  discards the design system the customer has already reviewed.
- **Global leakage.** `KendoCheck.tsx` already dodges this: it loads the Kendo
  theme by **dynamic import** precisely so `.k-*` rules do not go global. Adopt
  Kendo app-wide and the theme is global — and it will collide with 493 existing
  classes. Expect a shake-out period.
- **`css:check` will go red.** The consistency script that has caught six
  duplicate-class bugs works on our stylesheets. It needs rethinking, not
  deleting.

### 3.2 What we would have to re-achieve, not inherit

These are behaviours built to a written requirement and verified on screen. They
do not come free with Kendo; each must be re-established on top of it.

| Behaviour | Where it came from |
|---|---|
| Density preference (compact/default/comfortable) | 25 Aug review |
| View templates — Filter, Column, Sort, saved per screen | guideline; `useViews`, `views.ts` |
| Column chooser with `hiddenByDefault` + notes | guideline |
| Row selection surviving sort/filter/paging (held by id) | ours |
| `Select` as a filtering combobox with keyboard nav | live behaviour An caught |
| `PeoplePicker` — chips, avatars, email, filters both fields | live control An sent |
| `MiniTable` sorting: asc → desc → **none**, blanks sink both ways | guideline |
| Column roles → width/alignment (`column-model.ts`) | `table-patterns.md` |
| The `FieldRow` system — one labelled row, 63 uses | this session |

Kendo has a Grid, but it does not have *our* view templates or *our* density
model. Some of this maps onto Kendo features; some is re-implementation.

### 3.3 Accessibility has to be re-verified from scratch

Yesterday's audit measured 129 controls across six dialogs with **zero** missing
accessible names, correct three-deep dialog focus, `aria-sort` only on sortable
columns, and the 24px target-size work. All of that was verified against **our**
DOM. Kendo's accessibility is generally good, but "generally good" is not the
same as "measured", and the customer's own guideline does not cover it — so the
audit is redone, not skipped.

---

## 4. What does **not** migrate

Worth stating so nobody plans for it.

- **`FieldRow` and `ReadValue` (82 uses).** Kendo has `Field`/`FormElement`, but
  they are Form-bound; our row is used outside forms too. Keep ours.
- **`AppShell`, sidebar, header, search palette, sitemap.** No Kendo equivalent
  and no reason to change them.
- **All 19 data files.** Untouched.
- **The login page.** Answered a specific deck criticism; nothing to gain.

---

## 5. The order I would take it

Each phase leaves the app **working and shippable**. That is the point of the
ordering — not one big-bang branch.

| Phase | Work | Size | Risk |
|---|---|---|---|
| **0** | Theme spike: map our 160 tokens onto the Kendo theme on ONE screen. Decide re-skin vs adopt-defaults. **Stop and review.** | small | — |
| **1** | `Button` (109) + `Checkbox`, `RadioGroup` | medium | low — mechanical |
| **2** | `TextField` (40) → Input/NumericTextBox/DatePicker | medium | low |
| **3** | `Select` (37) → DropDownList/ComboBox | medium | **medium** — must preserve the filter-as-you-type behaviour An specifically caught |
| **4** | `Dialog` (21) → Dialog/Window | medium | medium — three-deep nesting must keep working |
| **5** | `MiniTable` (16) → Grid, **and take per-column filter cells** | large | medium |
| **6** | `DataGrid` (3 call sites, 438 lines) → Grid + virtualisation, re-wiring views, density, column chooser, selection | **large** | **high** — the most feature-dense component in the app |
| **7** | ExcelExport + Upload — the two capability wins | medium | low |
| **8** | Re-run the a11y audit, `css:check` rethink, responsive re-check | medium | — |

**Phase 0 is the gate.** If the theme spike shows our tokens cannot be mapped
cleanly, the whole calculus changes and the customer should hear that before
phases 1–8 are booked.

**Phase 6 is where the risk lives.** `DataGrid` carries 21 props and every one is
a requirement someone signed off. If the project has to stop early, stopping
after phase 5 leaves a coherent app: Kendo forms and small tables, our big grid.

---

## 6. My recommendation

**Do phase 0, then decide.** Not because the migration is wrong — the filter
cells and ExcelExport are real wins against real requirements — but because the
theme question determines whether this is a tidy 8-phase job or a re-skin of 493
classes, and that answer is cheap to get and expensive to assume.

Two things worth saying plainly to the customer either way:

- **No functional requirement is currently unmet** because of the component
  library. The worklog already tells them this. The migration buys the filter
  cells, Upload, Excel export, and visual parity — not capability we lack.
- **The current build is reviewed and working.** Migrating restarts the
  accessibility and responsive verification that was completed yesterday. That
  is a cost to schedule, not a reason to refuse.

---

## 7. What this document does not settle

- **Kendo version and package set.** Only `kendo-react-grid` is installed today;
  the full set is many packages and should be pinned deliberately.
- **Whether the customer wants Kendo's look or ours.** The 25 Aug review signed
  off our visual direction. Adopting Kendo's default theme partially undoes
  that, and nobody has asked them.
- **Effort in days.** Deliberately absent. The phases are ordered by risk and
  dependency; putting hours against them before the phase-0 spike would be a
  number with nothing behind it.
