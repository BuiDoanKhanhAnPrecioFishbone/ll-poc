# Loader

> `src/ui/Loader.tsx` · two exports: `Loader` and `BusyOverlay`.

---

<!-- ds:tab examples -->

<!-- ds:specimen loader -->

<!-- ds:tab usage -->

<!-- ds:specimen loader-usage -->

## When to use

| Situation | Use |
|---|---|
| A button's action is running | `busy` on the [Button](button.md) — it puts a `Loader` in the icon slot |
| Work over data **already on screen** | **`BusyOverlay`** |
| A first load, where nothing is on screen yet | A **skeleton**, not a loader |
| The app booting | The boot screen |

**A skeleton answers *"what will this look like?"*.** Once the user has seen
rows, that question is answered — so a re-price dims what is there and puts an
indicator over it instead.

---

## Which type, and it is a real distinction

| Type | Looks like | For |
|---|---|---|
| **`pulsing`** *(default)* | Three dots, **no rotation** | Inside a button or a cell. It holds still, so the control it sits in does not appear to spin |
| **`converging-spinner`** | Rotating | A whole page or a blocking overlay, where rotation is the point: something is working and there is nothing else to look at |
| `infinite-spinner` | Also rotating | Not used. Kept reachable so a third case does not have to reach past this file |

---

## Why this file is a thin wrapper and not a design

The customer's live bundle **already ships `k-loader`** — with `sm/md/lg`, the
eleven theme colours, and all three animation types.

> The indicator was never an open question. We simply did not have
> `@progress/kendo-react-indicators` installed, so the one thing the product
> already uses was the one thing we could not draw.

**Kendo's type names are kept verbatim.** `Button` maps MD3's variant ladder
onto Kendo's fill modes because MD3 has a ladder worth keeping; a loader has
no such vocabulary to reconcile, so inventing `dots` / `spinner` / `ring` here
would be **a second set of names for one set of things**.

---

## BusyOverlay

Dims what is on screen, puts a spinner and **a sentence** over it.

| Prop | Rule |
|---|---|
| `label` | **What is happening, in words.** It is shown *and* read aloud — *"Updating results…"*, not *"Loading"* |
| `blocking` | True when the user must not touch what is underneath |

Two things it does that are easy to miss:

- The content underneath gets `aria-hidden` while busy, so a screen reader
  does not read a table that is about to change.
- When `blocking`, it also gets **`inert`** — the right word for this, which
  React 19 passes through. It is only honoured once the overlay is actually
  up, which is why both are set rather than either alone.

---

## The label is the whole point

```tsx
<Loader label="Working" />          // on a button
<BusyOverlay label="Updating results…">…</BusyOverlay>
```

> **Say what is loading, not that something is.** *Loading* tells a screen
> reader user that the page is busy, which they already know from the fact
> that nothing is happening. *Updating results* tells them what to expect back.

## Accessibility

| | |
|---|---|
| Role | `role="status"` with `aria-live="polite"` on the overlay — it waits its turn, unlike an error |
| Label | `aria-label` on the loader, and the same words visible under it |
| Underneath | `aria-hidden` while busy; `inert` as well when blocking |
| Reduced motion | Honoured — see [B6](../design-system.md#b6--motion). Reduced motion is a **state**, not a switch: things that fade in stay |

<!-- ds:tab code -->

## API

**Loader**

| Prop | Type | Default |
|---|---|---|
| `size` | `small \| medium \| large` | `medium` |
| `type` | `pulsing \| converging-spinner \| infinite-spinner` | `pulsing` |
| `themeColor` | `base \| primary \| secondary \| tertiary` | `primary` |
| `label` | `string` | `Loading` — replace it |

**BusyOverlay**

| Prop | Type | Notes |
|---|---|---|
| `busy` | `boolean` | |
| `label` | `string` | Required, and said in words |
| `blocking` | `boolean` | Adds `inert` underneath |

---

<!-- ds:tab usage -->

## Related

[Button](button.md) · [Feedback](../patterns/feedback.md) ·
[D5 · The four screen states](../design-system.md#d5--the-four-screen-states) ·
[B6 · Motion](../design-system.md#b6--motion)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 2 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 8 Nov 2026 | This page |
| 8 Nov 2026 | The button's busy indicator moved to the fill's `on-` token — it was 1.19:1 on `filled` |
