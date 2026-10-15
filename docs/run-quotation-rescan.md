# Run Quotation — re-scan before redesign

6 October 2026. The customer's words after the demo: the design is bad, it is
missing structure, parts of it are over-engineered, and the dialog is small next
to the full-page one they have today.

Everything below is measured in the running build at 1440×900 and 1920×1080,
because three of those four statements turn out to be measurable.

---

## 1. What the flow actually is

| | Content height | Visible | Must scroll | Grid | Buttons on screen |
|---|---|---|---|---|---|
| **1 · Config BoM** | 1453px | 669 / 828 | **784 / 625** | — | 3 footer + 2 inline |
| **2 · Review BoM** | 1460px | 669 / 828 | **791 / 632** | 23 rows × 11 cols | 3 footer |
| **3 · Quoting** | 1861px | 669 / 828 | **1192 / 1033** | 23 rows × 21 cols | 4 footer + 4 inline |
| **4 · Summary** | not reached without a quote run | | | | |

*Visible / must-scroll are given at 1440×900 first, then 1920×1080.*

**The dialog is 1180px wide at every screen size** — `--vy-dialog-xl`, fixed. On
the customer's 1920px screen that is 61% of the width: **740px of empty screen
beside a box that still demands 625–1033px of scrolling.**

---

## 2. The four complaints, in measured terms

### "The dialog is a bit small"

Not modality — **width that does not grow, and height that does not fit.** Their
live Quoting BoM window fills the screen; ours keeps a fixed 1180px box and
scrolls inside it. At 1920 the content needs 2.2 screens on step 1 and 2.3 on
step 3 while 39% of the display is unused.

A full-page route is not the answer — the wizard is launched from a record and
returns to it, and a page would need its own URL, its own back behaviour and its
own unsaved-work rules. **The fix is a dialog that uses the screen.**

### "Missing structure" — step 1

Four sections, stacked in one column: `QUOTING INFORMATION` 402px · `ACTION`
167px · `BOM OPTIONS` 328px · `ASSEMBLY DETAILS` 307px. The live screen carries
the same content in **three regions side by side** and fits on one screen with
nothing cut.

Worse, the consequence: **the three fields `Next` requires — Assembly Part
Number, Revision, Description — begin 648px below the fold.** Press `Next` and
the only feedback is a toast naming them. Measured on that press:

- fields marked invalid: **0**
- dialog scrolled toward the problem: **0px**

So the user is told three field names they have never seen, in a box that does
not move, with no marks to look for.

### "Missing structure" — step 2 — **this one was my error**

I wrote that step 2 was a bare table with no toolbar. It is not: it carries the
same context bar as step 3, a warning when parts are missing from Part Master, a
search box and two filters — `Is Exclude?` and `Missing Manufacturer`. The
measurement that misled me counted headings and buttons, and a toolbar made of
labels and checkboxes has neither.

Step 2 needed no restructuring. What it did need was for the modal between it
and step 3 to stop existing, since the "Is Exclude?" filter it duplicated was
already sitting there.

### "Over-engineering"

- **Three actions where the live system has two.** `Import New BoM` and
  `Load Existing Assembly` are theirs; `Continue from drafts` and its table are
  ours.
- **Five dialogs can open on top of this dialog**: Excluded parts, Add
  attrition, Confirm quote, Add package, Import file.
- **The stepper repeats a sentence per step** ("Choose the BoM and the assembly
  to quote — current step"), costing 50px and reading as instructions the user
  did not ask for. The live stepper prints `1 - Config BoM`.
- ~~**"View more (2 more)"** on the attachment list is ours, not theirs.~~
  **Wrong — it is theirs.** The guideline specifies it: *"If there is more than
  one attachment, the system initially shows a shortened list with a View more
  option."* Kept.

---

## 3. Proposed redesign

### Size — both numbers change
- Width `min(1600px, 94vw)` for this wizard, height `92vh`.
- **Run Quotation opens maximised**, with restore available. It is a work
  surface, not a question — the same reason Maximise was built for it.
- Target after the change: **step 1 scrolls 0px at 1440×900**.

### Step 1 — three regions, as the live screen has
```
┌─ RFQ reference (read-only) ─┐┌─ Action ────────────────────────────┐
│ Customer, Quote Focus,      ││ ( ) Import New BoM  ( ) Load Existing│
│ Material Package Type,      │├─ BoM Options ──────┬─ Assembly ──────┤
│ Markup, Quantities,         ││ Attachment         │ Part Number     │
│ Special Need, Notes,        ││ File name          │ Revision        │
│ Attachments                 ││ Template           │ Description     │
│                             ││ Column detection   │ Build Qty · Attr│
└─────────────────────────────┘└────────────────────┴─────────────────┘
```
Left panel is reference, never edited here. Right side is the work.

### Validation — at the field, not in a toast
Mark the three fields, move focus to the first one, and keep the live wording in
the message. The string stays theirs; where it points becomes ours.

### Step 2 — keep, and drop the modal after it
It already has the frame. The "Review Excluded Parts" dialog between steps 2
and 3 goes: it reported a count that step 2's own `Is Exclude?` filter shows.

### Step 3 — unchanged in structure
It already matches the live screen: context strip, search, three filters, four
inline actions. Only its vertical budget improves — about 16 grid rows visible
instead of 8.

### Cut list
| Cut | Why | Where it goes |
|---|---|---|
| `Continue from drafts` action + table | Not in the live flow; a third door on a two-door screen | The RFQ record — a draft is the record's, not the wizard's |
| Excluded-parts dialog | A modal over a modal to report a count | An "Excluded" filter in step 2 |
| Stepper descriptions | 50px of instruction nobody asked for | Tooltip on the step |
| "View more (2 more)" | Ours; the list is short | Show every attachment |

---

## 4. Open decisions

1. **Drafts** — if `Continue from drafts` leaves step 1, where does it live? The
   RFQ record's action bar, or the Quotation Result tab?
2. **Confirm quote dialog** — keep the confirmation between step 3 and step 4?
   There is no live evidence either way, and `Next` could carry it.
3. **Maximised by default, or just fluid?** Maximised answers the complaint
   outright; fluid is less of a jump from what they saw.


---

## 5. Built — 6 October 2026

| | Before | After |
|---|---|---|
| Dialog | 1180px fixed, 61% of a 1920 screen | opens **maximised** (96vw × 94vh), Restore down kept |
| Step 1 scroll @1440×900 | 784px | **0** |
| Step 1 scroll @1920×1080 | 625px | **0** |
| Step 2 scroll | 791px | **0** — the grid scrolls, the frame stays |
| Step 3 scroll | 1192px | **0** — same |
| Step 4 scroll | — | **0** |
| Step 1 invalid fields marked | 0 | **3**, and focus moves to the first |
| Modals over the modal | 5 | **3** (Add attrition, Add package, Import file) |
| Step-1 actions | 3 | **2**, as the live flow has |

**Step 1** is three regions: reference on the left (scrolling on its own if the
RFQ carries long notes), Action across the top right, then BoM Options and
Assembly Details side by side.

**Validation** marks the fields, moves focus to the first one, and keeps the
customer's sentence in the toast.

**Step 3 → 4** is one button — `Generate Quotation` — with the numbers beside it
in the footer: *20 lines · $3,048.04 · 3 without a supplier → NO BID*. The NO BID
rule it used to confirm still runs, on the press.

**Drafts** left step 1 for the record's action bar, as `Run Quotation` with a
chevron listing this customer's drafts. The chevron appears only when there is
at least one.

**The stepper** no longer repeats each step's sentence under its label — the
dialog subtitle already says it for the current step. It survives as the tooltip.

### One defect I introduced and fixed on the way
Making the dialog content a flex column turned the stepper into a flex item
sized to its own content: 2816px of steps inside a 1536px dialog, with step 4
clipped out of existence by the new `overflow: hidden`. `min-width: 0` on the
children, and a column direction on the content. Third time this project has
paid for the automatic-minimum-size rule — `.vy-record-bar`, the sitemap's
compare column, and now this.

### Noticed, not ours
A small red badge reading **12** paints over the dialog's top-right corner, only
when a Kendo dialog is open, and it is **not in the DOM** — so it is drawn by
KendoReact itself, almost certainly the unlicensed/trial indicator described in
`docs/kendo-license-activation.md`. It needs the licence key in the environment
the demo runs from. Worth settling before the next demo.

---

# Steps 2 and 3, read live on 15 October 2026

Read on a live RFQ, desktop 1400x900, with the customer driving step 1 — we do
not complete a BoM import against a production record. Nothing was run: `Run
Quote`, `Apply`, `Add Attrition`, `Apply Price Range` and `SAVE DRAFT` were not
touched, and step 4 was not opened.

Confirmed on the way in: the wizard opens at **1400x900, the full window**, which
is the decision this project already took; and step 3 carries a **SAVE DRAFT**
button, which is the draft model behind "Run Quotation ▾ → Resume Draft".

## Step 2 — Review BoM, as they ship it

Context bar of 7: Assembly Part Number - Rev · Description · Quote Focus ·
Material Package Type · Markup (%) · Build Qty · Attrition Set.
Toolbar: search (`Search by Part/Desc/MPN/MFG/Supplier...`), and two filters,
`Is Exclude? (Include in quotation = FALSE)` and `Missing Manufacturer`.

Grid — **17 columns, 2515px inside a 1340px track, 1185px of horizontal scroll**:

| | |
|---|---|
| Frozen (5, 715px) | ☐ 25 · NUMBER 70 · ROCKET_PN 250 · PART DESCRIPTION 300 · QUANTITY 70 |
| Scrolling (12, 1800px) | MFG1 · MFGPN1 · MFG2 · MFGPN2 · MFG3 · MFGPN3 · MFG4 · MFGPN4 · MFG5 · MFGPN5 · MFG6 · MFGPN6, 150px each |

Rows 50px, ~58 lines in the BoM, header `#d9ecf5` 12px/700/uppercase.

**Measured fill rate across the 13 rendered rows:** MFG1/MFGPN1 13/13,
MFG2/MFGPN2 **1/13**, MFG3 through MFGPN6 **0/13**. Eight of the twelve AML
columns are empty on every row, and the frozen block takes 53% of the visible
track, so about four of the twelve are on screen at a time.

**Three colours, no key.** ROCKET_PN pink `#f8a4a7` on 13/13; MFG1 amber
`#fae197` on 9 and pink on 4; MFG2 pink on 1. No legend, no icon, no text
anywhere on the step — colour is the only channel (WCAG 1.4.1). And step 3 uses
a *different* pink, `#ffcdd2`.

## Step 3 — Quoting, as they ship it

Context bar adds `Primary Provider` and four buttons: `Run Quote` · `Apply` ·
`Add Attrition` · `Apply Price Range`. Filters: `Unselected Supplier` · `Not
Enough Qty` · `Missing Attrition`. Footer: `SAVE DRAFT` · `PREVIOUS` · `NEXT`.

Grid — **21 columns, 2300px in a 1340px track, 970px of scroll, and zero frozen
columns**: PART · REVISION · SOURCE · DESCRIPTION · MFG · MPN · QTY · ATTRITION ·
TOTAL QTY · SUPPLIER · ORDER QTY · STOCK · LT · PKG. · MOQ · EXCESS · UNIT PRICE ·
AMT · EXCESS AMT · STATUS · NOTES. Our column set already matches theirs.

Three findings:

1. **A rendering bug.** The header has 21 columns and a part row has 21 cells,
   but the alternate-AML row has **15**. Its values land under the wrong
   headings: the manufacturer renders under PART, its MPN under REVISION, a bare
   `0.00` under MFG. One such row among the 32 rendered; nothing compensates
   with a colspan.
2. **Nothing is frozen**, on the widest grid in the product. Scroll right to read
   UNIT PRICE or STATUS and PART, DESCRIPTION, MFG and MPN are all gone. Step 2
   freezes five columns; step 3 freezes none — adjacent steps, opposite rules.
3. **Error-red for "not calculated yet".** Before Run Quote, pink `#ffcdd2`
   covers MPN, ORDER QTY, STOCK, LT, PKG., MOQ, EXCESS and UNIT PRICE on 31-32
   of 32 rows — roughly 250 red cells on arrival at a step where nothing is
   wrong. Our step 3 already renders these as a `pending` tone.

## What we built for step 2, 15 October

**One column per AML slot — MFG1, MFGPN1, MFG2, MFGPN2 … as the live screen
has them.** Built first as a single stacked `MFG | MPN` cell, on the measurement
that eight of their twelve AML columns were empty on every row. The customer
corrected it the same day with a second BoM where MFG2/MFGPN2 carry real second
sources (TREND_TE, ONSEMI), and with the argument I had missed: **separate
columns let an estimator read DOWN a column** to see which lines have a second
source at all, which is the question this step exists to answer. Stacked pairs
can only be read row by row. Their structure wins.

What we do not copy is the fixed six slots. The columns are generated to the
depth the DATA uses — two columns for a BoM with one AML per line, six for a BoM
with three — so no row pays for a column no row fills. On our seed data that is
depth 3: six AML columns instead of twelve, 670px of scroll instead of 1185px.

`BomLine.alternates` carries them, and `ColumnSpec.id` was added so a generated
set keys on something other than `field`: six columns rendered from one
`alternates` array would otherwise share a React key and five would be dropped.

**"Missing Manufacturer" now means what its colour means.** The filter tested
`mfg === ''`, which on the live screen would match nothing — MFG1 is filled on
all thirteen rows and four of them are still painted red. Red marks a
manufacturer that is not in Manufacturer Management, and the filter is named for
it, so both now ask the same question. On our data: 23 rows → 8.

**A legend.** Two swatches under the toolbar — "In Part Master, manufacturer
recognised" and "Not on file — create it before confirming this RFQ" — so the
colours are painted *and* stated. Every coloured cell and chip also carries a
`title` in words.

**And we fixed the same mistake we were criticising.** At the role default
widths our frozen block was **988px of a 1302px track, 76%** — worse than their
53% — leaving the MFG | MPN column, the one the step exists to check, in a 314px
window. The guideline's six frozen columns are kept; the columns are sized to
the content they hold instead, and the grid now fits.

| | Live | Ours, before | Ours, after |
|---|---|---|---|
| Columns | 17 (12 of them AML) | 12 | 15 (6 of them AML) |
| AML slots rendered | 6, always | 1 pair, merged | as many as the data uses |
| Table width | 2515px | 1532px | 1956px |
| Horizontal scroll | 1185px | 246px | **670px** |
| Frozen share of track | 53% | 76% | 63% |
| Colour legend | none | none | **3 states, stated** |

The scroll is the price of the customer's column structure, and it is their
call to make; what we removed is the part that was empty. The frozen set is
theirs too — checkbox, NUMBER, ROCKET_PN, PART_REV, PART_DESC, QTY — and ours
is narrower than theirs column for column (ROCKET_PN 170 against 250,
PART_DESC 230 against 300).

## The context strip, tightened — 15 October

Boxing the five read-only facts took the strip from 68px to 126px: two rows
where there had been one, and every pixel of it comes off the grid below. Three
changes bought it back without giving up the boxes.

- A 28px box rather than 34px, as in the step 1 reference panel.
- `--vy-quote-fact-min` from 9rem to 5rem. It was a floor behaving like a width:
  "27%" was given the same 144px as a part number.
- `--vy-quote-fact-wide` from 220px to 180px. Flex wraps on the BASIS, before
  anything grows, so at 220 the seven facts summed to 1329px against a 1278px
  strip and Attrition Set dropped to a second row on its own.

Measured on step 3: **126px → 76px at 1400x900, and the dialog body scrolls
0px.** At 1280x720 the strip still wraps to two rows and the body scrolls 52px;
the footer is outside the scrolling region, so Previous, Save draft and Generate
Quotation stay put.

**The scrolling rule, stated.** Scroll the data, not the chrome. The stepper,
context strip, toolbar and footer hold still; the grid scrolls, in both
directions, with both scrollbars drawn and taking layout space so neither is
the invisible overlay that caused "I cannot scroll to see all the attachments".

## Step 3, built — 15 October

Two of the three findings against the live screen were true of ours as well,
and one of them we had written up as criticism while shipping it.

**Red for "not calculated yet".** `tone: pending` pointed at
`--vy-tone-missing-bg` — the same red-50 as a missing part — so step 3 opened
with **240 cells painted like failures** for values that had simply not been
fetched. It now has a token of its own, `--vy-tone-pending-bg`, set to the
sunken grey that marks every other not-typeable surface in the product. Grey
says inert; red is kept for something actually wrong. A legend says both in
words, as on step 2.

**Width.** 21 columns summed to 2814px in a 1302px track — wider than the live
screen's own 2300px, which is not a position to criticise from. Twelve columns
came down to the sizes the live uses: **2814px → 2500px, overflow 1528px →
1214px**, and the frozen block from 52% of the track to **43%**, which widens
the scrolling window from 626px to 742px.

**Frozen columns.** Ours already froze four — Part, Revision, Source,
Description — against the live screen's zero, so the identity of a line
survives the scroll to Unit Price and Status. That one needed no change.

### Not built: the alternate-AML rows

The live step 3 lists each alternate manufacturer as its own row under the part,
which is how a second source gets its own supplier, order quantity and price.
Ours does not render alternates on this step at all — `BomLine.alternates`
reaches step 2's MFG1..MFGPN6 columns and stops there.

That is a gap, not a decision, and it is the one place where copying the live
screen is unattractive: their alternate row has 15 cells in a 21-column table,
so its manufacturer renders under PART and its MPN under REVISION. Built here it
would want a properly indented sub-row with the columns aligned, which is a
feature rather than a fix. Raised for the customer to decide.

## Sections become cards — 15 October

*"Should we group them into group cards? The BoM quotation was complained hard
to understand, the structure layout is messy."*

They were describing a real inconsistency rather than a preference. The record
screen already renders "a named set of fields" as a bordered card with a
tinted, icon-led title bar — Customer, Project, Schedule & ownership. Step 1 of
Run Quotation renders the same thing, four times, as a small uppercase label
floating on white with a hairline rule between regions. Two patterns for one
job, in one product, two clicks apart. The one that looks unstructured is the
one without the card.

Applied to both users of `.vy-run-section`: Run Quotation step 1 (Quoting
information, Action, BoM Options, Assembly Details) and Create BoM (RFQ
Information, Select Action, Assembly Info, Component Info, MFG Mapping). Each
takes a border, a radius and a title bar that bleeds to the card's edges, with
an icon, matching the record screen.

**It costs nothing in height, which is the part worth recording.** A card
separates itself, so the rule between sections goes — and that rule was
costing 41px a join in margin, padding and border, more than a title bar. The
reference rail keeps its grey ground, because that is what says "carried from
the RFQ, not the work"; it takes the same border and title bar as its siblings.

Measured at 1400x900:

| | Before | After |
|---|---|---|
| Step 1, dialog body scroll | 0px | **0px** |
| Create BoM, dialog body scroll | 220px | **210px** |

**One defect found on the way.** `.vy-run-pair > .vy-run-section + .vy-run-section`
set `border-top: none`, to cancel the old separator where two regions sat side
by side. With a section as a card that rule was cancelling the card's own top
border, and Assembly Details rendered with three sides. Removed with the
separator it existed to suppress.

## The radio, and the room — 15 October

**"Is this radio style from Kendo? If not, update it to Kendo; if it is, fix the
dot so it is centred."**

It was not Kendo. It was Radix, and deliberately so: the live sweep found no
radio group anywhere in Voyager, only `k-switch` ×4, so there was nothing to
match and `docs/radix-to-kendo-scope.md` parked it as open question 17.

It was also drawing itself wrong, and the cause is worth recording. Radix
renders the control as a `<button>`, and a button carries the user agent's
`padding: 1px 6px`. Nothing reset it. On a 20px box with a 2px border and
`box-sizing: border-box` that leaves **4px** of content width for an 8px dot, so
the dot sat 8px from the left edge and 4px from the right — measured, not
guessed, and invisible until someone looked closely enough to ask.

Both answers are the same change: a native `<input type="radio">` wearing
`k-radio k-radio-lg`, as the checkbox has since phase C. Kendo's theme draws the
circle, the dot, the states and the focus ring; 24 lines of hand-drawn CSS are
gone, no new dependency was added, and none of the seven call sites changed.
`useId` names each group, so two groups on one screen stay independent —
verified on step 1, where Action and BoM Options are two groups.

### "Too small for this much information"

Step 3's grid had **349px of a 627px step** — nine lines of a BoM that runs to
fifty-eight — under five stacked bands of chrome: the context strip, the Primary
Provider row, a banner, the toolbar, and the colour key.

The key moved **inside the banner**, which is the sentence that explains it, and
the band gap went from 12px to 8px. Both bands disappear once the quote has run,
so the grid is at its largest exactly when there are results to read.

| | Before | After |
|---|---|---|
| Bands above the grid | 5 | 4 |
| Grid height | 349px | **391px** |
| Rows visible | 9 | **10** |
| Grid share of the step | 56% | **62%** |

Not a transformation. The next band worth taking is the Primary Provider row,
which could share a line with the search and filters — about 46px more — but at
1302px those two rows hold a select, four buttons, a search box and three
filters, and merging them buys a row back only until the first width where they
wrap. Left for the customer to call.

## "Why can I scroll on localhost but Safari is stuck?" — 15 October

It was never the browser, and it was never localhost. It was one media query.

```css
@media (max-width: 1180px) { /* the dialog scrolls as a whole, as on a phone */ }
```

A Retina screenshot 2000px wide is a **1000 CSS px** window. 1000 is under 1180,
so an ordinary desktop Safari window took the phone path: the whole dialog
scrolled, the grid's header scrolled away with it, and the footer sat over the
rows. The Claude preview pane happened to be wider than 1180 at the time, so the
same build behaved differently a metre apart.

**Reproduced in Chromium at 1000x800** before changing anything — phone
fallback active, step 1171px inside a 629px content box, dialog body scrolling
638px. Same build, same browser family, no Safari involved.

It was also keyed on the wrong axis. What makes a fixed frame unaffordable is a
shortage of HEIGHT; this asked about width, so a 1200x600 laptop kept a
treatment it had no room for while a 1100x1400 window gave it up with height to
spare. The condition is now `max-width: 720px, max-height: 620px` — a real
phone, or a genuinely short window.

| Viewport | Phone fallback | Dialog body scroll | Grid |
|---|---|---|---|
| 1000x800 — the reported case | **no** | **0px** | 229px, 6 rows |
| 1200x600 — short laptop | yes | 816px | — |
| 375x812 — phone | yes | 2059px | — |

**Worth saying plainly:** at 1000x800 the grid now holds its frame but gets only
229px, six rows, because the chrome above it is ~278px and does not shrink. The
fix stops the header disappearing; it does not make a 1000px window roomy. That
is the same chrome budget discussed above, and the Primary Provider row is still
the next band worth taking.
