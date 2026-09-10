# Live system re-check — 10 Sep 2026

Read from `erp.linhlongengineering.com`, signed in by An, read-only. No record
was opened for edit, nothing was saved, no view was created or deleted.

**The headline: the live system was restructured after our 25 Aug capture, and
this repo is built against the older menu.** The production bundle changed from
`lib-bundle-D109_KxB.js` (recorded 24 Aug in `bundle-evidence.md`) to
`lib-bundle-C_71R6i_.js`. The navigation is server-driven — the app fetches
`/api/account/get/menus` — so it can change without any bundle change at all.

---

## 1. The menu was reorganised

`legacyNav` in `src/data/sitemap.ts` no longer matches what is live.

### A new **Engineering** group, which did not exist in our capture

| Live child | Route | Where our records put it |
|---|---|---|
| Parts & Item Master | `/engineering/part-mst` | Inventory › **Part Management**, `/inventory-management/part-mst` |
| Bill of Materials (BoM) | `/engineering/bom` | Inventory › Bill of Materials, `/inventory-management/bom-list` |
| Manufacturers (MFG) | `/engineering/mfg` | **Procurement** › Manufacturer Management, `/system-setup/manufacturer` |
| Part Numbers (MPN) | `/engineering/mpn` | Inventory › **Manufacture Part Number**, `/inventory-management/mpn` |
| Material Planning | `/planning` | **nowhere — new** |

`/inventory-management/part-mst` now returns **404**. That is the route
`src/App.tsx` still uses as the canonical Part Master path.

### Inventory Management kept the name and swapped its contents

Live: `Packing List` · `RMA List` · `Adjustments` · `Reporting` ·
`Configuration` · `BoM Templates`

Ours: Manufacture Part Number · Part Management · Bill of Materials ·
BoM Templates Setup · Transfers Management · Adjustments · Reporting ·
Configuration

So it lost the whole parts domain to Engineering, gained **Packing List**, and
`Transfers Management` is no longer listed under its own name (see §3).

### Labels changed on screens we already build

| Ours (25 Aug) | Live now |
|---|---|
| Part Management | **Parts & Item Master** |
| Manufacture Part Number | **Part Numbers (MPN)** |
| Bill of Materials | **Bill of Materials (BoM)** |
| Manufacturer Management | **Manufacturers (MFG)** |
| BoM Templates Setup | **BoM Templates** |

Sales Management is unchanged except that `Customer Management` now sits above
`RMA Lists`. Accounting, Production, DB Encryption and System Configuration are
unchanged, children and order.

---

## 2. What we are missing

**M1 — Microsoft SSO is a whole authentication path we do not have.**
The live login carries an `OR` divider, a **`Sign in with Microsoft`** button
and the line *"Use your organization account to sign in securely."*; the bundle
carries a `login/callback` route. `src/pages/Login.tsx` reproduces every other
string on that page and has none of this. Ours is username/password only.

**M2 — `AML Search` on Part Master.** Live toolbar is `Add new Part` ·
`Import` · `Export Part Master Data` · **`AML Search`**. Ours has the first
three. AML is the Approved Manufacturer List — the concept `MpnMapping.tsx`
already models inside a part record, with no way in from the list.

**M3 — the Bill of Materials list shows the wrong entity.**

| Live `/engineering/bom` | Ours |
|---|---|
| ASSEMBLY PN · REVISION · DESCRIPTION · BOM VERSION · CUSTOMER · LAST RUN BY · LAST RUN DATE · BOM STATUS | `PART_COLUMNS` — the Part Master columns |

`BomList.tsx` says so in its own header comment and flags it as an inference
from the Testing Guideline's "Show the list of all parts". **The live system
answers that open question**: it is a list of BoMs, with a version, a last-run
user and a last-run date — none of which a part has. Its toolbar
(`BoM Comparison`, `Upload BoM`) matches ours exactly.

**M4 — no Manufacturers screen at all.** Live `/engineering/mfg`, heading
"Manufacturer List": NAME · WEBSITE · COUNTRY · ALIASES · STATUS · LAST SYNC,
with `Add manufacturer`, `Import manufacturer`, per-row `Edit`.

**M5 — no MPN list screen.** Live `/engineering/mpn`, heading "Manufacturer
Part Number Management": MPN NUMBER · MANUFACTURER · DESCRIPTION · LIFECYCLE
STATUS · MSL LEVEL · PACKAGE TYPE · COUNTRY OF ORIGIN · PCN ALERT · LAST SYNCED
AT. Our sidebar entry for this reaches `Placeholder`.

**M6 — no Packing List screen.** Live `/inventory-management/packing-list`,
heading "Packing Lists": PACKING LIST · SALES ORDER · CUSTOMER · FULFILLMENT ·
BILLING · TOTAL QTY · SHIP DATE.

**M7 — Part Master column wording.** Live `CUSTOMER NAME`, `PART SOURCE`,
`LAST CHANGE`; ours `Customer`, `Source`, `Last Changed`. Order and count are
identical (11). Minor, but tier 2 says the words are theirs, not ours.

**`LAST SYNCED AT`, `LAST SYNC` and `PCN ALERT`** on M4/M5 point at an external
data sync we have never modelled. The bundle has `/validate/z2data` and
`/z2data` endpoints — Z2Data is a component-lifecycle data provider. Worth a
question before anyone designs those two screens.

---

## 3. Defects in the live system — their backlog, not ours

- **`Material Planning` → `/planning` → 404.** A menu entry pointing at a
  screen that does not exist.
- **`RMA List` under Inventory Management opens the Transfer screen** —
  `/inventory-management/transfer`, browser title "Transfer", heading
  "Transfer", columns TRANSFER NAME · TRANSFER TYPE · REFERENCE · WAREHOUSE ·
  PARTNER · CREATED DATE · STATUS. The label is wrong, not the screen. Our
  record of it as "Transfers Management" is the accurate one.
- **`Adjustments` is "Under Construction".** We already treat it as a stub.

---

## 4. What we have NOT over-built — checked, and traceable

- **Project Requirements is unchanged.** All 11 columns in the same order,
  same toolbar, default page size 20 (`336` → `369` items is data growth).
  `live-spec-25aug.md` still holds for our biggest screen.
- **The KPI tiles on Part Master and BoM are requested, not invented.** They
  trace to the 25 Aug review — "the KPI can also be the filter" — and to
  gap-list C3, which turns the record count into a clickable KPI summary. The
  live screens have no tiles; tier 1 overrides tier 2, so that is correct.
- **The proposed IA is labelled as a proposal**, on the Sitemap page, not
  substituted for the real menu. Worth noting to the customer that their own
  new **Engineering** group — parts, BoM, MPN and manufacturers together —
  lands close to the `Parts` group we proposed. They have moved in the same
  direction on their own.

---

## 5. What this re-check did NOT cover

- Part Master returned **0 rows** for this account, so no row rendering, cell
  formatting or record screen was compared.
- No record was opened; the Form View, Run Quotation wizard and BoM Comparison
  result view were not re-verified against `bundle-evidence.md`.
- `Material Planning` could not be inspected — it 404s on their side.
- Screens behind Procurement, Production, Accounting and System Configuration
  were not walked; nothing in this repo builds them.

## 6. A note on method

Reading the sidebar, I clicked every collapsed disclosure at once to expand the
tree. That threw `useNavigationLoading must be used within a
NavigationLoadingProvider` and blanked the React root — a client-side render
crash on the customer's production system, cleared by a reload, with nothing
written. Everything after that point was read from the DOM, or a single
identified element clicked at a time.
