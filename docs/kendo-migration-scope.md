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
| **5** | `MiniTable` (16) → Grid, **and take per-column filter cells** | large | medium |
| **6** | `DataGrid` (3 call sites, 438 lines) → Grid + virtualisation, re-wiring views, density, column chooser, selection | **large** | **high** — the most feature-dense component in the app |
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
