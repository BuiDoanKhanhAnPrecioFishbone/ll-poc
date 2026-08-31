# BoM Part MFG MPN — coverage assessment

Assessed 30 Aug 2026 against `BoM Part MFG MPN` (guideline §6600–7160, 416
lines). This is an **assessment, not a test run** — the other four documents in
this folder record packages that were built and then exercised.

**Updated 30 Aug 2026 (`d8ea831`).** Requirements 3, 4 and 5 have since been
wired and are marked built below. Everything else stands as first assessed.

**Headline: the section is largely unbuilt, and the part it is named after is
entirely absent.** MFG–MPN (AML) — the Approved Manufacturer List, MPN mapping
table, stock report and mapping editor — has no implementation at all.

The section is not about the quoting flow. It covers four things: the Part
Master list, Create New Part, Part Master Detail (including BoM and Where-Used
popups), MFG–MPN (AML), and a Bill of Materials list.

## Part Master list

| # | Requirement | State |
|---|---|---|
| 1 | Navigate to Inventory Management » Part Master | **built** — `/inventory-management/part-mst` |
| 2 | Search by description or part number | **built** — also searches customer, a superset |
| 3 | Filter tools: multi-criteria, column visibility, flexible sorting | **built** — `d8ea831` |
| 4 | Setup View Template (Filter, Column, Sort) | **built** — `d8ea831` |
| 5 | Select View Template | **built** — `d8ea831` |
| 6 | "Add new Part" → *Add Part Master Detail* form | **absent** — the button exists and reports not-implemented |
| 7 | "Eye" button on each row → Part detail | **mostly built** — the record is now the sheet's form; there is still no Eye control, the row opens from its part number |
| 8 | Import: *Import All* / *Import by Customer* | **built** — the choice, with the file step declared unspecified |
| 9–10 | Per-row checkboxes, multi-select, Export selected to Excel | **built** — selection by id, Export names its scope |

**3, 4 and 5 were a wiring gap, not a capability gap**, and are now done.
`DataGrid` already accepted `filters`, `filterPanel`, `filterActive`, `views`,
`viewSetting`, `allColumns`, `onToggleColumn` and `onResetColumns`, all working
on Project Requirements; Part Master passed none of them, so its toolbar held a
search box and nothing else. It now carries search, a view picker, the filter
toggle, Setup View Template and Columns — the same toolbar as Project
Requirements, deliberately.

The eight filter fields are **my judgement, tier 3** (`src/data/partFilters.ts`).
The guideline asks for multi-criteria filtering here without naming the fields,
and unlike Project Requirements — whose eleven controls were read off the live
toolbar on 25 Aug — there is no reading of the live Part Master filter to take
them from. If one is taken later and disagrees, it wins.

Two defects surfaced only because these components gained a second caller,
both invisible while they had one: `ViewSetting` hardcoded its heading as
"Request For Quotation — View Setting" in the `h2` and the `aria-label`, so
Part Master announced itself as Request For Quotation to sighted users and
screen readers alike; and the filter machinery — `ViewField.value`, `applyView`
— was typed over `Quotation` despite nothing in it being Quotation-specific.

## Create New Part — **built**, 31 Aug 2026

`AddPartDialog.tsx`, declarations in `components/partFields.ts`, vocabularies in
`data/partMetadata.ts`. All fifteen sub-steps, thirty-one fields, six sections
across two tabs plus attachments — the sheet's own structure, which is both the
specification and the better screen.

**The live bundle settled a contradiction the sheets could not.** The guideline
enumerates Part Source twice and the two lists differ — `FLSTK` against
`FLRSTK`, and `CONSG` against `PACKAGING` as the sixth value — which
`open-questions.md` carried as unresolved. `chunk-AeZ_bNMa.js` exports the
enumeration itself, decoded 31 Aug (self-validating: the same pass returns
"MAKE" for MAKE and "BUY" for BUY):

    SERVICE "SERVICE"   MAKE "MAKE"           BUY "BUY"
    CONSG   "CONSG"     MAKE_PHAN "MAKE/PHAN" MAKE_PHANT "MAKE/PHANT"
    FLOORSTOCK "FLRSTK" MAKE_BUY "MAKE/BUY"   PROGRAM "PROG"

So `FLSTK` is a typo for `FLRSTK`; **`MAKE/PHAN` and `MAKE/PHANT` are both real
and distinct**, so neither sheet was wrong and `bom.ts` is right to auto-exclude
MAKE/PHANT; and `PACKAGING` does not exist in the live system, while `SERVICE`
and `PROG` do without appearing on either sheet. The form offers the Create New
Part sheet's six with `FLSTK` corrected — tier 1 governs the vocabulary, tier 2
resolved the customer's document against itself.

**Behaviours built and verified on screen:**

- **Customer prefixes the Part Number.** `ABC-9001` + customer 00848 becomes
  `00848-ABC-9001`; changing to 01455 gives `01455-ABC-9001` and not both codes
  stacked. Placed in Part identification rather than Sales & Purchase where the
  sheet lists it, because a field that rewrites the identifier cannot sit a tab
  away from it.
- **Part Type filtered by Part Class, cleared "if not applicable".** ASSEMBLY →
  ELEC-PCB, MECH-FMA. Changing ASSEMBLY→COMPONENT clears ELEC-PCB; changing
  COMPONENT→CONSUMABLE **keeps** ELEC-PAS, which is valid for both. Clearing a
  still-correct answer would make the user retype what they already said.
- **Part Number + Part Revision unique together.** Checked live rather than on
  submit — finding out after thirty fields is the worst moment. Verified all
  four ways: number alone is not a clash, number+B is, number+Z is not, and a
  blank revision clashes only with another blank.
- **Save → "Create the new Part successfully" → "Display the details of the
  newly created part".** Both Expected lines happen: the part appears at the top
  of the list and its record opens.

**The BoM button gating was wrong and is fixed.** "The 'BoM' button should be
displayed only when Part Source = MAKE, MAKE/BUY or MAKE/PHAN"; `PartDetail`
tested `=== 'MAKE'`, correct only while MAKE and BUY were the only two values
the generator produced. A MAKE/BUY part created through this form would have had
its BoM button silently withheld. Now `BOM_SOURCES` in `partMetadata.ts`.

**`PartDetail` renders the six new sections** from the same declarations, so a
created part's thirty values are visible and the two screens cannot list
different fields. The consequence, worth the customer's eye: the 2,000 generated
parts show these fields as "Not set", because that is the truth about the back
catalogue — the same reasoning already recorded for `abc` and `partClass`.

**Not built:** attachments upload (no file storage in this prototype — the
button reports what it would do), and the form is create-only. The sheet says
one form serves view, edit and create; `PartDetail` is the view, and making the
record editable in place is its own piece of work rather than a side effect of
this one.

**Three open questions raised by this build**, in `open-questions.md`.

### The original assessment

**Was absent in full.** The sheet specifies an *Add Part Master Detail* modal with
fifteen numbered sub-steps: Part Number, Part Revision and Description; Part
Source; Part Class and Part Type, where Part Type is filtered by Part Class and
cleared when Class changes; Package, ABC and Material Type; a required Customer
that prefixes its code onto the Part Number; then sections for Sales &
Purchase, Request & Control, Dimensions & Packages, Reordering Rule, Demand &
Forecast, Lead Time & Policies, and attachments.

## Part Master Detail — **mostly built**, `PartDetail.tsx`

The sheet asks for Part Number–Revision, Part Source, Description, Part Class,
Part Type, ABC, Package, Material Type, a General Info section, a Quantity Info
section, and the actions QR Code Generator, Edit and Approve, with everything
read-only until Edit. **All of that is now present.**

Built as the kick-off deck's "Data Form View" archetype (slide 14) carrying the
guideline's fields: caption over a large identifier, status chips, actions left
and reference links right, tabs, three-column sections. The deck gives the
shape; the guideline gives the content. Building the deck's own screenshot
instead — a Manufacturer Part Number record — would have meant inventing the MPN
data model, which is a package of its own and still absent (below).

`Package` and `Material Type` did not exist on the `Part` type and were added.
The vocabulary is the guideline's own examples; the fill rate is my judgement,
noted in `data/parts.ts`, since there is no reading of production for these two.

**Still outstanding here:** no "Eye" control — the row opens from its part
number, which is `open-questions.md` question 1 rather than an oversight. Edit,
QR Code and Approve report what they would do rather than doing it; a working
edit mode for parts is separate scope. The BoM and Where-Used links are present
and correctly gated on part source (MAKE → BoM, BUY → Where used), but the
popups they would open are still absent.

Both popups reached from this screen are now **built** (`PartBomDialog.tsx`):

- **BoM detail** (MAKE parts) — all nine header facts, read-only as the sheet
  requires, with Update BOM naming the version it would create. The *Components
  Part* tab lists the six specified columns, reusing the seeded BoM rather than
  generating a second near-identical one.
- **Where PN Used** (BUY parts) — the search over top assembly or description,
  and all seven columns.

**Two things deliberately not invented.** The *Other Information* tab exists
because the sheet names it, and says so instead of guessing: the sheet's entry
for it is, in full, `Under Tab "Other Information": .....`. And the Components
grid does not implement the per-column operator menu the sheet describes
("Contains, Does not contain, Is [not] equal to, Starts/Ends with, Is null") —
that is KendoReact's column filter, so it arrives with KendoReact or not at all;
`docs/filter-spec.md` governs the *list* filter toolbar and is a different
control, so the two do not conflict.

## MFG–MPN (AML)

**Absent in full**, and it is the subject the section is named for. The sheet
asks for a Quantity Info tab holding an MPN Mapping table of ten columns —
Manufacturer, MPN, Description, Order Preference, Rocket OH, Customer OH, Total
On-Hand, Safety Stock, AVG Cost, Last Purchased Cost — plus a mapping detail
popup that can view, edit and delete; a Stock Report popup with Update Quantity
and Replenishment; and an *Add a line* modal.

## Bill of Materials — **list built**, `BomList.tsx`

Inventory Management » Bill of Materials now serves a real screen: the list, the
search over part number and description, and a BoM Comparison button that opens
the dialog the RFQ record already uses rather than a second copy of it. Opening
a row goes straight to that assembly's BoM.

**One inference, and it needs confirming.** The sheet says "Show the list of all
parts", which reads like the Part Master line it was copied from. This screen
lists parts that HAVE a BoM — the MAKE parts — for two reasons: the section's own
context paragraph says BoM "manages the product structure for each ASSEMBLY",
and the sheet elsewhere gates the BoM button on a part being MAKE or MAKE/PHAN,
so a Bill of Materials list containing the BUY components that sit inside those
BoMs would contradict a rule the same document sets. 1,325 of the 2,000 parts
qualify. **If the customer means every part, it is a one-line change** — asked
rather than assumed.

**Not built:** *Create the new BoM*, the four-step form behind the Upload BoM
button — RFQ Information, Select Action with Import New / Load Existing,
Assembly Info, Component Info, the MFG mapping validation and the submit rules
for existing versus new parts and MFG-MPN pairs. The button is on this screen
because the sheet puts it here, and reports what it would do. It is a package of
its own, comparable to Create New Part.

## A data gap that blocks two rules

`Part.partSource` is typed `'MAKE' | 'BUY'`. The sheet lists six values: BUY,
CONSG, FLSTK, MAKE, MAKE/BUY and MAKE/PHAN.

This is not only a missing dropdown. Two behaviours in the sheet are *gated* on
part source — the BoM button appears for MAKE and MAKE/PHAN, and Where PN Used
appears for BUY and MAKE sub-assemblies — so with four of the six values
missing from the data, neither rule can be expressed even once the popups
exist. Widening the type is a precondition for that work rather than part of
it.

The Part Source filter added in `d8ea831` reads its options off the rows rather
than hard-coding the pair, so it will offer all six the day the type is widened
instead of becoming a second place that has to be found and corrected.

## Summary

Of roughly nineteen distinct requirements in this section: **eleven are built**
(navigate, search, filter tools, Setup View Template, Select View Template, the
Part Master Detail record, the BoM detail and Where-Used popups, and the Import
scope choice), **one is partial** (Export, in the sense that a button exists),
and **the remainder — including the whole of MFG–MPN and Create New Part — is
absent**.

**Three places now say "not specified yet" on screen** rather than guessing: the
BoM popup's *Other Information* tab, the import file step, and — implicitly —
Export. In each case the sheet names the thing and defines nothing beneath it.
They are the cheapest items left to finish, and they need a sentence from the
customer rather than a decision from us.

The three cheap ones are done. Everything left is genuine construction: Create
New Part, the MFG–MPN tab and its three popups, BoM detail, Where PN Used,
Import All / Import by Customer, row-selection export, and the Bill of
Materials route — plus widening `Part.partSource`, which gates two of them.
