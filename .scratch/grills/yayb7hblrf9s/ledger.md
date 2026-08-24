# Grill ledger — Voyager ERP revamp

Subject: what the revamp is actually for, and how far it may change how people work.
Started 24 Aug 2026.

## Why this grill exists
Everything built so far was justified against an audit I generated myself
(column clipping, density, navigation depth), not against a stated business
problem. That is why repeated rework happened: invented dropdown options, the
checklist model read backwards, three dropped fields. The decisions below were
never asked.

## Decisions

| # | Decision | State | Evidence | Depends on |
|---|---|---|---|---|
| D1 | How far may the revamp change how people work? | **accepted** | User, 24 Aug: "Same workflow, clearer surface" | — |
| D2 | May label TEXT be corrected? | **accepted** | User, 24 Aug: "Fix genuine errors only" | D1 |
| D3 | Does the Home dashboard replacement stand? | **accepted** | User, 24 Aug: "keep but in 2 different page" | D1 |
| D4 | Who is the queues page for, and what does it show? | **accepted** | User, 24 Aug, after contradiction raised: "One page, a Mine / Team toggle" | D3 |
| D5 | What counts as "overdue"? | **accepted** | User, 24 Aug: "Only open RFQs count" | D4 |
| D6 | Does the queues page replace Home as the landing page? | **accepted** | User, 24 Aug: "Keep Home as the landing page" | D3, D4 |
| D7 | What happens to the sitemap / audit / design-system pages? | **accepted** | User, 24 Aug: "Keep, but outside the product nav" | D1 |
| D8 | Which screens does the prototype cover? | **accepted** | User, 24 Aug: "Finish Quotations properly first" | D1 |

### D8 — accepted: depth over breadth, Quotations only
Apply D1–D7 to what exists, verify Quotations field-by-field against the live screen,
then stop and review. Every other screen stays an honest placeholder.
Rationale: one module that is provably faithful argues better than five that are
approximately right, and Quotations is the module whose users are already identified.

### D7 — accepted: keep as evidence, outside the product nav
Product nav mirrors the live menu exactly, nothing added. The three review pages move
behind a footer entry ("About this prototype"). Sitemap is annotated that its proposed
IA was declined under D1, so it documents history instead of asserting a plan. The
Audit marks which findings are in scope as build work and which are observations only.
Rationale: a stakeholder demo should show the ERP, not the argument for it.

### D6 — accepted: Home stays the landing page
Sign-in lands on Home, unchanged. The queues page is a nav entry of its own.
Verified: the live menu has Home at `sequence 1`, path `/`, and Menu Management edits
that — so promoting the queues page later is a config change your business already
controls, not a rebuild.
Known risk, accepted: a page nobody lands on may go unused.

### D5 — accepted: overdue = past Due Date AND still open
`Due Date < today AND status IN (New, In-Progress)`. Completed and Cancelled drop out
even if they were late. Rationale: a working queue counts what someone can still act
on; a number that includes finished work can never reach zero, so people stop trusting
it. Matches what the Quotations list already does, so list and queue agree.

Verified, not assumed: an RFQ carries Due Date and Created Date only — there is no
separate SLA or promised-back date to measure against.

### D4 — user answered "one page that adapts to the role"; kept OPEN
Checked against the system before accepting, per the grill rule. It conflicts with
what the platform exposes:
- JWT carries `role` as a bare GUID (c228ec5b-...), no name.
- JWT `/Permission` is an array of `<menuId>.<accessLevel>` (mostly `.7`, one `.3`)
  — per-SCREEN permissions, not job titles.
- /api/account/get/info returns name, timezone, branch, 2FA — no role or designation.
- Departments carry `departmentManagerId`, but that is a property of a department,
  not a signal about the signed-in user.
Conclusion: role-adaptation would require inventing a role model the system does not
have — more machinery, not less, against an explicit "no over-engineering" constraint.
Re-asked narrowed: get both audiences without a role signal.

**ACCEPTED: one page, Mine / Team toggle.** Same four measures either way, scoped by a
toggle the user flips. No role model invented; less machinery than role detection, not
more. Serves both audiences without locking anyone into a view.

Tiles (each links into the Quotations list, pre-filtered):
  due this week · overdue · unassigned · waiting on a document
Team view adds: who is carrying the most.
Toggle position is remembered between visits.

User story: As an estimator, I want to see what is mine and what is late, so that I
work the right RFQ next. As a manager, I want the same four measures across the team,
so that I can see where it is stuck.

### D1 — accepted: same workflow, clearer surface
KEEP field order, labels, groupings, step order, and what each control means.
FIX legibility, density, empty/loading/error states, contrast, inconsistent controls.
REVERT the renamed nav (51 screens), the regrouped IA, and the relocated header fields.
Rationale: retraining cost near zero; this is the reading of "easier to use, not
over-engineered" that does not make anything users already know wrong.

**Consequences to carry out** (not asked again, they follow from D1):
- Revert `proposedNav` to the live menu structure and names.
- Return Customer Contact, Project Type, Order Type, Customer Type to the record header.
- Re-check every screen against the ORIGINAL, not against my audit.
- The audit stays as a document; it stops being the mandate.

### D2 — accepted: fix genuine errors only
Correct misspellings and mangled words. Keep every other label verbatim, including
ones I judged poor. Distinction that settles it: a misspelling is not something
users learned, a working label is.

FIX: Polumeric Required → Polymeric Required;
     Provide Alt Aml For Out Stock → Provide Alt AML For Out of Stock
REVERT: Previous RFQ → Historical RFQ; Date needed → Due Date;
     Material packaging → Material Package Type;
     Customer notes → Customer specific needs;
     Broker sourcing permitted → Broker;
     Quantities to quote → Item Ant Quantities To Quote (keep — "Ant" unexplained
     but the label is in use; the CONTROL was wrong, not the text)
     Acceptable lead time → Acceptable LeadTime In Day
UNCHANGED: Rocket Consigned Inventory (verified real, NET_ROCKET_INVENTORY)

### D3 — accepted: split into two pages
Home keeps the real Quotation Request chart and its filters, unchanged. The stock
"World Population by Broad Age Groups" demo chart is removed. The work queues move
to their own page rather than replacing Home or being stacked beneath it.

NOTE — tension with D1, accepted knowingly: a new page IS a workflow addition, not
a surface fix. The user has approved it explicitly, so it is in scope; it is the one
sanctioned exception to D1 so far and is recorded as such rather than treated as
precedent.

STILL UNRESOLVED: the queues themselves were invented. "3 purchase orders over
budget" was never traced to a user or a task. D4 must settle what the page carries
before any of it is rebuilt, or the same invention repeats.

**Downstream promises invalidated by D1** — must revisit:
- Audit findings N2, N3, N6, C1, C2 recommend renaming/regrouping. Now out of scope as
  build work; they remain observations.
- Sitemap page's "proposed IA" column no longer describes what is being built.

## Verified facts (no need to ask)
- Users of Quotations: sales/estimating, daily. (Answered 19 Aug.)
- Production stack is React + Vite + KendoReact; licence held. (Measured.)
- Mockup is library-free now; "design target vs re-platform" still undecided. (Answered 22 Aug: "not decided yet".)
- Option lists come from GET /api/MetadataType. (Verified 24 Aug.)
- Ticked checklist items ARE the task rows. (Verified 24 Aug.)
- Customer Type (CUST_TYPE) and RFQ Type (QUOTATION_TYPE) are distinct fields. (Verified 24 Aug.)
- "Rocket" is a real concept: NET_ROCKET_INVENTORY. (Verified 24 Aug.)

## Open questions owned by others
- What "Rocket" means to the business (field is genuine; meaning unconfirmed).
- Whether Build Requirement reuses the APPLICATION list (inferred, not looked up).
