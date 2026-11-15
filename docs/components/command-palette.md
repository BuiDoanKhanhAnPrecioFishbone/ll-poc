# Command palette

> **Status: early access** · `src/components/CommandPalette.tsx` · no live specimen yet
> Written to the template set by [`button.md`](button.md). **Ours**: it imports
> neither KendoReact nor Radix. The pattern around it is [Search](../patterns/search.md).

## When to use

To **reach a screen by name** from anywhere, with ⌘K / Ctrl+K or the top-bar
button. It exists because the live menu is 51 nodes, 47 of them destinations, and
a user otherwise has to remember which of eight groups owns a screen.

## When not to use

| Instead of the palette | Use | Why |
|---|---|---|
| Finding an order, a part or a customer | The list toolbar's [`SearchField`](field.md) | The index is the 47 nav destinations and nothing else. The header button said *orders, parts* until 9 Nov, and was corrected |
| Typing `RFQ` or `Request for Quotation` | The nav | Neither appears in any nav label or route, so both match nothing. Left alone on purpose: matching them means a fourth name for 47 screens (finding C1) |
| Narrowing a list | A filter | A filter describes a set; search names a record ([Search](../patterns/search.md)) |

## What it is made of

A backdrop, and inside it: **input**, **result list**, **footer** with the keys
(`↑ ↓` move, `↵` open, `esc` close). A row is a **title**, then the **group**
right-aligned, so all titles start at one left edge; if the item has a
`wasCalled`, a second line reads *formerly …*. Empty: *No screen matches "q".*

## How it behaves

**Scoring.** Five scores, best first: title starts with the query (0), title
contains it (1), **route** contains it (2), old name (3), hint (4). Matching is
case-insensitive. A route match never outranks the name on screen.

> **On live data only three of the five can fire.** Measured 9 Nov: of 47 live
> destinations, 0 carry `wasCalled` and 0 carry `hint`. Both are populated only on
> `proposedNav` and `settingsNav`, the proposal decision D1 declined.

- **Empty query** shows the first 8 destinations in sitemap order. **Otherwise** at
  most 10 results.
- **Keys.** ↓ and ↑ move the highlight and **stop at the ends**; Enter opens it;
  Esc closes. Typing returns the highlight to the first row. The pointer moves it
  too, and clicking a row opens it. Clicking the backdrop closes.
- **Opening** starts from an empty query, with `autoFocus` on the input. The reset
  happens during render, so no frame shows the previous search.
- **⌘K toggles**, from a `window` listener in [App shell](app-shell.md).

## Accessibility

What the file renders, and so what a screen reader gets:

| | |
|---|---|
| Input name | **None.** A `placeholder` only, no `aria-label`. [Search](../patterns/search.md) says every box carries one; this one does not |
| Roles | No `role="dialog"`, no `combobox` or `listbox`, no `aria-selected` or `aria-activedescendant`. The highlight is the class `is-sel` |
| Results | A real `ul`/`li`, and rows are not buttons: a keyboard user opens them only with Enter from the input |
| Focus | Taken on open. Nothing in the file returns it on close or holds it inside |

## API

```tsx
<CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
```

| Prop | Type | Notes |
|---|---|---|
| `open` | `boolean` | Renders `null` when false. State is reset on each opening |
| `onClose` | `() => void` | Also called after a result is opened |

It navigates itself with `useNavigate`. The placeholder suggests `What If`,
`RMA` and `so-mst`; the last is a route, and returned nothing until 9 Nov.

## Recent changes

| Date | Change |
|---|---|
| 15 Nov 2026 | This page |
