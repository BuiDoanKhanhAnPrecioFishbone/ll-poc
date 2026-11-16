# Color meaning

Four colours carry meaning here. Everything else on screen is structure —
surfaces, borders, the brand blue — and says nothing about state.

> **The BA's settled set, 16 Nov 2026.** This page is her section, taken as
> written. The values below are hers; the measurements beside them are this
> system's, taken independently, and they agree.

<!-- ds:tab examples -->

<!-- ds:specimen toast -->

## The four

| Meaning | Light bg / text | Dark bg / text | Used for |
|---|---|---|---|
| **Information** · changed | `#e5eaf7` / `#15347e` | `#1a2846` / `#9db4ec` | A value that differs from the saved one; a change in a comparison; an info banner |
| **Warning** | `#f8efe3` / `#7a4a05` | `#3c3121` / `#f2c27a` | Something to check that does not block: not enough stock, not verified, stale data |
| **Success** · added | `#e4f1ea` / `#1a6b34` | `#18342e` / `#7dd39a` | A success toast; an added value in a comparison |
| **Error** · removed | `#fdeceb` / `#9e231d` | `#3d2025` / `#f28b82` | A required value missing; a value that blocks the next step; a destructive confirm |

Tokens: `--vy-info-bg` / `--vy-info-text` and the same pattern for `warning`
and `success`. Error is `--vy-danger-subtle` / `--vy-danger-text`, which the
system already held — her light pair and ours were the same two values before
either of us compared them.

**One base per meaning, both themes.** Her rule, not a convention invented
here: the background is that base mixed into the surface at 12% in light and
22% in dark, and only the text changes between themes, one step lighter in
dark. The values above are her resolved results, and she asks for them
literally — they were chosen by measuring contrast, so rounding one to the
nearest grey or blue ramp step would quietly undo the measurement.

<!-- ds:tab usage -->

## Never the colour alone

Each meaning always arrives with **its own mark and its own words**. A circle
for information and success, an octagon for an error, a triangle for a
warning. That is the same rule
[Inclusive writing](../content/inclusive-writing.md) states for status, and it
matters more here than there: a status pill at least carries a word, while a
tinted field or grid cell can easily carry nothing but its tint.

[Toast](../../components/toast.md) had exactly that fault until 16 Nov 2026 —
no icon, a green or red fill, and nothing left if you could not separate the
two hues. It now draws a mark per kind.

## The same colour means the same thing everywhere

A field, a grid cell, a banner, a toast and a comparison all use one set. Blue
means *changed or informational* in all five; it never also means *selected*,
which is the brand's job and a different token.

Two consequences worth stating, because both have been got wrong here before:

- **Blue is not the brand.** `--vy-info-text` is `#15347e`; the brand text is
  `#1a419e`. They are close enough to look like a mistake and far enough apart
  to be one. An inline note used the brand tint until this change, which read
  as *"this is a link"* rather than *"here is something you should know"*.
- **Yellow always means warning.** It does not also mean "in progress", which
  is the status vocabulary's job. The one place the two nearly collide — the
  amber row tones — is settled in
  [Accents and row tones](accents.md) by a rule about which grids carry a
  status column.

## Not the status pills

Three of these four light tints happen to equal a status pill tint today. They
are still separate vocabularies, and her red is the proof: the `blocked` pill
is `#f8e6e5`, the error meaning is `#fdeceb`. Aliasing one to the other would
bind two sets that she deliberately keeps apart, and the next time one moves
the other would follow it for no reason.

<!-- ds:tab code -->

```css
/* A notice: the tint, its own text, and nothing else to decide. */
.notice--info    { background: var(--vy-info-bg);       color: var(--vy-info-text); }
.notice--warning { background: var(--vy-warning-bg);    color: var(--vy-warning-text); }
.notice--success { background: var(--vy-success-bg);    color: var(--vy-success-text); }
.notice--error   { background: var(--vy-danger-subtle); color: var(--vy-danger-text); }
```

A border, where one is drawn, is the base at 30% of the surface. It is written
as a mix rather than frozen into a token, so one rule covers both themes:

```css
border: 1px solid color-mix(in srgb, var(--vy-danger) 30%, var(--vy-surface));
```

## Measured

`contrast:check` carries all four pairs in both themes, so a value edited away
from hers moves a number and fails the push rather than passing quietly.

| | Light | Dark |
|---|---|---|
| Information | **9.56:1** | **7.09:1** |
| Warning | **6.57:1** | **7.73:1** |
| Success | **5.65:1** | **7.43:1** |
| Error | **6.78:1** | **6.14:1** |

Every one of these reproduces the figure printed beside it in her document, to
the second decimal — which is the useful part. Two people measured the same
eight pairs from different directions and got the same eight numbers.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 16 Nov 2026 | This page, and the `info` / `warning` / `success` tokens it describes. The system had only `danger` before |
