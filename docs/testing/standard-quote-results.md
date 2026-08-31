# Standard Quote — build and test run

Sheet: **PR - EC - Standard Quote** (242 rows). Built and run 28 Aug 2026.

> *Use case: BOM is already approved and loaded in VIQ via the ECO process. PM
> uses the current system BOM to run a formal material cost quote.*

---

## The finding that shaped the work

**Steps 2, 3 and 4 are identical to Quick Quote.** Checked row by row: the
apparent differences are the same rules reworded — "Part numbers that already
exist in Part Master are displayed with a green background" against Quick
Quote's "Part numbers - Rev that already exist…" — not different behaviour. Same
grid, same colours, same filters, same dialogs, same formula, same buttons.

So the whole of Standard Quote is **step 1**, and the two sheets describe one
wizard with two entry points rather than two wizards. That is what the Action
control on step 1 now is.

---

## What changed structurally

The Action radio had three flat options, taken from the production bundle:
Import New BoM · Run quote with existing BoM version · User current BoM (no
changes).

The guideline shows that is the wrong shape. "User current BoM (no changes)" is
not a sibling of the other two — it sits **inside** Load Existing Assembly,
beside "Upload BoM and create a new version". Read as a peer, it put a question
about an existing assembly's BoM next to a question about which flow you are in.

Now:

```
Action
├── Import New BoM          → attachment · template · column detection
│                             assembly typed (Part Number · Rev · Description)
└── Load Existing Assembly  → BoM Options
                              ├── User current BoM (no changes)
                              └── Upload BoM and create a new version
                                    → template · Upload file · File name
                              assembly CHOSEN from the customer's list
```

---

## Built

- **Project Requirement** added to the quoting-information panel. Named on this
  sheet and not on Quick Quote's; shown on both, because it is one panel and a
  field that appears on only one of two paths through one screen reads as a bug.

- **BoM Options** for Load Existing Assembly, with the guideline's own guidance
  under each — these are easy to choose wrongly and the consequence of the
  second (a new BoM version nobody asked for) is invisible at the point of
  choosing.

- **User current BoM** hides the template selection, as specified: *"The template
  selection is hidden from the user to prevent incorrect template selection."*
  Which template is used is still named — the control is hidden, the fact is not
  a secret, and naming it answers the obvious question at no cost.

- **Upload BoM and create a new version** shows Select template (defaulting to
  the Inventory Management template), a read-only File name, and Upload file.

- **Import File from Voyager** — files already in the system, each with where it
  came from and when, plus local upload. The guideline names the modal after the
  first but requires the second, so both are in one dialog rather than the local
  upload hiding behind a differently-named control.

- **Please select assembly** — options formatted `Customer Code - Part Number -
  Rev - Version`, scoped to the RFQ's customer, with a Clear so another can be
  chosen. Choosing one fills Description **and locks it** (*"can't be more
  adjusted"*), and carries the part number and revision through to steps 2–4.

- **"Select assembly first!"** on Next, verbatim, bottom-right.

---

## Verified end to end

| Check | Result |
|---|---|
| Action offers exactly two options | `Import New BoM`, `Load Existing Assembly` |
| Next with no assembly | toast reads **"Select assembly first!"**, stays on step 1 |
| Assembly options | `01455 - 01455-184-6456 - A - v2`, `… - B - v1`, `01455 - 01455-221-6667 - A - v1` |
| Choosing one | Description = "Infusion Pump Main", locked, Clear appears |
| Import File from Voyager | File name fills with `BOM_RevD_2026-08-26.xlsx`, dialog closes |
| Next | step 2, context bar reads `01455-184-6456 - A` / `Infusion Pump Main` |
| Steps 2–4 | unchanged, as the sheet requires |

---

## Deviations and gaps

1. **The bundle's "Run quote with existing BoM version" is gone**, folded into
   Load Existing Assembly's two options. That is the guideline's structure and it
   accounts for every option the bundle had, but it is a change to a control the
   live system shows — worth a glance from the customer.

2. **Assemblies are synthetic**, derived from each customer's project names so
   the list always belongs to the RFQ's customer. Real assemblies come from the
   ECO process, which is outside this scope.

3. **Upload from this machine** raises the usual "not in this prototype" notice.
   Selecting an existing Voyager file works and fills File name.

4. **No BoM is actually re-parsed.** Choosing a different assembly, template or
   file gives the same lines on step 2 — the mock BoM is fixed. Everything that
   depends on the *choice* is wired; nothing that depends on the *file contents*
   can be.

5. **Project Requirement status transitions** are not written back, for the same
   reason as Quick Quote: RFQ data is generated per page load, so a status change
   would vanish on navigation and read as a bug rather than a limitation.

---

# Guideline pass — 31 Aug 2026

A re-read of the sheet against the controls now built, rather than against the
build plan. Distinct from the 28 Aug run above, which checked that the flow
worked; this asks whether each control does what the sheet says it does.

## Method, and why the yield was small

Steps 2–4 were diffed line by line against Quick Quote. Of 610 content lines,
**six** appear on this sheet and not that one, and four of those are the same
rule reworded. The 28 Aug finding — *"the two sheets describe one wizard with
two entry points"* — holds mechanically, not just by impression.

The two that are not rewording were already built: the Quotation Result columns
and their order, and *"The BOM File field is blank … when the quotation is run
from an existing BOM"*, which `ResultTab` renders as **From existing BoM**
rather than a dash, because an empty cell there is a fact about the run and not
missing data.

## Two findings

### 1. Attachments never collapsed

> "If there is more than one attachment, the system initially shows a shortened
> list with a View more option to expand and display all files. Clicking again
> changes it to View less to collapse the list."

Stated in full only here; Quick Quote has the same rule in one terse line
(r663). The `Attachments` component **quoted that line in its own doc comment
and then rendered all three files, always** — which is worse than the plain
omission, because the file read as done to anyone checking it.

Now collapsed to the first file with **View more (2 more)** / **View less**,
`aria-expanded` and `aria-controls` on the button. *More than one* is the
customer's condition, so a single attachment gets no control — a View more that
reveals nothing is a button that lies. At exactly two attachments "shortened"
can only mean one, which is why the collapsed list is one file and not a fixed
handful.

### 2. Quote Focus = OTHER still auto-selected suppliers

> "Other: Allows the user to manually select suppliers; the system will not
> auto-select suppliers in Step 3 - Run Quote."

`runQuote` took `provider` and never `quoteFocus`. It assigned a supplier to
every line under all four values, so the one Quote Focus option that changes
what the run *does* changed nothing.

The other three values each tell the system how to CHOOSE — availability, cost,
or the balance. OTHER is the value that says don't choose; the quoter has a
reason the system does not know.

**What the guideline already settles.** Lines then come back with no supplier,
and r1456 covers that case unconditionally: *"BOM lines without a Supplier are
displayed with a red background color and Status = N/A."* So no new status and
no new row colour were needed — under OTHER the red grid is not a failure
report, it is the to-do list, and the existing **Unselected Supplier** filter
counts it down. r1561's *"all unselected BOM lines are updated to Status = NO
BID"* on continue was already built and needed no change.

**What had to be added beyond the sentence.** A supplier the user picks now
survives Apply. Apply re-runs the pricing arithmetic, so left alone it would
have wiped the manual selections the mode exists to support — the button would
have destroyed the work of the feature.

**What the screen says.** Three run-banner states instead of two: after a run
under OTHER, *"0 of 20 lines covered, 20 without a supplier"* is true and reads
as total failure, when it is the mode working as asked. The banner, the Run
Quote tooltip and the success toast all now name the mode and say suppliers are
the user's to choose, then Apply to price.

**Verified**: OTHER → 20 of 20 suppliers empty, banner and toast name the mode;
picking Avnet on RES-0603-10K survives Apply and prices the line (stock 480,000,
LT 3, MOQ 5,000, excess 4,973, $60.00, COVER) and the count drops to 19.
Stock-Low cost still auto-fills 17 of 20 — no regression.

## Not built, and why

**Per-supplier pricing.** This mock holds one price per part, so under OTHER
choosing a different supplier changes WHO, not HOW MUCH. Prices that differ by
supplier belong to the supplier dropdown — the control carrying UP, MOQ, Stock,
LT, Price Break and NTO per supplier — which is already recorded as deliberately
unbuilt in `quick-quote-results.md`. Inventing per-supplier prices to fill the
gap would put fabricated numbers on a costing screen.
