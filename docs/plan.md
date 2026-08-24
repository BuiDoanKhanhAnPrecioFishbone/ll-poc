# Plan — remaining work, in order

Rules in force: decisions D1–D8 (`.scratch/grills/yayb7hblrf9s/ledger.md`), the PRD
(`docs/prd-quotations.md`), and the working agreement. Nothing is renamed, moved or
removed unless `docs/bundle-evidence.md` shows the live system does it that way.

Order is by dependency and by damage-if-wrong, not by size.

| # | Task | Why now | State |
|---|---|---|---|
| 1 | Quotations list must honour `?queue=&scope=` | The queue tiles already link to it. A tile that navigates to an unfiltered list is a broken promise I shipped. | done |
| 2 | Checklists become edit-free, with undo | Answered mid-session; the tab is otherwise inconsistent with the record's edit model. | done |
| 3 | Home: the real Quotation Request chart | D3. Home currently duplicates the queues page it was split away from. | done |
| 4 | Sitemap page annotated "declined" | D7. It currently argues for an IA that will not be built. | done |
| 5 | Audit page: in-scope vs observation | D7. Findings that D1 put out of scope must stop reading as a work list. | done |
| 6 | Remove CSS orphaned by the D1 revert | `.vy-nav-group-purpose`, `.vy-crumb-was` and friends style elements that no longer exist. | done |
| 7 | UI appearance pass | Last, deliberately: polish applied before the structure settles gets thrown away. | done |

## Added mid-plan

These came from questions asked while the plan was running. Each turned out to be a
real defect, not a preference, so each was verified against the shipped production
bundle before being changed. Evidence in `docs/bundle-evidence.md`.

| Task | What was wrong | State |
|---|---|---|
| Run Quotation rebuilt | Claimed the live flow "is not a linear stepper". It is — a four-step reducer with named steps. Three capabilities had been dropped and the four-bucket summary was invented. | done |
| BoM Comparison rebuilt | The RESULT was missing entirely — the dialog had a Compare button that did nothing. Mode labels paraphrased, panes in the wrong order, `.csv` accepted where live takes `.xlsx/.xls`, and an invented "summary only" checkbox. | done |
| Customer became a lookup | Live loads `custMsts` and drives contact, Customer Type, ITAR and a suggested markup from the chosen row. It was free text, so you could type a customer that does not exist. | done |
| Customer Contact made dependent | Live filters contacts to the selected customer and defaults to the first. Free text allowed a contact who does not work there. | done |
| Project Name restored as a field | It was only the page heading — readable, never settable — despite being a field on the RFQ. | done |
| Historical RFQ became a lookup | Carried live as `rfqParentName` + `rfqParentGuid`, a reference to another RFQ. | done |
| Read-only fields marked | Edit mode unlocked everything. Derived and system-owned fields now render as values with a note saying why. | done |

## Defects found by the work itself

| Found | Fix |
|---|---|
| Two definitions of "overdue" — the Quotations header said 22, My Queues said 2, because the header used a bare date test that swept in RFQs quoted months ago | Both now import the same predicate from `src/data/queues.ts` |
| RFQs were generated only in a two-month window, so a twelve-month chart showed nine empty columns | Two populations: a live queue around today, and a year of closed history behind it |
| `.vy-record-head` already belonged to the Part Master dialog; reusing the name silently reshaped the new header into a flex row | Renamed to `.vy-rfq-head` |
| The ITAR badge read the saved record while the customer was being changed, so it could say "not export-controlled" while the form said otherwise | Reads the draft |
| The grid search box collapsed to about six characters at 800px | Given a width floor; the toolbar wraps instead |
| 30-odd CSS rules styled markup that no longer exists, and stale rules in `app.css` silently override live ones in `components.css` | Removed, and `npm run css:orphans` now reports them |

## Decisions taken without asking

The user authorised self-answering with the recommended option, on condition that every
decision is logged. These are those decisions. Each states what was chosen, what was
rejected, and what would have to be true for the other answer to win.

### DA-1 — Queue links filter the list rather than open a saved view
**Chosen:** the tile passes `?queue=overdue&scope=mine`; the Quotations list reads it,
applies the same predicate the queues page used, and shows a dismissible bar naming the
filter.
**Rejected:** a separate pre-filtered page per measure (four near-duplicate screens), and
storing the filter in app state (the link stops being shareable).
**Would change if:** the business wants saved views with their own names and columns —
then these four become the first four saved views rather than URL parameters.

### DA-2 — One predicate, defined once
**Chosen:** the four measures live in `src/data/queues.ts` and both the queues page and
the Quotations list import them.
**Rejected:** re-implementing the filter on the list page.
**Why it matters:** two definitions of "overdue" that drift is exactly the bug where a
tile says 4 and the list it opens shows 6, and nobody can tell which is lying.

### DA-3 — Checklists save immediately; Requirements keeps Edit/Save
**Chosen:** ticking an item, changing an assignee, moving a status or attaching a
document commits at once, each with an undo toast.
**Rejected:** one edit mode governing the whole record.
**Reasoning:** the ceremony should match what a mistake costs. Checklist state changes
many times a day, by several people, on a shared record; a twenty-field specification
changes rarely and deliberately and needs a real Cancel.
**Would change if:** the live system turns out to gate checklist edits behind a button —
that is a claim about the live product and it has not been verified in the bundle.

### DA-4 — The assignee dropdown commits on close, not per keystroke
**Chosen:** the one control where a wrong pick is quietly damaging, because work lands in
someone else's queue and neither person is told.
**Rejected:** treating it like every other inline control.

### DA-5 — Home gets a Quotation Request chart built from the mockup's own RFQ data
**Chosen:** RFQs raised per month for the last twelve, split by status, with the filters
the live Home offers.
**Flagged:** the live chart's exact configuration is NOT in the bundle — it renders from
an API response. The shape here is inferred and marked as such in the code. This is the
one item in this plan resting on inference rather than evidence.

### DA-6 — The Sitemap page keeps the declined proposal instead of deleting it
**Chosen:** show the live IA as what is built, and the proposed IA marked declined with
the reason.
**Rejected:** deleting the proposal (loses why the question was asked) and leaving it
unmarked (asserts a plan that does not exist).

### DA-7 — Audit findings are split by what D1 did to them
**Chosen:** three states — *in scope* (surface fixes, still to do or done), *out of scope*
(renaming and regrouping, kept as observations), *superseded* (findings the bundle
evidence disproved).
**Rejected:** deleting the out-of-scope findings. They are still true observations about
the live system; they are just not work.
