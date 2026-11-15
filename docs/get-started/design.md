# For designers

**There is no Figma library.** What stands in for one is the running specimen
at `/design-system` and the live examples on each component page. Both render
the real components out of `src/ui`, not a copy made to look right — so where a
page and the product disagree, the product is right.

## The specimen

`/design-system` is one page of the running mockup. It follows light and dark:
switch in the user menu under **Appearance** and every swatch follows. In order:

| Section | What it shows |
|---|---|
| Semantic layer | The roles components reference |
| Colour ramps | The raw values underneath |
| Status vocabulary, column roles | The shared statuses and the width of each column role |
| Buttons, chip, button anatomy and states | The control family and the states that hold still |
| Elevation, motion, the third state | Depth, timing, and the error state |
| Type scale | The scale, with its floor |

The type scale carries a fact a designer would otherwise get wrong: **12px is
the floor**, agreed with the customer on 22 Oct, so the bottom three steps all
sit on it on a fine pointer, and come apart again under `pointer: coarse`.

## The component pages

29 pages, 20 with a live example you can press — hover it, focus it, tab to it.
Each also has usage guidance, the API and its own changelog. Start from
[Components](../components.md).

## Tokens

Three layers: ramps, semantic roles, components. **A screen may use only the
second.** A stylesheet saying `var(--vy-grey-0)` has hard-coded *white* and no
theme can move it; `var(--vy-surface)` has hard-coded *the colour a panel is*.

238 tokens are listed, light and dark, in
[All tokens](../foundations/tokens/all-tokens.md). The layers are set out in
[Tokens](../foundations/tokens/index.md). A page on
[using tokens in design](../foundations/tokens/use-tokens-in-design.md) is
planned and not yet written.

## What to do instead of a library

- Read values from the token table, by role, not from a screenshot.
- Check a behaviour on the component page, not in a mock-up of it.
- Trust the ratios: contrast is measured across 184 token pairs in both themes
  before every push ([Tools](../tools.md)).
