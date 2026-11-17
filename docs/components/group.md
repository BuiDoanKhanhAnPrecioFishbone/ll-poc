# Group

A heading, a rule beside it, and fields under it. The BA's whole
specification for it is two words: **no box, no fill**.

<!-- ds:tab examples -->

<!-- ds:specimen group -->

<!-- ds:tab usage -->

## Three shapes, one heading

| | |
|---|---|
| **Group** | Heading + fields, in up to three columns |
| **Section heading** | The same heading alone. She specifies it as *"As Group heading"* and nothing more |
| **Collapsible group** | The same group with ▸ / ▾ before the heading |

## When to use

- Sections of a record form: *Order Info*, *Shipping*, *Advanced Settings*.
- Any time a [Card](card.md) would be reaching — if what you are separating
  already sits on one surface, this is the tool.

## When not to use

- **As a card.** A group with a border is a card drawn badly. The absence of
  the box is the specification.
- **For one field.** A heading over a single field says the heading twice.

## The rule beside the heading is not decoration

At 12px, a heading and a field label are the same size. The rule is what tells
them apart — without it a group title reads as a label whose field has gone
missing.

## Collapsible groups open by default

A decision, not a default. A collapsed group hides fields from someone who
does not know they are there: fine for *Advanced Settings*, which is her own
example, and wrong for anything the user has to fill in. Call sites that want
it shut pass `defaultOpen={false}`.

## Accessibility

The toggle is a real `<button>` with `aria-expanded` and `aria-controls`,
**inside** the heading rather than instead of it. A heading that *is* a button
gets announced as a button and drops out of the heading outline, which is the
one thing a screen-reader user navigates a long form by.

## Layout

Three columns, 28px apart, fields 12px apart — her numbers. The columns fall
to two and then to one by **container** width, so a group inside half a split
card behaves without anyone configuring it.

<!-- ds:tab code -->

```tsx
<Group title="Order Info">…</Group>
<SectionHeading>Order Lines</SectionHeading>
<CollapsibleGroup title="Advanced Settings" defaultOpen={false}>…</CollapsibleGroup>
```

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page |
