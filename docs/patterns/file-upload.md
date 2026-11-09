# Pattern · File upload

> Choosing a file is real. Sending it is not, and the screen says so.
> **Components:** FileDrop · [Button](../components/button.md) ·
> Toast

---

## Where it appears

Five places, and they are the reason the component exists: the BoM file on
**Run Quotation** and on **Create BoM**, a document on a **checklist task**,
**attachments** on a new part, and the file for **BoM Comparison**.

Before it, `live-component-sweep.md` recorded the gap plainly: *"`k-upload`
ships and we have no file input at all — every upload in this prototype
reports what it would do."*

---

## The honest half

| What the user gets | What they do not |
|---|---|
| A file picker | A transfer |
| Drag and drop | A progress bar that means anything |
| The file's **name and size** on screen | A server-side result |
| The ability to **remove** it | Parsing |

**Nothing is uploaded, and that is deliberate.** `autoUpload` is off and no
`saveUrl` is set, because there is nowhere to send it.

> A `saveUrl` pointing at nothing would show **every file as failed** — which
> is not "not implemented", it is "implemented and broken". The difference
> matters to a reviewer, and it is the whole argument for leaving it unset.

**And the caller says so**, rather than letting the control imply otherwise.
The hint under every drop zone reads:

> *.xlsx only. Chosen files stay in this browser — this prototype has nowhere
> to send them.*

---

## What is deliberately not here

**Parsing the spreadsheet** — column detection, merge rules, the MFG/MPN
pairs — is a separate piece of work that needs a real file reader. It is
recorded as unbuilt in the testing docs, not hidden behind a spinner.

Choosing the file was the part missing from the UI; that is the part that was
built.

---

## Rules

1. **Restrict by extension, and say the restriction.** `.xlsx only` sits under
   the control, not in an error after the fact.
2. **One file unless the screen needs more.** `multiple` is off by default;
   the checklist task is the exception, and it accepts
   `.xlsx,.pdf,.png,.jpg,.doc,.docx` because a task attachment is whatever the
   task needs.
3. **A chosen file is removable.** The list is state, not a receipt.
4. **The caller handles the "and then what".** `onPick` receives the names and
   the screen decides — the control never claims the work is done.

## Content

- The hint names the **filter** and the **limitation**, in that order.
- A file that does not match shows **what it is** rather than only that it is
  wrong — the attachments list on Run Quotation marks a `.pdf` as *not .xlsx*
  beside it, so the user can see why it is not selectable.

## Accessibility

| | |
|---|---|
| Keyboard | Kendo's Upload is reachable and operable without a pointer; drag and drop is never the only way |
| Name and size | Real text beside each file, not a tooltip |
| Remove | A real button per file |
| Hint | A sibling of the control, so it is not folded into the accessible name |

---

## Related

[Wizard](wizard.md) · [Feedback and toasts](feedback.md) ·
[A3 · Five rules before you build](../design-system.md#a3--five-rules-before-you-build) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
