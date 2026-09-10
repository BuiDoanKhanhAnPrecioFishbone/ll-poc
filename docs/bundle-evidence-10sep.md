# Bundle re-extraction — 10 Sep 2026

`docs/bundle-evidence.md` was extracted on 24 Aug from `lib-bundle-D109_KxB.js`
and four named chunks. **All four now return 404**: the app was rebuilt, every
chunk hash changed, and the new build re-obfuscates — `Config BoM`,
`AML Search` and `Packing List` all return zero plain-string hits in the new
bundle while being visibly on screen.

So the August evidence described a build that no longer exists. This is the
re-extraction, against `lib-bundle-C_71R6i_.js` and its 231 chunks.
Reproducible with `scripts/decode-bundle.mjs`; **54,342 strings** recovered
from 1,627 of 1,968 obfuscator scopes.

---

## 1. The August findings still hold

**Run Quotation is still a linear four-step wizard, labels verbatim including
the numerals** — `chunk-Dv-3E9iF.js`:

```
1 - Config BoM
2 - Review BoM
3 - Quoting
4 - Summary
```

**BoM Comparison is unchanged** — `chunk-CGhoKd9b.js`:

- modes: `Compare 2 uploaded files`, `Compare 2 existing assemblies`, and the
  existing-assembly picker `Select Existing Assembly - Assembly Rev - BoM version`
- row statuses: `ADDED` · `REMOVED` · `CHANGED`
- result columns: `Column Name`, `What Changed In New BoM`, and a Part ID column
- the two sides are labelled `Old BoM` and `New BoM`
- exports to Excel, filename prefixed `BOMCompare-`

`BomComparisonDialog.tsx` matches all of it: same three modes, same statuses,
the on-screen table headed `Column Name | Old BoM | New BoM | what changed`.

**The Run Quotation Summary field set is fully covered.** Every live key —
`Assembly_Part_Number`, `Attrition`, `Cost/Board`, `Cost/Board_With_MarkUp`,
`Description`, `Excess_Amount`, `MarkUp`, `MaterialPkgType`, `Notes`,
`Primary_Provider`, `Qty`, `Quantity`, `QuoteFocus`, `RunBy`, `Run_Date`,
`TotalCost`, `Total_Cost_With_MarkUp` — is present somewhere in
`components/quotation/run/`.

So M-gaps aside, **the two flows we could not verify are verified, and correct.**

---

## 2. A correction

Mid-extraction I reported that the live system has "three Run Quotation modes,
not one", from `Run Quotation`, `Run Quotation (Get Nexar from DB)` and
`Run Quotation (Nexar API)`.

**That was wrong.** They sit in `chunk-KkmHkDQt.js` beside `UpdateRFQ`,
`CreateBom`, `AddMPNMapping`, `ToggleStatusBOM` and about forty more, under
`Audit_Log.Action.` — they are **audit-log action labels**, not buttons. What
they do tell us is real, though smaller: the audit trail distinguishes a
quote run served from the Nexar **cache** from one that hit the Nexar **API**.

---

## 3. New material

### 3.1 The app has a full i18n key layer — worth raising against D12

Keys recovered across `BOM_Import_Page.*`, `RFQ_Page.Run_Quotation.Form.*`,
`Audit_Log.Action.*`, `Audit_Log.PropertyLabels.*`, `Audit_Log.NoteCode.*`,
`Common.*`, `Inventory_Config.*`, `Bom_Setup_Page.*`, `PCB_Viewer.*`.

D12 was answered **"English only, no Vietnamese or CJK"**. That answer is about
what to design for and stands. But the live product is already *structured* for
translation, so the question of whether a second language is coming is worth
re-asking before we harden anything on English string widths.

### 3.2 Verbatim error and confirmation strings we were paraphrasing

BoM import — `chunk-Dv-3E9iF.js`:

- `Import has problem, try again!`
- `Load data from DB failed, please check the file and try again!`
- `File is not formatted, try double check columns/ values then re-upload the file`
- `Existing BOM has not found` · `No bom found` · `Not Found Inserted Bom!`
- `Error while fetching bom master` · `Error while fetching bom details`
- `Old bom has null value` · `There are problems with RFQ` · `Api Failure!`

Run Quotation:

- `Please run quotation for continue process!`
- `Please complete BOM import before saving draft quotation!`
- `RFQ ID is missing, cannot save draft quotation!`
- `Save draft quotation failed, please try again!`
- `Add Quotation Successfully!!!` · `Add Quotation Failed!!!`

These are the customer's own words, mangled grammar and triple exclamation
marks included. Ours are cleaner and invented. Tier 2 says the words are theirs
— but the 25 Aug review also asks for clearer messaging, so this is a genuine
tier-1-vs-tier-2 conflict to put to them rather than resolve quietly.

### 3.3 A warning our comparison does not have

`BOM Aggregation Warning: Multiple rows with PN-REV '…'` — the live comparison
warns when a BoM has duplicate part-number/revision rows it had to aggregate.
`BomComparisonDialog.tsx` has no equivalent.

### 3.4 The audit log's real vocabulary

About forty-five action codes: `CreateRFQ`, `UpdateRFQ`, `CreateBom`,
`ImportBom`, `UploadBomFromFile`, `CreateBomFromRFQ`, `ChangeBomInfo`,
`UpdateBomDetail`, `UpdateBomQty`, `UpdateBomAssembly`, `UpdateBomTemplate`,
`ToggleStatusBOM`, `MapBomPart`, `UnmapPartForRFQ`, `AddMPNMapping`,
`CreatePart`, `UpdatePart`, `DeactivatePart`, `Run Quotation`,
`CreateSaleOrder`, `UpdateSaleOrder`, `UpdateSODetail`, `CreateSOLinePrice`,
`UpdateCustomerForRFQ`, `DeleteConfigChecklist`, `DeactiveChecklistConfig` …

`ActivityTab.tsx` models three. Its **layout** is a sanctioned redesign — the
25 Aug review asked for grouping by date and user with details on demand — but
its **content** is thin next to the real thing. Now that the vocabulary is
recovered, the demo data can be made to look like the system it represents.

Its timestamp format is `YYYY-MM-DD HH:mm:ss`. That is a third format in play,
against Part Master's `09/09/2026 16:35:29` and our `16 May 2026` — see M10.

### 3.5 Two summaries, not one

`Quote Run Summary` and `Quoted BOM Summary` are distinct strings. Whether they
are two views or one is not established here.
