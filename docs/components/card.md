# Card

A titled box: border, radius, a header band — and **no shadow**.

<!-- ds:tab examples -->

<!-- ds:specimen card -->

<!-- ds:tab usage -->

<!-- ds:specimen card-usage -->

## Card or group?

This is the decision the component exists to make easy, and the BA's
principles of 16 Nov 2026 draw the line in two words.

| | |
|---|---|
| **Card** | A surface of its own. Border, radius, header band |
| **[Group](group.md)** | Divides ONE surface into readable parts. *"No box, no fill"* |

Reaching for a card where a group belongs is how a record form turns into a
column of boxes inside a box. If the thing you are separating is already on a
white panel, it is a group.

## When to use

- A block of a page that stands apart and is worth naming: *Cost Estimation*,
  *Quick Quote*.
- A summary with a figure in its header — `aside` is pinned to the right of
  the title for exactly that.

## When not to use

- **Sections of one form.** Those are groups.
- **To make something look important.** A page where everything is a card has
  no emphasis left to spend.

## No shadow, deliberately

Her spec says so, and the reason is worth keeping: a shadow says a thing
floats **above** the page, and this system spends that signal on popups, where
it means *"this will go away"*. A card that borrows it is promising something
it cannot do.

## Split card: two halves, no divider

Her second shape, and *no divider* is the interesting half of it. The 28px gap
is already separating the two; a rule down the middle makes two cards
pretending to be one, at which point they should be two cards.

Each half carries its own [section heading](group.md).

## Layout

The body is a **container**, not a viewport-width breakpoint. A card can sit
in a full-width page, in half a split card, or in a 470px specimen frame, and
what decides whether its columns fit is the space the card *has*. The first
version of this used `max-width: 720px` and collapsed a split card that had
plenty of room, because the browser was narrow for an unrelated reason.

## Accessibility

A `<section>` with an `<h3>`, so the page outline reads as a list of named
blocks. The title is a real heading, not a styled div — a card that is only a
box does not appear in a screen reader's heading list at all.

<!-- ds:tab code -->

```tsx
<Card title="Cost Estimation" aside={<strong>$1,820.34</strong>}>
  <Group columns={2}>…</Group>
</Card>

<SplitCard title="Quick Quote">
  <div><SectionHeading>BoM Options</SectionHeading>…</div>
  <div><SectionHeading>Assembly</SectionHeading>…</div>
</SplitCard>
```

Measured against her spec: radius 8px, border `#dde2e9`, header 36px on
`--vy-section-bg` `#f1f4fa`, title 14px at 600, `box-shadow: none`.

**One difference, flagged not fixed.** She specifies the card title in
`text-strong` `#232A34`; this renders `--vy-on-surface-strong` `#131820`,
because the two documents attach *text* and *strong* to opposite values. It is
one of the four open questions in
[the comparison](../ba-principles-16nov.md) and should move as one decision
rather than card by card.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 3 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 17 Nov 2026 | This component and this page. It also gave `--vy-section-bg` its first use — the token had nowhere to go while this system had no card |
