# VIQ UI Standard v1.0 — review against the build

Source: `VIQ UI Standard - Oct14.html`, Leona Truong, 14 Oct 2026, with the
covering note of 16 Oct. Checked against the prototype at commit `12592bb`, not
from memory — every claim below names the file or the measurement behind it.

**Overall: adopt it.** The document is better than most internal UI standards,
it is specific enough to check a screen against, and a large part of it already
describes what this prototype does — in several places the colour values are
literally ours. Four rules contradict instructions the same customer gave us
earlier, and those need a decision rather than a guess. Five more are worth
arguing before they are frozen into v1.1.

---

## A. Already true of the build — adopt as written, no work

| Rule | Where it already lives |
|---|---|
| `primary #1A419E` | `--vy-blue-600` — exact match |
| `header-bar #131820` | `--vy-grey-900` — exact |
| `readonly-bg #ECEFF3` | `--vy-grey-100` — exact, and it is the read-only fill we agreed on 14 Oct |
| `border #DDE2E9` | `--vy-grey-200` — exact |
| `text-label #4D5766` | `--vy-grey-600` — exact |
| Read-only field = grey + border + lock icon | Built 14 Oct, `FieldRow.ReadValue` |
| Grid: read-only plain text, only editable cells boxed | Our grids have never boxed read-only cells |
| Actions top-left, smart buttons top-right with counts | Built 8 Oct, `QuotationDetail` |
| Rare and destructive actions in **More ▾**, never `⋯` | `MoreMenu.tsx` — we already spell the word |
| Max 4 visible actions, max 5 smart buttons | RFQ record ships 4 and 2 |
| Colour never carries meaning alone — icon **and** text | The WCAG 1.4.1 argument we put to you about the live screens |
| A legend for every cell colour | Added to Review BoM and Quoting on 15 Oct |
| Alert banner between toolbar and record name | `.vy-run-banner` |
| Empty state names the next button | `NoRecords`, the step-3 empty state |
| Dialog buttons name the action; Keep editing / Discard changes | Already the wording in the discard dialog |

That the palette matches to the hex is worth saying out loud: the standard was
collected from this prototype, so adopting it costs us nothing and locks in work
already done.

---

## B. Agree — real work, no objection

1. **Regional Format for dates, numbers, money.** We have **17 hard-coded
   `en-GB` / `en-US` locale strings**. The rule is right for an ERP, and it
   supersedes our own change 1.10, which fixed `MM/DD/YYYY` ambiguity by picking
   `09 Sept 2026` — a per-user regional setting solves that properly and we
   should stop deciding it for them. Real migration, worth doing.
2. **Changed = blue until Save or Discard.** We do not have it. It needs a
   dirty-field model on the record form. Good feature; sizeable.
3. **Select ≤ 10 options, Combobox above.** We use a Combobox everywhere.
4. **"Discard Changes", not "Cancel", in edit mode; Cancel only in dialogs.**
   Ours says Cancel (`QuotationDetail.tsx:277`). The reasoning is sound — rename.
5. **Title Case for labels, sentence case for prose.** Much of ours is sentence
   case ("Save draft", "Keep editing"). A sweep, but a clear rule.

   > **30/10 — nửa đầu đã làm.** Lúc viết mục này em chỉ thấy *sentence case
   > vs Title Case* trong chữ của nút; em bỏ sót nửa còn lại, **nhãn trường
   > viết HOA TOÀN BỘ**. UPPERCASE không phải Title Case theo bất kỳ cách đọc
   > nào, nên nửa đó đã sửa: 15 rule bỏ `text-transform: uppercase` — nhãn
   > trường, tiêu đề cột, tiêu đề card và divider. Còn lại là nửa khó: đổi
   > **chữ** của từng nhãn sang Title Case, và nó **chọi với chính prototype
   > của chị** (file của chị viết *"Reload this screen"*, *"Accept &
   > continue"*). Cần chị chốt trước khi sửa chữ.
6. **Short filter labels.** The document cites our own
   `Is Exclude? (Include in quotation = FALSE)` as the thing not to do. Correct —
   we copied it verbatim from the live screen. Shorten it.
7. **Delete → deactivate if used, hard delete if never used; unique names
   including inactive; offer Activate.** Not built.
8. **Inline edit for ≤ 3 simple fields, form otherwise.** Not built.
9. **Columns chooser on every grid with 3+ columns.** Missing on the Run
   Quotation step grids.
10. **`border-input #8A94A6`** against our `#8A94A3`, and **`danger #9B2226`**
    against our `#C62D26`. Take theirs; we re-run the contrast sweep after.

---

## C. Four rules that contradict earlier instructions from the same customer

These are not disagreements with us. They are two customer instructions pointing
opposite ways, and only the customer can settle them.

### C1. Monospace for record and part numbers

- **Standard, 14 Oct:** "JetBrains Mono for record numbers and part numbers",
  "Record name in mono".
- **Design review, 8 Oct:** *"do not use monotext, hard to read"*. We removed it
  product-wide on 13 Oct; identifiers now use the body face with `tabular-nums`.

Both cannot hold. Our view: `tabular-nums` already gives the column alignment
mono was there for, without the legibility cost they objected to — so we would
keep the current treatment and drop the mono line from the standard. Either way,
a decision.

### C2. Yellow and green in the Review BoM grid

- **Standard:** yellow means warning **only**; green is "not used to colour rows
  or cells in a normal list".
- **Guideline, 25 Aug:** *"The background color is displayed in yellow because
  the manufacturer value already exists in Manufacturer Management"* — yellow for
  a perfectly normal state. We also colour `ROCKET_PN` green for "in Part Master"
  on the same instruction.

Under the new standard both are wrong. **Our proposal, which we think is better
than either:** colour only the problem states — not in Part Master, manufacturer
not recognised — and leave the normal case uncoloured. Measured on the live
screen on 15 Oct, `ROCKET_PN` was coloured on **13 of 13 rows**: a colour every
row carries tells the reader nothing. This satisfies the new standard, removes
noise, and keeps red for what actually blocks Confirm.

### C3. AML columns — this one reverses work from yesterday

- **Standard:** *"Child lists as rows: one AML pair per row, parent cells
  merged; never MFG 1 / MFG 2 columns."*
- **Instruction, 15 Oct:** *"each mfg and mfgpn is in different column now"* —
  on which we rebuilt Review BoM to `MFG1 · MFGPN1 … MFG6 · MFGPN6`, shipped in
  `f7961a7`.

The standard forbids exactly what we shipped yesterday. Worth knowing before
choosing: the sub-row layout the standard prescribes **is** what live Quoting
does, and that implementation has a defect we measured on 15 Oct — the alternate
row renders 15 cells into a 21-column table, so its manufacturer appears under
`PART` and its MPN under `REVISION`. The pattern is sound; their current build of
it is not. If we go to sub-rows we build it properly, and Review BoM changes for
the third time in three days — so we would like the decision to be final.

### C4. Wizard navigation

- **Standard:** `‹ Previous`, `Next ›`, `Save Draft` **top-left**; step indicator
  **top-right**.
- **Ours and live Voyager:** stepper across the top, navigation in the footer.

Their rule follows from "all buttons on the left", which is consistent. It is
also unlike every wizard their users meet outside this product, and it moves the
commit action away from where the eye finishes the form. We will do it if they
want it, but we would ask for it to be tested on one flow first rather than
mandated for all.

Related: the standard says "Submit on the last step". Their own writing rule —
*buttons name the outcome* — argues for our **Generate Quotation**. We would keep
ours and treat "Submit" as a placeholder in the standard.

---

## D. Five things we would push back on

1. **44px controls on standard forms.** Keep 44px as the **touch** floor, which
   our `touch:check` already enforces on a coarse pointer, and 34–36px on a fine
   pointer. On a 27-field RFQ record, 44px costs roughly 270px of height against
   our current 34px; we spent 15 Oct recovering 94px on one step because the
   grid was down to nine lines of a fifty-eight-line BoM. Height is the scarcest
   thing in this product and 44px everywhere spends it on empty space.
2. **11px labels and helper text.** Our own small-text check flags anything under
   12px, and these users read dense BoM data all day. Propose a 12px floor;
   nothing else in the type scale changes.
3. **"The toolbar is always one row; it never wraps — a narrow window scrolls
   sideways instead."** Measured yesterday on Quoting: one row is 56px at
   1400px, wraps to 94px at 1200px, against 108px for the two bands it replaced.
   Wrapping is the cheaper failure — forcing a horizontal scroll to reach a
   filter is worse than a second line. Propose: never wrap down to 1280px, wrap
   below it.
4. **"The popup never lists the changed fields."** Ours titles it *"Discard 3
   unsaved changes?"*. A count is not a list: it answers "did I actually change
   anything?", which is the question someone reaching for Discard is asking. We
   would keep the count and take their body text.
5. **Six status groups.** We ship seven, keeping `New/Open` distinct from
   `Draft` — a new RFQ and a draft are not the same thing to a planner.
   Either confirm seven, or tell us to collapse them.

---

## E. Questions back

1. **Dark mode.** The standard lists eight light hex values. This prototype
   already ships a full dark theme — 69 semantic tokens, honouring both
   `prefers-color-scheme` and an explicit toggle. Offer: we contribute the
   semantic layer (`--vy-surface`, `--vy-border-control`, …) so the standard
   survives dark mode instead of freezing eight light values that cannot.
2. **Accessibility.** The standard covers colour-blindness well and says nothing
   about focus order or keyboard. We check 1,068 focusable controls across 10
   routes on every push. Offer: we draft that section.
3. **Attachments** are explicitly out of v1.0, but we already ship attachment
   behaviour on Run Quotation step 1 and on the record. Hold ours as-is, or
   freeze until v1.1?
4. **"Status not counted"** in the ≤ 3-field rule — please confirm the full list
   of audit fields that do not count (Created Date, Created By, Updated …).

---

## What we would do first

In order, assuming the answers to C arrive:

1. Regional Format (B1) — it touches every screen and every later rule depends
   on it being settled.
2. `Discard Changes` rename and the Title Case sweep (B4, B5) — cheap, visible,
   no decisions needed.
3. Changed-is-blue (B2) — the biggest single gain in the document.
4. Delete semantics (B7) and inline-vs-form (B8) — new behaviour, best sized
   once C is answered.

---

# Pattern check, 16 October

Before arguing any of section C or D we checked what the common patterns
actually say, so the conversation is about evidence rather than taste. Findings
below, with the position each one leads to.

## C3 · AML: columns, sub-rows, or pairs in a cell

This is the one where the check changed our mind, and it does not land cleanly
on either side.

**What the pattern says.** SAP Fiori treats the three options as different
things rather than as styles:

- *Multiple fields in one cell* is a responsive-table-only feature, and it
  carries a specific defect: **multi-value cells come out empty when the table
  is exported to a spreadsheet.** For a quoting screen whose output is an Excel
  file, that disqualifies it.
- *One-to-many data whose children have their own attributes* is what a tree
  table or child rows are for — each child row can carry its own values and its
  own actions.
- *Many optional attributes on one record* is the wide-sparse-column shape.
  Fiori handles it with column priority and pop-in rather than by forbidding it.

**Where that leaves the three screens.**

| | Task | Shape of the data | Pattern says |
|---|---|---|---|
| Review BoM (step 2) | "Which lines have a second source at all?" | Attributes of the line | **Columns** — scanning down `MFG2` *is* the task |
| Quoting (step 3) | "Pick a supplier and a price for this AML" | Each AML has its own supplier, order qty, price | **Child rows** — the standard is right |
| Anywhere | — | — | Pairs stacked in one cell: **worst**, breaks export |

**Our position.** Adopt "never MFG 1 / MFG 2 columns" **for Quoting**, where the
standard is plainly right and where the live screen already attempts it. Keep
columns on **Review BoM**, where the user is comparing coverage across lines and
a column is the only shape that lets them. And drop the pairs-in-a-cell version
entirely — that was ours, from 15 Oct, and the export gap settles it.

If she wants one rule for both screens, child rows everywhere is the safer of
the two, and we would rebuild Review BoM accordingly. We would only ask that the
decision be final: that screen has changed shape three times in three days.

## C4 · Wizard navigation

**What the pattern says.** Design-system documentation consistently puts Back
and Next at the **bottom right** of a wizard and treats *consistency across
steps* as the rule that matters most — same place, same order, every step. One
system adds that navigation should stay visible while the content scrolls, so
Next is never pushed off-screen. The step indicator's job is to show position
and what remains, which is what a stepper across the top already does.

**Our position.** Keep navigation in the footer. It is the convention their
users meet everywhere else, the footer in our dialog does not scroll — verified:
`modalScrollY: 0` at 1400x900 — so Previous and Next are always reachable, and
the commit action sits where the eye finishes the form rather than above it.

The standard's reason for top-left is its own "all buttons on the left" rule.
That rule earns its keep on a record toolbar, where the buttons act on the
record; wizard navigation acts on the *form*, not on the data, which is why
every system treats it separately. We would keep "all buttons left" for
toolbars and exempt wizard navigation, rather than bend the wizard to it.

## C1 · Monospace for record and part numbers

No external check needed: the standard and the 8 October review contradict each
other, and the question is which reason is better.

Mono is asked for here to make columns of identifiers line up. `tabular-nums`
does exactly that — every digit the same width, so figures align in a column —
while keeping the body face's letterforms. It buys the alignment mono was
wanted for without the legibility cost the customer objected to on 8 October,
in their own words: *"do not use monotext, hard to read"*.

**Our position.** Keep the body face with `tabular-nums`, which is what ships
today, and drop the mono line from the standard. If she wants mono anywhere, the
narrowest case worth it is the record number in the page title — one string, not
a column.

## D1 · 44px controls — WE MISREAD THIS, correction

Our objection was aimed at something the standard does not ask for. It already
draws the distinction itself: *"Standard forms use 44px controls; screens whose
main content is a working grid use compact 32px controls"* — and it names
**Quoting** as a 32px screen, with 26px cells inside the grid.

So the disagreement is narrower than we wrote: only the **record form** is at
44px, and the working screens we were worried about are already carved out. The
note below is kept because the record form is still 27 fields deep, but it is a
question about one screen, not a principle.

### The original note, which still applies to the record form


**What the standards actually require.** 44x44 CSS px is WCAG 2.5.5 *Target
Size (Enhanced)*, a AAA criterion, and it governs the **pointer target**, not
the height of a visible control — a 34px input inside a 44px row satisfies it.
The AA criterion in WCAG 2.2 is 2.5.8 *Target Size (Minimum)* at 24x24. Material
specifies 48dp for the same reason: a finger.

None of them say a desktop form field must be 44px tall. They say what a finger
needs to hit.

**Our position.** Keep 44px as the floor on a **coarse pointer**, which our
`touch:check` already enforces on every push, and 34-36px on a fine pointer.
The cost of the blanket rule is measurable here: a 27-field RFQ record gains
roughly 270px of height, and on 15 October we spent a day recovering 94px on
Run Quotation because the grid was down to nine lines of a fifty-eight-line BoM.
Height is the scarcest resource in this product.

## Sources

- SAP Fiori, responsive table usage and table features — multi-value cells,
  export behaviour, tree tables, column priority:
  https://www.sap.com/design-system/fiori-design-web/v1-96/ui-elements/responsive-table/usage
  and https://experience.sap.com/fiori-design-web/explore_category/elements
- Visa Product Design System, Wizard pattern — Back/Next placement and
  consistency across steps: https://design.visa.com/patterns/wizard/usage/
- Embrace Cloud design system, Wizard — navigation stays visible while
  scrolling: https://design.embracecloud.nl/navigation/wizard
- Ontario Design System, Step indicator — when a stepper is appropriate:
  https://designsystem.ontario.ca/components/detail/step-indicator.html

---

# Run Quotation against the standard — 16 October

Run Quotation is the screen the standard covers most: its wizard pattern is
written about "Quoting BoM", and its "grid inside a form" example *is* our step
3, down to the filter names. Checked item by item.

## Fixed today

| Finding | Was | Now |
|---|---|---|
| **Two filled primaries on step 3** | `Run Quote` in the toolbar and `Generate Quotation` in the footer, both filled, so the step gave two answers to "what next" | One: before the run `Run Quote` is primary and Generate Quotation is secondary **but stays enabled**, exactly as the standard states for a wizard. A quote with no prices is a legitimate outcome to carry forward, and the tooltip says so better than a dead control |
| **Empty state did not name the action** | "No records available." — the same shape as the standard's ✕ example, "No data" | Two sentences, because the two causes differ: *"No quote results yet. Click Run Quote to get prices and pick a supplier for each part."* and, when a filter empties the grid, *"No lines match these filters. Clear a filter above…"* |
| **Step 1 action labels** | `Import New BoM` · `Load Existing Assembly` | `Quick Quote from BoM File` · `Existing Assembly` |

Two of the three overturn earlier instructions from the same customer:
"No records available" was the old guideline's wording, and `Import New BoM` is
verbatim from their Quick Quote sheet. The new standard names both strings and
gives a reason, so the later instruction wins.

## Left for the conversation — too big, or contested

- **"Setup locked after the calculation, with *Used for Current Results*. Edit
  Setup → Update Results (no external call) / Discard Changes. While editing,
  navigation and the grid are locked."** Not built at all, and the largest
  single piece of behaviour the standard asks of this screen.
- **The quota dialog.** *"This request uses your marketplace API quota… Cancel ·
  Re-pick Suppliers · Refresh Prices"*. We have no paid-action dialog. It lines
  up with what the live bundle showed — two run modes, `Run Quotation (Nexar
  API)` and `Run Quotation (Get Nexar from DB)` — so the free option is real.
- **Values carried from the Project Requirement shown blue when changed.**
  Needs the changed-is-blue model (B2).
- **Columns chooser with locked "always shown" columns** on the wizard grids.
- **Step 4 after Submit**: read-only result, Export top-left, version selector
  top-right.
- **AML as child rows** (C3) and **wizard navigation** (C4) stay open.
- **Legend placement.** The standard puts it in the grid's footer; ours sits
  above the grid, and on step 3 it now lives inside the banner that explains it,
  which bought the grid a row. Worth raising rather than silently moving.

---

# Second pass, 16 October — what the first review missed

Asked to check again, properly. The first review bucketed at the level of
headline rules and did not test the build against the standard's own **Review
checklist**, which is the list the customer will actually hold us to. Doing that
found **nine** things the first pass did not. Seven are fixed below; the first
review's own wording is corrected where it was wrong.

This is a failure of method, not of information: the document said all of this
on 14 October and was read in full before the first review was written.

## Fixed in this pass

| # | Checklist item | What ours did | Now |
|---|---|---|---|
| 1 | *"Status pills tinted, never solid"* | `In-Progress` was the one **solid** pill — white on `#15803D` | Tinted `#CFFAFE` on `#155E75`, 6.49:1 |
| 2 | Status groups: *In Progress = teal, Completed = green* | `In-Progress` wore solid **green**, the Completed family, so the two read as the same kind of thing | Cyan-leaning teal, 36° of hue from the done green. Teal-100 was tried first and rejected: 18° away and **1.01:1** against it, which is no difference at all |
| 3 | *"Edit mode: smart buttons hidden"* | Four ways out of the record were still on screen beside unsaved changes | Hidden while editing |
| 4 | *"Save is always enabled and validates on click"* | Disabled until every required field was filled | Always enabled. On click: marks the fields, names the count, moves focus to the first one |
| 5 | *"blue Editing pill first"* | Nothing — edit mode was announced by a banner lower down | Pill beside the record number, before the status |
| 6 | *"filters (no counts)"*, said twice | Chips carried counts — `Is Exclude? 3`, `Missing Manufacturer 8` | Counts removed |
| 7 | *"filters → search → Columns"* on the right | Ours ran provider → search → filters → actions, with the actions last | Provider and actions left; filters then search right |

Item 4 overturns the customer's own earlier guideline — *"the Save button
becomes enabled after the user enters or selects values for all required
fields"*. The newer rule is better for the reason the old comment half-admitted:
a disabled button is a dead end. It says you cannot proceed and leaves you to
hunt for why.

Item 6 is the one rule here we would rather argue than obey. A count tells you
whether a filter is worth clicking before you click it. It is followed because
the standard says it twice and says it plainly — but we would like to make the
case.

## Both outstanding items, now done

**Columns chooser on the wizard grids.** Review BoM and Quoting are the widest
grids in the product — fifteen columns and twenty-one — and neither let a user
put one away. `useColumnChoice` adds it to both, last on the toolbar row where
the standard puts it, and remembers the choice per user.

*Locked = frozen*, and that is not a shortcut. A frozen column is the one the
grid keeps on screen while the rest scroll, which is the same judgement as "this
is how you know which row you are reading" — the standard's **key column**.
Deriving one from the other means they cannot disagree, and it removes the
failure where hiding a column inside a seven-column frozen block leaves the
freeze counting a column that is no longer there. Measured on Review BoM: 15
columns, 7 locked, hiding `MFG1` takes the header count to 14 and persists.

**List toolbar actions.** `Add New` and `Export` were in the page header on the
right. They now sit in a row of their own above the table, left-aligned, which
is the shape the standard's own config-list example shows: title, then Add New
on its own line, then the filter-search-Columns strip, then the table.

This settles an argument the code had with itself. "Left corner: Add New" from
the earlier guideline had once been obeyed by dropping Add New *into* the
table's control strip, which mixed two tiers of control and crowded the search;
the fix at the time moved it to the header instead. A row of its own satisfies
the standard's "all buttons on the left" **and** the objection that earned the
move — because a row of its own is not the search strip.

## Corrections to the first review

- **D1, 44px.** We objected to something the standard does not ask for; it
  already exempts working-grid screens at 32px and names Quoting as one.
  Corrected in place above.
- **B9, Columns chooser.** Written as "missing" generally. It is missing on the
  wizard grids only; list screens have had one all along.
- **B6, short filter labels.** Listed as work. It was already done — the long
  label the standard objects to is the live system's, not ours.

## Still only in the "ask" bucket, not missed

Required marker `(*)` against the standard's red `*`; the six-vs-seven status
groups and the yellow `open` pill that goes with that question; AML child rows;
wizard navigation; legend placement. Each contradicts an earlier instruction or
a measurement of ours, so each is a question rather than a gap.

## One inconsistency the fixes created, caught in review

Moving the Run Quotation toolbar to *filters → search → Columns* left the
product saying two different things two clicks apart: search on the **left** of
a list, search on the **right** of the quoting grid.

The standard gives the same order for both — its config-list section says
"status filter, then search, then Columns last", and its grid-inside-a-form
section says "filters (no counts), then search… Columns always last" — so the
**list** was the one out of step, not the wizard. `DataGrid`'s toolbar now reads
spacer → views → funnel → search → Columns, matching Run Quotation.

Worth recording as a method note: applying a rule to one screen is how you
create an inconsistency with the screen you did not look at. The standard is
written per-pattern; the product has to be checked across patterns.

## And a CI failure that was not ours

`touch:check` failed on three overlapping hit areas — all of them
`a.k-watermark-trial-button "Start Free Trial"` lying across the KPI buttons,
with **FAIL 0** beside them: no target of ours was too small or too close to
another. Kendo paints that watermark when it finds no licence, CI has no
`TELERIK_LICENSE`, and a licensed build never renders it. Our own layout change
simply moved a KPI row under where it sits.

The check now excludes it, because a gate that fails on something the product
does not ship is a gate people learn to ignore. **The better fix is one we
cannot make: set `TELERIK_LICENSE` as a GitHub Actions secret** — the same value
the Vercel dashboard needs — and the watermark stops being drawn at all.
