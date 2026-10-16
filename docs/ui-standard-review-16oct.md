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
