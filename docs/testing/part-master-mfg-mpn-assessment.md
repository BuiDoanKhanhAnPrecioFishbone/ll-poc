# BoM Part MFG MPN — coverage assessment

Assessed 30 Aug 2026 against `BoM Part MFG MPN` (guideline §6600–7160, 416
lines). This is an **assessment, not a test run** — the other four documents in
this folder record packages that were built and then exercised. Nothing here
was built; this says what the sheet asks for and what exists today.

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
| 3 | Filter tools: multi-criteria, column visibility, flexible sorting | **not wired** |
| 4 | Setup View Template (Filter, Column, Sort) | **not wired** |
| 5 | Select View Template | **not wired** |
| 6 | "Add new Part" → *Add Part Master Detail* form | **absent** — the button exists and reports not-implemented |
| 7 | "Eye" button on each row → Part detail | **partial** — the row opens a summary dialog; there is no Eye control and the dialog is not the form the sheet describes |
| 8 | Import: *Import All* / *Import by Customer* | **absent** — one Import button, no choice |
| 9–10 | Per-row checkboxes, multi-select, Export selected to Excel | **absent** — no row selection; Export offers all rows |

**3, 4 and 5 are a wiring gap, not a capability gap**, which makes them much
cheaper than the table suggests. `DataGrid` already accepts `filters`,
`filterPanel`, `filterActive`, `views`, `viewSetting`, `allColumns`,
`onToggleColumn` and `onResetColumns`, and all of them work on Project
Requirements today. Part Master passes none of them, so its toolbar holds a
search box and nothing else.

## Create New Part

**Absent in full.** The sheet specifies an *Add Part Master Detail* modal with
fifteen numbered sub-steps: Part Number, Part Revision and Description; Part
Source; Part Class and Part Type, where Part Type is filtered by Part Class and
cleared when Class changes; Package, ABC and Material Type; a required Customer
that prefixes its code onto the Part Number; then sections for Sales &
Purchase, Request & Control, Dimensions & Packages, Reordering Rule, Demand &
Forecast, Lead Time & Policies, and attachments.

## Part Master Detail

**Partial.** The sheet asks for Part Number–Revision, Part Source, Description,
Part Class, Part Type, ABC, Package, Material Type, a General Info section, a
Quantity Info section, and the actions QR Code Generator, Edit and Approve,
with everything read-only until Edit.

The dialog shows Customer, Revision, Source, UoM, On Hand, Allocated,
Available, Unit Cost and Last Changed. Missing: Part Class, Part Type, ABC,
Package, Material Type, both named sections, QR Code and Approve. Edit closes
the dialog without editing anything.

Two popups reached from this screen are absent entirely:

- **BoM detail** (for parts sourced MAKE or MAKE/PHAN) — Customer, Part
  Number–Revision, BoM Version, ITAR, Quantity, BoM Type, Run By, Created Date,
  Last Updated Date, an Update BOM upload that increments the version, and a
  *Components Part* tab listing Component Part, Revision, Part Source,
  Quantity, Manufacturer and MPN with sorting and filtering.
- **Where PN Used** (for BUY, or MAKE sub-assemblies) — a search over top
  assembly or description, and columns View, Top Assembly, Revision,
  Description, Index, Quantity, BoM Status.

## MFG–MPN (AML)

**Absent in full**, and it is the subject the section is named for. The sheet
asks for a Quantity Info tab holding an MPN Mapping table of ten columns —
Manufacturer, MPN, Description, Order Preference, Rocket OH, Customer OH, Total
On-Hand, Safety Stock, AVG Cost, Last Purchased Cost — plus a mapping detail
popup that can view, edit and delete; a Stock Report popup with Update Quantity
and Replenishment; and an *Add a line* modal.

## Bill of Materials

**No route.** The sheet wants Inventory Management » Bill of Materials with a
list, a search over description or part number, and a BoM Comparison button.
`data/sitemap.ts` already names the path `/inventory-management/bom-list`, but
`App.tsx` has no route for it, so it falls through to the placeholder. BoM
Comparison itself is built, on the RFQ record rather than here.

## A data gap that blocks two rules

`Part.partSource` is typed `'MAKE' | 'BUY'`. The sheet lists six values: BUY,
CONSG, FLSTK, MAKE, MAKE/BUY and MAKE/PHAN.

This is not only a missing dropdown. Two behaviours in the sheet are *gated* on
part source — the BoM button appears for MAKE and MAKE/PHAN, and Where PN Used
appears for BUY and MAKE sub-assemblies — so with four of the six values
missing from the data, neither rule can be expressed even once the popups
exist. Widening the type is a precondition for that work rather than part of
it.

## Summary

Of roughly nineteen distinct requirements in this section: **two are built**
(navigate, search), **two are partial** (row detail, and Export in the sense
that a button exists), **three are unwired machinery that already works
elsewhere**, and **the remainder — including the whole of MFG–MPN and Create
New Part — is absent**.

The cheapest real progress is the three unwired items, which are configuration
of an existing, working component rather than new construction.
