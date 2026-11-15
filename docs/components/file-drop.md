# File drop

> **Status: trial** · `src/ui/FileDrop.tsx` · **4 call sites**, covering the
> five places `live-component-sweep.md` named.
> **Trial**, because what it returns is a file *name* — see below.
> Written to the template set by [`button.md`](button.md).

The flow around it is [File upload](../patterns/file-upload.md). This page is
the control.

---

<!-- ds:specimen file-drop -->

## When to use

To take a file from this machine: the BoM on Run Quotation and Create BoM
(one shared dialog), a document on a checklist task, attachments on a new
part, and BoM Comparison.

## When not to use

| Instead of a file drop | Use | Why |
|---|---|---|
| A file already on the record | The attachment list | Dropping is for adding; the list is for what is there |
| A file already in Voyager | The picker beside it | `ImportFileDialog` offers both, and the second path needs no upload at all |

---

## Why it exists at all

Phase 7 of the Kendo migration, and the second capability win. The sweep put
it plainly:

> *`k-upload` ships and we have no file input at all — every upload in this
> prototype reports what it would do.*

What the user now gets is real and was missing: **a file picker, drag and
drop, the file's name and size on screen, and the ability to remove it.**

---

## `autoUpload` is off, and there is deliberately no `saveUrl`

| | |
|---|---|
| `autoUpload={false}` | The drop is a selection, not a transfer |
| **No `saveUrl`** | With none set and autoUpload off, Kendo keeps the file client-side and **never attempts a request**. A `saveUrl` pointing at nothing would show every file as **failed** |
| `batch={false}` | Files are listed and removed one at a time |
| `restrictions` | `allowedExtensions`, split from `accept` — stated **before** the drop, not after |

**The hint says so in words**, every time:

> *.xlsx only. Chosen files stay in this browser — this prototype has nowhere
> to send them.*

Writing *Uploading…* over a bar that is measuring nothing would be the
invention this project keeps having to undo.

## What it returns, and why that is `trial`

`onPick` is called with **file names**, not `File` objects.

> In `ImportFileDialog` that is the point: choosing a local file returns its
> name exactly as picking a Voyager file does, so the two paths end in the
> same place and **the wizard cannot tell them apart**.

It is also the honest half of the feature. **Parsing the spreadsheet** — the
column detection, the merge rules, the MFG/MPN pairs — needs a real file
reader and is recorded as unbuilt. Choosing the file was the part missing
from the UI.

When an endpoint exists, `saveUrl` arrives, the hint changes, and `onPick`
starts carrying the file itself. Nothing else here moves.

## Anatomy

| Part | Rule |
|---|---|
| **Zone and select button** | Kendo's own `k-upload`, rounded to `--vy-radius-md` so it matches the cards around it |
| **File list** | Name · size · remove, inside the same box |
| **Hint** | Accepted extensions **and** where the file goes. Two facts, one line, always present |

## States

| State | What is shown |
|---|---|
| Empty | Zone, select button, hint |
| Selected | The file row, with its size and a remove control |
| **Rejected** | Kendo's own restriction message, naming the extension rule the file broke |

> A rejection names **which rule**. *Invalid file* tells someone to try the
> same file again.

## Accessibility

| | |
|---|---|
| Keyboard | The select button is a real control, and it is not a fallback — a drop-only target is reachable by one input device |
| Restrictions | In the hint, so they are read **before** the picker opens |
| Remove | One control per file, named with the file |
| Boundary | The box is drawn with Kendo's global border → `--vy-border`. It is a **container**, identified by the button and hint inside it, not by its edge — the 3:1 rule in [B1.4](../design-system.md#b14-lines) is for the controls within |
| Focus | `.k-upload-button` and each `.k-file` get the app's own ring from the bridge, so a file row can be reached and removed by keyboard |
| Not swept | `border:check` never reaches this control — it only appears inside dialogs the sweep does not open. Checked by hand instead, and recorded here so that is not mistaken for a pass |

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onPick` | `(names: string[]) => void` | — | Called with the chosen names; **empty when the last one is removed** |
| `accept` | `string` | `'.xlsx'` | Comma-separated extensions. Also printed in the hint and enforced as `allowedExtensions` |
| `multiple` | `boolean` | `false` | |
| `hint` | `string` | `` `${accept} only.` `` | Replaces the first sentence only — the *stays in this browser* sentence is not optional |

---

## Related

[File upload](../patterns/file-upload.md) ·
[Support ticket](support-ticket.md) · [Dialog](dialog.md) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
