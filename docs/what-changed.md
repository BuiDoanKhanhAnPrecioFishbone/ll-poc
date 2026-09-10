# What changed, and why

**Voyager Cloud ERP — the live system, and the mockup that answers it.**
Written 10 September 2026. Every claim about the live system was read from
`erp.linhlongengineering.com` or decoded from its shipped JavaScript; the dates
and methods are in `docs/live-spec-25aug.md`, `docs/live-recheck-10sep.md` and
`docs/bundle-evidence-10sep.md`.

---

## How to read this

Three kinds of change appear here, and they are not equal:

| | What it means |
|---|---|
| **Asked for** | Your Testing Guideline, the 25 August design report, or the kick-off deck asked for it. These override the live system by agreement. |
| **Carried over** | The live system's behaviour, kept. Layout may have moved; the field, the word and the rule did not. |
| **Proposed** | Our judgement, filling a gap none of the above covers. Every one is labelled as such on screen or in code, and every one is reversible. |

The rule we worked to is in `docs/precedence.md`: **the requirements say what
changes, the live system says what everything else is, and we invent nothing.**
Where you see "Proposed", it is a question waiting for an answer, not a
decision taken on your behalf.

---

# Part 1 — Changes that apply to the whole system

*These are the ones worth reviewing first. Each one shows up on every screen,
so agreeing or rejecting them settles dozens of individual decisions at once.*

## 1.1 The navigation is visible

**Before.** All 51 destinations sat behind a hamburger. A collapsed drawer shows
one branch at a time, so there is no way to build a picture of a system you can
never see whole. "Configuration" appears five times in that menu and "Reporting"
three; the label alone does not tell you which is which.

**After.** A persistent sidebar, always on screen, with the module you are in
kept open. Nothing is hidden behind a click that was not hidden before.

**Asked for** — the brief's "drastically reduce the learning curve"; audit
findings N1, N2.

> **You have already moved in the same direction.** Between our August reading
> and 10 September you created an **Engineering** group and moved Parts, BoM,
> MPN and Manufacturers into it. That is close to the `Parts` grouping our own
> proposed sitemap argues for. The mockup now matches your new menu, and the
> `/sitemap` screen shows both trees side by side.

## 1.2 One name per screen

**Before.** A screen is called "Project Requirements" in the menu, "Request for
Quotation" in the browser tab, and `quotation` in the URL. Training material and
the interface diverge on day one.

**After.** One name, used everywhere, taken from your Testing Guideline. Old
URLs still resolve — every renamed route redirects rather than 404s.

**Asked for** — audit finding C1.

## 1.3 Tables size their columns to their contents

**Before.** Every column is 108px wide, whatever it holds. The part number —
the one value people copy out of the grid all day — is clipped in 85% of rows,
while columns that are empty in every record take the same width.

**After.** Width follows the **role** of a column, defined once: an identifier,
a description, a code, a quantity, a date, a status. A column empty in most
records does not open at all until you ask for it.

**Asked for** — audit findings T1, T2.

## 1.4 Row height is your choice, not ours

**Before.** One fixed row height.

**After.** Compact, comfortable or relaxed, set once and applied to every grid
in the system. Compact fits roughly 60% more rows on a screen.

**Asked for** — 25 August review; audit finding T3.

## 1.5 Opening a record

**Before.** A leading column of eye icons — one column of width, on every row of
every list.

**After.** The identifier opens the record. It costs no column, it reads as a
link without explanation, and middle-click and open-in-new-tab work.

**Proposed, and standing against your Testing Guideline knowingly.** The
guideline lists a "View Detail" column and your system has one. We think it is
a component default rather than a decision — and your own notes plan a *second*
row action ("duplicate record (clone)"), which an icon column does not survive.
**This is open question 1.** If you want the column back, it comes back.

> One thing this costs, and it is the reason we did not make the whole row
> clickable instead: a drag to select text ends on the row, which fires the
> row's click and navigates away. Copying a part number out of the grid is a
> daily task, and it outranks saving a pointer trip.

## 1.6 Status has a vocabulary, and the colours mean something

**Before.** On Part Master every status renders green — Active, Obsolete and
Inactive alike. Colour carries no information.

**After.** Seven states, distinguished by **who is blocked**, not by what stage
a record is at: nothing has happened yet · waiting on us · being worked ·
waiting on someone else · closed successfully · stopped and needs intervention ·
closed without completing. Each has its own colour, tested for contrast.

**Asked for** — the guideline specifies status colours; the vocabulary is
**proposed** and documented in `src/data/status.ts`.

## 1.7 Filters work the way yours do

**Before.** A filter toolbar behind a funnel icon, all fields visible at once,
**no operators anywhere**.

**After.** The same — same fields, same absence of operators, same funnel. An
earlier version of this mockup invented an operator-based filter builder; it
was removed once we read your screen properly.

**Carried over.** Added on top: saved views, so a filter set you use every
morning is one click rather than six.

## 1.8 The record count became a summary you can click

**Before.** The number of records is printed inside the module name.

**After.** A row of tiles above the grid — Active, Pending, Obsolete, Inactive —
each showing its count and each doubling as a filter.

**Asked for** — 25 August review, "the KPI can also be the filter"; audit
finding C3.

## 1.9 Forms tell you what you can change

**Before / After.** In view mode the record is one white surface, on your own
25 August instruction — which overrode the kick-off deck's request that
read-only and editable values look different. We built the deck's version first
and replaced it when you said otherwise.

**Asked for**, and recorded because the two documents disagree.

## 1.10 Dates say when, not roughly when

**Before.** `09/09/2026 16:35:29` — MM/DD/YYYY with seconds.

**After.** `09 Sept 2026 16:35:29` — the same information, in a format that
cannot be misread between US and European conventions. Columns that carry a
moment show the moment; columns that carry a day show the day.

**Proposed.** Whether date format should be a user preference or a system
setting is **an open question** — your own system has a "Region Language Format
Config" screen, which suggests you have already decided it is a setting.

## 1.11 Accessibility is measured, not asserted

Every colour pairing in the system is checked against WCAG 2.2 AA — 4.5:1 for
text, 3:1 for controls and meaningful graphics — and the measurements are in
`docs/contrast-sweep.md`. Where a pairing could not reach the threshold we say
so and explain what carries the meaning instead.

Concretely: keyboard focus is visible on every control, every icon-only button
has a name a screen reader can read, and no information is carried by colour
alone.

**Asked for** — the brief's "high WCAG".

## 1.12 Dark mode

New. Follows the operating system by default, with a manual override that
persists. Every colour in the system is defined twice and both sets are
contrast-tested.

**Asked for**, and deferred by you — "they also need dark mode, but we can leave
it later". It is built and ready whenever you want it.

## 1.13 The interface no longer shows demo data

**Before, and still true on 10 September:** the dashboard behind your login
carries a **"World Population by Broad Age Groups"** pie chart.

**After.** Gone. Every number on the mockup's dashboard is either your data or
labelled as sample data.

**Asked for** — audit finding C3, the first quick win on the list.

---

# Part 2 — Screen by screen

## 2.1 Login

**Kept:** every word, including "Welcome Back", "Please sign in to continue" and
the Privacy Notice / Term of service pair. **Sign in with Microsoft** is kept as
an equal option below the username form — it is where you put it, and the form
above it is the fallback for anyone whose account is not federated.

**Changed:** the Sign In button. Yours is pale blue on white, which is the
contrast fault the kick-off deck names. Ours measures **9.16:1** in light and
**6.86:1** in dark.

## 2.2 Project Requirements — the list

**Kept, exactly:** all eleven columns in your order, the toolbar, the funnel,
the view-template gear, the per-row View, `1 - 20 of N items` and a default page
size of 20. Re-verified 10 September: unchanged.

**Added:** the KPI summary (1.8), saved views (1.7), column chooser, and the
density preference (1.4).

## 2.3 Project Requirements — the record

**Kept:** all five tabs, all four section names — `QUOTE CONFIGURATION`,
`TECHNICAL SPECIFICATIONS`, `SPECIAL REQUIREMENTS & OPTIONS`, `ADDITIONAL
NOTES` — and **all 27 fields** with their required markers. `Historical RFQ`
appears only when Order Type is `Repeat`, as your guideline specifies.

**Changed:** the Activity Logs tab. Yours prints raw column names in the diff —
one entry we read said `DtIssuedUtc:` with no before or after value. Ours groups
by day and by person and says what changed from what to what.
**Asked for** — 25 August review.

**Corrected in this mockup, not in yours:** two mangled field labels — `AML` is
an acronym, and "Out Stock" is missing a word.

## 2.4 Part Master

**Kept:** all eleven columns in your order and your words (`CUSTOMER NAME`,
`PART SOURCE`, `LAST CHANGE`), and the full toolbar including **AML Search**.

**Added:** the KPI summary, and an import flow that asks *Import All* or
*Import by Customer* rather than offering one button for two outcomes.

## 2.5 Bills of Materials

**Kept:** the columns of your BoM list — Assembly PN, Revision, Description,
BoM Version, Customer, Last Run By, Last Run Date, BoM Status — and both
actions, BoM Comparison and Upload BoM.

> Worth flagging: until 10 September this mockup listed **parts** here, because
> the Testing Guideline's entry for the screen reads "Show the list of all
> parts" — a line that appears to have been copied from the Part Master section
> above it. Your live screen answered the question. BoM Version, Last Run By and
> Last Run Date are not things a part has.

## 2.6 Run Quotation

**Kept, verbatim including the numerals:** `1 - Config BoM` · `2 - Review BoM` ·
`3 - Quoting` · `4 - Summary`, and the full Summary field set. An earlier
version of this mockup invented a step order and a summary screen; both were
replaced once the shipped code was decoded.

## 2.7 BoM Comparison

**Kept:** all three modes, the ADDED / REMOVED / CHANGED row statuses, the
Old BoM / New BoM pairing and the Excel export. An earlier version had a Compare
button that produced nothing — the result *is* the feature.

## 2.8 Manufacturers, Part Numbers (MPN), Packing Lists

Three screens your system has and this mockup did not until 10 September. Built
to your columns, with the standard list toolbar. Three vocabularies in them are
**inferred and flagged**: MPN lifecycle statuses, and the Fulfillment and
Billing values — of which only `SHIPPED` is confirmed, from your own
"Mark this packing list as SHIPPED?".

---

# Part 3 — What we deliberately did not change

- **Your field names, section names and option lists.** Where an earlier draft
  invented four section names, they were replaced with yours.
- **The absence of filter operators.** It is a simpler screen than the one we
  first built.
- **Your route structure**, including the parts of it that are inconsistent.
  `Purchase Requisition` still resolves to `/procurement/purchase-order-lines`.
  Renaming routes is a migration, not a redesign, and it is yours to schedule.
- **Anything behind Procurement, Production, Accounting or System Configuration.**
  Out of scope; the mockup shows them as placeholders rather than guessing.

---

# Part 4 — Decisions we need from you

Full list in `docs/open-questions.md`. The ones that block work:

1. **Row actions** — does the eye-icon column come back? (1.5)
2. **Setting Form View** — how much of it is in scope.
3. **Dark mode** — in this release or the next.

And five smaller ones raised by the 10 September re-read: the MPN lifecycle
vocabulary, the Packing List fulfilment and billing vocabularies, the two words
behind BoM Status, what **Confirm RFQ** does — your status list has no
"Confirmed" in it, so we built New → In-Progress — and whether your error
messages or clearer ones should win. That last one is a genuine conflict: your
Testing Guideline asks for clearer messaging, and the precedence rule says the
words are yours.

---

# Part 5 — Three things we noticed in passing

Small things we ran into while building against your system. None of them
affect the mockup and none need anything from us — noted only in case they are
useful to whoever is next in that part of the code.

1. **The Material Planning menu entry** points at `/planning`, which does not
   currently resolve — most likely a screen still on its way.
2. **"RMA List" under Inventory Management** opens the Transfer screen —
   browser title "Transfer", heading "Transfer", transfer columns. The label and
   the destination look to have drifted apart at some point.
3. **A sample chart on the dashboard.** "World Population by Broad Age Groups"
   is still on the landing page. It was on the August list; we mention it again
   only because it is the quickest item on that list to clear.

---

# Appendix — Is KendoReact earning its place?

You asked for KendoUI, and the mockup uses it. This is an honest account of
where it helps and where we work around it, measured on 10 September.

## What is actually Kendo

Six of our twenty-four interface primitives wrap a Kendo component; the other
eighteen are ours.

| Kendo | Ours |
|---|---|
| Grid (both tables) · Button · Dialog · ComboBox · TabStrip · Upload · Excel export | Badge · Chip · Column chooser · Confirm dialog · Fields · Filter toolbar · Skeleton · **Pager** · People picker · Priority · Rich text · Stepper · Toast · View picker · View setting · Icons |

The **pager is ours even though the grid is Kendo's** — the stock one could not
produce your `1 - 20 of 336 items` wording alongside a page-size control.

## Where it clearly pays

- **The grid.** Sorting, locked columns, header/body scroll sync and Excel
  export are the parts of a data grid that are tedious to get right, and they
  work.
- **Accessibility comes free in places.** Sortable headers carry `aria-sort`
  without us adding it.
- **It is a real licence you already own**, so the components are supported and
  will be patched by someone other than us.

## Where we work around it — and the pattern in those workarounds

Our stylesheets reach into **35 distinct Kendo classes**. That is the honest
cost of the theme, and most of it is fine. Four cases were not:

1. **Escape closed every open dialog at once.** React portals propagate along
   the React tree, not the DOM tree, so one key press escaped through every
   nested dialog. Fixed with a wrapper that stops it at one level.
2. **The select-all checkbox sat 10px left of the column it heads.** Kendo's
   header cell centres inline content; our checkbox sits in a flex label, which
   is not inline content.
3. **The part-number link filled 22% of its cell.** A `height: 100%` written for
   our own table does not resolve inside a Kendo `<td>`. Three quarters of the
   most-clicked cell in a 2,000-row grid did nothing.
4. **A button's icon stacked above its label.** Kendo wraps every child it is
   given in one span, so a flex row on the button has a single child to lay out.

**The pattern:** none of these were Kendo behaving badly. Each was Kendo's
internal structure differing from what our CSS assumed, silently — no error, no
warning, just a layout that looked deliberate. They were all found by measuring
rendered geometry, and none would have been found by reading the code.

**One inconsistency we chose to leave.** A grid header is 41px where the grid is
selectable and 36px where it is not. Fixing it means overriding
`.k-grid-header-wrap`, which is the piece of Kendo layout that makes the header
stick while the body scrolls. Not worth 5px between screens you navigate
between rather than see side by side.

## The one number worth your attention

The stylesheet Kendo's theme contributes is **725KB (99KB gzipped)** — larger
than our entire application stylesheet at 491KB. We load the default theme and
re-map roughly 450 of its custom properties onto our tokens rather than forking
it, so upgrades stay possible. If page weight becomes a concern, building a
trimmed theme from source is the lever, and it is a build-configuration change
rather than a rewrite.

## Verdict

**Keep it.** The grid alone justifies it, and the workarounds are one-time costs
already paid and documented. The thing to watch is the reflex to fight it: every
one of the four defects above came from styling Kendo's internals from the
outside. Where a component's structure and our design genuinely disagree,
building our own — as we did for the pager — has been cheaper than overriding
theirs.
