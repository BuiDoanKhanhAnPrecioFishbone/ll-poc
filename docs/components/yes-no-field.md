# Yes / no field

A boolean that is a **field**, not a bare checkbox. The BA's principles of
16 Nov 2026 keep the two apart, and the difference is the whole point of
having both.

<!-- ds:tab examples -->

<!-- ds:specimen yes-no-field -->

<!-- ds:tab usage -->

## The difference from a checkbox

| | |
|---|---|
| **Checkbox** | A box and a label that names the box: *"✓ Save as default"*. The label is the question |
| **Yes / no field** | A labelled row whose value happens to be a boolean: label *ITAR*, value **Required** or **Not required**. The label is the question, the value is the answer |

Her rule, and the one this component enforces: the value reads as **a word
written for that field**. Never "yes", never "true", and never a ticked box
sitting on its own with the reader left to work out what a tick means here.

That is why `words` has no default. A field that cannot say what its two
states are called in its own vocabulary should be a
[Checkbox](checkbox.md) instead — the component will not let you skip the
decision.

## When to use

- A record attribute with two named states: ITAR *Required / Not required*,
  RoHS *Compliant / Not compliant*, a part *Active / Inactive*.

## When not to use

- **An option in a dialog or a filter.** *"Save as default"* is a checkbox;
  her spec says the bare checkbox belongs in grid filters and popup options
  and never as a form field.
- **Three or more states.** Two words is the limit of this shape; past that it
  is a [Select](select.md) or a [radio group](radio-group.md).

## States

Everything a text field does, because it is one: **view** shows the grey value
box carrying the same box and word, **changed** takes the brand border like
any other field, **focus** moves the border, **disabled** mutes both halves.

**No helper text under it**, which is her rule and a sound one — the word is
already the explanation, so a hint beneath it would say the same thing twice.

## Accessibility

The control is a real `<input type="checkbox">`, so it keeps a checkbox's
keyboard and its announcement; the word is its label. The drawn box is
`aria-hidden`, because a screen reader should hear the state once, from the
control, and not again from a decoration.

<!-- ds:tab code -->

```tsx
<YesNoField label="ITAR" words={{ on: 'Required', off: 'Not required' }}
            value={itar} onChange={setItar} />
```

The real input is transparent and stretched across the box rather than hidden,
because a `display: none` input is not focusable and this one has to be. The
visible box is a sibling, driven by `:checked` and `:focus-visible`.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page. One of the BA's Input widgets that had no implementation |
