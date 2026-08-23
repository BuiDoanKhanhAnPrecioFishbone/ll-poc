# Voyager ERP — UX revamp mockup

An interactive mockup for the redesign of **Voyager Cloud ERP** (`erp.linhlongengineering.com`),
built with **React + Vite**, **TanStack Table**, **Radix UI** and a design system of its own.

> **This is a mockup, not the ERP.** All data is synthetic. No customer data, no credentials
> and no production code from the live system are included in this repository.

---

## Why it exists

The revamp has four objectives. This repo is the executable argument for each of them.

| Objective | Where it lives |
| --- | --- |
| 1. A customised Kendo design system | `src/theme/` and the **Design System** page |
| 2. Restructured layout and sitemap | `src/data/sitemap.ts`, `src/components/AppShell.tsx`, the **Sitemap** page |
| 3. Standardised data-table patterns | `src/components/StandardGrid.tsx`, the **Part Master** page |
| 4. Low-to-medium effort improvements | `src/data/findings.ts` and the **UX Audit** page |

## How it is built

The repo began under a hard constraint — customise KendoReact primitives, build nothing bespoke
— because production is KendoReact and everything here had to be drop-in. That constraint was
lifted on 22 Aug 2026: components may now be built freely, with no licence, informed by
Material Design.

What that changed, and what it did not:

**Unchanged.** The design system itself. Tokens, the six-token status vocabulary, the column
role model, the restructured IA and the whole audit were always library-agnostic. That is the
part with the thinking in it.

**Replaced.** The component layer. Three libraries, all MIT:

| | | |
| --- | --- | --- |
| **TanStack Table** | grids | headless, with row virtualisation |
| **Radix UI** | dialogs, tabs, select, toast | WAI-ARIA behaviour, zero styling |
| Everything visual | `src/ui` | ours, driven entirely by tokens |

**Structure** comes from Material 3 (`src/theme/md3.css`): a five-level elevation ladder, one
state-layer treatment for every interactive surface, emphasised motion curves and a shape scale.
**Colour never does.** Every value resolves to a Voyager token, so the result reads as Linh
Long's system rather than a Google app in different paint.

### What dropping the library bought

| | Before | After |
| --- | --- | --- |
| CSS bundle | 764 kB | **51 kB** |
| JS bundle | 1,065 kB | **514 kB** |
| Rows in the DOM (2,000-row list) | 2,000 | **~40** |
| Paging | 50 per page | none — scroll all 21,941 |
| Licence | required, watermark without it | none |
| Open GAPs | 2 | **0** |

Both GAPs existed only because a third-party component would not do what the design needed.
They stopped existing when the library did — see [`gap-register.md`](docs/gap-register.md).

### The trade-off, stated plainly

Production **is** KendoReact. While this repo was Kendo-based, everything in it was directly
transferable: the same stack, restyled. It is now a design *target* — adopting it means
replacing the UI layer of a 218-chunk application. That may be exactly the intent, but it is a
different proposition and should not be discovered by accident.

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

**A design system driven entirely by tokens.** One brand ramp, one neutral ramp, six status
tokens, a fixed type scale, and three grid densities.

**An information architecture named after the work, not the database.** Eight verb-named groups
(Sell, Buy, Parts, Stock, Make, Finance, Insight) with administration moved out of the primary
navigation. Every renamed screen keeps its old name searchable in ⌘K, so anyone trained on the
current system can still find it by the name they know.

**One standard list pattern.** Column width follows from a column's *role*:

| Role | Width | Rule |
| --- | --- | --- |
| `ident` | 240px | Never truncates — it is how people refer to the record |
| `text` | 280px | The only truncatable role; full value in a tooltip |
| `code` | 96px | Sized to the longest member of the enumeration |
| `number` | 104px | Right-aligned, tabular figures |
| `money` | 124px | Right-aligned, currency-aware |
| `date` | 150px | Sized to the full rendered format |
| `status` | 128px | One badge from the six shared status tokens |

Measured in this mockup: **0% clipping on every column**, 28px rows in compact mode, 16 rows
visible where production shows 10. A new list screen costs a column spec, not a design.

---

## Running it

```bash
npm install
npm run dev
```

### Licences

None. Every dependency is MIT. There is no key to configure and no watermark.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). The defaults are correct:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

`vercel.json` already rewrites all routes to `index.html` so that deep links work.

---

## Structure

```
src/
  theme/
    tokens.css         Design primitives — the only file with raw values
    kendo-bridge.css   Maps primitives onto Kendo's CSS variable API
    app.css            Application chrome (layout only)
  data/
    sitemap.ts         Live menu payload + the proposed IA
    parts.ts           Synthetic part data + the column role model
    findings.ts        UX findings, each with evidence and effort/value
  components/
    AppShell.tsx       Persistent sidebar, breadcrumb, top bar
    StandardGrid.tsx   The standard list pattern
    CommandPalette.tsx ⌘K search, matches former screen names too
    StatusBadge.tsx    The shared status vocabulary
  pages/
    Home.tsx           Work queues, replacing the demo-chart dashboard
    PartMaster.tsx     The standard pattern on 2,000 rows
    Sitemap.tsx        Current vs proposed IA, side by side
    DesignSystem.tsx   Tokens, status vocabulary, column roles
    Audit.tsx          The findings, filterable
```

## Known gaps

- Only the Part Master is fully mocked. Other screens render a placeholder that states what the
  screen is for and where it lived in the current system.
- Data is synthetic and held in memory; there is no backend.
- The audit covers the screens reachable in the session on 19 August 2026. The RMA, PCB Viewer,
  Accounting and What-If screens were not examined in depth.
