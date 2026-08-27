# Create PR — test run against the build

Sheets: **PR - EC - Create PR** (116 rows) and **PR - NC - Create PR** (114 rows,
9 of them new). Run 27 Aug 2026 against the local build.

The two sheets are 92% identical. Everything below covers both unless it says
otherwise.

---

## What was built for this package

`Add New` was a stub that raised a "not in this prototype" toast. It now opens a
**New Project Requirement** modal carrying the whole record form:

- **General information** — the three header groups, in edit mode
- **Specific Requirements**, **Checklists & Assignment**, **Activity Logs** tabs
- **Save only**, disabled until every required field is answered, labelled with
  how many are left; each tab carries its own count
- The next sequential RFQ number is reserved on open and shown in the subtitle
- On save: view mode, status **New**, and Edit / BoM Comparison / Run Quotation
  with Cancel top-left — the guideline's order

New-customer path (**PR - NC**):

- **New Customer?** unchecked by default; ticking it turns Customer from a
  dropdown into a text field and clears what the dropdown had derived
- After save, a blue **New Customer** badge sits with the other statuses
- **+ Add Contact** under the Customer field opens **Create New Customer** on its
  Contact tab; contacts added there become the Customer Contact options, and the
  first one is selected automatically

---

## Defects found and fixed during the run

| # | Defect | Fix |
|---|---|---|
| 1 | **Due Date had a required marker and no control.** It was a hand-written row, not a field declaration, so it rendered as static text in both modes — the one field the guideline says the user must set could not be set. | Added a `date` field kind; Due Date is a real date control. |
| 2 | **Due Date was not validated.** Because it lived outside `ALL_FIELDS`, Save would have armed with no due date. | Added both date fields to `ALL_FIELDS`. |
| 3 | **Created Date never got the read-only treatment.** Same cause as #1 — grey fill and grey border in edit mode, confirmed by the customer 27 Aug, applied to every locked field except this one. | Declared `readOnly`; it now greys and says "set by the system". |
| 4 | **Project Name was a closed dropdown.** The guideline says it "allows the user to enter the project name", and for a customer created through New Customer? the list is empty — the required field had no reachable value. | New `combo` kind: typed, with the customer's existing projects as suggestions. |
| 5 | **A new customer's name vanished on Edit.** Customer is a lookup over Customer Management; a name that is not in that list rendered as an empty control, discarding what was typed on create. | `freeTextWhen` on the lookup kind — free text when the RFQ is flagged `newCustomer`. |
| 6 | **Markup and Lead Time started at 0**, which satisfied their own required check before the user had read either field. | Seeded genuinely empty. |
| 7 | **The first contact was not auto-selected.** Add Contact is reachable while reading, and the handler wrote to the edit draft, which is null then — so it silently did nothing unless the user happened to be editing. | Commits to the record, and to the draft when one is open. |
| 8 | **A duplicate contact name broke the field.** The Customer Contact control renders the text of every option matching its value, so two contacts called the same thing printed the name twice. | Duplicate names refused, with the reason on the button. |
| 9 | **The Engineering Checklists panel showed for every project type.** The guideline restricts it to NPI - Validation Production, Production, Box Build and Test Development - High Vol. | Conditional on project type. |

---

## Deliberate deviations

1. **Customer Type is now user-selected**, with the guideline's four values
   (Consigned / Managed Consigned / Mixed / Turnkey), defaulting from the
   customer record. The live system derives it and locks it, with a different
   option list. The guideline outranks the live system, so it wins — but see
   open question 10, because this makes its option list identical to RFQ Type's.

2. **Priority stays a labelled dropdown**, not the guideline's "rating input"
   with a hover tooltip. The 25 Aug design review asked for the dropdown
   explicitly. Open question 6.

3. **Dates render as `15 Oct 2026`**, not the guideline's MM/DD/YYYY, and
   Created Date carries no time. Open question 4 — the two customer documents
   disagree, and the native date picker follows the reader's own locale, which
   matches neither.

4. **Created records live in memory only.** They survive navigation inside the
   app and are lost on reload, and the save toast says so. Persisting them would
   make the prototype look like it has a backend and invite testing of things it
   cannot do.

5. **Email notifications are not built** — the guideline sends mail to the
   assignee and to the checklist assignees on create. Nothing here sends mail.

6. **The Attached Documents table is not built.** Rows r94–r107 specify seven
   columns, four statuses, upload/download/remove and per-checklist default
   assignees. It is a feature in its own right rather than part of the create
   flow, and belongs with the checklist work, not here.

7. **Only the Contact tab of Create New Customer exists.** The rest of that modal
   belongs to Customer Management, which is outside the agreed scope; its fields
   are not guessed at, and the tab says so.

---

## Not verifiable here

- "an email notification is sent to the assigned user"
- "If the same user is assigned to both the Program Manager and Engineer roles,
  the system sends only one email"
- "Inactive customers are not displayed in the list" — every customer in the mock
  master is active, so the rule is named in the code but cannot be exercised
- Minimize on the modal — see open question 9
