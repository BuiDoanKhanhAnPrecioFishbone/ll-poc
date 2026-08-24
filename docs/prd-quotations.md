# PRD — Voyager ERP prototype: Quotations

Status: approved 24 Aug 2026 · Decision trail: `.scratch/grills/yayb7hblrf9s/ledger.md`

---

## 1. Problem

The prototype drifted from a clarity exercise into a workflow redesign. Screens were
built from inferred structure and invented option lists. The customer repeatedly had to
catch errors that should never have reached them:

| What shipped | What was true |
|---|---|
| 51 nav entries renamed and regrouped | Users have learned the existing names |
| Header fields relocated into tabs | The live header carries them |
| Hand-written dropdown options | Only 1 of 4 Project Types was real |
| Checklist and documents modelled as unrelated | The ticked item **is** the row |
| Customer Type, Created Date, BoM File absent | All three exist on the live screen |

The value being sought is a system that is **easier to read and use** — not one that
works differently.

## 2. Goals

- **G1** Make existing screens clearer: legibility, density, handled states, contrast.
- **G2** Keep every learned thing true: field order, labels, groupings, step order,
  control meanings.
- **G3** Give estimators and managers one place to see what needs attention.

## 3. Non-goals

Restructuring navigation · renaming screens · normalising label case, plurals or
abbreviations · relocating fields between header and tabs · changing what any control
means or where a step sits in a flow · role-based screen adaptation · replacing Home ·
building screens beyond Quotations.

## 4. Users

**Estimator** — sales/estimating, daily. Works an RFQ queue. Needs to know what is
theirs and what is late, and to copy values out of grids into email and search.

**Manager** — periodically. Same four measures across the team. Needs to see where work
is stuck and who is carrying most.

## 5. User stories

1. As an estimator, I want to see what is mine and what is late, so that I work the
   right RFQ next.
2. As a manager, I want the same four measures across the team, so that I can see where
   it is stuck.
3. As an estimator, I want to copy a part number or customer name out of a grid, so that
   I can paste it into an email or a search.
4. As an estimator, I want to open a record without losing my place in the list.
5. As an estimator, I want a screen that tells me when it is loading, empty or broken,
   so that I do not mistake one for another.

## 6. Functional requirements

**FR1 — Navigation mirrors the live menu.** Same eight groups, same names, same order,
same child order. Group headers expand and collapse rather than navigating to `/`
(the live behaviour dumps the user on Home; that is a defect, not a workflow).

**FR2 — Record headers carry the same fields, in the same places.** The Quotation
header returns to the live field set and layout, including Customer Contact, Project
Type, Order Type, Customer Type, Created Date and BoM File.

**FR3 — Labels are verbatim.** Only genuine errors are corrected:
`Polumeric → Polymeric`, `Provide Alt Aml For Out Stock → Provide Alt AML For Out of
Stock`. Seven earlier renames are reverted (Historical RFQ, Due Date, Material Package
Type, Customer specific needs, Broker, Item Ant Quantities To Quote, Acceptable
LeadTime In Day).

**FR4 — Option lists come from metadata.** Every dropdown sources from
`src/data/metadata.ts`, mirroring `GET /api/MetadataType`. Hand-written option arrays
are a defect.

**FR5 — Home is unchanged** except that the stock "World Population by Broad Age
Groups" demo chart is removed. The Quotation Request chart and its filters stay.

**FR6 — Queues page.** Own nav entry, not the landing page. Four measures: due this
week, overdue, unassigned, waiting on a document. A Mine / Team toggle, remembered
between visits. Team view adds who is carrying the most. Each measure links to the
Quotations list, pre-filtered.

**FR7 — Overdue is defined.** `Due Date < today AND status IN (New, In-Progress)`.
No SLA field exists on an RFQ; Due Date and Created Date are the only dates.

**FR8 — Grids stay copyable.** Row text is selectable. The identifier cell is the link
that opens the record. Clicking elsewhere on a row does nothing.

**FR9 — Review pages leave the product nav.** UX Audit, Sitemap and Design System move
behind a footer entry. The Sitemap page is annotated that its proposed IA was declined.

**FR10 — Every other screen is an honest placeholder** naming what it would contain,
not a half-built approximation.

## 7. Acceptance criteria

### Faithfulness
- Given a Quotations screen, when compared field-by-field with the live system, then
  every field is present, in the same group, with the same label except FR3 corrections.
- Given any dropdown, when its options are listed, then they match its MetadataType code.
- Given the nav, when compared with `GET /api/account/get/menus`, then every title and
  order matches, with only the queues entry added.

### Queues page
- Given an estimator with 2 overdue RFQs, when they open the queues page, then Mine is
  selected and Overdue reads 2.
- Given they switch to Team and return later, then Team is still selected.
- Given an RFQ past its Due Date with status Completed, then it is **not** counted.
- Given they click Overdue, then the Quotations list opens filtered to exactly those RFQs.

### States that get forgotten
- **Empty** — nothing outstanding shows a plain statement, not four zeros.
- **Loading** — skeletons, never "0".
- **Error** — names the failure and offers retry.
- **First visit** — no stored preference defaults to Mine.
- **Overflow** — only a `text`-role column truncates, with the full value in a tooltip.

## 8. Open questions (owned by the customer)

- What "Rocket" refers to. The field is genuine (`NET_ROCKET_INVENTORY`); only its
  meaning is unconfirmed.
- Whether Build Requirement reuses the APPLICATION list. Inferred from one observed
  value; no `BUILD_REQUIREMENT` metadata code exists.
- Where the "Quoted" status on the list grid comes from — it is not in `RFQ_STATUS`.

## 9. Glossary

**Task** — a ticked checklist item. Ticking selects that the item *applies*; the row
then carries its document, assignee and status. A tick is not "done".
**Overdue** — past Due Date and still open.
**Mine / Team** — the queues page scope toggle. Not a role.
**Surface fix** — legibility, density, states, contrast. Not order, naming or meaning.
