# Checkbox

> `src/ui/Overlays.tsx` · a **native input wearing Kendo's classes**, and that
> is the interesting part.

---

<!-- ds:tab examples -->

<!-- ds:specimen checkbox -->

<!-- ds:tab usage -->

<!-- ds:specimen checkbox-usage -->

## When to use

A single yes/no, or one of several independent yes/nos: *Conformal Coating*,
*Provide Alt AML For Out of Stock*, a column in the
[column chooser](column-chooser.md), a row in a grid.

## When not to use

| Instead of a checkbox | Use | Why |
|---|---|---|
| One choice among several | [Radio group](radio-group.md) | Checkboxes are independent; radios are exclusive |
| A setting that applies immediately and can be undone | A switch — **which this app does not have** | The live system uses `k-switch` ×4 and nothing here matches it yet |
| Filtering a list | [Chip](chip.md) or the [filter toolbar](filter-toolbar.md) | |

---

## Why the class, not Kendo's React component

Kendo's `<Checkbox>` cannot express two things this app needs:

**`indeterminate`.** There is no prop for it. The grid's select-all box needs
it to mean *"some rows on this page, not all"*, and it has to be set through
the DOM node either way.

**`aria-label`.** Only `ariaLabelledBy` / `ariaDescribedBy` are offered — and
the grid names **every row's box individually**:

> *"Select 01455-387-9552"*, because a screen reader moving down twenty
> identical labels reading *"Select row"* learns nothing.

Kendo's component renders exactly this markup anyway: a native input carrying
`k-checkbox`. Using the class directly gives the same pixels, keeps both
capabilities, and **avoids a React wrapper around each of the ~300 checkboxes
a full grid page renders**.

> Kendo styles `.k-checkbox:indeterminate` — the **native pseudo-class** — so
> the state comes through with no help from us.

---

## `k-checkbox-lg`, and why the size is not a detail

**20px, measured** — exactly the size the hand-written box was.

`md` is 16px and would have **quietly shrunk every checkbox in the app by a
fifth**, including the grid's, where the label's 24px target is switched off
and **the box *is* the pointer target**.

---

## Two Kendo defaults the bridge has to correct

| | Kendo's default | Here |
|---|---|---|
| **Unchecked boundary** | `--kendo-color-border` → grey-200, **1.30:1** | `--vy-border-control` |
| **Indeterminate box** | A white box with a blue dash — the dash reads at 5.9:1, but the **outline** still came from the global border | Same visible edge as an empty box |
| **Disabled** | Styled **by class**, so a plain `<input disabled>` renders identically to an enabled one | Keyed off `:disabled`, dimmed by `--vy-state-disabled` |

> **An indeterminate box is not a checked one.** It needs the same visible
> boundary as an empty one, which is why the rule is `:not(:checked)` and not
> `:not(:checked):not(:indeterminate)` — the first attempt left the select-all
> header with the faint edge the rule was written to fix.

**Disabled uses opacity, not a grey wash.** The earlier rule put `:disabled`
after `:checked` at equal specificity, so a disabled **ticked** box went grey
and took its white tick with it — on exactly the control whose whole job was
to show *"this column is always shown"*.

## Accessibility

| | |
|---|---|
| Label | The `<label>` wraps the input, so there is no `for`/`id` to get wrong |
| Grid rows | Each box is named individually, with the record it selects |
| Indeterminate | The native pseudo-class, so assistive tech reports *mixed* |
| Disabled | Dimmed and announced; where it matters, the reason sits beside it |
| Target | 20px box; where the label's target is off, the box carries it |

<!-- ds:tab code -->

## API

```tsx
<Checkbox checked={on} onCheckedChange={setOn} label="Conformal Coating" />
```

| Prop | Type |
|---|---|
| `checked` | `boolean` |
| `onCheckedChange` | `(c: boolean) => void` |
| `label` | `ReactNode` |

For a grid row or the column chooser, the raw input is used directly with
`k-checkbox k-checkbox-lg` — the wrapper exists for the labelled case.

---

<!-- ds:tab usage -->

## Related

[Radio group](radio-group.md) · [Column chooser](column-chooser.md) ·
[Data grid](data-grid.md) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact) ·
[B1.4 · Lines](../design-system.md#b14-lines)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 2 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 17 Nov 2026 | `disabled` and `invalid` — the BA names both states and this component could not draw either, so a read-only checkbox was an ordinary one that ignored clicks |
| 8 Nov 2026 | This page |
| 8 Nov 2026 | `--vy-border-control` re-measured against every ground — the unchecked box was reading 2.85 on the page |
