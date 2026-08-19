# Voyager ERP — UX revamp mockup

An interactive mockup for the redesign of **Voyager Cloud ERP** (`erp.linhlongengineering.com`),
built on the same stack as the production system — **React + Vite + KendoReact** — so that
everything demonstrated here is directly transferable.

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

## The constraint this respects

> *Customise design primitives only. Use existing Kendo components. Build nothing bespoke.*

No Kendo component is re-implemented or overridden by copying its internal CSS. The entire
visual change is achieved by defining primitives in `src/theme/tokens.css` and mapping them onto
Kendo's own CSS variable API in `src/theme/kendo-bridge.css`. Change a value in `tokens.css` and
every Kendo component — Grid, Button, Dialog, DropDownList, Charts — updates with it.

The only non-Kendo UI in the repo is application chrome that Kendo does not ship: the sidebar,
the breadcrumb bar and the ⌘K palette.

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

### KendoReact licence

KendoReact requires a licence key. Without one, every component renders a trial watermark and a
banner across the top of the page — which is what you will see on a fresh clone.

Linh Long already holds a KendoReact licence (the production ERP uses it). To activate:

**Locally** — download your key from [telerik.com](https://www.telerik.com/account/your-licenses/license-keys)
and save it as `kendo-ui-license.txt` in the repo root. It is git-ignored and must never be committed.

**On Vercel** — add an environment variable named `KENDO_UI_LICENSE` with the key as its value.
The build script activates it automatically.

The build succeeds without a key; the watermark is cosmetic.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). The defaults are correct:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `KENDO_UI_LICENSE` (see above) |

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
- No `package-lock.json` is committed, so `npm install` resolves the latest patch versions within
  the ranges in `package.json`.
- The audit covers the screens reachable in the session on 19 August 2026. The RMA, PCB Viewer,
  Accounting and What-If screens were not examined in depth.
