# Record skeleton

> **Status: stable** · `src/ui/RecordSkeleton.tsx` · the first-load state of a
> [record form](../patterns/record-form.md), as
> [`GridSkeleton`](grid-skeleton.md) is for the list.
> Written to the template set by [`button.md`](button.md).

---

## When to use

While one record's values are loading, on a screen whose **fields are already
known**.

## When not to use

| Instead of this | Use | Why |
|---|---|---|
| A save in progress | [`BusyOverlay`](loader.md) | The values are on screen; they are being sent, not fetched |
| A new, empty record | The form itself | There is nothing to wait for |

---

## The labels are real, and only the values are bars

A skeleton greys out **what it does not know yet** — and on a record screen
that is less than people assume.

> The labels, the grouping and the order are in the field declarations, which
> are already in the bundle. It is the customer's name and the due date that
> are still in flight. Greying the labels as well would be hiding something we
> are holding, and it would cost the reader the one thing that makes a wait
> bearable: knowing what they are about to see.

So *Customer*, *Project* and *Schedule & ownership* read normally from the
first frame.

> Nothing moves when the data arrives — the labels are already in their final
> positions, which is the whole promise a skeleton makes and the usual one it
> breaks.

## It is built from the same declarations the form is

It takes **`HEADER_GROUPS`**, the same array `QuotationDetail` renders from.

> A field added to the form appears here too, and the skeleton cannot drift
> into describing a screen that no longer exists.

Bars are sized by **field kind** (`data-sk`), the same idea as the grid's
widths by column role — a date's placeholder is a date's width, and a `notes`
field gets **two** bars.

---

## It wears the record's own container classes

`vy-rfq-head`, `vy-action-bar`, `vy-record-bar`, `vy-back`,
`vy-record-title` — rather than a parallel set with the numbers copied across.

> **Borrowing the class is exact; copying the number is exact until someone
> edits the original.**

This was found by measuring, not by looking:

| Attempt | What happened |
|---|---|
| First | The top rows were skipped entirely, so the field groups sat **92px too high** — when the record arrived the whole form jumped down, breaking the one promise a skeleton makes, in the same file whose comment claims it keeps it |
| Second | Still **24px** out. 18 of those were margins living on `vy-back` and `vy-record-title`, so those two classes are worn as well |

## Anatomy

| Part | Treatment |
|---|---|
| Back link · action bar · record bar · title | Bars in the **real containers**, all `aria-hidden` |
| Group heading | **Real text**, with the icon slot left empty — the glyph is one more thing we have, and the title carries the meaning without it |
| Field label | **Real text** |
| Field value | A bar sized by the field's kind |

## Accessibility

| | |
|---|---|
| Role | `role="status"`, `aria-live="polite"`, `aria-busy="true"` on the header |
| Announced | A `vy-sr-only` *"Loading the record"*, once |
| Labels | Read normally, because they are real — a screen reader user learns the shape of the form while it loads, which is what a sighted user gets too |
| The bars | `aria-hidden`, including the whole top block |

## API

| Prop | Type | Notes |
|---|---|---|
| `groups` | `readonly HeaderGroup[]` | Pass `HEADER_GROUPS`, or a subset for a narrower form |

---

## Related

[Record form](../patterns/record-form.md) ·
[Grid skeleton](grid-skeleton.md) · [Field row](field-row.md) ·
[D5 · The four screen states](../design-system.md#d5--the-four-screen-states)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
