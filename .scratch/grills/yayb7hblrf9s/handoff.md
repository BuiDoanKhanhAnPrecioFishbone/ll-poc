# Grill handoff — Voyager ERP prototype, Quotations

## Problem
The prototype drifted from a clarity exercise into a workflow redesign. Screens were
built from inferred structure and invented option lists, so the customer repeatedly had
to catch errors: dropdown values the system would reject, a checklist model read
backwards, three fields silently dropped. The value being sought is a system that is
easier to read and use — not one that works differently.

## Goals
- Make the existing screens clearer: legibility, density, handled states, contrast.
- Keep every learned thing true: field order, labels, groupings, step order, meanings.
- Give estimators and managers one place to see what needs attention.

## Non-goals
- Restructuring navigation or renaming screens.
- Changing what any control means or where a step sits in a flow.
- Covering the whole system. Depth on Quotations beats breadth.

## Users & use cases
- **Estimator (sales/estimating), daily.** Works an RFQ queue; needs to know what is
  theirs and what is late, and to copy values out of grids into email and search.
- **Manager, periodically.** Same four measures across the team; needs to see where
  work is stuck and who is carrying most.

## User stories
- As an estimator, I want to see what is mine and what is late, so that I work the
  right RFQ next.
- As a manager, I want the same four measures across the team, so that I can see
  where it is stuck.
- As an estimator, I want to copy a part number or customer name out of a grid, so
  that I can paste it into an email or a search.
- As an estimator, I want to open a record without losing my place in the list.

## Functional requirements
1. Navigation mirrors the live menu exactly — same groups, same names, same order.
2. Record headers carry the same fields, in the same places, as the live screens.
3. Labels are verbatim, except genuine errors (misspellings, mangled words).
4. Option lists come from GET /api/MetadataType. No hand-written option arrays.
5. Home keeps the Quotation Request chart and its filters; the stock "World Population"
   demo chart is removed.
6. A separate queues page carries four measures — due this week, overdue, unassigned,
   waiting on a document — with a Mine / Team toggle, remembered between visits.
   Team adds who is carrying the most. Each tile links to the pre-filtered list.
7. Overdue = Due Date < today AND status is New or In-Progress.
8. Sign-in lands on Home. The queues page is its own nav entry.
9. Grid text is selectable; the identifier is the link that opens the record.
10. Audit, Sitemap and Design System sit behind a footer entry, not in the product nav.

## Acceptance criteria
**Faithfulness**
- Given a Quotations screen, when compared field-by-field with the live system, then
  every field is present, in the same group, with the same label except corrected errors.
- Given any dropdown, when its options are listed, then they match its MetadataType code.

**Queues page**
- Given an estimator with 2 overdue RFQs, when they open the queues page, then Mine is
  selected and Overdue reads 2.
- Given they switch to Team, when they return later, then Team is still selected.
- Given an RFQ past Due Date with status Completed, then it is NOT counted as overdue.
- **Empty:** given nothing outstanding, then the page says so plainly rather than
  showing four zeros.
- **Loading:** given counts are still arriving, then skeletons show — never "0".
- **Error:** given counts fail to load, then the page names the failure and offers retry.
- **First-time:** given no toggle preference stored, then Mine is selected.

**Grids**
- Given a user drags across a cell, then text selects and the record does NOT open.
- Given they click the identifier, then the record opens.
- **Overflow:** given a value longer than its column, then only a `text`-role column
  truncates, with the full value in a tooltip.

## Out of scope
Renaming or regrouping navigation · relocating fields between header and tabs ·
normalising label case, plurals or abbreviations · changing what any control means ·
building screens beyond Quotations · role-based adaptation · replacing Home.

## Open questions (owned by others)
- What "Rocket" refers to in the business. The field is genuine (NET_ROCKET_INVENTORY);
  only its meaning is unconfirmed.
- Whether Build Requirement reuses the APPLICATION option list. Inferred from one
  observed value, not looked up — there is no BUILD_REQUIREMENT metadata code.
- Where "Quoted" status comes from. It appears on the list grid but is not in RFQ_STATUS.

## Glossary
- **Task** — a ticked checklist item. Ticking selects that the item applies; the row
  then carries its document, assignee and status. A tick is not "done".
- **Overdue** — past Due Date and still open.
- **Mine / Team** — the queues page scope toggle, not a role.
- **Surface fix** — legibility, density, states, contrast. Not order, naming or meaning.
