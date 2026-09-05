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
| **1** | ~~`Button`~~ — **DONE.** The §9 blocker was misdiagnosed; see §16 | one file | — |
| **2** | `TextField` (40) → Input/NumericTextBox/DatePicker | medium | low |
| **3** | `Select` (37) → DropDownList/ComboBox | medium | **medium** — must preserve the filter-as-you-type behaviour An specifically caught |
| **4** | `Dialog` (21) → Dialog/Window | medium | medium — three-deep nesting must keep working |
| **5** | ~~`MiniTable` (16) → Grid~~ — **DONE.** Filter cells taken. See §10 | one file | — |
| **6** | ~~`DataGrid` → Grid~~ — **DONE.** See §13 | one file | — |
| **7** | ~~ExcelExport + Upload~~ — **DONE.** See §14 | medium | — |
| **8** | ~~Re-run the a11y audit, `css:check` rethink, responsive re-check~~ — **DONE.** See §15 | medium | — |

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


---

# 14. Phase 7 — ExcelExport and Upload. Run 31 Aug 2026. **Done.**

The two capability wins. Between them they close nine `notImplemented` toasts —
there are now **none left** for export or upload.

## Export — four places, one hook

`ui/useExcelExport.tsx`. Each caller passes the rows and the `ColumnSpec[]` it is
already rendering, so the spreadsheet has the same columns, in the same order,
under the same headings as the screen. A second column list would drift from the
first the moment anyone added a column.

| Where | Scope |
|---|---|
| Part Master | the SELECTION when there is one, the filtered view otherwise |
| Quotations list | the filtered set |
| Quotation Result tab | the costed lines |
| BoM Comparison | flattened to one row per difference |

**Values, not rendered cells.** `ColumnSpec.render` returns JSX — a link, a
badge, a formatted price — which is right for a screen and useless in a
spreadsheet. The export takes the raw field value and hands Excel a number
format by column role, so a money column arrives as a **number you can sum**
rather than the text "US$131.15". Columns that exist only as a control carry no
data and are dropped; `sortable: false` already marks them.

**BoM Comparison is flattened.** On screen it is grouped by part, one expandable
block each. A spreadsheet wants one row per difference — Part, Column, BoM 1,
BoM 2, Status — which is also the shape the live system's own result has.

## Verified, and how

The preview pane **blocks a download the page starts itself**, so `save()`
succeeds and nothing appears — which looks exactly like a broken export. The
proof is `toDataURL(rows, cols)`, which returns the same workbook as a string:

- all 2,000 parts → a **231 KB** data URL, MIME
  `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, with the
  `PK` zip header of a real xlsx
- one row selected → **7.6 KB**, and the button's label changes to "Export 1
  selected"

That note is in the hook, because the next person to test this will otherwise
conclude it does not work.

## Upload — five places, one control

`ui/FileDrop.tsx`, over Kendo's `Upload`. The sweep recorded the gap plainly:
"`k-upload` ships and we have no file input at all — every upload in this
prototype reports what it would do." Now there is a real `<input type="file">`
with drag and drop, the file's name and size on screen, and removal — on the
Run Quotation BoM file, Create BoM, BoM Comparison, checklist documents and new
part attachments.

**Nothing is uploaded, and the control says so.** `autoUpload` is off and no
`saveUrl` is set, because there is no server; a `saveUrl` pointing at nothing
would show every file as failed. The hint reads "Chosen files stay in this
browser — this prototype has nowhere to send them."

Parsing the spreadsheet — column detection, merge rules, MFG/MPN pairs — remains
unbuilt and is recorded as such in the testing docs. **Choosing the file is the
part that was missing from the UI**, and that is what this adds.

## A mistake worth recording

The first install ran as a background command, which does **not** inherit the
shell's working directory. It created a `package.json`, a lock file and 30 MB of
`node_modules` in `/Users/nguyenhuyen/development/LL` — the parent of the
project. Removed, and reinstalled with an explicit `cd` inside the background
command. Anything backgrounded from now on states its own directory.


---

# 15. Phase 8 — audits re-run against the Kendo DOM. 31 Aug 2026. **Done.**

§3.3 said the accessibility work would have to be redone because it was measured
against **our** DOM. Phases 5, 6 and 7 replaced that DOM three times. This is the
pass over what they left.

## The §11 defect is fixed

Filter inputs announced themselves by the FIELD — "part Filter", "partSource
Filter" — so a screen reader read camelCase identifiers aloud where a sighted
user saw the column heading. §11 recorded the fix as attempted and reverted,
because wrapping the filter cell leaked Kendo's internal props onto the DOM as
React warnings on every render.

`kendoDomProps`, written in phase 6 for a different reason, is exactly what that
attempt was missing. The wrap is now in place and the inputs read **"Component
Part filter"**, **"Part Source filter"**. Filtering and the ten-operator menu
both still work — checked, because replacing a library's own cell is how you
silently lose its behaviour.

## The regression from §11 is closed

Kendo puts `aria-sort` on **every** column header, including ones it correctly
marks unsortable — and `aria-sort="none"` does not mean "not sortable", it means
sortable and currently unsorted. So a column of checkboxes or buttons announced
itself as something you could order by. The hand-written tables deliberately
omitted it; §11 recorded losing that as a regression.

`kendoHeaderProps` drops it, and both grids now supply a header cell for their
control columns. Verified: on the Checklists tab, `Actions` has **no**
`aria-sort` while the six real columns keep theirs.

## DataGrid, audited on its new DOM

| | Result |
|---|---|
| ARIA structure | `role=grid` owning presentation tables — 15 columnheaders, 300 gridcells, 21 rows |
| Interactive controls | **41, none unnamed** |
| Keyboard | header takes focus, **Enter sorts**; one `tabindex=0` entry point, 313 at `-1` |
| Row checkboxes | all 21 reachable |
| Responsive @375 | page does not scroll sideways; the grid scrolls inside itself; pager visible |

The `.k-table` sitting past the right edge at 375px is **inside** that scroller,
which is the required behaviour: fifteen fixed-width columns cannot fit a phone
and should not try.

## `css:check` gained a sixth check

The script asked two questions — "does this rule use the scale" and, in its
sibling, "does this rule still describe real markup". Since the migration there
is a third: **does this rule style a third-party class without saying where.**

Every Kendo override in this app is scoped to one of our containers —
`.vy-grid-k .k-grid`, never a bare `.k-grid` — because an unscoped one reaches
every Kendo component on every screen, including ones nobody was thinking about.
That is how two systems end up fighting, and phase 5 spent an afternoon on the
mirror image of it when `.vy-td` met a real `<table>`.

Check 6 enforces it. **Verified by planting a bare `.k-grid { }` and watching it
fail**, then removing it — a check that has never failed is not yet a check.

## What phase 8 did not do

- **Contrast was not re-measured** on the new DataGrid surfaces. The tokens
  driving them were measured when they were set, and the Kendo bridge maps our
  values rather than introducing new ones — but that is an argument, not a
  measurement.
- ~~**Tab ORDER within the grid**~~ **CLOSED 5 Sep** — swept, and clean. The
  grid is one tab stop with a correct roving tabindex (1 cell at 0, 313 at -1),
  a row costs two stops rather than fifteen, and the derived order was checked
  against real Tab presses. See `docs/focus-order.md`.


---

# 16. Phase 1, unblocked. 31 Aug 2026. **My diagnosis in §9 was wrong.**

§9 concluded "KendoReact 16's Button breaks the app under React 19", having
ruled out the Vite dep cache, duplicate React, missing peers and dep-graph
splitting, and having watched a **production** build fail with React error #185.
Every one of those observations was accurate. The conclusion drawn from them was
not.

## The evidence was on screen the whole time

Phases 5 and 6 put Kendo Grids into this app, and Kendo's Grid renders **Kendo
Buttons** in its own filter cells. Twelve of them were on screen, working, with
no console errors, while the scope still said the Button was broken. Checking
that took one query and would have reopened the phase a day earlier.

## The actual cause: one prop

Found by bisection — minimal props rendered fine, `{...rest}` looped, `{...rest}`
minus `ref` rendered fine.

`rest` carried a **`ref`**. In React 19 `ref` is an ordinary prop, so when
`Popover.Trigger asChild` clones our Button it injects its ref along with
`data-radix-popper-*`, and the spread handed all of it to Kendo.

**Kendo's Button does not forward a DOM node.** Its `useImperativeHandle` exposes
`{ element, selected }`. Radix took that object as the element to position its
popover against and re-measured it forever — "Maximum update depth exceeded", in
dev and in production alike, which is exactly why the production build failing
looked like proof of a library fault.

## The fix

Not dropping the ref, which would break the popovers that need it: **unwrapping
Kendo's handle to the node underneath.** A DOM node is what our Button's own
contract promises anyone who asks for its ref; Kendo's handle is an
implementation detail and now stops at that boundary.

Verified: the ColumnChooser popover — a `Popover.Trigger asChild` around our
Button, the exact path that broke — opens and anchors to its trigger, with zero
console errors.

## A second thing this uncovered

`tonal` was mapped to Kendo's `flat` fill. `.k-button-flat` sets
`background: initial **!important**`, so the tint could never land there however
specific the selector. The giveaway was precise: the text colour from my rule
applied while the background from the *same rule* did not.

Tonal now rides on Kendo's `solid`, whose background is set normally — and that
is the better mapping anyway, because MD3's tonal **is** a filled button at low
emphasis rather than a flat one. Verified: `rgb(238,244,252)`, our blue-50, with
blue-800 text. No `!important` anywhere.

## The lesson worth keeping

Ruling out four causes is not the same as finding one. §9 listed everything the
fault was *not* and then named a culprit that none of the evidence pointed at —
and the contradicting evidence was already rendering on screen. **A negative
result is not a diagnosis.**

## All eight phases are now complete

Phase 1 was the last one open. What remains is not engineering: **open question
2, whether to adopt KendoReact at all, is still unanswered.** TanStack Table and
Virtual stay in `package.json` unimported so that this is still reversible.

---

# §17 — The customer said yes, and the bridge became the design system

**4 September 2026.** Open question 2 is answered: adopt KendoReact. The reason
given is not incidental and it governs everything below — *the system they run
today is Kendo, so the revamp should read as the same product improved rather
than as a different one.*

That rules out the obvious reading of "improve the design system on top of
Kendo". This is **not** a re-skin. Kendo stays recognisably Kendo. What changes
is that it stops speaking two design languages at once.

## What being undecided had been costing

Phase 0 mapped 18 of Kendo's 453 variables and deliberately stopped, recording
three things as "a design call, not a mapping": elevation, motion, and disabled
state. That was the right call at the time — you cannot decide how two systems
should merge while it is still open whether one of them is being kept.

The cost was that the app ran **two complete parallel systems**:

| | ours | Kendo's |
|---|---|---|
| elevation | `--vy-elev-1..5`, blue-tinted | `--kendo-elevation-1..5`, neutral black |
| easing | 4 curves | 8 curves |
| duration | 3 rungs | 13 rungs, all deriving from one kill switch |
| disabled | `.38` (MD3) | `.6` |
| focus | one ring token | per component |

These are not abstract. A Kendo dropdown opens inside our dialog; a disabled
Kendo button sits beside a disabled Save. Adjacent components were visibly
different, and the disabled opacity gap — `.38` against `.6` — is the kind of
thing that reads as sloppiness rather than as a decision.

## The principle, stated once

> **Our token wins where ours is demonstrably better for this app.
> Kendo wins where Kendo's system is more complete than ours.**

Both directions appear in the file. A bridge that only ever pushed our values
onto Kendo would be a re-skin wearing a map's clothing.

- **Elevation → ours.** Rung for rung; both scales are 1..5 ordered by height,
  so this is a map rather than an interpretation. Ours is tinted with the house
  blue so a shadow on a blue-grey surface reads as depth rather than as dirt.
- **Motion → ours for easing, Kendo's for the switch.** See the trap below.
- **Disabled → Kendo's number**, and `--vy-state-disabled` moves from `.38` to
  `.6` to meet it. MD3's `.38` assumes comfortable type; the house body size is
  13px, and a disabled button here carries the *reason* it is disabled in a
  tooltip the user first has to notice is worth hovering.

## The trap in the motion mapping

Worth recording because the obvious mapping silently breaks accessibility.
Kendo declares every duration as

```css
--kendo-duration-brief: var(--kendo-duration-global, 100ms);
```

`--kendo-duration-global` is normally **unset**, so the 100ms fallback applies.
Its one declaration is inside `@media (prefers-reduced-motion: reduce)`, where
it becomes `0.01ms` — collapsing all thirteen durations at once. It is a good
design and we have no equal to it.

So `--kendo-duration-brief: var(--vy-dur-short)` would pin the duration and
**discard the switch**: reduced-motion users would keep every animation. The
mapping puts our value in the *fallback slot*, where Kendo put its own, and the
switch survives untouched.

## The defect this pass found

Kendo's focus indicator for a button is:

```css
outline: 0;
box-shadow: 0 0 0 2px color-mix(in srgb, var(--kendo-color-on-app-surface) 8%, transparent);
```

Eight per cent of the text colour is a hairline at best. On this app it computes
to `oklab(0 0 0 / 0)` — **fully transparent**. Measured with the bridge both on
and off: identical, so this is Kendo's own design and not something the variable
map caused.

**It is a regression we introduced.** `md3.css` gives the whole app a ring:

```css
:where(button, a, input, …):focus-visible { box-shadow: var(--vy-focus-ring); }
```

`:where()` contributes **zero specificity** — chosen so a component could
override the ring without a fight. That choice is exactly what makes it lose
here: the rule weighs (0,1,0) and Kendo's `.k-button.k-button-solid.k-button-base.k-focus`
weighs (0,4,0). **Phase 1 turned every Button in the app into a `.k-button`, and
every button quietly stopped showing focus.** Neither the phase 1 check nor the
phase 8 accessibility pass caught it, because both looked at what was *on* the
screen rather than at what a keyboard could *reach*.

### Why `!important`, when nothing else in the theme uses it

The honest alternative is to out-specify Kendo, and that was measured: the
deepest Kendo focus selector in the stylesheet carries **six** classes. Winning
by stacking means writing `.k-button.k-button.k-button…` today and re-counting
on every Kendo upgrade — a race where losing is silent and invisible by
definition. A focus indicator is not a style preference; it is the floor that
lets someone use the app without a mouse, and it should not be overridable by a
third-party rule we do not control. Scope is kept to `.k-*` elements and to the
two focus properties, so it can never reach our own components.

Grid cells take an **inset outline** instead of the ring: the ring is two
spreading shadows, and on a cell inside a scrolling grid the outer 4px is
clipped by the viewport edge and the neighbouring cell's border, so it reads as
a smear on the leading edge only.

## Verifying it cost four false negatives

Every one of them said "the fix does not work", and every one was the check
rather than the code. Recorded because the pattern is now unmistakable:

1. **Tab presses did nothing** — the Browser pane was hidden, so key events
   never landed. The log came back empty.
2. **`fv: true` on a first probe** — read as proof of keyboard modality; it was
   not, and the same probe after a reload returned `false` for `.vy-input`,
   which certainly *does* have a ring. A check that contradicts a known-good
   control is measuring itself.
3. **`getComputedStyle` inside a `focusin` handler** returns the style before
   the focus state is applied, while `matches(':focus-visible')` in the same
   handler evaluates live. The two disagreed, and the disagreement was the tell.
4. **The real one.** With the pane hidden, `document.visibilityState` is
   `"hidden"`, which freezes CSS transitions. `getAnimations()` showed a
   `CSSTransition` on `box-shadow`, `playState: "running"`, `currentTime: 0` —
   **stuck on the first frame of the ring's own 150ms fade-in, forever.** The
   computed value was our ring's exact two-shadow shape with every value zeroed.
   Setting `transition: none` returned
   `rgb(255,255,255) 0 0 0 2px, rgb(42,99,184) 0 0 0 4px` — the ring, correct
   all along.

Visual proof was then obtained by neutralising transitions and screenshotting:
the Import button carries the ring.

**The lesson is the same one phase 1 taught and is now earned twice: when a
check reports that nothing happens anywhere, doubt the check first.**

## What `css:check` now reports

Seven findings in `kendo-bridge.css` — five `important`, two `kendo-scope`. All
seven are deliberate and none is counted as a failure, because the checker
treats bridge files as reported-not-failed. The `kendo-scope` pair is flagged as
"reaches every screen", which for a focus ring is the point rather than the
problem. `0 off-scale in owned stylesheets` is unchanged.

## Also done

**TanStack Table and Virtual removed.** They stayed in `package.json`,
unimported, through all eight phases so a "no" could be honoured. That hedge is
spent, and an unused dependency nobody can explain later is a liability rather
than an option.

**The bridge header was lying.** It said "NOT IN USE by the app. Loaded only by
`/kendo-check`". That stopped being true at phase 5, when the first Kendo Grid
shipped, and `main.tsx` has set `data-kendo-bridged` on the root all along.
Corrected.

## What this pass did not do

- **Contrast was not re-measured** on the new focus ring against every Kendo
  surface. The ring is unchanged from the one already passing on our own
  components, but "unchanged token" is not the same as "measured in a new place".
- **The 150ms fade-in on the focus ring is left as Kendo designed it.** Tabbing
  quickly means a ring that never reaches full strength before focus moves on.
  It is short enough to read, and shortening it is a taste call nobody asked for
  — but it is a real question, not an oversight.
- **The remaining 11 durations and the expressive easings stay unmapped.** We
  have no counterpart in a three-rung scale, and an invented rung is a guess
  that later reads as a decision.
- **Radix still owns Dialog, Tabs, Checkbox, Toast and the rest.** Adoption
  answered "do we use Kendo", not "does Kendo replace every primitive". Those
  are working, accessible and layered correctly; swapping them is its own piece
  of work with its own risk, and would need a reason better than symmetry.
