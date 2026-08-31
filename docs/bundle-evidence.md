# Bundle evidence — Run Quotation and BoM Comparison

Captured 24 Aug 2026 from the production build at `https://erp.linhlongengineering.com`.
No login, no writes: the app's own JavaScript is fetched and its obfuscated string
tables decoded. Nothing here is inferred — every string below is a literal in the
shipped code. Where something is NOT confirmed it says so.

Method: `index.html` → `assets/lib-bundle-D109_KxB.js` → 228 `assets/chunk-*.js`.
The obfuscator is the standard base64+RC4 string-array with a rotation checksum;
each scope's decoder and array were extracted and evaluated to recover its table.

- Run Quotation wizard: `chunk-BAkpvJLm.js`
- Run Quotation summary render: `chunk-DtT2PYYA.js`
- BoM Comparison: `chunk-CQr-c-QW.js` (compare + export), `chunk-CeuR-5ZG.js` (column mapping)

---

## Run Quotation — CONFIRMED structure

It **is** a linear four-step wizard. An earlier note in this repo claimed it was
"a working screen plus four modals" and that the stepper was this mockup's proposal.
That was wrong. The reducer is explicit:

```js
const initial = {
  step: 0, previousStep: -1,
  steps: [
    { label: '1 - Config BoM',  isValid: undefined },
    { label: '2 - Review BoM',  isValid: undefined },
    { label: '3 - Quoting',     isValid: undefined },
    { label: '4 - Summary',     isValid: undefined },
  ],
};
// actions: NEXT | PREV | GOTO | SET_STEP_VALID | RESET
// NEXT is a no-op at step >= 3; PREV is a no-op at step <= 0
isLastStep            = step === steps.length - 1
isPreviousStepsValid  = steps.slice(0, step).every(s => s.isValid !== false)
```

**Step labels are verbatim, numbered, and include the number in the label.**

### Step 1 — "1 - Config BoM"
Three mutually exclusive ways to supply the BoM (radio group):
- `Run quote with existing BoM version`
- `Upload new BoM file to replace current version`
- `User current BoM (no changes)`   ← sic, "User" not "Use"

Also on this step: `Assembly Details` (`Assembly Name`, `Assembly Part Number`,
`Build Qty` / `Build Quantity`), `Bom Options`, `Upload File`, `File Name`,
`Select Column Detection`, `Select Key Column Detection`, `Run Version`,
`Save Draft`, `CONTINUE FROM DRAFTS`.

Validation messages: `Please select an option to proceed` ·
`File not yet chosen, Please select the file first!` ·
`Upload file or select template first` · `Please select assembly` ·
`Select assembly first!` · `Please select a draft to continue` ·
`File is not formatted, try double check columns/ values then re-upload the file` ·
`Please make sure the BoM includes Part Number, Part Rev, Part Description, Qty Per...` ·
`Draft data is invalid. Continue with empty quotation data.` ·
`Please complete BOM import before saving draft quotation!`

An RFQ context panel is present: `Item Ant Quantities to Quote: `,
`Customer Special Need:`, `Internal Notes:`, `Created Date`.

### Step 2 — "2 - Review BoM"
- Excluded parts: `Review Excluded Parts` (handlers `showExcludedPartsReview`,
  `completeExcludedPartsReview`, `restoreExcludedPartsStatus`),
  `Please review those exclude part(s) as listed below. These parts will not be used
  to quote from Nexar and cannot be recalled`,
  `Do not install item must be excluded from the quotation`
- Manufacturer mismatch: `MFG Mismatch Review`, `Manufacturer Mismatch`,
  `Missing Manufacturer`, `Change Manufacturer`, `Link to an existing Manufacturer`,
  `Create a new Manufacturer`, `Add to Alias`, `Z2Data MFG`,
  `The following BOM manufacturers mismatch with Z2Data. Do you want to add them to
  the system?`, `The manufacturer you selected (…) is different from the one in the
  BOM file (…)`, `Please select a manufacturer.`
- Attrition: `Add Attrition`, `Batch attrition qty change`,
  `Detect attrition failed when changing MPN`, handler `showMissingAttrition`
- Columns: `PART NUMBER`, `PART REV`, `PART DESCRIPTION`
- Actions: `Accept & Continue`, `Confirm & Continue`

### Step 3 — "3 - Quoting"
**The quote is run HERE, not at the end.** `Run Quote` ·
`Please run quotation for continue process!` · `Please run the quote to get new data.`

- Search: `Search by Part / Description / MPN / MFG / Supplier`
  (also a narrower `Search by Part / Description / MPN/MFG`)
- Columns: `Unit Price`, `Minimum Qty`, `Total Qty`, `On Hand`, `Need Qty`,
  `Order Qty`, `Excess Qty`, `Excess Amt` / `Excess AMT`, `Lead Days`, `Price Break`,
  `Supplier`, `Manufacturer Name`
- Supplier controls: `➕ Load More Suppliers`, `🔼 Show Preferred Only`,
  `Apply Price Range`, `Add Package`, `Add Part`, `Add All`, `supplier change`,
  `tape & reel`, `needs review`
- Line states: `No Match`, `Not Enough Qty`, `Out Stock`, `Unselected Supplier`
- `The following part are unselected and will be changed to NO BID if you continue`
- `Back to Rework`, `Here are list of excess parts`, `Total Excess Amount :`

### Step 4 — "4 - Summary"
A **Cost Estimation** panel, NOT status buckets. Fields (i18n keys):

`RFQ_Page.Run_Quotation.Form.` + `Assembly_Part_Number` · `Description` · `Qty` ·
`Attrition` · `QuoteFocus` · `MaterialPkgType` · `MarkUp` · `Primary_Provider` ·
`Run_Date` · `Cost/Board` · `TotalCost` · `Total_Cost_With_MarkUp` · `Excess_Amount`

Layout: a two-thirds card in three columns (assembly identity / commercial terms /
run metadata) beside a one-third grey card headed `Cost Estimation` listing the five
money lines. Also `Quote run complete for `, `Analyze results not found`,
`Add Quotation Successfully!!!`, `Add Quotation Failed!!!`.

### NOT confirmed
- The exact English for the `RFQ_Page.*` keys. They resolve from a runtime
  translation resource, not the bundle. The key names are used as labels here.
- Which of Excluded Parts / MFG Mismatch / Attrition are inline panels versus modals
  within step 2.

### Strings this repo previously claimed and that DO NOT EXIST
`Quote Run Summary` · `Matches Another Supplier` · `No Bid` (as a match status) ·
`Missing Attrition` · `Upload BoM File` · `Upload Quote File` · `Nexar` as a Source
column value. The four-bucket summary was invented outright.

---

## BoM Comparison — CONFIRMED structure

Three modes, chosen under `Select Action`:

| Code | Label (verbatim) |
|---|---|
| `COMPARE_FILES` | `Compare 2 uploaded files` |
| `COMPARE_ASSEMBLY` | `Compare with existing assembly` |
| `COMPARE_2_ASSEMBLIES` | `Compare 2 existing assemblies` |

Two panes, `bom-1` on the left and `bom-2` on the right, labelled `Old BoM` and
`New BoM` (`BOM_Comparison_Page.BOM_1` / `.BOM_2`, `.Label_Bom_1`).

Per pane: file upload accepting **`.xlsx, .xls`** (not CSV), `Select sheet` read from
the workbook's own `SheetNames`, and `BOM_Comparison_Page.Select_Template`. Templates
are per customer (`Bom_Setup_Page.Template_Form.Select_Customer_Label`). Assembly mode
uses `Select Assembly` with the option text
`Select Existing Assembly - Assembly Rev - BoM version`, built from
`custCode - bom version: N - rev: R`.

### The result — the part this repo omitted entirely
Heading `BOM_Comparison_Page.BOM_Comparison_Summary`. Rows are computed as
`{ partId, columnName, bom1, bom2, change, status }` and grouped by `partId`
(`groupedComparisonResult`), so one part expands to show each changed column.

Grid columns: `BOM_Comparison_Page.Column_Name` (= `Column Name`) ·
`Target BOM` · `Source BOM` · `BOM_Comparison_Page.What_Changed_In_Bom_2`
(= `what changed`). Pane headers read `Old BoM (` + filename + `)` and `New BoM (` + `)`.

Status vocabulary and its colours, straight from the export code:

| Status | Colour |
|---|---|
| `Added` | `#C8E6C9` green |
| `Removed` | `#FFCDD2` red |
| `Changed` | `#FFF9C4` yellow |

Change text is built as `ADDED: <value>`, `REMOVED: <value>`,
`CHANGED: <old> -> <new>` from `BOM_Comparison_Page.Row_Changed_Status.*`.

Empty state: ` Contents are identical`. Controls: `Common.Expand_All_Btn_Title`,
a `FULLSCREEN` toggle, and an Excel export named `BOMCompare-<target file>`.

The export writes a `SUMMARY REPORT` sheet counting six categories:
`Part Number Changes` · `Quantity Changes` · `Revision Changes` ·
`Reference Designator Changes` · `Rocket PN# Adds` · `Rocket PN# Removes`

Compared columns: `PART_NUMBER` · `PART_REV` · `QTY` · `REF_DESIG` · `MANUFACTURER` ·
`MANUFACTURER_PN` · `ROCKET_PN` · `ITEM_NO` · `REVISION` · `CUSTOM_COL`.
Quantity columns aggregate; others take the first occurrence
(`Using first occurrence for non-quantity fields.`), and conflicts report
`… have conflicting values:`.

Errors: `Invalid BoM Template or Comparison files` ·
`Please modify the template or correct the content of the files then try again.` ·
`Assembly's BoM not found.` · `Error reading file:`

---

## Incidental finding — what "Rocket" means

`Rocket PN# Adds` / `Rocket PN# Removes` in the comparison summary, alongside
`ROCKET_PN` as a compared column and `rocketColumnName` / `includedRocketPN` in the
wizard, establish that **Rocket is a part-number namespace** — Linh Long's own part
numbering, compared against the customer's. That resolves most of the open question:
`NET_ROCKET_INVENTORY` is inventory held against Rocket part numbers. Whether "Rocket"
is a product name, a system name or a customer is still not answered by the code.

---

## RFQ form — CONFIRMED field behaviour

From `chunk-DtT2PYYA.js` (the RFQ reducer payload) and `chunk-Dqkhv0o_.js` (its
GraphQL query). These settle four fields this mockup had as free text.

### The pickers FILTER as you type — `KendoReactDropDownList`, not a ComboBox
Read from the current bundle on 31 Aug 2026, after An pointed out our Customer
picker was a plain dropdown where the live one is searchable. Note the entry
bundle had been redeployed since this document's original capture —
`lib-bundle-BxbBltK-.js`, not `lib-bundle-D109_KxB.js` — so read the hash out of
`index.html` rather than trusting one written down here.

- `KendoReactDropDownList` is present; **`ComboBox` does not appear at all**.
- The filter handler emits
  `{ filter: { field: textField, operator: …, ignoreCase: true, value } }`.

That distinction is the point. A ComboBox accepts arbitrary text; a filterable
DropDownList makes you type to NARROW and then choose from the list — which is
what "Customer is a lookup, not text" below already required. So the behaviour we
were missing was the filtering, not free entry.

### Customer is a lookup, not text
The form loads `custMsts { custId custNumId custCode custName custNo custAddress …
custType creditLimit creditStatus custTerms isItar isActive priceMarkup discount
internalNote contactInfos { contactName custGuid guidId title … } }` **and
`projectNames`**. `dropdownData.customer` backs a picker; the chosen row is held as
`customerSelected`, and `custId` / `custName` are written from it.

### Customer Contact is DEPENDENT on Customer
```js
let contacts = dropdownData.custContactInfos.filter(c => c.custId === rfq.custId);
if (!contacts.length) contacts = await appendValueToDropDownData('custContactInfos', …, custId);
if (contacts.length)  { rfq.custContactId = contacts[0].guidId;
                        rfq.custContactName = contacts[0].contactName; }
setCustContactArrDisplay(contacts.map(c => c.contactName));
```
Choosing a customer repopulates the contact list and defaults to its first entry.

### Three values DERIVE from the chosen customer
- `markUp` ← the customer's `priceMarkup`, only when markUp is still 0/undefined
- `itar` ← the customer's `isItar`
- `custType` ← the customer's `custType`

### Historical RFQ is a lookup to a parent RFQ
Carried as the pair `rfqParentName` + `rfqParentGuid`, alongside `projectType`,
`orderType`, `itar`, `assignedToId`. It is a reference to another RFQ record, so a
free-text input is wrong.

### Project Name is a field ON the RFQ
`projectName` is written into the RFQ payload, and `projectNames` is fetched with the
customer master — so it is a combo scoped to the customer, not a display-only title.

### Other confirmed
`rfqStatus` initialises to `"New"` · `isNewCustomer` flag exists ·
`createdDate` displays as `MM/dd/yyyy HH:mm:ss` · `dtNeededUtc` is the due date,
stored UTC with a separate display string.
