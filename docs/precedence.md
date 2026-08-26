# Which source wins

Three sources describe what to build, and they disagree. The order is:

### 1. Customer requirements — HIGHEST
Two documents, plus anything the customer says after them:

- **`docs/testing/testing-guideline.md`** — the customer's official Testing
  Guideline. It reads as a QA checklist but it is a functional specification:
  it states expected behaviour screen by screen, names the required fields,
  specifies validation messages and pagination sizes. Where it and the running
  system disagree, **this wins** — the live build is what exists, this is what
  it is supposed to do.
- The reviewer's design report (25 Aug 2026).

**Where these ask for a change, they win outright**, even against the live
system. Where the two disagree with each other, ask — one such conflict is
already open, over whether the date format is a user preference or a system
setting.

Examples it overrides: priority becomes a dot and a label though live uses stars;
breadcrumbs go; the record count leaves the module name; density moves to user
preferences.

### 2. The live system — the baseline
`erp.linhlongengineering.com`, read directly (`docs/live-spec-25aug.md`).
Governs **everything the requirements do not mention**: field names, section
names, option values, capabilities, which fields exist, what each control does.

The rule for anything in this tier: **layout may be redesigned, content and
purpose may not.** Same fields, same words, same options, same behaviour —
arranged better.

### 3. My judgement — LOWEST
Only fills a gap neither of the two above covers, and must be labelled as such
on the screen or in the code.

---

## Why this order, stated once

The live system is what users have learned; changing it without being asked
spends their knowledge for nothing. The customer's requirements are what they
are paying for; ignoring them to preserve the live system is just as wrong in
the other direction. So: **the requirements say what changes, the live system
says what everything else is, and I invent nothing.**

## The failure this prevents

Every correction in this project so far has come from getting this backwards —
building from inference where the live system had an answer:

- dropdown options invented where `/api/MetadataType` had the real lists
- Run Quotation given an invented step order and a fabricated summary screen
- BoM Comparison shipped without its result view
- Customer, Customer Contact and Project Name built as free text where the live
  form uses lookups
- an operator-based filter builder where the live filter has no operators at all
- four section names invented where the live form names them
  `QUOTE CONFIGURATION`, `TECHNICAL SPECIFICATIONS`,
  `SPECIAL REQUIREMENTS & OPTIONS`, `ADDITIONAL NOTES`
- Historical RFQ deleted as "not on the record", when it is conditional on
  Order Type being `Repeat` — I had looked at one record, whose Order Type was
  `New`

That last one is worth stating on its own: **reading one record tells you about
one record.** The Testing Guideline would have told me the rule outright.

None of these were judgement calls. Each had a verifiable answer that I did not
go and look up first.
