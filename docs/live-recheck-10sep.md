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

## 5. Second pass — the items the first pass left open

### Part Master rows — covered

**21,959 items, 20 per page.** The "0 - 0 of 0" in the first pass was me
sampling mid-load; the check was wrong, not the screen.

The row model has **13 columns, not 11**: a leading **select checkbox**, then a
leading **icon button that opens the record**, then the eleven named ones.

| What | Live | Ours |
|---|---|---|
| Opening a record | leading icon-button column; **PART NUMBER is plain text** | the identifier is the link |
| `LAST CHANGE` | `09/09/2026 16:35:29` — MM/DD/YYYY, **with seconds** | `16 May 2026` — date only |
| `STATUS` | rounded pill, green `#e2f3e6` on `#1e6b34` | `StatusBadge` — same idea |
| Row select | checkbox, `Select Row` | same |

Two things follow.

**The eye-icon column is on this screen too.** Our records had only noted it on
Project Requirements. Our choice to hang opening off the identifier instead is
*already* documented as standing against a client document knowingly, and is
open question 1 — so it is escalated, not invented. But the customer's pattern
is more consistent than we recorded, which strengthens their side of it.

**`fmtDateTime`'s open question is answered.** Its comment says seconds were
dropped because "the seed sets seconds to zero on every record, so a seconds
field would read `:00` on every row… worth confirming whether seconds carry
meaning for them". The live data settles it: `16:35:29`, `15:51:03`, `10:48:17`
— real seconds, displayed. And `LAST CHANGE` carries a **time at all**, where we
render it date-only through `fmtDate`.

### Form View — covered, and it matches

Route `/sales-management/quotation/:id`, opening as a maximisable panel
(`restore` / `close`).

- **Tabs — all five, exact:** Specific Requirements · Checklists & Assignment ·
  Quotation Result · Conversations · Activity Logs.
- **Sections — exact:** `ITAR`, `QUOTE CONFIGURATION`,
  `TECHNICAL SPECIFICATIONS`, `SPECIAL REQUIREMENTS & OPTIONS`,
  `ADDITIONAL NOTES`.
- **Fields — all 27 present in `requirementFields.ts`**, including the required
  markers. Nothing missing, nothing extra.
- `Historical RFQ` is absent from the live record and present in ours —
  expected: it is conditional on Order Type `Repeat`, and this record is not.
- The one wording difference is deliberate and labelled: live
  `Provide Alt Aml For Out Stock`, ours `Provide Alt AML For Out of Stock`,
  with the reason recorded at `src/data/quotations.ts:215`.

**But the record actions do not match.**

| Live | Ours |
|---|---|
| Edit · BoM Comparison · Run Quotation · **Confirm RFQ** · **Cancel** | Edit · BoM Comparison · Run Quotation |

`Confirm RFQ` appears **nowhere in this codebase**, though `components.css`
already refers to a red part blocking it. Both are state transitions on a real
customer record, so neither was clicked to see what it does.

### Run Quotation and BoM Comparison — still NOT verified

All four chunks `bundle-evidence.md` was extracted from — `chunk-BAkpvJLm`,
`chunk-DtT2PYYA`, `chunk-CQr-c-QW`, `chunk-CeuR-5ZG` — now **404**, and the new
`lib.js` references none of them. The rebuild re-obfuscated: `Config BoM`,
`Review BoM`, `AML Search` and `Packing List` all return zero plain-string hits
in the new bundle although they are visibly on screen.

So that evidence describes a build that no longer exists. Re-verifying means
either redoing the RC4 string-array extraction against the new chunks, or
clicking `Run Quotation` on a live RFQ — a write on the customer's production
data, which is not mine to take unsupervised. **Neither was done.** The
structure may well be unchanged; we simply cannot say so from evidence.

---

## 6. What this re-check did NOT cover

- **Run Quotation** and **BoM Comparison** — see above; evidence is stale and
  re-verifying costs either a re-extraction or a write.
- `Confirm RFQ` and the record-level `Cancel` — seen, deliberately not clicked.
- The four other tabs of the Form View — only Specific Requirements was read
  field by field.
- `Material Planning` could not be inspected — it 404s on their side.
- Screens behind Procurement, Production, Accounting and System Configuration
  were not walked; nothing in this repo builds them.

## 7. A note on method

Reading the sidebar, I clicked every collapsed disclosure at once to expand the
tree. That threw `useNavigationLoading must be used within a
NavigationLoadingProvider` and blanked the React root — a client-side render
crash on the customer's production system, cleared by a reload, with nothing
written. Everything after that point was read from the DOM, or a single
identified element clicked at a time.
