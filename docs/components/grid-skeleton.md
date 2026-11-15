# Grid skeleton

> **Status: stable** · `src/ui/GridSkeleton.tsx` · the first-load state of the
> standard list pattern. Written to the template set by
> [`button.md`](button.md).

---

<!-- ds:specimen grid-skeleton -->

## When to use

**A first load, where nothing is on screen yet.** The route has resolved, the
rows have not arrived, and the user is looking at the screen they asked for.

## When not to use

| Instead of a skeleton | Use | Why |
|---|---|---|
| Work over rows already on screen | [`BusyOverlay`](loader.md) | *"What will this look like?"* is already answered |
| A list with no rows to show | The empty state | A skeleton promises rows that are coming |
| A failed load | The [error state](error-state.md) | A skeleton that never resolves is the worst of the four states |

---

## The cells are proportioned by column **role**

It takes the real `ColumnSpec[]` and sets `data-role` on each cell, so the
placeholder reads as **the same shape of table that is coming**.

| `data-role` | Share of the row |
|---|---|
| `ident` | 18% |
| `text` | 22%, and the only flexible one |
| `date` | 11% |
| `money` | 9% |
| `status` · `rating` | 9% |
| `code` · `number` | 7% |

> They **approximate rather than match exactly**. The real widths are numbers
> in the token layer, and reproducing them here would mean an inline style per
> cell — a second copy of the width table, kept in step by hand.

A skeleton whose bars are all the same width tells you a table is coming. One
whose bars follow the roles tells you **which** table.

---

## What the live system does instead

The customer's build renders **"No records available" while its spinner is
still turning** — audit finding **T5**.

> For the first moment of every list screen, the product says there is nothing
> there. Then the rows appear. The empty state and the loading state were
> wired to the same condition.

*Loading* and *empty* are two different answers, and only one of them is true
at a time.

## Accessibility

```tsx
role="status" aria-live="polite" aria-busy="true"
```

| | |
|---|---|
| Announced | **Once**, in words — a `vy-sr-only` *"Loading records"* — not once per bar |
| The bars | Carry no text and no label, so a screen reader is not read a picture of a table 12 rows deep |
| `aria-busy` | Stays on the container until the real rows replace it |
| Reduced motion | The shimmer stops; the layout stays. See [B6](../design-system.md#b6--motion) |

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `ColumnSpec<T>[]` | — | The screen's real columns, so the proportions cannot drift |
| `rows` | `number` | `12` | Match the page size, so nothing jumps when data lands |

---

## Related

[Record skeleton](record-skeleton.md) · [Data grid](data-grid.md) ·
[Loader](loader.md) ·
[D5 · The four screen states](../design-system.md#d5--the-four-screen-states)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
