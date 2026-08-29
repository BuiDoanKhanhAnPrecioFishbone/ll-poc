# Voyager Cloud ERP — UX Revamp
## Work log, 19–25 August 2026

Client: Linh Long Engineering · Prepared by: Huyen Nguyen (UI/UX), Precio Fishbone
Repository: `ll-poc` · Deployed prototype: `ll-poc-tau.vercel.app`

**How to read the effort column.** Hours are an estimate of the work each package
represents, not a clock reading. The "commits" column is factual — taken from the
repository — and corroborates the days worked, but a commit records when work was
saved, not how long it took. Adjust the hours to your own record before invoicing.

---

## Summary

| | |
|---|---|
| Elapsed | 7 calendar days (19–25 Aug 2026) |
| Days with recorded activity | 7 |
| Commits | 44 |
| Net code | ~16,400 lines added, ~3,600 removed |
| Modules delivered | Quotations (complete), Part Master (list), My Queues |
| Estimated effort | **58–72 hours** |

---

## Work packages

### WP1 · Discovery and measured audit
**19 Aug · 6–8 h · 11 commits**

Walkthrough of the live production system. Extracted the full navigation from
`GET /api/account/get/menus` — 51 nodes, captured verbatim. Instrumented the
rendered DOM on live list screens to measure column widths, text clip ratios and
empty-column ratios.

Deliverable: **17 findings, every one measured rather than asserted** — including
that all data columns render at exactly 108px, that the primary part number is
clipped in 85% of rows, and that one always-empty column consumes the same width
as the identifier. Written up as a reviewable audit with evidence, impact and a
recommendation per finding.

### WP2 · Design system foundation
**19–20 Aug · 8–10 h · 10 commits**

Token layer (colour, spacing, type, weight, elevation, motion) with a single file
holding raw values and nothing else. A **column role model** — width follows the
semantic role of a column rather than being set per screen — and a **six-token
status vocabulary** replacing ad-hoc status colours.

Deliverable: a design system a new screen can inherit. **A new list now costs a
column specification, not a design.**

### WP3 · Standard list pattern
**20 Aug · 5–6 h**

One reusable grid: sorting, search, column visibility, density, empty/loading/
error states. Row virtualisation proven on the Part Master's 21,941 records.

### WP4 · Quotations module
**21–22 Aug · 10–12 h · 4 commits**

The full record structure: list, record page, five tabs (Requirements,
Checklists, Result, Conversations, Activity), plus the Run Quotation wizard and
BoM Comparison dialog. Responsive behaviour and contrast pass — **verified WCAG
AA throughout, 4.59:1 to 17.81:1**.

### WP5 · Component layer replacement
**23 Aug · 6–8 h · 12 commits**

Rebuilt the component layer on **licence-free (MIT) components** after the
commercial component library was ruled out. Material 3 used for structure only —
elevation, state layers, motion — with all colour still from the client's own
tokens. Added a responsive layer with three breakpoints.

**Result: ~93% reduction in CSS payload** against the previous library-based build.

### WP6 · Correctness pass
**23 Aug · 5–6 h**

Systematic sweep of every control. Fixed a pagination bug that produced a blank
grid, a component shipped with no stylesheet, an edit-mode layout collision, and
a row-click behaviour that broke text selection — the latter reported by users
who copy part numbers out of the grid into email.

### WP7 · Metadata verification
**24 Aug · 3–4 h**

Audited every dropdown against the system's own `GET /api/MetadataType`.

**Finding: most option lists in the prototype were wrong.** Project Type had 1 of
4 correct values; Quote Focus 1 of 4; Material Packaging 1 of 4; Test
Requirements was a free-text field that is in fact a fixed list. All replaced
with the system's real enumerations. **This class of error would have caused the
built system to reject valid user input.**

### WP8 · Requirements definition
**24 Aug · 4–5 h**

Structured requirements session producing **eight recorded decisions** with
rationale and evidence, a **written PRD** with functional requirements and
acceptance criteria, and an explicit scope boundary.

Key decision: *same workflow, clearer surface* — the revamp improves legibility,
density and state handling, and does **not** rename screens, regroup navigation
or move fields. Rationale: renaming 51 screens invalidates what every current
user has already learned.

### WP9 · Production bundle forensics
**24 Aug · 6–8 h**

Retrieved and analysed the shipped production JavaScript (228 modules) and
decoded its obfuscated string tables to recover the real specification of
features that could not be exercised without writing records to the live system.

Recovered and documented:
- **Run Quotation** — confirmed as a four-step wizard with its real step names,
  validation rules and step gating
- **BoM Comparison** — three comparison modes, the result model, the six summary
  categories its Excel export produces
- **RFQ form** — that Customer is a lookup, that Customer Contact depends on it,
  and that Customer Type, ITAR and Markup are all derived from the customer record
- **Incidental:** established that "Rocket" is the client's own part-number
  namespace — an open question from the audit

Deliverable: a written evidence document, so every later decision cites the real
system rather than an assumption.

### WP10 · Fidelity restoration
**24 Aug · 6–7 h · 4 commits**

Applied WP8 and WP9. Reverted the renamed navigation and nine renamed labels;
restored the live menu structure verbatim; returned four fields to the record
header; rebuilt Run Quotation and BoM Comparison to the recovered specification —
**restoring three capabilities that had been dropped** (choice of BoM source,
save draft, assembly details) and removing an invented summary screen.

Converted four free-text fields to lookups, matching the real system.

### WP11 · Design review response, round 1
**25 Aug · 5–6 h**

Response to the customer's design report of 25 Aug 2026 — a tier-1 source under
`docs/precedence.md`, not an internal review. Smart buttons (related-record
navigation, previously absent), header fields grouped into labelled regions,
priority indicator changed from a star rating to a dot and label, quick and
advanced filters, and a column chooser.

### WP12 · Design review response, round 2
**25 Aug · 6–7 h**

Remaining eleven review items: global header (clock, timezone, language),
My Queues as a header icon with badge, breadcrumbs removed, per-item navigation
icons, pagination at the grid foot, clickable KPI summary, action-button
ordering, row density moved to user preferences, consistent date format,
consistent label casing, editable priority, and the activity log grouped by day
and by user.

Also added an automated stylesheet check which found **six classes defined in two
files** — where one silently overrode the other. Three had already caused visible
bugs, including one where an internal page was restyling every chip in the app.

---

## In progress

| Item | State |
|---|---|
| My Queues — module separation and role scoping | Permission model and module queues built; page not yet rebuilt |
| Advanced filter — rebuild as a saved **View Setting** | Specification received 25 Aug; current build to be replaced |

---

## What the client should know

**1. The prototype does not use a commercial component library.**
No licence is available, so it is built on MIT-licensed components. **Every
functional requirement is met either way** — pagination, column selection,
read-only field treatment, filters. The only cost is implementation time, since
these are written rather than bought.

**2. Current phase is layout and user experience, not visual design.**
Colour, spacing, typography and component styling are a later phase, deliberately
— polishing visual design before the structure settles means doing it twice.

**3. Three findings materially reduce delivery risk.**
The metadata audit (WP7) caught option lists that would have made the built system
reject valid input. The bundle forensics (WP9) recovered specifications for
features that would otherwise have been rebuilt from guesswork. The fidelity
decision (WP8) prevents a change-management cost across 51 screens and every
current user.

**4. Two questions remain open with the client.**
What "Build Requirement" draws its options from — there is no metadata code for
it — and where the "Quoted" status originates, as it appears on the list but not
in the status enumeration.
