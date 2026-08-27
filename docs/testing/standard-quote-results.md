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
