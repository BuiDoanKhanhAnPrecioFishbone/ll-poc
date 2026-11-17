# Multi-column list

A lookup whose popup is a small grid. One of the BA's Input widgets, and the
only one of them that exists because of a specific reading problem.

<!-- ds:tab examples -->

<!-- ds:specimen multi-column-list -->

<!-- ds:tab usage -->

## Why the extra columns

Her own example makes the case better than an argument would:

```
0455-300-0017-11
0455-300-0017-12
```

Those differ in the last character of sixteen. In a single-column list the
reader has to compare the whole string to reject a row. Put **Rev** and
**Description** in their own columns and the eye lands on the difference
instead of hunting for it.

## When to use

- A lookup where the visible value does not identify the row on its own — part
  numbers, revisions, anything serialised.

## When not to use

- **A short list of words.** Package type, status, currency: those are a
  [Select](select.md). Three columns of one word each is furniture.
- **More than about four columns.** The popup has to stay narrower than the
  form; past four the columns start truncating, and a truncated column is
  worse than an absent one.

## Every column is searchable

Not just the one shown in the box. Typing a description to find a part number
is the reason the other columns are on screen at all, so filtering that
ignored them would undo the component.

The operator is `contains`, case ignored, and it is held here rather than left
to Kendo — the same decision, for the same reason, as [Select](select.md): a
default that moves with a library release is not a decision.

## The popup is a grid, so it has a header

12px at 600 on `--vy-grid-header`, rows 30px — her numbers. The header is what
separates this from a plain dropdown: without it the extra columns are three
unlabelled strings and the reader has to infer which is the revision.

## Accessibility

Kendo's own combobox roles and roving focus. The filter is a text input, so
the list narrows as you type without the keyboard leaving the field.

<!-- ds:tab code -->

```tsx
<MultiColumnList label="Part Number" columns={COLUMNS} data={PARTS}
                 value={v} onChange={setV}
                 textField="part" dataItemKey="part" />
```

KendoReact's `MultiColumnComboBox`, from the dropdowns package this app
already used — not a second lookup component.

`clearButton` is off and a null change is ignored, both copied deliberately
from [Select](select.md), where the reasoning is written out at length: with
custom values disallowed, Kendo answers unmatched text by clearing the value,
so typing over a chosen part and clicking away would lose it.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page. The last of the BA's Input widgets that had no implementation |
