# Design tokens

A token here is a CSS custom property with the prefix `--vy-`, declared in
`src/theme/tokens.css`. There are **238** of them, declared **414** times: once
in `:root`, and again in each of the two dark blocks. A token is not worth
having unless the line next to it says why it has that value, so more than half
of the file is prose. Measured by `tokens-build.mjs`: of 1,055 lines, 544 (51%)
are comments and 414 (39%) are declarations.

## The three layers

| Layer | Example | A screen may use it? |
|---|---|---|
| 1 · Ramp | `--vy-grey-0`, `--vy-blue-600` | No |
| 2 · Role | `--vy-surface`, `--vy-brand` | Yes, only this |
| 3 · Component | Button, Field, Grid, Dialog | Yes |

The ramps are 10 blues, 12 greys and 4 reds. Layer 3 is not a set of tokens in
`tokens.css`: it is the components in `src/ui` and `src/components`, which spend
layer 2. See [Tokens](index.md) for the rule.

The reason for the middle layer is dark mode. `background: var(--vy-grey-0)`
has hard-coded white, and no theme can move it; `var(--vy-surface)` has
hard-coded "the colour a panel is", which a theme may answer differently. The
dark values redefine **only** the role layer, never a ramp step, so grey-50
keeps meaning "the light grey" in both themes.

## A ramp step is chosen, not picked

The blue sits at hue 222 (decision D1, 7 Sep 2026). It was chosen by
measurement: the `waiting` badge is violet and `review` is cyan, and both must
stay clear of primary. At hue 216 the gaps were 47° to violet and 23° to cyan;
at 222 they are 41° and 29°, more even than before. Going to 226 drops the gap
to violet to 37°.

Two values are **not** on a ramp because no step conforms, and each is set by
its worst ground, not by the panel:

| Token | Value | Why |
|---|---|---|
| `--vy-border-control` | `#758096` | 3:1 against every ground a control can land on; tightest 3.05 on `surface-strong`. grey-400 is 2.58 on white, grey-500 is 5.24 |
| `--vy-on-surface-subtle` | `#5b6575` | grey-500 reaches 4.02 on `surface-strong`; this clears every ground, tightest 4.53 |

## Where a raw value may live

`tokens.css` and `src/theme/tokens.ts` and nowhere else. The second file exists
because KendoReact's `GridColumn width` and `Dialog width` take numbers and do
arithmetic on them, so a `var(--x)` string cannot reach them. It holds
`COLUMN_WIDTH` (keyed by column role) and `DIALOG_WIDTH`, which is `record: 640`
and `wide: 960`.

## Three blocks

Dark is declared in `:root[data-theme="dark"]` and again inside
`@media (prefers-color-scheme: dark)`, and **a token must appear in all three**.
It has failed once: four tokens (`--vy-border-mid`, `--vy-brand-light`,
`--vy-brand-soft`, `--vy-on-chrome-muted`) existed only in the media copy, so a
user who picked dark in the menu got light-theme values. The full table is
generated: [All tokens](all-tokens.md).
