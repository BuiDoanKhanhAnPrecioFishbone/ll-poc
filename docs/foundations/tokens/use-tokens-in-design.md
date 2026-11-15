# Use tokens in design

There is **no Figma library**. No file holds these tokens as variables and
nothing syncs. The running specimen at `/design-system` is what stands in for
it, and by decision F3 the specimen wins when it and the documentation
disagree. This page is how to read it.

## What the page is

`src/pages/DesignSystem.tsx` renders every swatch from `var(--vy-...)`, so it
is the live token file, not a picture of it. It was rewritten on 9 Sep 2026
because it had gone two weeks stale, which matters because decision D10, which
screens the system is signed off against, is reviewed on this page.

## Switch the theme first

Open the user menu, then Appearance. Light and dark are both live and every
swatch follows. Check both: the dark theme inverts the brand pair (light fill,
dark label) rather than shifting it, so a dark swatch is not a darker light one.

## The sections, in order

| Section | What to take from it |
|---|---|
| Semantic layer | The roles, in five groups: surfaces, text, lines, brand, danger. Hover a swatch for the token name |
| Colour ramps | The raw values under the roles. Blue, grey, red. For reference; a design should name a role |
| Status vocabulary | Eight tokens, seven labels. The eighth, `review`, is for a checklist document, not a record |
| Column roles | The width of each role, read from the code's own `ROLE_WIDTH` |
| Buttons, Chip | Variants, and the states that hold still: default, disabled, busy |
| Elevation | Five levels, each two shadows |
| Motion | The real boot rocket, with the six easing and duration tokens beside it |
| The third state | A panel that really throws, caught by the real error boundary |
| Type scale | Nine steps; the bottom three all sit on the 12px floor on a fine pointer |

## What it deliberately does not show

Hover, focus and press are **not drawn**. They need a live cursor or keyboard,
and a class that imitates them photographs a rule the product never runs
(`.k-hover` turns a tonal button dark here; a real pointer leaves it tinted).
What they do is written in the note, with the token that does it. Test them in
the product.

The specimen lists a subset of the semantic tokens. For example, its surfaces
group stops at `--vy-surface-chrome` and omits `--vy-surface-chrome-soft`.
For the complete set, with light and dark values, use [All tokens](all-tokens.md).
