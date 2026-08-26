# What the Testing Guideline changes

The customer's `OFFICIAL - Testing Guideline - Dev Environment.xlsx` is a
functional specification, not a QA checklist. It states expected behaviour
screen by screen.

**It now sits at the top of `docs/precedence.md`, above the running system.** The
live build is what exists; this is what the customer says it is supposed to do.
Where the two disagree, this wins.

---

## Corrections to work already done

### 1. The required marker is RED, not amber
> *"A red asterisk (\*) is displayed next to each required field label."*

I picked amber and argued for it — that red is this system's colour for
something that has gone wrong, and spending it on a form's resting state leaves
nothing louder for a real error. The customer has specified red. Their call,
and it is now red.

The glyph stays `(*)`, which is both what the live form renders and what the
guideline writes.

### 2. Exactly seven required fields on the header
> *"Required fields: Customer, Project Name, Order Type, Customer Type, Due
> Date, Assigned To, and Priority."*

Matches what was built. Due Date had no marker because it has no FieldDef —
now corrected.

### 3. Historical RFQ EXISTS — conditionally
> *"If selected value is Repeat, the Historical RFQ field is displayed below,
> allowing the user to select an existing RFQ associated with the selected
> customer in order to copy basic information from that RFQ."*
> *"Precondition: Displays when selected Order Type is Repeat."*
> *"The option list is populated with RFQs corresponding to the selected
> existing customer."*

**I removed this field yesterday** on the evidence that it was not on the record
I opened. That record's Order Type was `New`, so the field was correctly hidden
and I read its absence as non-existence. Restored, with the condition, and the
option list narrowed to the selected customer's RFQs.

A reminder that reading one record tells you about one record.

### 4. View Setting is a RIGHT SIDEBAR, not a modal
> *"Display the 'Request For Quotation - View Setting' right sidebar."*

`docs/filter-spec.md` recorded it as a modal, from a screenshot that had been
maximised. Corrected there.

### 5. Validation behaviour, which was not built at all
> *"If any required field is left empty, an error message is displayed below the
> field in red text: 'This field is required.'"*
> *"After the user enters or selects values for all required fields, the Save
> button becomes enabled."*

Triggered on blur — *"click outside"*. Nothing like this exists in the prototype.

### 6. Pagination sizes are 20, 50, 100
> *"The user can select 20, 50, or 100 items per page."*
> *"The user can navigate to the first, previous, next, and last page. The
> Previous and First buttons are disabled on the first page. The Next and Last
> buttons are disabled on the last page."*

The prototype offers 25/50/100 and has no first/last control.

### 7. Date format is a system setting
> *"All date/time columns are displayed using the format configured in System
> Configuration > Region Language Format Config."*

So the date format belongs to an admin screen, not to a per-user preference —
which is where the review asked me to put it. **These two instructions
conflict** and the customer should settle it. Left as a user preference for now,
flagged here.

### 8. Modals carry window controls
> *"Allow user to use modal actions: Minimize · Maximize/Restore Down · Close."*

Every dialog in the guideline has all three. The prototype's dialogs have Close
only.

### 9. Priority tooltip
> *"Displays a tooltip on hover corresponding to the selected level: Low,
> Medium, or High."*

Confirms the three levels the review asked for, and that they are named — which
supports the dot-and-label change rather than stars.

---

## Still to reconcile

The guideline covers far more than the current scope — Quick Quote, Standard
Quote, Resume Draft Quote, Create PR for existing and new customers, Compare
BoM, BoM/Part/MFG/MPN. Those describe flows the prototype has not modelled.
They are the reference for whenever those screens come into scope.

## A note on the environment

The guideline names **`https://erp-staging.linhlongengineering.com/`** as the
test environment. All research so far used the production URL. Staging is the
correct place to test against, and is also safer — production is live data.
