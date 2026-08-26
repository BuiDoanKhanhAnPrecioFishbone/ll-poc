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
3. **A4, A5, A7** — option values and radio groups. Highest risk remaining: the
   same class as the metadata errors, where wrong values make the built system
   reject valid input.
4. **A15** — ITAR is a field on the live form, a badge here.
5. **A14** — Quotation Result's eleven columns.
6. **A13** — Conversations: the Comment / Send Email choice and the rich editor.

**LIST VIEW**
7. **B1, B11, B6** — rebuild the filter: no operators, the real field set,
   hidden behind the funnel by default.
8. **B7, B8, B9, B10** — pager text and page size, the eleven real columns,
   `Add New`.
9. **B2, B3, B4, B5** — saved views and the View Setting dialog. Substantial;
   worth its own estimate.

**PARKED** — My Queues module separation and role scoping.
