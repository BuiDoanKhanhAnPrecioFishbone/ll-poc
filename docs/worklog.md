# Voyager Cloud ERP — UX Revamp
## Work log, 19 August – 6 September 2026

Client: Linh Long Engineering · Prepared by: Huyen Nguyen (UI/UX), Precio Fishbone
Repository: `ll-poc` · Deployed prototype: `ll-poc-tau.vercel.app`

**How to read the effort column.** Hours are an estimate of the work each package
represents, not a clock reading. The "commits" column is factual — taken from the
repository — and corroborates the days worked, but a commit records when work was
saved, not how long it took. Adjust the hours to your own record before invoicing.

---

## Summary

### Phase 1 · 19–25 August

| | |
|---|---|
| Elapsed | 7 calendar days (19–25 Aug 2026) |
| Days with recorded activity | 7 |
| Commits | 44 |
| Net code | ~16,400 lines added, ~3,600 removed |
| Modules delivered | Quotations (complete), Part Master (list), My Queues |
| Estimated effort | **58–72 hours** |

### Phase 2 · 26 August – 6 September

| | |
|---|---|
| Elapsed | 12 calendar days (26 Aug – 6 Sep 2026) |
| Days with recorded activity | 10 |
| Commits | 108 |
| Net code | ~30,200 lines added, ~3,800 removed |
| Modules delivered | Part Master Detail, BoM, MFG-MPN (AML), Quotation wizards (Quick, Standard, Resume Draft), Login |
| Component library | migrated to **KendoReact** after the licence arrived, 31 Aug |
| Estimated effort | **79.5 hours** (timesheet total for 26 Aug – 6 Sep) |

### Both phases

| | |
|---|---|
| Commits | 152 |
| Timesheet total | **138.5 hours** (6 Aug – 6 Sep, both tabs reconcile) |

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

### WP13 · Testing Guideline intake, and the gap it opened
**26–27 Aug · 19.5 h · 17 commits** *(hours as already logged on the timesheet)*

The customer's Testing Guideline arrived and was read against the build. It
contradicted the prototype in fifteen places on the record form alone — tab
names, section names, required markers, option values, three fields that should
have been radio groups rather than dropdowns, and two fields invented that the
live system does not have. All corrected to the customer's own wording.

Also built from it: ITAR as an access rule rather than a badge, the Quotation
Result's eleven real columns, the Conversations Comment/Send Email choice with a
rich editor, the list grid's real columns and pager, the advanced filter rebuilt
without operators, saved views with a View Setting sidebar, and the New Project
Requirement modal on both of the customer's paths.

Their PR List test sheet was then run end to end: **26 pass, 3 fixed, 5
deviations** recorded for them to rule on.

### WP14 · Quotation wizards
**28 Aug · 6–7 h · 7 commits**

Quick Quote built out to the guideline's four steps, and Standard Quote's second
entry point, Load Existing Assembly. Action bars consolidated to one per screen,
the Mine/Everyone scope control dropped, and one reading measure applied across
the app.

### WP15 · UI consistency sweep, four parts
**29–30 Aug · 6–8 h · 8 commits**

An automated consistency checker, then four passes over what it and a manual
review found: colour contrast, the one remaining native `confirm()`, a missing
loading state, motion where content is replaced, three touch targets under the
24px minimum, and a class with no rule behind it.

**The finding worth naming: the app announced failures in green.** Validation
messages and "Select assembly first!" were arriving on the success toast — the
words right and the colour saying the opposite, which is worse than silence,
because a user who trusts the colour carries on believing the step worked.

### WP16 · Resume Draft, Part Master tooling, deck audit, Login
**30 Aug · 5–6 h · 6 commits**

Resume Draft Quote as the third entry point, with a Save draft that saves. Filter,
view and column tools wired onto Part Master. The kick-off deck checked against
the repo for the first time and filed into the precedence order, which produced
the gap list still being worked through. Login rebuilt to answer the two faults
the deck names by name — "too much empty space" and "lack of contrast".

### WP17 · Kendo licence, and five screens from the guideline
**31 Aug · 10–12 h · 24 commits**

The heaviest day of the engagement. The Kendo licence key arrived and was
recorded with its deployment route, plus a check page proving a licensed grid
renders clean on the deployment.

Five screens built: Part Master Detail as the deck's Data Form View archetype,
BoM detail and Where Part Number Used, the Bill of Materials list, Create New
Part, Create the new BoM (Config and Review), and MFG-MPN (AML) — the Approved
Manufacturer List. Plus the deck's alert panel and the notifications bell.

The live production bundle was swept for the components it actually uses and
compared against ours — **and the sweep was then corrected**: MultiSelect ships
in it, and the method used could not have found it.

### WP18 · Responsive, accessibility, and the answer sheet
**1 Sep · 3–4 h · 3 commits**

Responsive and accessibility checks across the three new packages, and the
sixteen open questions written up as an answer sheet the customer can fill in.

### WP19 · KendoReact migration, phases 0–8
**4 Sep · 8–10 h · 12 commits**

The customer chose KendoReact so the mockup would not diverge from the system
they already use. Scoped before anything was touched, then a theme spike, then
the grid, MiniTable, DataGrid, Excel export and file upload.

Two capability wins came free: real Excel export and a real upload control.
A keyboard failure in the Kendo Grid was found and fixed, and a **layering scale**
replaced the single z-index every overlay shared — the symptom being an error
toast rendering behind the Run Quotation dialog and dimmed by its own scrim.

**Phase 1 was declared blocked and the diagnosis was wrong.** KendoReact 16's
Button was reported as incompatible with React 19; it was one prop. Recorded
rather than quietly corrected, because the wrong diagnosis cost a day.

### WP20 · Radix to Kendo, phases A–F
**4–5 Sep · 6–8 h · 8 commits**

Six component families reassessed one at a time against evidence from the live
bundle, not swapped wholesale. Four packages removed; Tabs, Checkbox, Dialog and
Select moved to Kendo; Popover, Toast and RadioGroup **held**, each with a stated
reason — Kendo's Notification has no action slot and our undo is used at 29 call
sites, which is a fact rather than a preference.

Kendo's defaults would have shipped three regressions on the checkbox alone, and
every dialog in the app shared one ARIA id, so a nested dialog announced itself
with its parent's title.

### WP21 · Post-migration defects
**5 Sep · 5–6 h · 7 commits**

Kendo wraps tab content in a container that shrinks to fit, which collapsed a
three-column form to one on **every tabbed screen** — reported by the customer,
not caught by our checks, because none of them looked at a box size. Fixed, then
swept across all six tabbed surfaces, the last of which was measured rather than
inferred by creating a new-customer RFQ through the UI to reach it.

Also: the maximise button aligned with the close button in every dialog, the
tasks panel tightened, and view pickers moved onto Kendo.

### WP22 · Accessibility sweeps
**5 Sep · 6–7 h · 9 commits**

Colour contrast, focus order and density, each swept with a harness that was
**first proved able to detect a planted failure** before its zero results were
believed. Text passes everywhere; three control borders failed and a new token
fixed all four occurrences. Every remaining failure in the Run Quotation wizard
is an inactive control, which WCAG exempts.

Two questions raised rather than guessed: which four fields are switches, and
whether error text may name fields the user cannot see.

### WP23 · Dead ends, the modal spec, and Escape
**6 Sep · 6–7 h · 7 commits**

All nineteen "not in this prototype" stubs audited against what has since been
built. **Six were missing wiring, not a feature** — five of them the RFQ record's
smart buttons, whose destinations sit on the same page.

Modal design was found to be specified **nowhere**: the guideline names ~25
modals and their contents but never how one should behave, and the deck's six
archetypes are all full-page. `docs/modal-patterns.md` now states the eight rules
the app's 22 dialogs already follow, so the customer can review them as a set.

Writing it found two defects, both fixed. One Escape closed **every** open dialog
rather than the innermost, and Escape with a dropdown open dismissed the dropdown
**and** the form behind it. Swept across nine dialogs and three nesting depths.

---

## In progress

| Item | State |
|---|---|
| My Queues — module separation and role scoping | **Parked at the customer's request, 25 Aug.** Permission model and module queues built; page not rebuilt |
| ~~Advanced filter — rebuild as a saved View Setting~~ | **Done, 27 Aug** (WP13) |
| Setting Form View (deck slide 15) | **Blocked.** No guideline section defines it; four Configuration paths reach a placeholder |
| Brand — "Voyager IQ" rename and tagline | **Blocked** on the customer (answer sheet, Q1) |
| Dark mode (deck slide 7) | **Blocked** on a scope decision (answer sheet) |
| `Add: Packages` dialog | The one dialog not reachable by our test harness; its Escape behaviour is untested rather than assumed |

---

## What the client should know

**1. The prototype now runs on KendoReact.** *(Reversed 31 Aug – 4 Sep; the
paragraph this replaces said the opposite, and was true when written.)*
The licence key arrived on 31 August and is active until 5/6/2029. The customer
then chose Kendo so the mockup would not look unlike the system their users
already know, and the migration ran as WP19 and WP20 — component by component,
each swap justified against what the live production bundle actually uses.

Three families were deliberately **not** moved, each for a stated reason rather
than a preference: our Toast carries an undo action used at 29 call sites and
Kendo's Notification has no action slot; the popover menus are bespoke panels
with no visible gain from swapping; and the radio groups wait on question 17.

The design system is now a **bridge** — our tokens mapped onto Kendo's 453
custom properties — so the visual identity stays ours while the components are
theirs.

**2. Current phase is layout and user experience, not visual design.**
Colour, spacing, typography and component styling are a later phase, deliberately
— polishing visual design before the structure settles means doing it twice.

**3. Three findings materially reduce delivery risk.**
The metadata audit (WP7) caught option lists that would have made the built system
reject valid input. The bundle forensics (WP9) recovered specifications for
features that would otherwise have been rebuilt from guesswork. The fidelity
decision (WP8) prevents a change-management cost across 51 screens and every
current user.

**4. Eighteen questions are open with the client**, up from two, because the
Testing Guideline and the kick-off deck each raised more than they closed. They
are written up as an answer sheet at `docs/open-questions.md`, ordered so the
three that actually stop work come first: the **brand** decision, the scope of
**Setting Form View**, and whether **dark mode** is in scope.

One is cheap to answer and expensive to get wrong: Purchase Lead Time is in
**days** on the customer's own sheet and **weeks** on their live form. We assumed
days. Either way it is a sevenfold planning error.

**5. Two defects in the live system** were found while building against it and
are listed for the customer's own backlog. They need nothing from us.
