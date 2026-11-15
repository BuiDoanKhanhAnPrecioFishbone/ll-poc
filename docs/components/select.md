# Select

> **Status: stable** · `src/ui/Overlays.tsx` · 39 call sites.
> Written to the template set by [`button.md`](button.md).

It is a **combobox**: the field *is* the input, and the list filters as you
type.

---

<!-- ds:tab examples -->

<!-- ds:specimen select -->

<!-- ds:tab usage -->

## When to use

To choose **one value from a list the system owns** — a customer, a project
type, a saved view, a supplier.

## When not to use

| Instead of Select | Use | Why |
|---|---|---|
| A value that may not exist yet | [TextField](field.md) | This control **will not accept a value outside the list**, by design |
| Two or three options the user should see at once | RadioGroup | A dropdown hides the choice until it is opened |
| On/off | Checkbox | |
| A list of records to act on | A grid | Choosing is not browsing |

---

## It will not accept a value outside the list

Kendo's `allowCustom` permits that; this does not.

> `bundle-evidence.md` established that **Customer is a lookup**. Typing a
> customer who does not exist has to be impossible. Type to narrow, then
> choose.

That is the single rule that separates this control from a text field, and it
is why the two are not interchangeable even though they look similar.

---

## Why it was rebuilt on Popover

It was Radix Select with a filter box inside the content. Two problems, which
turned out to be the same problem.

**Focus.** The filter box could never hold focus — Select keeps a focus scope
on its listbox and returns focus to the selected option. `autoFocus`, a frame
later and a macrotask later were all beaten. Popover has no such scope.

**Shape.** Checking the live bundle settled what it should have been anyway:
`onComboBoxKeyDown` appears in the app's own code, and the ComboBox
implementation ships. **A combobox's trigger is the text input** — you type in
the *field*, as the live Assigned To control does, not in a box that appears
after opening a button.

> So the filter box was never the right shape. The field itself is.

---

## Options can be a value or a pair

```tsx
options={['New', 'Repeat']}                       // the text IS the value
options={views.map(v => ({ value: v.id, label: v.name }))}
```

**The pair form exists because of the view pickers.** A saved view is chosen
by `id` and shown by `name`; view names are user-typed with no uniqueness
check, so two views may legitimately read *My view*. Keying the control on the
label would make one of them unreachable — a bug the plain `<select>` this
replaced did **not** have, because it carried `value={v.id}`.

---

## Size is defaulted, not optional-in-practice

`size` defaults to `medium`, and that default is load-bearing.

> Kendo's ComboBox emits **no size class** when given none — the control
> rendered `k-combobox k-input` and nothing else — so a scale keyed on
> `k-input-md` could not reach it, and the form's select sat at **29px beside
> a 34px input**.

A component that always carries a size name is the whole point of having a
scale.

| Size | Where |
|---|---|
| `medium` *(default)* | Forms, dialogs |
| `small` | Grid toolbars — [View picker](view-picker.md), [Filter toolbar](filter-toolbar.md) |

---

## The footer

Pinned under the option list, inside the popup, **for a list that is
deliberately short**.

Guideline 2.1 §3.3.1 has the Supplier dropdown show preferred suppliers only,
with *Load more suppliers* at the bottom to reach the rest and the brokers. A
short list with a way out is a different thing from a truncated list.

## Accessibility

| | |
|---|---|
| Role | Kendo's ComboBox carries the ARIA wiring; the appearance is ours |
| Label | `label` renders a real label; `id` pairs them when the markup is split |
| Required / invalid | Passed through, so the field participates in the form's validation |
| Boundary | `--vy-border-control`, mapped in the bridge — Kendo's own default measured 1.30:1 |
| Keyboard | Type to narrow, arrows to move, Enter to choose, Esc to close the list **before** closing anything around it |

<!-- ds:tab code -->

## API

| Prop | Type | Notes |
|---|---|---|
| `options` | `readonly SelectOption[]` | `string` or `{ value, label }` |
| `value` / `onChange` | `string` / `(v: string) => void` | |
| `size` | `small \| medium` | Defaults to `medium` — never pass nothing to Kendo |
| `label`, `id`, `required`, `invalid` | | |
| `footer` | `ReactNode` | Pinned inside the popup |

---

<!-- ds:tab usage -->

## Related

[Field](field.md) · [View picker](view-picker.md) ·
[Filter toolbar](filter-toolbar.md) ·
[D2 · Fields](../design-system.md#d2--fields) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
