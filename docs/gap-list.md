# Gap list — prototype vs (live baseline + customer requirements)

Built from `docs/live-spec-25aug.md`, read off the live system 25 Aug 2026.
Precedence per `docs/precedence.md`.

**LIVE** = live system is right, prototype is wrong, fix to match.
**REQ** = customer requirements override the live system; prototype already correct.

---

## A. Record form — the largest cluster

| # | Item | Live | Prototype | |
|---|---|---|---|---|
| A1 | Tab names | Specific Requirements · Checklists & Assignment · Quotation Result · Conversations · Activity Logs | Requirements · Checklists · Result · Conversations · Activity | **LIVE** — all five shortened without being asked |
| A2 | Section names | QUOTE CONFIGURATION · TECHNICAL SPECIFICATIONS · SPECIAL REQUIREMENTS & OPTIONS · ADDITIONAL NOTES | Commercial · Technical · Inventory & options | **LIVE** — all invented |
| A3 | Required markers | `(*)` on 16 fields | none | **LIVE** — no field is marked required anywhere |
| A4 | Excess and MOQ | None · Low · OK | different values | **LIVE** — invented options |
| A5 | Net Consigned Inventory | No · Yes-No Charge | 3 options | **LIVE** |
| A6 | Rocket Consigned Inventory | No · Yes-No Charge · Yes-Charge | matches | ok |
| A7 | Those three fields | inline radio groups | dropdowns | **LIVE** |
| A8 | `Excess and MOQ` | lower-case "and" | `Excess And MOQ` | **LIVE** |
| A9 | `Internal notes` | lower-case "notes" | `Internal Notes` | **LIVE** |
| A10 | RFQ Type | grid column only, **not on the form** | on the form | **LIVE** — remove |
| A11 | Historical RFQ | **not on the record at all** | a form field I added | **LIVE** — remove |
| A12 | Close button | `Cancel` | `Back` | **LIVE** |
| A13 | Conversations | Comment / Send Email choice + rich text editor | plain comment list | **LIVE** — capability missing |
| A14 | Quotation Result columns | 11 named columns | fewer | **LIVE** |
| A15 | Header field set | 11 fields incl. ITAR as a field | ITAR as a badge only | **LIVE** |

## B. List screen

| # | Item | Live | Prototype | |
|---|---|---|---|---|
| B1 | Advanced filter | all fields at once, **no operators**, date From/To pairs | operator-based condition builder | **LIVE** — invented |
| B2 | Saved views | `Select View`, named, savable, default-able | none | **LIVE** — capability missing |
| B3 | View Setting dialog | Filter / Column / Sort tabs | none | **LIVE** — capability missing |
| B4 | Column config | drag to reorder · **editable column name** · **per-column width** · required markers | on/off checklist | **LIVE** |
| B5 | Sort | multi-level, reorderable, per-field asc/desc | single-column header click | **LIVE** |
| B6 | Filter panel default | hidden, toggled by funnel | always visible | **LIVE** |
| B7 | Page size | 20, label `items per page` | 50 | **LIVE** |
| B8 | Pager text | `1 - 20 of 336 items` | `Showing 1–13 of 13` | **LIVE** |
| B9 | Grid columns | 11, incl. Application / RFQ Type / OrderType | 12, different set | **LIVE** |
| B10 | Create button | `Add New`, left | `New RFQ`, left | **LIVE** — position right, name wrong |
| B11 | Filter fields | Priority · No · Project Name · Customer Name · Status + 3 date ranges | different set | **LIVE** |

## C. Where the requirements override the live system — prototype is right

| # | Item | Live | Requirement | Prototype |
|---|---|---|---|---|
| C1 | Priority | stars | dot + label | ✅ correct |
| C2 | Breadcrumbs | present | remove | ✅ removed |
| C3 | Record count | in module name | KPI summary, clickable | ✅ done |
| C4 | Row density | — | user preference | ✅ done |
| C5 | Smart buttons | absent | required | ✅ added |
| C6 | Global header | no clock/tz/language | add all three | ✅ done |
| C7 | My Queues | absent | header icon + badge | ✅ done |
| C8 | Collapsed menu | group icons | per-item icons | ✅ done |
| C9 | Activity Logs | grouped by year | group by date **and user**, click for detail | ✅ done |
| C10 | Field grouping | four sections exist | group related data by region | ✅ done — but use **A2**'s real names |
| C11 | Date display | mixed | one format, exact or relative | ✅ done |
| C12 | Label casing | mixed | consistent | ✅ done |

## D. Live defects worth reporting to the customer

| # | Defect |
|---|---|
| D1 | Grid column `OrderType` has no space |
| D2 | Grid column `Created Date ` has a trailing space |
| D3 | `Polumeric Required` misspelled in the Program checklist |
| D4 | `Provide Alt Aml For Out Stock` — acronym mis-cased, word missing |
| D5 | Sort tab reuses the Column tab's hint verbatim — says "columns" on a sorting panel |
| D6 | Sort tab's add button reads `Add a column` |
| D7 | Demo pie chart `World Population by Broad Age Groups` still on Home in production |
| D8 | One date is `Due Date` on the form and `Date Needed` on the grid |
| D16 | The placeholder could not name itself outside the live menu's leaves: module roots, the proposed `/sell` and `/settings` tree, and any typo all rendered the word "Screen" over an empty subtitle. Closed 9 Sep |
| D15 | Home and My Queues printed "Tuesday 19 August" as a string literal, frozen on the day those screens were built. Three weeks later both greeted every visitor with the wrong day — on a screen whose own header carries a live clock, so the page disagreed with itself two inches apart. Closed 9 Sep |
| D13 | Part Master's column ORDER did not match the live system — Customer and Description swapped, Status and Last Changed swapped, and Part Class / Part Type / ABC pushed to positions 12–14 behind three columns the live list does not have. The same correction as B9, never applied to this screen. Closed 9 Sep |
| D14 | `hiddenByDefault` was honoured by nothing. It set the width budget and was ignored when a screen built its default view, so ABC — empty in 100% of records — opened at full width beside the part number, which is the finding the original audit led with. Closed 9 Sep |
| D12 | Bill of Materials was the last list screen with a search box and nothing else — no filter, saved views, column chooser or KPI summary, and the subtitle "assemblies". Closed 8 Sep |
| D11 | Part Master opened with the subtitle "parts" and no KPI summary, so the 25 Aug review's "the KPI can also be the filter" reached only one of the two list screens. Closed 8 Sep |
| D9 | `Assigned To` is not a list column and the Column tab does not offer it, so an estimator cannot see who owns a row without opening it — worth raising, given My Queues is built on assignment |
| D10 | The guideline says Priority uses "star icons"; the 25 Aug review asked for a dot and a label. Both are customer sources — the review is newer and explicit, so it wins. Flagging so nobody re-reads it as a regression |

---

## Customer answers, 25 Aug 2026

**Read-only field styling** — confirmed: grey box in EDIT mode only; VIEW mode
shows the normal white box. Done. Note this reverses an earlier call of mine to
render view mode as bare values — the boxes stay, only the GREY is confined to
editing.

**My Queues** — parked. "Low priority, so for now just note that we will have it
in the future rather than handling it. Let's focus on the list view and form
view of Project Requirement first." The permission model and module queues built
so far are kept but wired to nothing; see the header comment in
`src/data/permissions.ts`.

**Scope is now: Project Requirements list view and form view only.**

## Order of work

~~1. **A1, A2, A8, A9** — names.~~ **done**
~~2. **A3** — required markers.~~ **done**
~~4. **A10, A11, A12** — invented fields removed, close button renamed.~~ **done**

**FORM VIEW**
~~3. **A4, A5, A7** — option values and radio groups.~~ **done**
~~4. **A15** — ITAR as a field.~~ **done** — and it turned out to be an ACCESS
   CONTROL flag, not a label: an ITAR record is only visible to an ITAR-cleared
   account. The rule now lives in `src/data/itar.ts` and the list applies it.
~~5. Validation — "This field is required." on blur, Save gated.~~ **done**
~~6. **A14** — Quotation Result's eleven columns.~~ **done**
~~7. **A13** — Conversations: the Comment / Send Email choice and the rich editor.~~ **done**

**FORM VIEW IS COMPLETE.** Everything below is list view.

**LIST VIEW**
~~7. **B1, B11, B6** — rebuild the filter: no operators, the real field set,
   hidden behind the funnel.~~ **done**
~~8. **B7, B8, B9, B10** — pager text and page size, the eleven real columns,
   `Add New`.~~ **done** — plus the View Detail column, first/last paging, the
   guideline's status colours, and a `waiting` badge token that had no CSS at
   all so every "Quoted" badge rendered unstyled.
~~9. **B2, B3, B4, B5** — saved views and the View Setting sidebar.~~ **done**

**THE GAP LIST IS CLEAR.** Everything from the 25 Aug live-system read and the
customer's Testing Guideline is now built for Project Requirements list and form
view, except the items listed under "Parked" and the open questions in
`docs/testing/what-this-changes.md`.

**PARKED** — My Queues module separation and role scoping.

---

**RE-OPENED, 10 Sep 2026** — the live system was restructured after our 25 Aug
capture and this repo is built against the older menu. Full evidence in
`docs/live-recheck-10sep.md`. Seven items, none of them Project Requirements
(which is unchanged):

| # | Gap | Weight |
|---|---|---|
| M1 | Login has no **Sign in with Microsoft** — an entire auth path the live page offers | blocking for a login demo |
| M2 | Part Master toolbar has no **AML Search** | one action |
| M3 | Bill of Materials lists **parts, not BoMs** — live has ASSEMBLY PN · REVISION · DESCRIPTION · BOM VERSION · CUSTOMER · LAST RUN BY · LAST RUN DATE · BOM STATUS. This closes the inference `BomList.tsx` flagged in its own header | a screen's whole column model |
| M4 | No **Manufacturers (MFG)** screen | a screen |
| M5 | No **MPN list** screen — our nav item reaches `Placeholder` | a screen |
| M6 | No **Packing List** screen | a screen |
| M7 | Part Master column wording: live `CUSTOMER NAME` / `PART SOURCE` / `LAST CHANGE` vs our `Customer` / `Source` / `Last Changed` | three labels |

Plus routing: `/inventory-management/part-mst` is now **404** on the live
system; it moved to `/engineering/part-mst`, and BoM, MPN and MFG moved with it
into a new **Engineering** group. `src/App.tsx` and `src/data/sitemap.ts` still
use the old paths.

**Second pass, same day** — Part Master rows and the Form View, now read with
data (the earlier "0 of 0" was a mid-load sample, not a real state):

| # | Gap | Weight |
|---|---|---|
| M8 | No **Confirm RFQ** action on the RFQ record. The string appears nowhere in this codebase, though our own CSS already refers to a red part blocking it | a state transition |
| M9 | Live records carry a **Cancel** action too. Ours has only the edit-mode cancel, which is a different thing. Not clicked — it changes a real record | a state transition |
| M10 | `LAST CHANGE` on Part Master is `09/09/2026 16:35:29` — a date **and time, with seconds**. We render it date-only via `fmtDate`. This also answers `fmtDateTime`'s own open question about whether seconds carry meaning: the live data has real ones and shows them | one column, one format decision |

Not gaps, checked and cleared: Project Requirements is unchanged in every
column, control and page size; the Part Master and BoM KPI tiles are the 25 Aug
review's "the KPI can also be the filter" (C3), not an invention; the RFQ Form
View matches on all five tabs, all five section names and **all 27 fields**.

Still unverified, and honestly so: **Run Quotation** and **BoM Comparison**. All
four chunks `bundle-evidence.md` was extracted from now 404 and the rebuild
re-obfuscated its strings, so that evidence describes a build that no longer
exists. Confirming it needs either a fresh RC4 extraction or a write on live
data.


---

## M1–M10 — CLOSED, 10 Sep 2026

All ten built. Commits `fa29d52`, `8772a20`, `2d9b9bb`.

| # | What | Where |
|---|---|---|
| M1 | Sign in with Microsoft, with the OR rule and the hint line | `pages/Login.tsx` |
| M2 | AML Search on the Part Master toolbar | `components/AmlSearchDialog.tsx` |
| M3 | The BoM list lists BoMs, not parts | `data/bomList.ts` |
| M4 | Manufacturers (MFG) | `pages/ManufacturerList.tsx` |
| M5 | Part Numbers (MPN) | `pages/MpnList.tsx` |
| M6 | Packing Lists | `pages/PackingList.tsx` |
| M7 | Customer Name · Part Source · Last Change | `data/parts.ts` |
| M8 | Confirm RFQ | `pages/QuotationDetail.tsx` |
| M9 | Cancel RFQ, and the back control relabelled | `pages/QuotationDetail.tsx` |
| M10 | `datetime` column role; `fmtDateTime` emits seconds | `ui/renderCell.tsx` |

Plus the routing: the **Engineering** group, `/engineering/*`, and redirects
from the four old paths. 84 nav routes crawled after the change — every one
resolves, nothing renders the generic placeholder.

### Three things these gaps uncovered on our side

- **The back control on an RFQ said "Cancel"**, on the reading that the live
  record labels it that way. The bundle shows that Cancel is
  `confirmCancelRfqForm` — it cancels the RFQ. Deferring to their wording was
  right; deferring to a word whose meaning had been guessed was not.
- **BoM version could be 0**, from `Math.floor(rnd() * 4)`. Invisible inside one
  record, unmissable as a column.
- **Three generators produced date-only values** that a `datetime` column then
  rendered as `00:00:00`. Fixed at source each time.

### Still open, and needing the customer rather than us

1. **MPN `LIFECYCLE STATUS` values.** Ours are the industry-standard set; the
   live grid was read before its rows loaded, so theirs were never seen.
2. **Packing List `FULFILLMENT` and `BILLING` values.** Only `SHIPPED` is
   confirmed, from the bundle's own "Mark this packing list as SHIPPED?".
3. **`BOM STATUS` wording.** Evidenced as a two-state toggle
   (`ToggleStatusBOM`); which two words is not established.
4. **What `Confirm RFQ` actually does.** There is no `Confirmed` in the status
   vocabulary, so we built New → In-Progress. Stated as an inference in the code.
5. **The verbatim error strings** (`bundle-evidence-10sep.md` §3.2). Theirs are
   the customer's own words; ours are cleaner and invented. Tier 1 asks for
   clearer messaging, tier 2 says the words are theirs — a real conflict.
