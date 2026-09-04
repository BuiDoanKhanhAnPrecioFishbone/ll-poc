# Scoping the KendoReact migration

Written 31 Aug 2026, at An's request, so the decision — open question 2 — can be
taken on numbers rather than on impression.

**Phase 0 has since been run and passed (§8).** No app screen has been migrated;
the only code it added is a 40-line variable bridge loaded on `/kendo-check`
alone. Two of this document's original cost estimates were wrong and are struck
through where they stand.

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

### 3.1 The stylesheet — **two of the three worries were wrong, see §8**

493 `.vy-` classes and 160 tokens are written against **our** DOM. Kendo renders
its own `.k-` structure. Every rule targeting a component's internals stops
applying the moment that component is swapped — that part stands.

The three sub-problems as first written, with what phase 0 found:

- ~~**Theme.** Matching our tokens means re-skinning Kendo with our 160
  variables — a real piece of work.~~ **Wrong.** It is a 40-line variable map.
- ~~**Global leakage.** Adopt Kendo app-wide and the theme collides with 493
  existing classes. Expect a shake-out period.~~ **Wrong.** Measured collision:
  zero.
- **`css:check`.** Stands, but smaller than feared — the bridge is now scanned
  as a third-party bridge alongside `md3.css` and `base.css`, and passes. The
  script will still need rethinking for whatever `.k-` overrides adoption
  produces.

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
| **0** | ~~Theme spike~~ — **DONE, passed.** `kendo-bridge.css`, 40 lines, on `/kendo-check` | small | — |
| **1** | ~~`Button` (109) + `Checkbox`, `RadioGroup`~~ — **ATTEMPTED, BLOCKED.** See §9 | one file | **blocker found** |
| **2** | `TextField` (40) → Input/NumericTextBox/DatePicker | medium | low |
| **3** | `Select` (37) → DropDownList/ComboBox | medium | **medium** — must preserve the filter-as-you-type behaviour An specifically caught |
| **4** | `Dialog` (21) → Dialog/Window | medium | medium — three-deep nesting must keep working |
| **5** | ~~`MiniTable` (16) → Grid~~ — **DONE.** Filter cells taken. See §10 | one file | — |
| **6** | ~~`DataGrid` → Grid~~ — **DONE.** See §13 | one file | — |
| **7** | ExcelExport + Upload — the two capability wins | medium | low |
| **8** | Re-run the a11y audit, `css:check` rethink, responsive re-check | medium | — |

**Phase 0 is the gate — and it has now been run. It passes.** See §8.

**Phase 6 is where the risk lives.** `DataGrid` carries 21 props and every one is
a requirement someone signed off. If the project has to stop early, stopping
after phase 5 leaves a coherent app: Kendo forms and small tables, our big grid.

---

## 6. My recommendation — updated after phase 0

**The theme risk is gone.** Phase 0 was the gate on exactly that question and it
passes cleanly (§8). What remains is component-swap work, which is the tidy
8-phase job rather than the re-skin.

That does not by itself decide adoption — the argument is still the one below —
but the biggest unknown has been priced and it came in far cheaper than the
scope assumed.

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


---

# 8. Phase 0 — theme spike. Run 31 Aug 2026. **Passed.**

The question: *can our design tokens drive KendoReact, or does adoption mean
abandoning them?*

**Answer: they can, from a 40-line variable map.** `src/theme/kendo-bridge.css`,
loaded on `/kendo-check` only, with a toggle so both states can be compared.

## What was measured

**1. The theme is entirely custom-property driven.** 453 `--kendo-*` variables
— every colour, size, radius, duration and elevation — declared on `:root`. A
bridge loaded after the theme overrides any of them on cascade order alone: no
specificity tricks, no `!important`.

**2. One override moves a whole colour family.** All **72** derived colour
variables (`-hover`, `-active`, `-subtle`, `-emphasis`, `-on-subtle`…) are
written as `oklch(from var(--kendo-color-…) …)`. Not one bakes in a literal.
Setting `--kendo-color-primary` to our `#1b4f9c` re-derived both:

    --kendo-color-primary-hover   oklch(from #1b4f9c calc(l - 0.044) …)
    --kendo-color-primary-subtle  oklch(from #1b4f9c 0.958 calc(c * 0.11) h)

**3. Collision with our 493 classes: zero.** Of 8,549 selectors in the compiled
theme (keyframes excluded), **8,535 are Kendo-namespaced**, 8 are `:root`
blocks containing *only* custom properties, and 6 could touch our DOM —
`[hidden]`, `script`, and RTL fragments. We set neither `[hidden]` nor `script`.

Verified on screen rather than only in the file: `.vy-page-title` and
`.vy-nav-link` compute **byte-identically** on a route with the Kendo theme
loaded and one without.

## The one real constraint found

**The bridge must be on the root element.** Kendo declares its 72 derived
variants on `:root`, and a custom property resolves where it is DECLARED, not
where it is inherited. With the map on a wrapper div, `--kendo-color-primary`
changed and `--kendo-color-primary-hover` did not — it still derived from
Kendo's red while the element merely inherited the resolved value. Moved to the
root, everything followed.

This cost the spike a wrong intermediate reading before it was caught, and it is
the kind of thing that would have been debugged for a day during phase 1. It is
now in the bridge's own comment.

## What this changes in the scope above

| §3.1 said | Phase 0 found |
|---|---|
| "re-skinning Kendo with our 160 variables… a real piece of work" | 40 lines |
| "the theme is global — it will collide with 493 existing classes. Expect a shake-out period" | Zero collision, measured two ways |
| "`css:check` will go red" | Passes; the bridge is scanned as a third-party bridge |

## Deliberately still unmapped

Each is a decision rather than an oversight, and each is listed in the bridge:

- **Derived contrast colours** (`-on-surface`, `-on-subtle`). Kendo computes
  these with oklch maths carrying its own contrast floor. Pinning them by hand
  is how a themed library quietly loses its accessibility guarantees.
- **Elevation.** Our shadows are tuned to our surfaces. Whether Kendo's
  five-step scale replaces or sits beside ours is a design call.
- **Motion.** `md3.css` owns it; Kendo ships 51 duration variables. Two motion
  systems is a question for whoever owns the motion spec.

## What phase 0 did NOT test

Honest limits, so nobody reads more into this than it earned:

- **One component.** A Grid. Dialogs, dropdowns and form controls may surface
  variables this map does not cover — though all of them draw from the same 453.
- **Dark mode.** Kendo ships `default-main-dark`. Untouched, and it interacts
  with open question 7.
- **Density.** Our compact/default/comfortable model has no Kendo equivalent
  wired here.
- **Nothing was migrated.** No app screen uses Kendo. That is still phases 1–8.


---

# 9. Phase 1 — attempted 31 Aug 2026. **Blocked, and reverted.**

The app is exactly as it was before, and passes build, lint and `css:check`.
Three things were learned; the third stops the phase.

## 1. This phase is ONE FILE, not 109 call sites

The scope sized phase 1 as "109 uses across 29 files". That was wrong, and the
correction applies to **every** later phase.

`Button` is already the only way this app makes a button, so the swap belongs
BEHIND that boundary — `ui/Button.tsx` keeps its own API (`variant`, `size`,
`icon`, `asChild`) and renders KendoReact underneath. Nothing outside that file
changes. It is reversible by reverting one file, the variant mapping is stated
once where it can be argued with rather than as 109 individual judgements, and
`asChild` survives — it has no call sites today, which is exactly why a
call-site migration would have dropped it silently.

**Re-estimate every phase on this basis.** The real work is not the call sites;
it is the mapping and the behaviours in §3.2.

## 2. The theme must be built as a subset, and can be

Importing `all.css` app-wide costs **97 KB gzipped** against an app whose entire
stylesheet is **31 KB**. Tripling the payload to render buttons that look the
same is not a trade worth making.

Kendo ships per-component Sass. `src/theme/kendo-subset.scss` compiles button +
checkbox + radio to **13 KB gzipped** — measured, and confirmed end-to-end: with
it wired in, the app's CSS went from 31 KB to 45 KB gzipped and nothing else
moved. The file is kept and **not imported**, since importing it now would add
14 KB to render nothing.

One trap, recorded because it costs an hour and produces a *silent* wrong
answer: `@include button.styles()` — the obvious spelling — fails with
"Undefined mixin" on v14 and emits a stylesheet that looks fine but contains no
component CSS. The real names are `kendo-button--styles()` etc., listed at the
bottom of each component's `_index.scss` under `// Expose`.

## 3. THE BLOCKER: KendoReact 16's Button breaks the app under React 19

With the adapter in place, every page renders **nothing**:

```
Invalid hook call … more than one copy of React
Cannot read properties of null (reading 'useRef')
Maximum update depth exceeded          ← the real one
```

What was ruled out, in order:

| Suspected | Result |
|---|---|
| Stale Vite pre-bundle | Cleared `node_modules/.vite`, restarted — **no change** |
| Duplicate React on disk | One copy, 19.2.8. Kendo peer range is `^18 \|\| ^19` — **satisfied** |
| Missing peer packages | All seven present at matching versions — **not it** |
| Vite splitting the dep graph | Same dist file appeared under three `?v=` hashes; added `resolve.dedupe` + `optimizeDeps.include` — **no change** |
| Vite dev pre-bundling itself | **Production build fails too** — React error #185, "maximum update depth". Rollup, no pre-bundling. Not a dev-server artefact. |

**And it is not KendoReact wholesale.** In the *same* production build,
`/kendo-check` renders its Kendo **Grid** with 12 rows. The Grid is fine under
React 19; the Button is not.

That distinction matters for the decision: the component that carries the
capability wins — the Grid, with its per-column filter cells — is the one that
works.

## What I would do next, if this resumes

In cost order:

1. **Reproduce in isolation** — a bare Vite + React 19 app with one
   `<KendoButton>`. Five minutes, and it either confirms the incompatibility or
   points back at something in this app.
2. **Check KendoReact's own React 19 support matrix and changelog** for v16, and
   whether a later patch fixes it.
3. **Try React 18** in a branch. This is a prototype, so downgrading is possible
   — but it is a large decision to take for a button.
4. **Re-sequence.** Since the Grid works and the Button does not, phase 5
   (`MiniTable` → Grid, taking the per-column filter cells) could go first. It
   is where the actual capability win is, and it would prove the migration on
   the component that justifies it.

## What is left in the tree

- `src/theme/kendo-subset.scss` — proven recipe, not imported.
- `vite.config.ts` gains `resolve.dedupe: ['react', 'react-dom']` — correct
  regardless, and the first thing to rule out if this is revisited.
- `sass` (dev) and `@progress/kendo-react-buttons` stay installed. Neither is
  imported by the app; both are needed the moment this resumes, and reinstalling
  them takes minutes.


---

# 10. Phase 5 — MiniTable on the Kendo Grid. Run 31 Aug 2026. **Done.**

Taken out of order because phase 1 is blocked and this is where the capability
win is. One file — `ui/MiniTable.tsx` — as phase 1 established. All eleven
callers still pass `ColumnSpec` and know nothing about Kendo.

## The gap is closed

`live-component-sweep.md` recorded per-column filter cells as **the one real
gap** between the live system and this prototype, and the Testing Guideline asks
for them by name on the BoM Components tab. Measured on that exact tab — 23
rows, 6 filter cells — the operator menu offers:

> Contains · Does not contain · Is equal to · Is not equal to · Starts with ·
> Ends with · Is null · Is not null · Is empty · Is not empty

That is the guideline's list — *"Contains, Does not contain, Is [not] equal to,
Starts/Ends with, Is null"* — with three more. Filtering verified working:
typing `DFM` cut a three-row list to one and clearing restored it.

**And the Grid works app-wide where the Button did not.** Imported into a module
eleven files depend on, with a clean dep cache: no invalid hook call, no render
loop, zero console errors. Phase 1's blocker does not generalise.

## Everything that had to survive, did

| Behaviour | State |
|---|---|
| asc → desc → **none** | Works — verified all three clicks; the third restores the original order, which is the guideline's "Clear" |
| Row tones (excluded/no-supplier/short/covered) | Works — `rows.data` puts `data-tone` back on the `<tr>` |
| Cell tones (green/red part and MFG) | Works — verified on Create BoM step 2, `missing` painting `rgb(253,236,235)` |
| Column roles (mono idents, right-aligned money) | Works — re-expressed for a real `<table>` |
| Control columns opting out | Works — `sortable: false` now also suppresses the filter cell |
| Frozen columns | Mapped to Kendo `locked` |

## Two bugs I introduced, and one false alarm

**`.vy-td` destroyed the table layout.** That class is `display:flex;
height:100%` — correct for the CSS-grid table it was written for, fatal inside a
real `<td>`, where columns stopped aligning with their headers entirely. Roles
now ride on `data-role` and are styled under `.vy-minitable-k`.

**`overflow: hidden` clipped Kendo's own scroller.** Added for the border
radius, it silently ate the right-hand columns of a wide grid with no way to
reach them. `overflow-x: auto` rounds the corners and keeps the scrollbar.

**The false alarm cost the most time.** I twice concluded sorting was broken —
`aria-sort` stayed `none` after clicking a header, with a real browser click,
not a synthetic one. It was not broken: Kendo binds the handler to the `.k-link`
*inside* the `th`, and both clicks landed on the th's padding. The rule this
project already wrote down after the virtualised-grid false zeros applies
exactly: **when a check reports "nothing happens anywhere", doubt the check
first.**

## What it costs

The app's CSS goes from **31 KB to 71 KB gzipped**. The grid subset is 40 KB and
pulls button, progressbar and the input chain in as its own dependencies — so
phase 1's components are now paid for whether or not phase 1 ever lands.

That is a real 2.3× on the stylesheet, and it is the honest price of the filter
cells. It is also most of what full adoption would ever cost: the full theme is
97 KB, so the remaining phases add roughly 26 KB between them.

## One judgement call

A filter row appears only at **8 rows or more**. This component backs both a
23-line BoM and a one-line Where-Used, and a filter row over three rows spends a
row of chrome to search three things. The threshold is mine, not the
guideline's — which asks for filter cells on the BoM Components tab, and that
has 23 lines and gets them. Callers can still force it either way.

## Not done

- **`DataGrid` is untouched** — phase 6, the 21-prop component, still ours.
- **Column widths** are passed through but Kendo distributes leftover space
  differently; `Part Sour…` truncates in a narrow dialog where it did not
  before. Cosmetic, and worth a pass.
- ~~**Accessibility is not re-verified**~~ — **done, see §11.** One defect found
  and fixed, one found and left, one regression recorded.


---

# 11. Accessibility pass on the Kendo Grid. Run 31 Aug 2026.

§3.3 said the audit would have to be redone because it was measured against
*our* DOM. It was. Measured on the BoM Components tab (23 rows, 6 columns) and
the Checklists tab (which has a control column).

## What is right

**The ARIA structure is correct**, and better than the one it replaced. A
`div[role=grid]` owns the whole thing, the tables inside are
`role="presentation"`, and rows, rowgroups, column headers and cells all carry
proper roles — 6 `columnheader`, 144 `gridcell`, `aria-rowcount` and
`aria-colcount` on the grid.

**Every interactive control has an accessible name.** 30 controls in the grid,
**0 unnamed**.

**`aria-sort` is present and correct** on sortable headers, and control columns
declared `sortable: false` are correctly `k-sortable=false`.

**Contrast is 16.77:1** on both header and cell text — far above the 4.5:1 floor.

## Fixed: the grid was MOUSE-ONLY for sorting

Kendo puts the sort handler on a `<span class="k-link">` inside the `<th>`,
which is not focusable. Before this pass the only tabbable things in the grid
were the filter inputs — **a keyboard user could filter but could never sort.**

`navigatable` on the Grid turns on Kendo's own roving-tabindex model: one
`tabindex="0"` entry point, 174 cells and headers at `-1`, arrow keys between
them, Enter to sort. Verified: focusing a header and pressing Enter sorts it
ascending and the rows reorder.

That is a genuine WCAG 2.1 **2.1.1 Keyboard** failure that shipped in phase 5
and was found only because this pass happened.

## Found and NOT fixed: filter inputs are named by the field

The filter boxes announce as **"part Filter"**, **"revision Filter"**,
**"partSource Filter"** — Kendo builds the label from the FIELD name, so a
screen reader reads camelCase identifiers aloud where a sighted user sees
"Component Part" and "Part Source".

`filterTitle` does not change it; it names the filter menu. The label comes from
`ariaLabel` on the filter cell, so I wrapped `GridFilterCell` in a custom
`cells.filterCell` to supply the column title. **It worked** — the names became
"Component Part filter", "Part Source filter" — **and it was reverted**, because
a custom filter cell replaces Kendo's `<td>` wrapper as well as its contents,
which put a `<div>` directly inside a `<tr>`, and restoring the `<td>` then
leaked Kendo's internal props (`columnId`, `ariaColumnIndex`, `navigatable`)
onto the DOM as React warnings on every render.

Trading a poor label for a console full of invalid-DOM warnings is not a trade.
The route is right and needs more care than the end of a session: pass only the
props `GridFilterCell` declares, rather than spreading the rest.

## Regression against our own previous behaviour

The old `MiniTable` deliberately **omitted** `aria-sort` on control columns,
because `aria-sort="none"` does not mean "not sortable" — it means sortable and
currently unsorted, which is a claim about a column of buttons. Kendo puts
`aria-sort="none"` on every column header including the ones it correctly marks
`k-sortable=false`.

Small, and inconsistent within Kendo's own output rather than something we
introduced — but it is a thing this prototype used to get right and now does
not.


---

# 12. Overlay and stacking audit. Run 31 Aug 2026.

Prompted by An finding an error toast behind the Run Quotation dialog. That one
fix exposed a class of fault, so the whole app's layering was swept rather than
patched at the point of complaint.

## The root cause was one value for everything

Every overlay — dialog scrim, dialog, menus, popovers, command palette, View
Setting, skip link, toasts — carried `--vy-z-palette: 10050`. At equal z-index
DOM order decides, so what sat on top was an accident of portal mount order.
Three things were wrong because of it and one more was wrong by luck.

## The scale now

    drawer   10020
    dialogs  10040+   a BAND: level n takes scrim 10040+2(n-1), panel +1
    menu     10070    above any dialog depth — Selects live inside dialogs
    palette  10075
    toast    12500    above Kendo's popups, see below
    skip     12600

## Fixed

**Toasts behind dialogs.** The reported fault. A toast reports the outcome of
the action you just took, and that action is usually taken in a dialog.

**Nested dialogs did not dim their parents.** This app stacks three deep — Part
record → Stock Report → Update Quantity — and all three panels and all three
scrims shared one value, so every dialog rendered at full brightness with
nothing to say which was live. Worse, the correct front-to-back order held only
because portals mount in order: correct by accident, the same fault as the
toast. `ui/Overlays.tsx` now counts nesting depth and steps each level's scrim
above the parent's panel. Verified: scrims 10040/10050/10060, panels
10041/10051/10061, and the parent is now visibly dimmed.

**The mobile nav derived its z-index as `calc(palette - 1)`**, so it moved
whenever an unrelated token did — and would have floated above dialogs.

**Toasts sat below Kendo's popups.** Kendo ships its own ladder, and
`.k-animation-container` — the filter operator menu — is at 12001. A dropdown
inside a grid would have covered a toast: the same fault again, across a library
boundary. Toast and skip link now clear Kendo's range.

## One I got wrong on the way

I first put the View Setting on the drawer layer. It is `role="dialog"` and
renders its own `.vy-scrim`, so it sat **below its own scrim** — dimmed and
unclickable. It is a modal surface and belongs in the dialog band. Caught by
hit-testing, not by eye.

A second miss: the first depth step was ten a level, which put a third dialog
at 10070 — the menu layer — so a Select inside it would have opened behind the
dialog it belongs to. Two a level, with fourteen levels of headroom.

## Checked and correct

- **Kendo popups render above our dialogs** (12001 over 10041), so the filter
  operator menu works inside the BoM dialog — verified with all ten operators
  visible. An earlier screenshot appeared to show it clipped; that was the
  open animation caught mid-flight, not a fault.
- **No accidental stacking contexts.** Swept every element for
  transform/filter/opacity/will-change/contain that also contains an overlay.
  One hit: `.vy-dialog` trapping its own header while animating, which is its
  own child and belongs there.
- **Sticky grid headers** (z-index 1 and 2) are inside their own scroll
  containers and do not interact with the overlay band.

## Method note

Every claim here is hit-tested with `elementsFromPoint` rather than read off a
computed z-index. Two of the faults above — the View Setting under its own
scrim, and the toast — had perfectly sensible-looking z-index values and were
still wrong.


---

# 13. Phase 6 — DataGrid on the Kendo Grid. Run 31 Aug 2026. **Done.**

The phase the scope called **high risk**: twenty-one props, each of them a
requirement somebody signed off. One file again, as phase 1 established — all
three call sites are untouched.

## What Kendo took over, and what it did not

**Took over:** the table — header, rows, cells, sort controls.

**Did not:** everything around it. Title, KPIs, actions, search, filter panel,
view picker, column chooser, empty state, loading skeleton and pager are ours
and unchanged. Kendo's own pager, filter row and column menu are switched **off**
— each already exists here answering a written requirement, and two of a thing
is worse than either.

## Every requirement re-verified on screen

| Requirement | Source | Result |
|---|---|---|
| asc → desc → none | guideline | works, `aria-sort` follows |
| Density, three levels, a USER preference | 25 Aug review | `relaxed` gives 44px rows |
| Paging, 20/50/100, our Pager | 25 Aug review | works; Kendo's pager stays off |
| Selection held BY ID, surviving paging | ours | select on page 1, page away, return — still selected |
| Select-all covers THIS PAGE | guideline | label says so; indeterminate at 1 of 20 |
| Identifier is the affordance, not the row | `table-patterns.md` | `<a>` on Quotations, `<button>` on Part Master |
| Column roles → width and alignment | `table-patterns.md` | money right-aligned, idents monospace |
| Column chooser edits the page's list | guideline | untick → 15 columns to 14, live |
| Empty state names WHICH thing emptied it | ours | "Nothing matches "zzzznothing"" |

All three call sites checked: Part Master, Quotations, Bill of Materials.

## TanStack Table and TanStack Virtual are now unused

Nothing in `src/` imports either. **They stay in `package.json` deliberately** —
open question 2, whether to adopt Kendo at all, is still unanswered, and
removing them would make reverting this work harder than it needs to be. When
the customer answers, they either come out or the question is moot.

## The bug this phase nearly shipped

I passed `rowHeight` to the Grid, reasoning that Kendo should know the density's
row height. That puts Kendo into its **virtual-scroll mode**, which needs
`skip`/`take`/`total` and an `onPageChange` to feed it — none of which this grid
supplies, because our own pager already did the slicing.

The symptom was silent: a 100-row page reserved 4,400px of scrollbar and
rendered only the first twenty rows. Eighty records were unreachable while the
scrollbar said they were there. Removing `rowHeight` fixed it, and Kendo then
virtualises correctly on its own — a 23-row window that moves as you scroll and
reaches the end. Virtualisation came back for free, having been dropped as
redundant.

**It was only caught by scrolling to the bottom and comparing the last row.**
Row counts and totals all looked right.

## `kendoDomProps`, and a debt from phase 5 repaid

A custom cell component replaces Kendo's own wrapper, so it must render the
`<td>`/`<th>` itself and spread the props Kendo hands it — which are written for
Kendo's internal element factory, not React DOM: camelCase ARIA (`ariaSort`,
`ariaColumnIndex`) and bookkeeping that is not an attribute at all (`columnId`,
`navigatable`). Spread raw, React warns for each, on every render, for every
cell.

`ui/kendoDomProps.ts` translates them: ARIA is converted rather than dropped,
because it carries real semantics, and the bookkeeping is removed.

**This is the fix phase 5 was missing.** §11 records the filter inputs still
being named by their field — "partSource Filter" read aloud — because the
wrapper needed to correct it produced exactly these warnings and was reverted.
The translator is what that fix lacked; applying it is now a small, known job.

## Also fixed: a latent copy of the same fault in MiniTable

`MiniTable`'s custom `headerCell` returned a bare fragment rather than a `<th>`.
No column ships a `headerRender` today, so it had never fired — found because
the identical mistake in `DataGrid`'s select-all header did.
