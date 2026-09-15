# Voyager ERP — UX revamp mockup

An interactive mockup for the redesign of **Voyager Cloud ERP** (`erp.linhlongengineering.com`),
built with **React + Vite** and **KendoReact**, on a design system of its own.

> **This is a mockup, not the ERP.** All data is synthetic. No customer data, no credentials
> and no production code from the live system are included in this repository.

---

## Why it exists

The revamp has four objectives. This repo is the executable argument for each of them.

| Objective | Where it lives |
| --- | --- |
| 1. A customised Kendo design system | `src/theme/` and the **Design System** page |
| 2. Restructured layout and sitemap | `src/components/AppShell.tsx` — the layout was built, the sitemap restructure was declined (D1); both are on the **Sitemap** page |
| 3. Standardised data-table patterns | `src/ui/DataGrid.tsx`, `src/components/column-model.ts`, the **Part Master** page |
| 4. Low-to-medium effort improvements | `src/data/findings.ts` and the **UX Audit** page |

## How it is built

Production is KendoReact, so the repo began under a hard constraint: customise
Kendo primitives, build nothing bespoke. That constraint was lifted on 22 Aug
2026 and the component layer was rebuilt on headless primitives. Then, on
**4 Sep 2026, the customer answered the open question and chose KendoReact**,
and the component layer came back — phase by phase, each one a commit: tabs on
TabStrip, one checkbox, Dialog, Select on ComboBox.

The reason governs the work. The system they run today is Kendo, so the revamp
should read as the same product improved rather than as a different one. This
is not a re-skin: Kendo stays recognisably Kendo, and stops speaking two design
languages at once.

**Unchanged through both reversals.** The design system itself. Tokens, the
seven-token status vocabulary, the column role model and the whole audit were
always library-agnostic. That is the part with the thinking in
it, and it is why the component layer could be swapped twice without it moving.

**The component layer today:**

| | | |
| --- | --- | --- |
| **KendoReact** | grid, dialog, tabs, combobox, upload, Excel export, button | the production library, restyled through the bridge |
| **Radix UI** | popover, radio group, toast, slot | the four primitives Kendo does not cover |
| Everything visual | `src/ui` | ours, driven entirely by tokens |

`src/theme/kendo-bridge.css` maps Voyager tokens onto Kendo's CSS variable API.
Since 4 Sep that bridge *is* the design system rather than a compatibility
layer. **Structure** comes from Material 3 (`src/theme/md3.css`): a five-level
elevation ladder, one state-layer treatment for every interactive surface,
emphasised motion curves and a shape scale. **Colour never does.** Every value
resolves to a Voyager token, so the result reads as Linh Long's system rather
than a Google app in different paint.

**The theme is compiled to what is used.** `src/theme/kendo-subset.scss` builds
per-component Sass instead of importing Kendo's `all.css`, which is 725 kB raw
and 99 kB gzipped on its own. Nothing is generated and committed, so the subset
cannot drift from what ships.

### What it costs

Measured 13 Sep 2026 from `npm run build`:

| | raw | gzipped |
| --- | --- | --- |
| CSS | 498 kB | 75 kB |
| JS | 1,669 kB | 506 kB |

Kendo's full `all.css` is a separate 725 kB chunk, dynamically imported by
`/kendo-check` alone and never loaded by the app. The main JS chunk is over
Vite's 500 kB warning threshold and is not yet code-split.

An earlier version of this table compared bundle sizes before and after
dropping the library. It has been removed rather than updated: it described a
decision that was reversed on 4 Sep, so neither of its two columns describes
this repo.

### GAPs

Custom CSS here must cite a GAP number. Both original GAPs were retired on
22 Aug 2026 — see [`gap-register.md`](docs/gap-register.md) — and the register
stays in force for anything raised since.

### The trade-off, stated plainly

There isn't one any more, and that is the point of the 4 Sep decision.
Production is KendoReact and so is this: the same stack, restyled. Adopting a
screen costs a stylesheet and a column spec, not a rewrite of the UI layer.

What it costs instead is that the design is now bounded by what Kendo will do.
Two GAPs existed in the first Kendo era precisely because a third-party
component would not do what the design needed; they stopped existing when the
library did, and the library is back. The register is the place that argument
gets had.

---

## What was found in the live system

Every finding is measured, not estimated — taken from the rendered DOM and the menu API on
19 August 2026. The full list is on the **UX Audit** page; the headline numbers:

- **Every data column in the Part Master is exactly 108px.** Against live data that clips the
  **part number in 85% of rows**, the customer name in 100%, and the last-changed date in 100% —
  while the `ABC` column, **empty in 100% of records**, is granted the same 108px.
- **50px rows against a 21px header**, 20 rows per page, across **21,941 part records**. About
  ten rows are visible at a time.
- **All 51 navigation destinations sit behind a hamburger menu**, even at 1600px. There is no
  breadcrumb and no persistent active state.
- **"Configuration" appears five times and "Reporting" three times** in the same menu.
- **Seven screens are served from the wrong namespace** — Purchase Orders (a Procurement screen)
  resolves to `/sales-management/po-mst`; Work Orders (Production) to `/sales-management/work-orders`.
- **Three group headers route to `/`**, so clicking a section lands you on Home.
- **Every one of the 51 menu nodes returns the same `transKey` and `icon`** (`nav.dashboards.home`),
  so navigation cannot be translated and no item can have its own icon.
- **A Kendo demo chart titled "World Population by Broad Age Groups" is live on the dashboard.**

## What this mockup proposes

**A design system driven entirely by tokens.** One brand ramp, one neutral ramp, seven status
tokens, a fixed type scale, and three grid densities.

**A navigation shell, on the structure they already know.** A persistent sidebar with a
breadcrumb and an active state, replacing 51 destinations behind a hamburger — but on the live
menu, not a new one. ⌘K searches every screen, including by the name it has in the current
system.

An information architecture named after the work rather than the database *was* proposed —
eight verb-named groups (Overview, Sell, Buy, Parts, Stock, Make, Finance, Insight) with
administration moved out of the primary nav. **The customer declined it** on 24 Aug 2026:
same workflow, clearer surface, because renaming and regrouping 51 screens invalidates what
every user has already learned. It survives in `proposedNav` and on the **Sitemap** page, marked
as declined, which is where a rejected proposal belongs.

**One standard list pattern.** Column width follows from a column's *role*:

| Role | Width | Rule |
| --- | --- | --- |
| `ident` | 240px | Never truncates — it is how people refer to the record |
| `text` | 280px | The only truncatable role; full value in a tooltip |
| `code` | 96px | Sized to the longest member of the enumeration |
| `number` | 104px | Right-aligned, tabular figures |
| `money` | 124px | Right-aligned, currency-aware |
| `date` | 150px | Sized to the full rendered format |
| `datetime` | 190px | A moment, not a day — 150px fits "16 May 2026" and clips the time off it |
| `status` | 128px | One badge from the seven shared status tokens |
| `priority` | 104px | A dot and a word; the widest is "Medium" |

Measured in this mockup: **no clipped identifiers** — `text` is the one role that truncates,
and it carries the full value in a tooltip — against 85% of part numbers clipped in production.
28px rows in compact mode. A new list screen costs a column spec, not a design.

---

## Running it

```bash
npm install
npm run dev
```

### Checks

```bash
npm run check         # everything: about ten minutes
npm run check:fast    # lint, css, build: about ten seconds
npm run check:visual  # the five browser checks, server and all
```

`check:visual` starts its own dev server on the port the checks read, runs all
five against it — every one, even after a failure, because they are independent
measurements and you want the whole list — and shuts it down. If you already
have a server on that port it is reused and left alone.

Measured on 13 Sep 2026, so nobody has to guess where the ten minutes go:

| | |
| --- | --- |
| `render:check` | 86s |
| `touch:check` | 126s |
| `focus:check` | 153s — 1,081 controls focused one at a time, three passes |
| `mobile:check` | 259s — twelve routes, four viewport-and-theme passes |
| `hover:check` | 47s — every control hovered with its ancestors, and compared with its copies |

Two things run these without being asked:

| | | |
| --- | --- | --- |
| **`.githooks/pre-push`** | before every push | `check:fast`, ~10s |
| **`.github/workflows/check.yml`** | every push and PR | everything, the five browser checks as parallel jobs |

First run, all five jobs green: 5m29s wall clock, 12m24s of runner time. The
repo is public, so those minutes are free.

The hook is installed by `npm install` (the `prepare` script points
`core.hooksPath` at `.githooks`) — nothing to install separately, and the hook
lives in the repository rather than in one person's `.git`. It runs only the
cheap half on purpose: a ten-minute wait on every push is a hook people disable
within a week. Skip it once with `git push --no-verify`.

### Licences

**KendoReact is commercial and this repo uses it.** The key lives in
`.env.local` as `TELERIK_LICENSE`, gitignored via `*.local`, and Vercel needs it
set in the dashboard — see
[`kendo-license-activation.md`](docs/kendo-license-activation.md).

One thing worth recording, because it is easy to mistake for "no licence
needed". Checked on 13 Sep 2026: the key has never actually been activated on
the dev machine — `.env.local` is a Vite convention that `kendo-licensing`'s
postinstall does not read, and the variable was never exported — and despite
that there is no watermark and no console warning, in the dev server *or* in
the production build, on a page rendering a real Kendo Grid. So the enforcement
is not visible here.

That is a fact about the tooling, not permission to skip the licence. It is
paid, per-developer software; the absence of a watermark is not the absence of
the obligation. It does mean CI needs no secret, which is why
`.github/workflows/check.yml` asks for none.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). The defaults are correct:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

`vercel.json` already rewrites all routes to `index.html` so that deep links work.

The defaults are not quite everything, though: set **`TELERIK_LICENSE`** under
Settings → Environment Variables, ticked for Production, Preview *and*
Development, since Vercel builds previews the same way it builds production.
The signal that it worked is in the **install** log, not the build log — see
[`kendo-license-activation.md`](docs/kendo-license-activation.md).

---

## Structure

```
src/
  theme/
    tokens.css         Design primitives — one of the only two files with raw values
    tokens.ts          The same layer, for values a Kendo prop needs as a number
    base.css           Reset and document defaults
    md3.css            Material 3 structure: elevation, state layer, motion
    kendo-subset.scss  Kendo's per-component Sass, built to what is used
    kendo-bridge.css   Maps primitives onto Kendo's CSS variable API
    components.css     The component layer
    app.css            Application chrome (layout only)
    responsive.css     Breakpoints, and everything behind (pointer: coarse)
  data/
    sitemap.ts         Live menu payload + the proposed IA
    parts.ts           Synthetic part data + the column specs
    status.ts          The shared status vocabulary
    findings.ts        UX findings, each with evidence and effort/value
  ui/                  The component library — ours, driven entirely by tokens
    DataGrid.tsx       The standard list pattern
    Badge.tsx          One badge from the seven status tokens
    Pager.tsx, ColumnChooser.tsx, FilterToolbar.tsx, ViewPicker.tsx, …
  components/          Application-level composites
    AppShell.tsx       Persistent sidebar, breadcrumb, top bar
    column-model.ts    Column roles and the width that follows from each
    CommandPalette.tsx ⌘K search, matches former screen names too
    quotation/         The record screen's own pieces
  pages/
    Home.tsx           Work queues, replacing the demo-chart dashboard
    PartMaster.tsx     The standard pattern on 2,000 rows
    BomList.tsx, MpnList.tsx, ManufacturerList.tsx, PackingList.tsx
    Quotations.tsx, QuotationDetail.tsx, Queues.tsx, Login.tsx
    Sitemap.tsx        Current vs proposed IA, side by side
    DesignSystem.tsx   Tokens, status vocabulary, column roles
    Audit.tsx          The findings, filterable
    Placeholder.tsx    Everything not yet built
scripts/               The checks — see "Checks" above
```

## Known gaps

- **Twelve screens are built**: Part Master, BOM, MPN, Manufacturer, Packing
  List, Quotations, the Quotation record, Work Queues, Home, Login, Sitemap and
  the Design System, plus the Audit. Everything else in the 51-destination
  sitemap renders a placeholder that states what the screen is for and where it
  lived in the current system.
- Data is synthetic and held in memory; there is no backend.
- The audit covers the screens reachable in the session on 19 August 2026. The
  RMA, PCB Viewer, Accounting and What-If screens were not examined in depth.
- **The phone layout has never been checked against the live system.** Every
  phone figure in the comparison document is this mockup. Auditing production at
  phone size would mean signing into the customer's system, and the audit above
  was taken at desktop size only.
- The main JS chunk is over Vite's 500 kB warning threshold and is not yet
  code-split.
