# Is the control scale Kendo's? — audit, 18 October 2026

Asked before changing the row's icon buttons to the standard's 26px: *make sure
everything is standard Kendo first, with no odd constraints except the ones that
are genuinely needed.* Right question in the right order — 26 is a number, and a
number is only safe to change once there is one place to change it.

## What was wrong, and it was the centre of it

Kendo does not give a control a height. It gives it a **font size, a line height
and a vertical padding**, and the box comes out as tall as those make it; the
theme's own `$kendo-button-md-calc-size` is literally
`(line-height × 1em) + (padding-y × 2) + (border-width × 2)`.

We were setting `block-size` on `.k-button-md`, `.k-input-md` and `.k-picker-md`.
That is not configuring the scale — it is out-shouting it. Kendo's padding stayed
underneath, still sizing the same box to a different number, and the disagreement
had to be settled one selector at a time: two `min-block-size: 0` patches on the
inner element of every input, a `padding-block: 0` beside them, and a rule in the
grid toolbar dragging the funnel onto the dense height, which set one axis and
left it 28×32.

**And the reason given for doing it that way was wrong.** The note in
`kendo-bridge.css` said the scale could not be configured because Kendo ships it
"only [as] SCSS, which we do not compile". `src/main.tsx` imports
`kendo-subset.scss`; Vite has been compiling it with Dart Sass on every build
since phase 5. The variables were reachable the whole time. The *other* half of
that note was correct and worth keeping: Kendo publishes 453 CSS custom
properties and not one of them sizes a button, so CSS alone could not have done
it.

## What it is now

`kendo-subset.scss` configures Kendo's own variables, and nothing anywhere sets a
control height:

```scss
@use ".../button/index.scss" as button with (
  $kendo-button-sm-padding-y: size.control-padding(var(--vy-control-dense)),
  $kendo-button-md-padding-y: size.control-padding(var(--vy-control-md))
);
```

`control-padding()` (`src/theme/_kendo-size.scss`) inverts Kendo's arithmetic:
give it the height the design system wants and it returns the padding Kendo needs
to arrive there, reading `--kendo-font-size` and `--kendo-line-height` so the sum
cannot drift from the box it describes. Three things fall out that a forced
height could not give:

- **Icon buttons are square by construction.** `.k-icon-button` takes the same
  value on both axes and floors the glyph at one line box — Kendo's own rule, not
  ours. The 28×32 funnel was a symptom of hand-sizing, and hand-sizing is gone.
- **A control still fits its text.** At the 15px `--vy-text-base` a phone gets,
  the line box grows and the padding thins; the control stays on the scale
  instead of clipping inside a fixed box.
- **One number moves everything.** `--vy-control-md: 34px` is declared once.
  Honouring the standard's 44 is now that line.

Button is configured before Input on purpose: `input/_index.scss` loads the
button module, and Sass refuses to configure a module something else has already
loaded. In the wrong order the build fails outright, which is the good failure.
Pickers need no entry — `.k-picker-*` is generated from `$kendo-input-sizes`.

## Also fixed, while measuring

- **The funnel is a Kendo icon button**, at all seven call sites. It was a bare
  `<button>` with a 28×28 box of its own invention. `Button` now adds
  `k-icon-button` when the icon is the whole content, and the count badge travels
  inside the icon so the button stays icon-only — it is `position: absolute` and
  sits where it always did.
- **Step 3's toolbar was two sizes**: the Primary Provider picker and four action
  buttons at `medium`, the search and Columns at dense — 34, 34, 34, 34, 32, 32 in
  one row. All `sm` now. A row is level because every control in it carries the
  same size name, which is the whole point of having names.
- **Three number fields were half height.** `.vy-field--editing .vy-suffixed
  .vy-input { flex: 1 }` meant "fill the row beside the suffix", but the input's
  flex parent is `.vy-field-control`, a flex **column** — so it resolved against
  the block axis: basis 0, no free space, 17.5px tall beside 34 everywhere else.
  Markup, Acceptable LeadTime and Assembly Turn Time. Fourth time the wrong axis
  has cost something here.
- **The funnel's paint needed `.k-button.vy-funnel`.** Kendo's outline button is
  two classes to our one, so a plain `.vy-funnel` lost and the border came back as
  `currentColor` — a #4d5766 edge in a row of #dde2e9 ones.

Measured after, at 1440×900: list toolbar 32 across, both icon buttons 32×32;
record action bar 34; edit mode 18 controls at 34 and no other height; step 3
toolbar 32 across. Gates: lint 0, build 0, 0 orphans, render:check and
touch:check pass.

## What is still a constraint, and why each one stays

| Where | What | Keep? |
|---|---|---|
| `kendo-bridge.css` | `.k-icon-button > .k-button-text { display: flex }` + the glyph at `--kendo-icon-size-md` | **Yes.** KendoReact wraps children in a block `k-button-text`; a block gives the icon a line box, leading and all, and the button came out 35.3×32. Kendo's own icon buttons have no text wrapper — that markup only happens for an icon passed through its `icon`/`svgIcon` props, which take a Kendo icon name or an SVG descriptor string, not the nodes our icon set is made of. |
| `kendo-bridge.css` | 44px `min-block-size` / `min-inline-size` under `@media (pointer: coarse)` | **Yes.** A minimum on touch, not a scale. WCAG 2.5.5. |
| `app.css` | `.vy-run-step > .vy-minitable-k` in-cell padding | **For now.** It no longer compacts anything — the in-cell combobox is 34 because its own arrow button is, and the override's job today is to stop the inner element pushing the wrapper past it. The honest version is a size name on the in-cell editors, and Kendo's input scale stops at `sm` (32), so a 40px row in step 3 needs a rung Kendo does not ship. Its own change. |
| `components.css` | `.vy-select .k-input-inner { padding-inline }` | **Yes.** Horizontal only; nothing to do with the scale. |
| `components.css` | `.k-button.k-button-solid.vy-btn--tonal` | **Yes.** MD3's tonal has no rung in Kendo's fill ladder; documented in `Button.tsx`. |
| `app.css` | `.vy-icon-btn` — *missing from this table until 25 Oct; see the finding below* | **Yes.** On the row rung at 26 now, and it stays ours: Kendo's flat button forbids a background with `!important` and ships no hover state. |
| everywhere | `.vy-input`, `SearchField`, `.vy-view-btn` are ours, not Kendo's | **Open.** They are not overrides — they are a second implementation, and they only line up because they read the same token. Kendo ships a TextBox; adopting it would delete the dense rule in the grid toolbar and leave one input in the product. Not today. |
| `Button.tsx` | the `asChild` path emits `.vy-btn--*`, a parallel size ladder | **Open.** It exists so a link can look like a button. Kendo's own answer is `.k-button` classes on an `<a>`, which would fold the ladder away. |

## So, about 26 — answered 25 October

The standard asks for "26px square icon buttons" on a row. The audit above left
two ways open: give it a rung of Kendo's, or a token of ours. **It is a rung of
Kendo's**, and the audit pointed at the right one.

`size="xs"` ships in KendoReact's `Button` type — `'xs' | 'small' | 'medium' |
'large'` in `Button.d.ts:30` — and the theme ships the matching
`$kendo-button-xs-*` family. One more line in the file that already holds the
scale:

```scss
$kendo-button-xs-padding-y: size.control-padding(var(--vy-control-row)),
```

Verified in the shipped stylesheet rather than assumed:

```css
.k-button-xs.k-icon-button { padding: calc((var(--vy-control-row)
   - var(--kendo-font-size) * var(--kendo-line-height) - 2px) / 2) }
```

~2.71px around an 18.57px line box, and `.k-button-icon` floors the glyph at
that same line box, so the button is 26 square by Kendo's construction. Measured
in the DOM: **25.99 × 25.99**, against `sm` at 31.99 × 31.99.

Only the button gains the rung. Kendo's input scale has no `xs`, and nothing in
this product puts a text field inside a 26px row.

## The finding this audit missed on 18 October

The table above lists `.vy-input`, `SearchField`, `.vy-view-btn` and the
`asChild` ladder as parallel implementations. **`.vy-icon-btn` was not in it,
and should have been.** Found on 25 October by stripping the comments out of
every stylesheet and listing what was left:

| | |
|---|---|
| What | `<button>` with `padding: 4px` around a 16px glyph |
| Size | **24px square**, arrived at by arithmetic written down nowhere — sitting exactly on the 24px AA floor with nothing in hand |
| Reach | **ten call sites**: dialog maximise, view-setting maximise and close, the queue bell, the nav toggle, notifications, the step-1 template preview and download, the two attachment actions |
| Recorded in | **nothing**. Not this document, not `radix-to-kendo-scope.md`, not the worklog |

It is now on the rung — 26 from `--vy-control-row`, the same number Kendo's `xs`
derives from — and recorded here. `.vy-view-btn` moved with it, off
`--vy-control-sm`, a token named "avatar, brand mark".

**Why both stay ours rather than becoming Kendo buttons.** Kendo v16's default
theme ships exactly one flat-button rule:

```css
.k-button-flat { color: inherit; box-shadow: none!important;
                 background: 0 0!important; border-color: #0000!important }
```

No theme-colour variants (`.k-button-flat-base` does not exist, in the subset or
in the full theme) and **no hover state at all**. A grey chrome icon button with
a hover surface is not a thing that button can be: `background: 0 0 !important`
in a third-party stylesheet is not a specificity contest to enter, and
solid-plus-our-paint is the tonal compromise already made once — worth making
once, not twice.

`.vy-view-btn` has a second reason of its own. It is one control with two tags:
a `<Link>` on the grids that open through `rowHref`, a `<button>` on the five
that open through `onOpenRow`. Kendo's button cannot be an anchor except through
our `asChild` ladder, which would paint the two tags differently — the exact
defect the `.k-grid a.vy-view-btn` rules exist to fix.

## The rest of the sweep, 25 October

Method: strip every CSS comment, then list each remaining line that names a
Kendo class. Comments are where this project keeps its reasoning, so a rule
with no comment above it is the thing being looked for.

| | |
|---|---|
| Rules reaching into a `.k-` class | **33** — `app.css` 5, `components.css` 16, `responsive.css` 1, `kendo-bridge.css` 11 |
| With no note above them | **0** |
| `!important` outside the bridge | **0** (the bridge has 5, each with its own paragraph; `app.css` has the `prefers-reduced-motion` block, which is not Kendo's) |
| Added by the four commits of 21-24 Oct | **one** — `.vy-with-actions > .k-combobox { flex: 1; min-width: 0 }`, layout only, noted |
| `@radix-ui/react-radio-group` | in `package.json` since 15 Oct with nothing importing it. **Removed** |

One thing worth knowing and not a finding: `dist/assets/all-*.css` is 724 KB of
the full Kendo theme, and it is **not** on the critical path — `KendoCheck.tsx`
pulls it through a dynamic `import()`, so Vite splits it into a chunk only that
diagnostic route loads. The shipped stylesheet is the subset.
