# MiniTable

> **Status: stable** · `src/ui/MiniTable.tsx` · 15 call sites — the short
> lists inside a record. Written to the template set by
> [`button.md`](button.md).

---

## When to use

A list **inside** something else: documents on a record, quotation results,
the wizard's line items. Tens of rows, not tens of thousands.

## When not to use

| Instead of MiniTable | Use | Why |
|---|---|---|
| A module's main list | [DataGrid](data-grid.md) | That one brings the title, KPIs, search, view picker, pager and empty state with it |
| Three facts about one thing | A field group | |
| A list nobody filters or sorts | A plain list | The filter cells are the reason to pay for a table |

**Same column-role model and the same visual language as the main grid**,
without the virtualiser — these lists are tens of rows, and paying for
virtualisation would add machinery with nothing to gain.

---

## What it brought that nothing else had

**Per-column filter cells**: *Contains · Does not contain · Is (not) equal to ·
Starts/Ends with · Is null*.

The Testing Guideline asks for exactly this on the BoM Components tab, and
`live-component-sweep.md` recorded it as **the one real gap** between the live
system and this prototype.

> It arrived as a prop rather than as a fortnight of work. That is the single
> clearest return the Kendo migration produced, and it is why this component
> was migrated **before** phase 1 — which was blocked at the time, because
> KendoReact 16's Button loops infinitely under React 19 while its Grid renders
> fine.

---

## What was kept on purpose, because Kendo does it differently

**asc → desc → none.** Kendo's default is a two-state toggle; `allowUnsort`
restores the third click, which the guideline calls the *Clear* reset and
which the main [DataGrid](data-grid.md) already uses. A sort you cannot undo
is a sort that has to be undone by reloading.

**Zebra by record, not by row.** The rules between the rows of one record are
already suppressed so the line's cells read as one merged block — but Kendo
stripes by *row*, so a three-manufacturer part came out white / grey / white
with the "merged" cell banded down the middle.

> The question was whether these should be truly merged cells, as the
> customer's mockup shows. The honest answer is that **the merge was already
> there and the zebra was undoing it.** Striping by record does both jobs: the
> eye still tracks a wide row across the table, and one record is one tint.

---

## Row tones

A tone is a row's **state in the quote**, not a severity:

| Tone | Means |
|---|---|
| `covered` | Covered by the chosen supplier |
| `short` | Short of the quantity |
| `no-supplier` / `missing` | No bid |
| `excluded` | Excluded from the quote entirely |
| `known-mfg` | Manufacturer already known |

**Every tone is named in a legend under the grid it paints.** A colour only
the author can decode is a colour that means nothing — and the legend is also
what lets the same amber mean *short* on one grid and *known manufacturer* on
another without either becoming ambiguous.

## One renderer, shared

Cells go through the same `renderCell` as the main grid. Before that,
MiniTable used roles for **width** but fell back to `String(value)` for
content — so identifiers lost their treatment and dates rendered as raw `Date`
objects in every in-record table.

> Two renderers is one renderer too many.

## Accessibility

| | |
|---|---|
| Filter cells | Real inputs with their own labels, not a menu behind an icon |
| Sort | Three states, announced |
| Tone | Never the only carrier — the legend names it and the cells say it |
| Identifiers | Body face, semibold, `tabular-nums` — and **not** monospace, since 13 Oct |

## API

The same `ColumnSpec` the main grid takes. **All eleven callers kept passing
it and know nothing about Kendo** — which was the condition the migration had
to meet before it was allowed to happen.

---

## Related

[Data grid](data-grid.md) · [Status badge](badge.md) ·
[D3 · Grids](../design-system.md#d3--grids) ·
[B1.7 · Row tones and accents](../design-system.md#b17-row-tones-and-accents) ·
[List screen](../patterns/list-screen.md)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
