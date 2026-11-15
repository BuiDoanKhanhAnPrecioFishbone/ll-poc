# Rich text

> **Status: trial** · `src/ui/RichText.tsx` · the Conversations tab.
> **Trial**, because the implementation is deliberately provisional — see
> below. Written to the template set by [`button.md`](button.md).

---

<!-- ds:tab examples -->

<!-- ds:specimen rich-text -->

<!-- ds:tab usage -->

## When to use

Where a comment written **in the real system** can arrive formatted — the
Conversations tab, and nowhere else yet.

## When not to use

| Instead of rich text | Use | Why |
|---|---|---|
| A description or note field | A textarea — see [Field](field.md) | Formatting someone cannot see elsewhere is formatting lost |
| A single line | An input | |

> A plain textarea here would render a formatted note as **a wall of unstyled
> text**, and an editor missing *Clean formatting* cannot undo a paste from
> Word. Those two facts are why this component exists.

---

## The toolbar is the live one, in its order

```
Undo · Redo | Bold · Italic · Underline · Strikethrough |
Unordered list · Ordered list | Color · Background color |
Outdent · Indent | Format | Clean formatting
```

Read off the live editor and reproduced exactly, because a comment in the real
system can contain all of it.

**The glyphs are drawn, not lettered** — B/I/U as paths rather than characters,
so the toolbar does not depend on the UI font.

### Two places it narrows the live control on purpose

| | Live | Here | Why |
|---|---|---|---|
| **Text colour** | Kendo's full spectrum | **5 system ink colours** | In a comment thread a wheel is more freedom than anyone needs and a reliable way to produce unreadable text on white |
| **Highlight** | Full spectrum | 4, including *None* | Same, and all four are grounds the ink above stays legible on |

---

## What is deliberately **not** built

The live tab shows a **"?"** beside the toolbar. It looks like a help control.

> It is not. It is the current user's **avatar with no initials to show**.
>
> Worth recording, because building a help affordance that does not exist is
> exactly the kind of invention this project has had to keep undoing.

## Implementation, and why it is `trial`

`contentEditable` plus `document.execCommand`.

`execCommand` is deprecated, and its replacement is to ship a full editor
framework — a large dependency to prove a small point in a prototype. It is
supported in every current browser, and **the seam is one file**: swapping in a
real editor later means replacing this component, not its callers.

That is the whole reason for the **trial** status. The surface is right; the
engine is provisional.

## Accessibility

| | |
|---|---|
| Toolbar | `role="toolbar"`; every button has a text label, never the glyph alone |
| Pressed state | `aria-pressed` on the mark buttons; Undo/Redo are `stateless` and carry none, because they have no on/off to reflect |
| The surface | Labelled, and reachable with one `Tab` from the toolbar |
| Keyboard | The browser's own `Cmd/Ctrl+B/I/U` work, because the surface is a real editable region |
| Colour menus | Each swatch is named — *Red*, *Amber* — not colour alone |

<!-- ds:tab code -->

## API

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | HTML |
| `onChange` | `(html: string) => void` | |
| `placeholder` | `string` | Rendered as **a real element**, not a CSS `::before`, so it can be `aria-hidden` and not read as content |
| `ariaLabel` | `string` | Names the surface, and the toolbar as *"{ariaLabel} formatting"* |

---

<!-- ds:tab usage -->

## Related

[Field](field.md) · [Button](button.md) ·
[B1.4 · Lines](../design-system.md#b14-lines) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
