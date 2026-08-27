# Quick Quote — build and test run

Sheets: **PR - EC - Quick Quote** (265 rows) and **PR - NC - Quick Quote** (265 rows,
byte-identical — the customer already existing changes nothing once you are in the
wizard). Built and run 28 Aug 2026.

---

## What existed before, and what was wrong with it

The wizard had the right four steps — `1 - Config BoM · 2 - Review BoM ·
3 - Quoting · 4 - Summary` — recovered earlier from the production bundle and
confirmed by this sheet. Everything inside them was thin:

- **Step 2 had no BoM grid at all.** It showed an excluded-parts list, an MFG
  mismatch panel and an attrition banner. The guideline's step 2 *is* a grid.
- **Step 3 had 11 columns** where the guideline specifies **21**, in a stated order.
- **None of the four row colours existed**, nor the three cell colours.
- **None of the six search-and-filter controls existed.**
- **None of the four dialogs existed** — Review Excluded Parts, Add Attrition,
  the NO BID confirmation, Add: Packages.
- **No formula.** `Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)`
  appears three times in the sheet and was implemented nowhere.

A wizard whose shape is right and whose content is absent still cannot be reviewed.

---

## Built

**Step 1 — Config BoM.** Quoting information carried from the RFQ, with the three
fields the guideline says are editable here (Quote Focus, Material Package Type,
Markup) and the rest read-only. Attachment picker restricted to `.xlsx` and
auto-selecting when there is only one; read-only File Name; template and column
detection with their consequences stated; *Don't see your template?* enabled only
while no template is chosen. Assembly Part Number auto-prefixes to
`0CustomerCode-PartNumber` on blur — `3032606` becomes `01455-3032606`. Build
Quantity and Attrition Set default to 1 and revert to 1 if set at or below zero.
Next validates with the live message verbatim: *"Please input information for
assemblyPartNumber, partRev, partDesc"*.

**Step 2 — Review BoM.** The grid, with the six frozen columns the guideline names
plus the checkbox in front of them. Select-all in the header. Auto-exclusion for
Part Source MAKE / MAKE/PHANT and for zero-quantity lines. ROCKET_PN green when the
part is in Part Master and red when it is not, with the consequence stated in a
banner. MFG yellow when the manufacturer is already known. Search over Part /
Description / MPN / MFG; filters *Is Exclude?* and *Missing Manufacturer*, each
carrying its count. Next opens **Review Excluded Parts** with the guideline's five
columns and its warning, then Go Back / Confirm & Continue.

**Step 3 — Quoting.** Primary Provider Nexar/Z2data, with the fallback modelled
rather than labelled — Z2data resolves one part Nexar does not. The four buttons in
the stated order and weight: Run Quote primary, Apply / Add Attrition / Apply Price
Range secondary. All 21 columns in order. Twelve columns red until the run. Five
fields editable — MPN, Attrition, Supplier, Order Qty, Notes — with negatives
resetting to zero and Total Qty recomputing from Attrition. Row colours after the
run: red no supplier, yellow short on quantity, green covered, grey NO BID. Search
over five fields; three filters. Next opens the confirmation with both lists and
Total Excess Amount bottom-right.

**Step 4 — Summary.** Run by / Run Date / Run Version on the context bar. Cost
summary with the guideline's four figures plus Excess Amount in red. Add Package
below it. Search and the three step-4 filters. Status editable, everything else
read-only.

---

## Defects found while running the sheet

| # | Defect | Fix |
|---|---|---|
| 1 | **Frozen columns painted over their own cell colours.** ROCKET_PN is both frozen and colour-coded; the `background: inherit` that keeps a frozen cell opaque overrode the green/red. The one colour that blocks confirming an RFQ was invisible. | `:not([data-tone])` on the frozen-cell rule. |
| 2 | **Every row was red before the run.** Rows were coloured by status, and every line starts at `N/A`, so "no supplier found" looked identical to "not asked yet". The guideline lists those colours under *6.3. After Run Quote*. | Status colours apply only after the run. |
| 3 | **NO BID lines were greyed only if excluded on step 2.** A line that became NO BID for want of a supplier showed no colour — same status, two appearances. | Grey follows the status, whichever route it arrived by. |
| 4 | **Add Package broke Cost/Board.** A package entered as 50 raised Cost/Board by the whole $21 rather than the $0.42 one board consumes, because the entered quantity was stored as per-board. | Select Quantity is per board; Total Quantity is that × Build Qty. See deviation 2. |
| 5 | **Assembly Part Number prefix used stale state.** The blur handler read the config rather than the field, so a value typed and blurred quickly prefixed an empty string. | Reads `e.target.value`. |
| 6 | **Material Package Type opened blank.** This sheet spells the option "Reel"; the Create PR sheet spells it "Reels", which is what the RFQ holds — so the value matched no option. | Uses the shared constant. See deviation 4. |

---

## Deliberate deviations

1. **Add: Packages actions sit in the dialog footer**, not "top left" as r229 says.
   Every other dialog in the prototype puts its actions in the footer; moving one
   dialog's buttons would make the app inconsistent with itself to match one line.

2. **Total Quantity = Select Quantity × Build Qty.** The guideline says Total
   Quantity updates "accordingly" when Select Quantity is entered, without saying
   how. Read any other way the two fields are redundant, and the cost summary comes
   out wrong (defect 4). **Worth confirming.**

3. **The MFG Mismatch Review panel is gone.** It came from the production bundle —
   BoM manufacturers that disagree with Z2Data, with *Link to an existing
   Manufacturer / Create a new Manufacturer / Add to Alias*. The guideline's step 2
   has no such panel; it has a *Missing Manufacturer* filter instead. **This is a
   removal of something real, on the strength of a sheet that does not mention it —
   flagged rather than assumed.** Say the word and it comes back.

4. **"Reel" vs "Reels"** — the customer's two sheets disagree. Using "Reels", which
   is what the Project Requirement record holds.

5. **Apply Price Range uses a stated stand-in.** The Attrition Info bands live in
   configuration outside this scope, so quantity thresholds stand in for them and
   the toast says what changed.

6. **Minimize** is not built on any of these dialogs — open question 9.

---

## Specified but not built, and why

- **Template validation** — "if the system cannot detect the required header values
  (Qty, MFG, MPN) ... displays an error message and prevents navigation to Step 2".
  Needs a real spreadsheet parsed against a real template.
- **Line merging** — lines sharing Part Number and Revision merge, summing Qty Need
  to Quote. Needs a real file with duplicates.
- **Variable MFG/MPN column pairs** — "the number of columns is determined based on
  the part with the highest number of MFG/MPN pairs". The mock BoM has one pair per
  part.
- **The supplier dropdown** — Supplier, PKG, Stock, LT, Price Break, MOQ, UP, NTO,
  Excess, Ext, Status, preferred first with "view more". Supplier is a plain picker
  here; this is a substantial control in its own right.
- **Save draft persists nothing.** It shows the guideline's exact message —
  *"Save draft quotation successfully!"* — and that is all. Resume Draft Quote is
  work package 3.
- **Project Requirement status transitions.** Each step ends with a status rule
  (New → In Progress after a draft save → Quoted after submit). The wizard does not
  write back to the record; RFQ data is generated per page load, so a status change
  would vanish on navigation and read as a bug rather than a limitation.
