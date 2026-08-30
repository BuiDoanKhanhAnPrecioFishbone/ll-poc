# Kick-off deck — coverage and gaps

`VIQ – Design Improvement_1.pptx`, 16 slides, the customer's day-one brief.
Checked against the repo on 30 Aug 2026.

## First, where this document sits

**`docs/precedence.md` does not list it.** That file names two tier-1 customer
sources — the Testing Guideline and the reviewer's design report of 25 Aug 2026
— and this deck is a third. It should be added.

It is also the **oldest** of the three. That matters more than it sounds:
where the deck and a later customer source disagree, the later one wins, and
two such disagreements already exist (below). Nothing in this file proposes
undoing work the 25 Aug review or the guideline asked for.

The deck is largely images. Its text is thin, so most of the content is in the
screenshots of the live system, and the six archetypes it names are the real
brief: Login, Generic Layout, List View, Form View, Data Form View, Setting
Form View, plus the alert pattern on the last slide.

## Covered

| Slide | Asked for | Where it is |
|---|---|---|
| 5–6 | Header: logo, clock + timezone, search, language switch, notification icon, user icon | `AppShell.tsx` — all six present |
| 5–6 | Left-hand menu, main content area | `AppShell.tsx` |
| 7 | Font and font-size, colour code, size of each section, consistency between components | `tokens.css`, `/design-system`, and `npm run css:check` enforces it |
| 8–9 | List View: title, column content types (text, number, icon, status badge), distribution rule, total columns, order | Column-role model in `components/column-model.ts`; order and visibility via view templates |
| 8–9 | Size: mobile / tablet / desktop | `responsive.css`, eight breakpoints |
| 10 | Form View: sections, label with required/optional, text, multi-selection, status | `RecordField.tsx` — one declaration drives read and edit |
| 10 | Action button (main behaviour) **and** smart button (reference linkage), as two different things | Built, and slide 14's own screenshot is where the pattern comes from: `Linkage parts (1) · Open POs (0) · On hand (0)` sit right of the action buttons, exactly as `SmartButtons.tsx` renders them |
| 10 | View Mode / Edit Mode | Built |
| 11 | Project Requirement Form | Built |
| 12–13 | Quotation Stepper, and Step 2 | Built — four steps, two entry points, now three with Resume Draft |

## Gaps

Ranked by value against risk, not by size.

### 1. Login page — absent entirely

The deck spends two slides on it and names two faults: **"Too much empty
space"** and **"Lack of contrast"**. Both are fair on the screenshot — a small
card adrift in a large white field, and a pale blue Sign In button on white.

There is no `/login` route in `App.tsx` and no login component anywhere. This
is the only screen the deck criticises directly and it is the first thing
anyone sees in a demo. Self-contained, nothing else depends on it, and the two
faults are specific enough to be answered rather than interpreted.

### 2. The alert pattern (slide 16), listed as "Alert warning" on slide 10

Slide 16 is titled "Notification Form" but is not a notifications inbox. It is
an **inline validation panel**: a red region at the top of a form listing each
problem in words — *"Total Schedule Qty exceeds order quantity by 3 units"* —
each with a link that takes you to the field at fault (*Adjust Schedule Qty*).

We have validation, and it is decent: required fields are marked, Save is
disabled and counts what is outstanding ("Save · 17 left"), and failures now
speak on an error toast. What we do not have is a **persistent list of what is
wrong, with a route to each one**. A toast says it once and disappears; a
disabled button says how many but not which. On a form of 23 fields those are
different things.

### 3. The Notifications bell does nothing

`AppShell.tsx` renders it with an unread dot and no handler. Every other
unimplemented control in this prototype says what it would do —
`toast.notImplemented('…')` — precisely so a reviewer can tell a missing
feature from a broken one. This one is silent, which is the failure that
convention exists to prevent. A one-line fix.

### 4. Brand: "Voyager IQ"

Slide 2 asks for the name **Voyager IQ**, colour "inspired by Rocket colour"
(Rocket EMS, Inc. — red and navy, which the existing Voyager mark already
uses), and *"Improve the tagline, 'The completed ERP/MES Solution'"*.

We render `VOYAGER` with `Linh Long Engineering` beneath it.

**Two questions for the customer before anything changes.** Whether the quoted
string is the tagline they want or the one they want improved — the sentence
reads both ways — and if it is the new one, whether "completed" should be
"complete". Guessing at a company's own product name and strapline is not a
decision to take quietly.

### 5. Setting Form View (slide 15)

A Configuration screen: top-level tabs, collapsible sections each with its own
Edit, number-plus-unit compound fields, help text under every field, and an
inline editable sub-table with Add new.

`data/sitemap.ts` lists a Configuration path for four modules; none has a
route, so all four fall through to the placeholder. **No Testing Guideline
section defines these screens**, so building one is tier-3 invention and needs
the customer's agreement on scope first.

### 6. Data Form View (slide 14)

The Manufacturer Part Number record: identifier with several status chips, a
last-sync line, a part image, tabs, and three-column field sections — which is
the same shape as the Project Requirement record we built, so the archetype is
already proven.

This is the same work as `part-master-mfg-mpn-assessment.md`, seen from the
design side rather than the requirements side. Cross-reference rather than
duplicate: that document has the detail, including the `Part.partSource` data
gap that blocks two of its behaviours.

### 7. Dark mode / light mode (slide 7)

`tokens.css` carries on-dark tokens, but only for the sidebar; there is no
theme switch and no dark palette. This touches every colour token in the
system, and **no other customer source mentions it** — not the Testing
Guideline, not the 25 Aug review. Largest item here by a distance and the one
most in need of a scope decision before any work starts.

## Where the deck disagrees with later customer instructions

Recorded so nobody reads these as oversights and reopens them.

**"Use KendoUI" (slide 7).** We build on licence-free MIT components because
there is no KendoReact licence. Already raised — `open-questions.md`, item 2.
Unchanged by this deck.

**"Value (read-only/editable)" (slide 10).** The deck lists read-only versus
editable as a distinction the Form View should express. Our view mode does not
express it: every field renders as a white box whether or not it can be
edited, and the difference appears only in edit mode, where locked fields go
grey.

That is not an oversight. It is the customer's own decision of 25 Aug 2026,
recorded at `components.css:298` — *"the grey box only shows in EDIT mode; in
VIEW mode just show the white box as normal"* — which reversed an earlier call
of mine to render read mode as bare values. **The 25 Aug instruction is newer
and more specific, so it wins.**

Worth knowing, though, that the day-one deck asked for the distinction. If the
customer ever revisits the view-mode question, this is evidence that they
wanted it once, not an argument that we got it wrong.

## Proposed order

1. **Login page** — answers the deck's only direct criticism, self-contained,
   no dependencies.
2. **Notifications bell** — one line, removes a silent dead control.
3. **Alert panel** — a named Form View element, and it fits the record already
   built rather than requiring a new screen.
4. **Brand** — cheap, but blocked on two customer answers.
5. **Data Form View** — real scope, and the guideline defines it; see the
   Part Master assessment.
6. **Setting Form View** — real scope, and no guideline section defines it.
7. **Dark mode** — needs a scope decision first.

Items 1–3 are buildable now without inventing anything the customer has not
asked for. Items 4–7 each need an answer before they start.
