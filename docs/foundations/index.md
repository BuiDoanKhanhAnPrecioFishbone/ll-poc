# Foundations

Fifteen pages, one more than the Atlassian structure this site is modelled on.
The extra one is [Sizing](sizing.md), and the reason is in deviation DEV-02 of
14 Nov 2026: Atlassian pushes control height, row density and column role down
into each component because a table is not their product. Voyager IQ **is** a
table product. Sixteen column minimums set by the *role* of the column cut
across the whole system, `grid:check` and `touch:check` measure them in CI, and
`renderCell`, `column-model`, `DataGrid` and `MiniTable` all point at them.
Filed under one component page, that rule would be buried under a detail.

| Page | Phase | What it settles |
|---|---|---|
| [Tokens](tokens/index.md) | GA | The three layers: ramp, role, component |
| [Accessibility](accessibility.md) | GA | `contrast:check` reads 184 token pairs, with no browser, in the pre-push hook |
| Content | Beta | Grows from a single 14-line table (D6); all five sub-pages are new |
| [Spacing](spacing.md) | GA | 13 space tokens; the scale starts at 2px and steps by 2px at the bottom |
| [Grid](grid.md) | GA | Sixteen column minimums, measured by `grid:check` in CI |
| [Color](color/index.md) | GA | Every pair carries its measured ratio and a date |
| [Typography](typography.md) | GA | 12px floor, agreed with the client on 22 Oct 2026 |
| [Motion](motion.md) | GA | One loading clock; reduced motion treated as a state |
| [Iconography](iconography.md) | GA | The set is `src/ui/icons.tsx`, imported by 9 files |
| [Illustrations](illustrations.md) | Beta | Seven assets; none of the eight checks looks at an image |
| Logos | Early Access | Not written. `docs/logo-ideas.md` of 26 Sep 2026 says "Nothing here is built yet" |
| [Elevation](elevation.md) | Beta | Three shadows, one scrim, a flat z-index list; decision D7 still open |
| [Border](border.md) | GA | 82 lines in B1.4; `border:check` measures it in CI |
| [Radius](radius.md) | Beta | Four radii; decision D8 still open |
| [Sizing](sizing.md) | GA | Control heights, row density, column roles, dialog and shell widths |

The phase is not a mood. Each one in `docs/ia.config.mjs` carries the
measurement behind it, which is what the right-hand column abbreviates.

## How they relate

Tokens come first because every other page is a way of saying which tokens to
use and why. Color, Spacing, Typography, Motion, Border, Radius and Elevation
are the value families, and each is a slice of the same `tokens.css`. Sizing and
Grid are rules about the product's tables, not value families. Accessibility is
not a family at all: it is the check that runs over the others.

## What is not here

There is no Atlassian-style Primitives layer (`Box`, `Inline`, `xcss`),
because those are the layout API of Atlaskit and nothing in `src/` calls them
(DEV-01). Fourteen pages for code that does not exist would document something
no one can use. What Primitives does elsewhere, `src/theme/*.css` and the tokens
do here.
