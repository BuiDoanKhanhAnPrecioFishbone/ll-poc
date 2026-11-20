# Icon

The set itself is catalogued on
[Iconography](../foundations/iconography.md); this page is the component.

<!-- ds:tab examples -->

<!-- ds:specimen icon -->

<!-- ds:tab usage -->

<!-- ds:specimen icon-usage -->

## When to use

To mark a **destination, an action or a state that also has words of its own**:
a nav item, a button's icon slot, a grid-row action. Every icon is `aria-hidden`
(see *Accessibility*), so an icon can never be the only thing that says what
something is.

## When not to use

| Instead of an icon | Use | Why |
|---|---|---|
| A name that is not in the set | Add it to `ICONS`, in `icons.tsx` | An unknown name draws nothing. The file's own history is the reason: a second map in `SmartButtons` fell back to a document glyph, and a fix made in one map did not reach the other |
| A glyph drawn inline in a screen | The shared set | The set was one map in the shell plus one in `SmartButtons`, overlapping on six names. `AppShell.tsx` still draws four SVGs inline (collapse, hamburger, search, bell) |
| A second weight or a filled variant | Nothing | The stroke is fixed at 1.5 on a 20×20 box. `size` is the only prop |

## What it is made of

One `<svg>`, one `<path>`. `viewBox="0 0 20 20"`, `fill="none"`,
`stroke="currentColor"`, `strokeWidth="1.5"`, round caps and joins. The colour
is whatever text colour surrounds it. Paths are stroked rather than filled so
they stay legible down to 15px (the file's own note).

**43 names.** This page said 45 until 17 Nov 2026, and the figure had been
copied from here into the comparison with the BA's principles, where it sat
under a heading saying it had been checked. It had not: the Examples tab now
counts the set from `ICONS` itself, so the number on screen cannot be wrong
again.

The stroke moved at the same time, from **1.6 to 1.5**. Nobody had chosen 1.6
— it is what the file was written with — and her Icons section states the set
is drawn at one stroke width of 1.5px. Too small to see on one glyph, and
exactly the kind of difference that makes a set look uneven beside the next
icon drawn to spec.

## How it behaves

- **Default size 16.** Sizes passed as a literal in the build: 11 (once, the tick
  in `ErrorState`), 13 (5), 14 (5), 15 (4), 16 (2). Four single-line call sites pass none.
- **An unknown name renders an empty, `aria-hidden` `<svg>`** carrying
  `data-unknown-icon="<name>"`. It is a bug, not a case to style for.
- **Nav icons are resolved, not chosen per screen.** `AppShell` renders
  `i.icon ?? g.icon`: an item's own glyph, else its group's. In the icon-only rail
  these glyphs are the navigation ([App shell](app-shell.md)).
- **Imported by 14 files**: nine under `src/components` and `src/pages`, five in
  `src/ui` (`DataGrid`, `ErrorState`, `FieldRow`, `MoreMenu`, `ViewSetting`).

## Accessibility

| | |
|---|---|
| Name | **None, by construction.** `aria-hidden` is unconditional and the component takes no `label` prop. An icon-only control needs its own `aria-label` ([Button](button.md#accessibility)) |
| Colour | Inherits `currentColor`, so contrast is the surrounding text's, not the icon's |
| Size | Nothing enforces a floor. The file says "down to 15px"; 11, 13 and 14px are in use |

<!-- ds:tab code -->

## API

```tsx
<Icon name="download" />            // 16px
<Icon name="check" size={11} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | A key of `ICONS`. Typed `string`, not `keyof typeof ICONS`, so a wrong name is a runtime bug, not a type error |
| `size` | `number` | `16` | Sets `width` and `height` together |

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 2 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 15 Nov 2026 | This page |
| 17 Nov 2026 | Live examples: the whole set, counted from `ICONS` rather than written down. The count was wrong — 43, not 45 — and the stroke moved to the BA's 1.5 |
