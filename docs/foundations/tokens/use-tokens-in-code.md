# Use tokens in code

Reference the role, never the ramp. `var(--vy-surface)`, not
`var(--vy-grey-0)`: the first moves with the theme and the second cannot. The
repo's own checks enforce the edges of this rule, and nothing here asks you to
remember it.

## What the checks catch

| Check | Catches | Runs in |
|---|---|---|
| `css:consistency` | Values off the scale, colours duplicating a token, `!important`, Kendo selectors with no `.vy-` ancestor | pre-push |
| `contrast:check` | 184 token pairs in both themes, resolved from `tokens.css` with no browser | pre-push |
| `tokens:build` | Every token declaration rebuilt and compared to its source line, 414 of 414 | pre-push |

Run `npm run tokens:build` after editing `tokens.css`. It writes the
[all-tokens table](all-tokens.md) and a W3C DTCG export, `docs/tokens/voyager.tokens.json`.
The CSS is the source and the JSON an export, because 51% of the CSS is prose
that would not survive being a JSON string.

Adding a colour token means editing **three** places: `:root`, the
`data-theme="dark"` block and the `prefers-color-scheme` block.

## A number, not a variable

KendoReact's `GridColumn width` and `Dialog width` need numbers. Import
`COLUMN_WIDTH` or `DIALOG_WIDTH` from `src/theme/tokens.ts` rather than writing a
literal in the component.

## Through Kendo

The components are KendoReact, restyled and never used stock. The bridge,
`src/theme/kendo-bridge.css`, maps our tokens onto Kendo's own `--kendo-*`
variables (453 of them, all on `:root`) rather than re-skinning its 493
classes. Four things to know before debugging a Kendo control:

- **It sits on the root.** Kendo derives 72 variants on `:root`, and a custom
  property resolves where it is declared, so an override on a wrapper leaves all
  72 deriving from Kendo's own red. Hence `html[data-kendo-bridged]`.
- **Point it at roles.** Kendo computes text colour from the surface with a
  lightness switch at 0.6, so handing it a dark surface flips every derived text
  colour on its own.
- **Motion keeps the kill switch.** `--kendo-duration-brief` is mapped as
  `var(--kendo-duration-global, var(--vy-dur-short))`, our value in the fallback
  slot. Pinning the duration directly would discard Kendo's
  `prefers-reduced-motion` handling.
- **A runtime theme toggle needs a reload.** Chrome does not re-resolve a
  relative colour inside a custom property when an attribute changes after
  paint; five controls measured as failures that way and passed loaded dark from
  the first paint.

Specificity is the trap: `.k-button.k-button-solid.k-button-base.k-focus` weighs
(0,4,0), so a one-class rule loses silently. Prefix with
`html[data-kendo-bridged]` rather than repeating a class. Kendo disables with a
`.k-disabled` class, not the `:disabled` attribute. The other two bridge files
are `kendo-subset.scss`, which compiles only the Kendo components used, and
`_kendo-size.scss`, which configures the size scale rather than overriding it.

## When Kendo cannot do it

A rule that deviates from stock Kendo needs a GAP number in a comment
(`docs/gap-register.md`); a rule with none is a bug. The only rule ever to reach
into a Kendo internal class was GAP-02, a `.k-rating-item` override, and it was
retired on 22 Aug 2026.
