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
