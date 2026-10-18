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
| everywhere | `.vy-input`, `SearchField`, `.vy-view-btn` are ours, not Kendo's | **Open.** They are not overrides — they are a second implementation, and they only line up because they read the same token. Kendo ships a TextBox; adopting it would delete the dense rule in the grid toolbar and leave one input in the product. Not today. |
| `Button.tsx` | the `asChild` path emits `.vy-btn--*`, a parallel size ladder | **Open.** It exists so a link can look like a button. Kendo's own answer is `.k-button` classes on an `<a>`, which would fold the ladder away. |

## So, about 26

The standard asks for "26px square icon buttons" on a row. Ours are 28 and square
— `.vy-view-btn`, an anchor of our own, which is **not** on Kendo's scale and
carries its own number. Changing it to 26 is therefore not the same kind of edit
as changing 34 to 44: it touches a control the scale does not reach.

Two ways, and the choice is worth making deliberately:

1. **Give it a rung.** Kendo has an `xs` button size we do not use.
   `$kendo-button-xs-padding-y: control-padding(26px)` and the row's buttons
   become Kendo buttons at `xs` — one more line in the file that already holds
   the scale, and the number lands where every other control height lives.
2. **Give it a token.** `--vy-control-row: 26px` beside the other two, and the
   anchor keeps being ours.

(1) is the Kendo answer and the one this audit points at. Worth knowing either
way: at 26 the row button is still above the 24px AA floor and further from the
44px AAA one, and `touch:check` already reports it as THIN at 28 — on a coarse
pointer the 44px minimum covers it, so this is a mouse-only number.
