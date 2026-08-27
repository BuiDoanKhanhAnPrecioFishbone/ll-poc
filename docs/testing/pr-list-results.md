# Test run — `PR - PR List`

The customer's own test sheet, executed against the prototype on 27 Aug 2026.
Thirty-four expected-result rows. Each was run against the running build, not
read and judged.

**26 pass · 3 fixed during the run · 5 deviations, all deliberate and recorded**

---

## Fixed during the run

| # | Expected | Was | Now |
|---|---|---|---|
| 3 | *"Page's header is Project Requirement"* | Header read **"Quotations"** — invented, and it disagreed with the menu item you click to reach it | `Project Requirement` |
| 5 | *"Display tooltips corresponding to their buttons"* | Add New and Export had none | Both have one |
| 7 · 17 · 27 | *"Minimize · Maximize/Restore Down · Close"* | Close only | **Maximize/Restore Down** added to dialogs and the View Setting sidebar |

Number 3 is the same defect class as the renamed tabs: a screen title invented
rather than taken from the system.

---

## Deviations — deliberate, and each already raised

| # | Expected | What we do | Why |
|---|---|---|---|
| 21 | A leading **View Detail** column | The RFQ number is the link | Question 1. Their own notes plan a second row action (clone); a leading icon column does not survive one. |
| 23 | Dates from *System Configuration → Region Language Format Config* | A user preference | Question 4. Their guideline and their design review contradict each other here. |
| 24 · 26 · 27 | The record opens as a **modal** | It is a full page | See below — question 9. |
| 6 | **Add New** opens the New PR modal | Says it is not implemented | Out of scope: creating an RFQ is a separate flow with its own sheets. |
| 7 · 17 · 27 | **Minimize** | Not built | Question 9. In Kendo, minimise collapses a *draggable* window to its title bar. These dialogs are centred and modal, so a minimised one would be a title bar floating in a dimmed screen — which is not what minimising is for. |

### The record-as-page decision needs revisiting

The prototype opens a record as a page. The original justification, written into
`QuotationDetail.tsx`, was:

> *"the live detail opens in a `k-window` over the app, so the record has no
> URL, no back button and no breadcrumb — you cannot send someone a link to an
> RFQ."*

**That justification was wrong.** Signed in on 27 Aug, the live record dialog
*does* have its own URL — `/sales-management/quotation/<guid>`. So the argument
that decided this was based on something untrue.

A page may still be the better answer, but it is now a preference rather than a
correction, and their guideline asks for a modal three times. Raised as
question 9 rather than left resting on a false premise.

---

## Passing

Menu highlight · action button order (Add New left; Select View, Filter, Setup
right) · Select View applies saved filters, columns and sorting · filter toolbar
expands, filters, and collapses on a second click · View Setting opens as a
right sidebar with the exact title · creates and edits templates · all three
tabs configure filters, columns and sorting · column order follows the template
· header click sorts · rows are read-only · status colour coding · page sizes
20/50/100 · list updates on size change · correct record count · pagination
recalculates · first/previous/next/last all present · First and Previous
disabled on page one · Next and Last disabled on the last page.

---

## A note on method

Three results in this run were initially recorded as failures and were not:
the row count read zero twice, and the sidebar measured 1px wide. All three were
measurement faults — queries racing a navigation, and a preview pane reporting
`innerWidth: 0` so that `96vw` resolved to nothing.

Worth writing down, because the reflex on a red result is to change the code. In
this pane, a reading taken straight after a navigation or across a CSS
transition is not evidence.
