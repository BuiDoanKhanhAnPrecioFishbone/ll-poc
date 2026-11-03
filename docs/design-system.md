# Voyager IQ — Design System

**Version 1.0 · 3 November 2026 · Linh Long Engineering / Rocket EMS**
Source of truth: `src/theme/` in `ll-poc`. Live specimen page: `/design-system`.

---

## 0 · How to read this, and what it is for

This is the **handover document**: everything someone needs to build a new
Voyager IQ screen without asking, and everything a reviewer needs to tell a
correct screen from a plausible one.

It is written against a working build, not a drawing. **Every number in it was
read out of the source**, and every picture was captured from the running
application at 2× on 3 November 2026. Where a figure came from measuring the
running screen rather than from a rule, it says so.

**Three layers, and the order matters.**

| Layer | What it is | Where it lives | May a screen use it? |
|---|---|---|---|
| **1 · Ramps** | The raw palette. Ten blues, twelve greys, four reds | `tokens.css` | **No** |
| **2 · Semantic roles** | `surface`, `on-surface`, `brand`, `danger`… named for the job | `tokens.css` | **Yes — only this** |
| **3 · Components** | Button, Field, Grid, Dialog… | `src/ui`, `src/components` | Yes |

A stylesheet saying `background: var(--vy-grey-0)` has hard-coded *white*, and
no theme can move it. One saying `var(--vy-surface)` has hard-coded *"the
colour a panel is"*, which a theme is allowed to answer differently. **Layer 1
exists so that layer 2 can be consistent; it is not for use in a component.**

![The semantic layer](assets/design-system/semantic-layer.png)

### What a reader should check first

1. **Is there a token for this?** If yes, use it. If no, say why in the code.
2. **Does the live system already answer this?** Content, field names, option
   lists and behaviour come from the live system unless a customer requirement
   overrides them — the order is written down in [`precedence.md`](precedence.md).
3. **Does it work in both themes, at both densities, and at 820px?**

---

## 1 · Colour

### 1.1 The ramps — layer 1

Three ramps and nothing else. A fourth colour in a screen is a bug unless it
is a status, and the status colours are listed in §1.6.

![Colour ramps](assets/design-system/colour-ramps.png)



| Token | Value |
|---|---|
| `--vy-blue-50` | `#f1f4fa` |
| `--vy-blue-100` | `#dae2f3` |
| `--vy-blue-200` | `#b0c2ea` |
| `--vy-blue-300` | `#7f9ce1` |
| `--vy-blue-400` | `#4973d4` |
| `--vy-blue-500` | `#2754bc` |
| `--vy-blue-600` | `#1a419e` |
| `--vy-blue-700` | `#15347e` |
| `--vy-blue-800` | `#112960` |
| `--vy-blue-900` | `#0d1e44` |
| `--vy-red-50` | `#fdeceb` |
| `--vy-red-500` | `#e23a32` |
| `--vy-red-600` | `#c62d26` |
| `--vy-red-700` | `#9e231d` |
| `--vy-grey-0` | `#ffffff` |
| `--vy-grey-25` | `#fbfcfd` |
| `--vy-grey-50` | `#f5f7fa` |
| `--vy-grey-100` | `#eceff3` |
| `--vy-grey-200` | `#dde2e9` |
| `--vy-grey-300` | `#c3cbd6` |
| `--vy-grey-400` | `#97a2b2` |
| `--vy-grey-500` | `#626d7e` |
| `--vy-grey-600` | `#4d5766` |
| `--vy-grey-700` | `#363e4b` |
| `--vy-grey-800` | `#232a34` |
| `--vy-grey-900` | `#131820` |


### 1.2 Surfaces — what a thing sits on

`app` is the page, `raised` a dialog or menu, `sunken` an inset below the page,
`chrome` the deliberately dark furniture that stays dark in **both** themes.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-surface-app` | `var(--vy-grey-50)` | `#f5f7fa` | `#0f131a` |
| `--vy-surface` | `var(--vy-grey-0)` | `#ffffff` | `#161c25` |
| `--vy-surface-raised` | `var(--vy-grey-0)` | `#ffffff` | `#1e2531` |
| `--vy-surface-subtle` | `var(--vy-grey-25)` | `#fbfcfd` | `#131922` |
| `--vy-surface-sunken` | `var(--vy-grey-100)` | `#eceff3` | `#0b0e14` |
| `--vy-surface-strong` | `var(--vy-grey-200)` | `#dde2e9` | `#2a323f` |
| `--vy-surface-hover` | `var(--vy-grey-50)` | `#f5f7fa` | `#1e2531` |
| `--vy-surface-selected` | `var(--vy-blue-50)` | `#f1f4fa` | `#1b2a4a` |
| `--vy-surface-chrome` | `var(--vy-grey-900)` | `#131820` | `#1e2531` |
| `--vy-surface-chrome-soft` | `var(--vy-grey-700)` | `#363e4b` | `#2a323f` |


### 1.3 Text colour — six tiers

The stylesheets were already using six greys for text, so the scale has six.
`on-surface` is body copy; `strong` is above it for headings and identifiers.

> **`on-surface-faint` measures 2.58:1 on white.** It is legitimate only on a
> dark ground or where the text is decorative — never for anything a user has
> to read. See §6.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-on-surface-strong` | `var(--vy-grey-900)` | `#131820` | `#f5f8fc` |
| `--vy-on-surface` | `var(--vy-grey-800)` | `#232a34` | `#e9edf3` |
| `--vy-on-surface-soft` | `var(--vy-grey-700)` | `#363e4b` | `#d3dae4` |
| `--vy-on-surface-muted` | `var(--vy-grey-600)` | `#4d5766` | `#aab4c3` |
| `--vy-on-surface-subtle` | `var(--vy-grey-500)` | `#626d7e` | `#8f9aaa` |
| `--vy-on-surface-faint` | `var(--vy-grey-400)` | `#97a2b2` | `#67727f` |
| `--vy-on-surface-invert` | `var(--vy-grey-0)` | `#ffffff` | `#0f131a` |
| `--vy-on-chrome-muted` | `var(--vy-grey-300)` | `#c3cbd6` | `#c3cbd6` |
| `--vy-on-dark-fg` | `#ffffff` | — | *(same)* |
| `--vy-on-dark-secondary` | `var(--vy-grey-300)` | `#c3cbd6` | *(same)* |
| `--vy-on-dark-muted` | `var(--vy-grey-400)` | `#97a2b2` | *(same)* |
| `--vy-on-dark-hairline` | `rgba(255, 255, 255, .07)` | — | *(same)* |
| `--vy-on-dark-hover` | `rgba(255, 255, 255, .05)` | — | *(same)* |
| `--vy-on-dark-active` | `rgba(43, 99, 184, .22)` | — | *(same)* |


### 1.4 Lines

`border` is **structure** — panel edges, table rules — which WCAG 1.4.11 does
not cover. `border-control` is the boundary of something you can operate,
which it does cover, and it is the one value in the system chosen by
**measurement** rather than by the ramp.

The sweep of 5 September found why: the grey ramp has **no step that
conforms**. grey-400 `#97a2b2` measures 2.58:1 against white and misses by
0.42; the next step, grey-500, overshoots to 5.24. So `--vy-border-control`
`#8a94a6` was introduced between them — **3.06:1**, the lightest value that
conforms. It governs boundaries only: input, textarea, combobox, checkbox,
radio. Panel edges, card outlines and table rules stay on the ramp.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-border-control` | `#8a94a6` | — | `#6d7889` |
| `--vy-border-faint` | `var(--vy-grey-100)` | `#eceff3` | `#212936` |
| `--vy-border` | `var(--vy-grey-200)` | `#dde2e9` | `#2a323f` |
| `--vy-border-strong` | `var(--vy-grey-300)` | `#c3cbd6` | `#3b4553` |
| `--vy-border-mid` | `var(--vy-grey-400)` | `#97a2b2` | `#55606f` |
| `--vy-border-heavy` | `var(--vy-grey-500)` | `#626d7e` | `#55606f` |
| `--vy-border-emphasis` | `2px` | — | *(same)* |


### 1.5 Brand and danger

Fill and text are separate roles because in a dark theme they pull opposite
ways: a fill must be dark enough for its label, brand text light enough for
the page. **The dark theme inverts the pair rather than shifting it.**



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-brand` | `var(--vy-blue-600)` | `#1a419e` | `#7f9ce1` |
| `--vy-brand-hover` | `var(--vy-blue-700)` | `#15347e` | `#b0c2ea` |
| `--vy-brand-active` | `var(--vy-blue-800)` | `#112960` | `#dae2f3` |
| `--vy-brand-text` | `var(--vy-blue-600)` | `#1a419e` | `#7f9ce1` |
| `--vy-brand-text-hover` | `var(--vy-blue-700)` | `#15347e` | `#b0c2ea` |
| `--vy-brand-text-deep` | `var(--vy-blue-800)` | `#112960` | `#dae2f3` |
| `--vy-brand-on` | `var(--vy-grey-0)` | `#ffffff` | `#0f131a` |
| `--vy-brand-subtle` | `var(--vy-blue-50)` | `#f1f4fa` | `#1b2a4a` |
| `--vy-brand-subtle-strong` | `var(--vy-blue-100)` | `#dae2f3` | `#223357` |
| `--vy-brand-light` | `var(--vy-blue-400)` | `#4973d4` | `#7f9ce1` |
| `--vy-brand-soft` | `var(--vy-blue-500)` | `#2754bc` | `#4973d4` |
| `--vy-brand-boundary` | `var(--vy-blue-400)` | `#4973d4` | `#4973d4` |
| `--vy-brand-boundary-soft` | `var(--vy-blue-200)` | `#b0c2ea` | `#2754bc` |
| `--vy-brand-boundary-light` | `var(--vy-blue-300)` | `#7f9ce1` | `#7f9ce1` |
| `--vy-brand-boundary-strong` | `var(--vy-blue-500)` | `#2754bc` | `#4973d4` |




| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-danger` | `var(--vy-red-600)` | `#c62d26` | `#c62d26` |
| `--vy-danger-on` | `var(--vy-grey-0)` | `#ffffff` | `#ffffff` |
| `--vy-danger-text` | `var(--vy-red-700)` | `#9e231d` | `#f0918a` |
| `--vy-danger-text-deep` | `var(--vy-red-700)` | `#9e231d` | `#f5aba5` |
| `--vy-danger-subtle` | `var(--vy-red-50)` | `#fdeceb` | `#38201e` |
| `--vy-danger-boundary` | `var(--vy-red-500)` | `#e23a32` | `#e0655c` |


### 1.6 Status vocabulary

Eight statuses, each a foreground/background pair. **A status is a word and a
colour, never a colour alone** — the pair is what makes it legible to someone
who cannot separate the hues.

![Status vocabulary](assets/design-system/status-vocabulary.png)



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-status-draft-fg` | `var(--vy-grey-600)` | `#4d5766` | `#aab4c3` |
| `--vy-status-draft-bg` | `var(--vy-grey-100)` | `#eceff3` | `#2a323f` |
| `--vy-status-open-fg` | `#92400e` | — | `#eeb796` |
| `--vy-status-open-bg` | `#fef3c7` | — | `#38281e` |
| `--vy-status-progress-fg` | `#155e75` | — | *(same)* |
| `--vy-status-progress-bg` | `#cffafe` | — | *(same)* |
| `--vy-status-done-fg` | `#065f46` | — | `#96eed5` |
| `--vy-status-done-bg` | `#d1fae5` | — | `#1e3831` |
| `--vy-status-waiting-fg` | `#5b21b6` | — | `#b896ee` |
| `--vy-status-waiting-bg` | `#ede9fe` | — | `#281e38` |
| `--vy-status-review-fg` | `#0e7490` | — | `#96dbee` |
| `--vy-status-review-bg` | `#ecfeff` | — | `#1e3338` |
| `--vy-status-blocked-fg` | `var(--vy-red-700)` | `#9e231d` | `#ee9a96` |
| `--vy-status-blocked-bg` | `var(--vy-red-50)` | `#fdeceb` | `#38201e` |
| `--vy-status-cancelled-fg` | `var(--vy-grey-500)` | `#626d7e` | `#aab4c3` |
| `--vy-status-cancelled-bg` | `var(--vy-grey-100)` | `#eceff3` | `#2a323f` |
| `--vy-status-slot-w` | `104px` | — | *(same)* |


### 1.7 Row tones — the grid's own language

A tone is a row's **state in the quote**, not a severity. Three of them paint
most of a BoM grid, and the legend under the grid names all three.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-tone-excluded-bg` | `var(--vy-grey-100)` | `#eceff3` | `#2a323f` |
| `--vy-tone-excluded-fg` | `var(--vy-grey-500)` | `#626d7e` | `#aab4c3` |
| `--vy-tone-missing-bg` | `var(--vy-red-50)` | `#fdeceb` | `#38201e` |
| `--vy-tone-missing-fg` | `var(--vy-red-700)` | `#9e231d` | `#ee9a96` |
| `--vy-tone-short-bg` | `var(--vy-status-open-bg)` | `#fef3c7` | *(same)* |
| `--vy-tone-covered-bg` | `var(--vy-status-done-bg)` | `#d1fae5` | *(same)* |
| `--vy-tone-known-mfg-bg` | `var(--vy-status-open-bg)` | `#fef3c7` | *(same)* |
| `--vy-tone-pending-bg` | `var(--vy-surface-sunken)` | `#eceff3` | *(same)* |




| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-accent-positive` | `#047857` | — | `#75f0cd` |
| `--vy-accent-caution` | `#d97706` | — | `#f0b775` |
| `--vy-accent-warning` | `#b45309` | — | `#f0aa75` |
| `--vy-accent-waiting` | `#6d28d9` | — | `#a679ec` |
| `--vy-accent-neutral` | `#4d5766` | — | `#aab4c3` |
| `--vy-accent-bar-w` | `3px` | — | *(same)* |


### 1.8 The illustration's palette

The rocket is drawn from ten role tokens rather than ten hex values, so it
survives dark mode. The dark column is the same blue ramp picked further up
it — the craft goes pale on a dark ground instead of into it.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-rocket-hull` | `var(--vy-blue-600)` | `#1a419e` | `#7f9ce1` |
| `--vy-rocket-shade` | `var(--vy-blue-800)` | `#112960` | `#2754bc` |
| `--vy-rocket-accent` | `var(--vy-blue-500)` | `#2754bc` | `#7f9ce1` |
| `--vy-rocket-soft` | `var(--vy-blue-300)` | `#7f9ce1` | `#4973d4` |
| `--vy-rocket-detail` | `var(--vy-blue-200)` | `#b0c2ea` | `#2754bc` |
| `--vy-rocket-trim` | `var(--vy-blue-100)` | `#dae2f3` | `#dae2f3` |
| `--vy-rocket-ground` | `var(--vy-blue-100)` | `#dae2f3` | `#112960` |
| `--vy-rocket-ground-sh` | `#c3d1ee` | — | `#0d1e44` |
| `--vy-rocket-paper` | `var(--vy-blue-50)` | `#f1f4fa` | `#1b2436` |
| `--vy-rocket-smoke` | `var(--vy-grey-400)` | `#97a2b2` | `#626d7e` |


### 1.9 How dark mode is wired

Three blocks, and **a token must appear in all three** or the two ways of
choosing dark disagree:

| Block | Who it serves |
|---|---|
| `:root { … }` | Light — the default |
| `:root[data-theme="dark"] { … }` | A user who **picked** dark in the user menu |
| `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` | A user whose **OS** is dark |

> This has already failed once: four tokens existed only in the media copy, so
> a user who picked dark in the menu got grey-400 borders and a near-white
> priority dot on a near-black ground. **Adding a colour token means editing
> three places.**

---

## 2 · Typography

Two families. `Inter Variable` for everything, `JetBrains Mono` for
identifiers that get read out or compared character by character — part
numbers, MPNs, error ids. Body text is **never** mono: the customer's own
instruction of 13 October, *"do not use monotext, hard to read"*.

![Type scale](assets/design-system/type-scale.png)



| Token | Value |
|---|---|
| `--vy-font-sans` | `"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Arial, sans-serif` |
| `--vy-font-mono` | `"JetBrains Mono", ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace` |
| `--vy-text-2xs` | `12px` |
| `--vy-text-xs` | `13px` |
| `--vy-text-sm` | `14px` |
| `--vy-text-base` | `15px` |
| `--vy-text-md` | `16px` |
| `--vy-text-lg` | `18px` |
| `--vy-text-xl` | `20px` |
| `--vy-text-2xl` | `24px` |
| `--vy-text-3xl` | `28px` |
| `--vy-weight-regular` | `400` |
| `--vy-weight-medium` | `500` |
| `--vy-weight-semibold` | `600` |
| `--vy-weight-bold` | `650` |
| `--vy-weight-heavy` | `700` |


**The scale shifts on a touch device.** Under `@media (pointer: coarse)` the
body range moves up by a constant +2px — 12, 13, 14, 15, 16, 18 instead of
10, 11, 12, 13, 14, 16 — which keeps every relationship intact and lifts the
smallest step to a readable 12. The display sizes (`xl` and up) do not move:
they are already comfortable, and growing a heading on a 375px screen buys
nothing and costs a wrap.

**Casing.** The customer's UI Standard of 14 October: buttons, links, tabs,
form and dialog titles, section and card titles, **field labels**, column
headers, filter labels, menu items and status pills take **Title Case**, with
prepositions (for, to, of, by, as, in, on, at, from, with, via, per, into)
lowercase unless they lead. Prose is sentence case. Three levels are drawn
differently and deliberately:

| Level | Case | Size | Example |
|---|---|---|---|
| Card header | Title Case | 14px / 600 | `Select Action` · `Continue from Drafts` |
| Divider inside a card | **UPPERCASE**, .05em | 12px / 600 | `QUOTE STRATEGY` · `BOM OPTIONS` |
| Field label | Title Case | 12px / 600 | `Customer` · `Qty to Quote` · `Markup (%)` |

---

## 3 · Spacing, shape and elevation

### 3.1 The spacing scale



| Token | Value |
|---|---|
| `--vy-space-1` | `2px` |
| `--vy-space-2` | `4px` |
| `--vy-space-3` | `6px` |
| `--vy-space-4` | `8px` |
| `--vy-space-5` | `10px` |
| `--vy-space-6` | `12px` |
| `--vy-space-7` | `14px` |
| `--vy-space-8` | `16px` |
| `--vy-space-9` | `20px` |
| `--vy-space-10` | `24px` |
| `--vy-space-11` | `28px` |
| `--vy-space-12` | `32px` |
| `--vy-space-14` | `40px` |


### 3.2 Which gap goes between two controls

The scale alone does not say which step to pick, so the system states it —
and the tiers are what carry grouping, which is why they are **not** collapsed
into one value:

| Gap | Where | Examples |
|---|---|---|
| **2px** | Buttons in a cluster that reads as **one** control | dialog titlebar, pager arrows |
| **4px** | Icon buttons attached to the control they act on | a Select with Preview and Download |
| **8px** | **Two adjacent actions.** The default | `.vy-page-actions`, `.vy-run-nav-actions`, `.vy-cost-actions` |
| **12px** | Between items that each hold a control **and** a label | the filter checkboxes, which are 8px from their own words |
| **16px** | Between **groups** on one row | toolbar filters / search / Columns |

Two buttons side by side are 8px apart everywhere. A bigger gap means a real
boundary, not a different author.

### 3.3 Radius, elevation and the scrim

Four radii and three shadows. Elevation is for things that **float** — a
dialog, a menu, a toast. A card on a page gets a border, not a shadow.

![Elevation](assets/design-system/elevation.png)



| Token | Value | Dark |
|---|---|---|
| `--vy-radius-sm` | `3px` | *(same)* |
| `--vy-radius-md` | `4px` | *(same)* |
| `--vy-radius-lg` | `6px` | *(same)* |
| `--vy-radius-pill` | `999px` | *(same)* |
| `--vy-shadow-sm` | `0 1px 2px rgba(19, 24, 32, .06)` | *(same)* |
| `--vy-shadow-md` | `0 2px 8px rgba(19, 24, 32, .10)` | *(same)* |
| `--vy-shadow-lg` | `0 8px 28px rgba(19, 24, 32, .14)` | *(same)* |
| `--vy-overlay-scrim` | `rgba(19, 24, 32, .45)` | `rgba(0, 0, 0, .62)` |


### 3.4 Z-index

A flat list, so two overlays can never argue about which is on top.



| Token | Value |
|---|---|
| `--vy-shell-sidebar-w` | `248px` |
| `--vy-shell-sidebar-w-collapsed` | `56px` |
| `--vy-shell-topbar-h` | `52px` |
| `--vy-z-drawer` | `10020` |
| `--vy-z-dialog` | `10040` |
| `--vy-z-menu` | `10070` |
| `--vy-z-palette` | `10075` |
| `--vy-z-toast` | `12500` |
| `--vy-z-skip` | `12600` |
| `--vy-dialog-md` | `640px` |
| `--vy-dialog-lg` | `960px` |
| `--vy-dialog-xl` | `1180px` |


---

## 4 · Sizing

### 4.1 Control heights

Every control sits on **Kendo's own size scale**, configured rather than
overridden — `_kendo-size.scss` sets the variables and the components inherit
them. Forcing a height on a Kendo control instead is how a 29px select ends
up beside a 34px input.



| Token | Value |
|---|---|
| `--vy-row-h-compact` | `28px` |
| `--vy-row-h-comfortable` | `40px` |
| `--vy-row-h-relaxed` | `48px` |
| `--vy-target-min` | `44px` |
| `--vy-control-sm` | `28px` |
| `--vy-control-row` | `26px` |
| `--vy-control-md` | `34px` |
| `--vy-control-dense` | `32px` |
| `--vy-icon-sm` | `16px` |


| Token | Where it is used |
|---|---|
| `--vy-control-md` 34px | Form inputs, selects, buttons — the default |
| `--vy-control-dense` 32px | Toolbar controls: search, `size="sm"` buttons |
| `--vy-control-sm` 28px | Compact density |
| `--vy-control-row` 26px | An icon button **inside a grid row** — Kendo's `xs` step |
| `--vy-target-min` 44px | The floor under `@media (pointer: coarse)` only |

> **44px is a touch rule, not a desktop one.** WCAG 2.5.5 is about a pointer
> target, and applying it to a 27-field form on a mouse-driven screen adds
> ~270px of scrolling for nothing. It applies below the coarse-pointer
> breakpoint.

### 4.2 Row density — a user preference

| Token | Height | Setting |
|---|---|---|
| `--vy-row-h-compact` | 28px | Compact |
| `--vy-row-h-comfortable` | 40px | Comfortable *(default)* |
| `--vy-row-h-relaxed` | 48px | Relaxed |

### 4.3 Column roles — a width is chosen once, by role

A grid column declares a **role**, not a pixel width. A deviation needs a
`widthNote` in the source saying what was measured, which is what keeps the
numbers from becoming folklore.

![Column roles](assets/design-system/column-roles.png)

| Role | Width | What it holds |
|---|---|---|
| `ident` | 240px | Part numbers, MPNs — must not truncate |
| `text` | 280px | Descriptions and other prose |
| `code` | 96px | Short codes, revisions |
| `number` | 104px | Quantities |
| `money` | 124px | Prices and amounts |
| `date` | 150px | A day |
| `datetime` | 190px | A moment — `09/09/2026 16:35:29` |
| `status` | 128px | A status pill |
| `priority` | 104px | A dot and a word |

### 4.4 Dialogs

| Size | Width | Opens maximised? | For |
|---|---|---|---|
| `md` | 640px | No | A question: a confirmation, a short form |
| `lg` | 960px | Yes *(overridable)* | Two blocks and a short table |
| `xl` | 1180px | Yes | A work surface: a 21-column grid, a 4-step wizard |

`startMaximised` defaults to true for `lg` and `xl` — asked for at the
13 October review, *"open one modal/dialog now open full size first"*. A
confirmation that fills a 27-inch screen is a worse answer than the one it
replaced, so `md` never does.

### 4.5 Shell

| Token | Value |
|---|---|
| `--vy-shell-sidebar-w` | 248px |
| `--vy-shell-sidebar-w-collapsed` | 56px |
| `--vy-shell-topbar-h` | 52px |

---

## 5 · Motion

Four easings and three durations, and nothing else. There is deliberately **no
loop-length token**: a custom property nothing reads is a token that rots.

![Motion](assets/design-system/motion.png)

| Token | Value | Use |
|---|---|---|
| `--vy-ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | The default. Everything, unless it has a reason |
| `--vy-ease-emphasised` | `cubic-bezier(.2, 0, 0, 1)` | A moment that should be noticed. **Currently identical to `standard`** — named separately so the two can diverge without touching call sites |
| `--vy-ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` | Something arriving |
| `--vy-ease-accelerate` | `cubic-bezier(.3, 0, 1, 1)` | Something leaving |
| `--vy-dur-short` | 100ms | State changes: hover, focus |
| `--vy-dur-medium` | 200ms | Small components entering |
| `--vy-dur-long` | 300ms | Dialogs, drawers |

**Reduced motion is a first-class state, not a switch that turns things off.**
Under `prefers-reduced-motion: reduce` the rocket holds its pose — no climb,
no flicker, no streaks — and the step bar still fills. A welding arm with its
animation removed is an arm with no sparks and an empty checklist, which says
something different from what the state means, so the things that *fade in*
are left on.

### Loading, and the 0.4 second rule

| Rule | Value |
|---|---|
| Show the boot screen only if the boot takes longer than | **400ms** |
| Exit: the craft leaves the top of the frame | **400ms** |
| "Still climbing…" appears after | **5s** |
| Minimum display time once shown | **none** |

Holding a loading screen so it does not flash spends the user's time to make
our indicator look better. Not showing one at all for a boot that beats the
clock costs them nothing. The two rules are the two halves of one answer.

---

## 6 · Accessibility

Measured, not asserted. The full sweep is in
[`contrast-sweep.md`](contrast-sweep.md); the focus work is in
[`focus-order.md`](focus-order.md).

| Requirement | Threshold | Status |
|---|---|---|
| Text contrast (WCAG 1.4.3) | 4.5:1 normal, 3:1 large (≥24px, or ≥18.66px at ≥700) | **78 combinations measured, 0 failures** |
| Non-text contrast (WCAG 1.4.11) | 3:1 for control boundaries | Three controls failed at 1.30 / 1.64 / 2.55; fixed by `--vy-border-control` at **3.06:1** |
| Target size (WCAG 2.5.5) | 44×44 | Enforced under `pointer: coarse` |
| Reduced motion | respected | §5 |

**How the contrast harness is trusted:** colours are read through a **canvas
pixel** rather than parsed from strings, because Kendo emits `oklch()`, which
no regex over `getComputedStyle` survives. Backgrounds are composited up the
ancestor chain. Before the results were believed, a `#bbbbbb`-on-white element
was planted in the page and caught at 1.92:1 — a sweep that reports no
failures is only worth reading if it can prove it would have found one.

Four rules that are easy to get wrong and are already settled here:

- A **status is a word and a colour**, never a colour alone.
- A **hint is a sibling of the label**, never inside it, or it becomes part of
  the control's accessible name.
- An **error state uses `role="alert"`**; a loading state uses
  `role="status"`. One interrupts, the other does not.
- A **decorative glyph is `aria-hidden`** and the state it marks gets words of
  its own — a padlock plus a screen-reader-only "read-only".

---

## 7 · Components

`src/ui` holds 33 files — the primitives, plus the icon set, the preference
store and three hooks. Each wrapper has a reason. The rule that produced them: **the live system already ships KendoReact, so the
question is never "what should this look like" but "what does Kendo already
do, and what must we add".**

![Buttons](assets/design-system/buttons.png)

### 7.1 Buttons

| Variant | When |
|---|---|
| `filled` | **One per view.** The most likely next step |
| `outlined` | The default for everything else |
| `tonal` | A secondary action that still needs weight |
| `text` | Tertiary, inside dense rows |
| `danger` | Destructive, and it goes behind **More ▾** |

Rules: all buttons on the **left** of a toolbar; a smart-button group or step
indicator on the right; **Cancel only in dialogs** — in edit mode the word is
**Discard Changes**; at most four visible, the rest behind `More ▾`, and the
label is always the word *More* with a chevron, never `⋯`.

`busy` is not decoration. The indicator says something is happening; the
**disable** is what stops a second click spending a second marketplace
request.

### 7.2 Fields

![Field states](assets/design-system/fields.png)

Two backgrounds, not three — the 14 October instruction: **white means you can
type in it.** A read-only value is a box with a sunken fill, a 1px border and
a padlock, so read and edit modes are the same shape and the layout does not
move between them.

| Part | Rule |
|---|---|
| Label | Above the value, never beside it (13 Oct). Title Case, 12px, 600 |
| Required | A **red asterisk** right after the label, in view and edit mode |
| Optional | No mark. Never the word "(optional)" |
| Helper | Below the field, italic, ≤ the label's size (22 Oct) |
| Error | Red text below the field, on blur — not on every keystroke |

### 7.3 Grids

| Rule | |
|---|---|
| Column chooser | On every grid with **3+ columns** |
| Frozen block | Declared as `locked`, so the chooser and the freeze cannot disagree |
| Zebra | By **record**, not by row — a record spanning two AML rows is one band |
| Totals | A grid the user sums by eye gets a totals row |
| Empty | A real empty state that says what to do, never "No records available" |

### 7.4 The four states of a screen

Loading, empty, error and not-yet-built are four different things and look it.

| State | Illustration | Actions |
|---|---|---|
| **Loading** | Rocket climbing, planet sinking, 5-segment bar | none |
| **Empty** | — | the action that would fill it |
| **Error** | Rocket on the pad: tilted, cracked, one fin off, smoking | Reload · Back to Home · Send a support ticket · Error ID + Copy |
| **Under development** | Rocket whole on the pad, an arm welding it, the plan ticking off | Back to Home. **No Reload — nothing is broken** |

![The error state](assets/design-system/error-state.png)

![Still on the launch pad](assets/design-system/launchpad.png)

### 7.5 Icons

One set, 20×20 viewBox, stroke only, no fill, one stroke weight. A heavier
line at a smaller size is how an icon set stops looking like one set. An
unknown name renders **nothing** with the name in the DOM, rather than falling
back to a document glyph that hides the bug.

`task · chat · log · quote · order · return · customer · requisition ·
supplier · factory · simulate · bom · transfer · adjust · pcb · tool ·
machine · invoice · journal · lock · people · template · job · plug · menu ·
globe · metadata · queue · doc · home · sell · buy · parts · stock · make ·
finance · insight · settings · chevron-down · chevron-right · eye · download ·
clip · trash · check`

---

## 8 · Responsive

Breakpoints are raw pixels because `@media` cannot read custom properties —
a documented exception to the no-magic-numbers rule.

| Width | What changes |
|---|---|
| ≤ **1180px** | The 248px sidebar becomes a 56px icon rail |
| ≤ **980px** | Two-column regions stack |
| ≤ **820px** | The sidebar leaves the flow; a menu button reveals it |
| `pointer: coarse` | Type scale +2px on the body range; 44px target floor |

The system runs on shop-floor terminals that are often 1366×768 or narrower.
Below about 1100px a 248px sidebar stops being orientation and starts being
the thing in the way — measured at 543px it was taking 46% of the viewport.

---

## 9 · Relationship to KendoReact

The live system already ships KendoReact 16. The bridge is three files:

| File | Job |
|---|---|
| `kendo-subset.scss` | Compiles only the Kendo components actually used |
| `_kendo-size.scss` | **Configures** Kendo's size scale — does not override it |
| `kendo-bridge.css` | Maps Kendo's variables onto ours, and fixes what cannot be configured |

Specificity is the trap: `.k-button.k-button-solid.k-button-base.k-focus`
weighs (0,4,0), so a one-class rule of ours loses silently. The bridge prefixes
with `html[data-kendo-bridged]` rather than repeating a class five times.

Two Kendo behaviours worth knowing before debugging a component:

- **Kendo disables with a `.k-disabled` CLASS, not the `:disabled` attribute.**
  A plain `<input disabled class="k-radio">` renders identically to an enabled
  one.
- **KendoReact 16 locks grid columns with sticky cells in one table**
  (`position: sticky`), not with two panes.

---

## 10 · Governance

### 10.1 Where everything is

| Path | Contents |
|---|---|
| `src/theme/tokens.css` | **Every token.** Light, plus the two dark blocks |
| `src/theme/tokens.ts` | The values TypeScript needs: column widths, dialog widths |
| `src/theme/md3.css` | Motion, focus ring, the Material 3 structure we kept |
| `src/theme/base.css` | Reset and element defaults |
| `src/theme/components.css` | Component rules |
| `src/theme/app.css` | Screen and layout rules |
| `src/theme/responsive.css` | Every breakpoint, in one file |
| `src/theme/kendo-*.{css,scss}` | The Kendo bridge |
| `src/ui/` | The primitives |
| `/design-system` | The living specimen page |

### 10.2 Changing a token

1. Add or change it in **all three** blocks of `tokens.css` (§1.9).
2. If it is a colour on text or a control boundary, re-run the contrast sweep.
3. `npm run check:fast` — lint, stylesheet check, typecheck and build.
4. CI runs the five visual checks on every push: `render:check`,
   `touch:check`, `mobile:check`, `focus:check`, `hover:check`.

### 10.3 The rules that keep this document true

- **A magic number needs a note.** A width that deviates from its role carries
  a `widthNote` saying what was measured.
- **A comment states what was measured, not what was intended.** Three
  corrections in this project came from a comment describing behaviour the
  code did not have.
- **The living page beats the document.** `/design-system` renders the real
  components; if the two disagree, the page is right and this file is stale.

### 10.4 Versioning

`v1.0` is this handover. The document carries a date and a commit; a change to
a token or a component rule is a minor version, a change that requires screens
to be rebuilt is a major one.

---

## 11 · Known gaps and open decisions

Honest list, because a handover that claims completeness is one nobody checks.

| | Status |
|---|---|
| **Label text casing** (`Reload this screen` → `Reload This Screen`) | Half done. Uppercase is gone from labels; rewriting the **words** collides with the customer's own prototypes, which use sentence case. Awaiting her answer |
| **Sale type list** on Other Quoted Cost | Eight values, two of them hers and six ours. Awaiting the metadata list |
| **Support ticket destination** | The dialog is complete; the send is faked. One POST away |
| **Row merging on step 3** | Her prototype merges cells; ours bands by record. Trade-off documented, awaiting a decision |
| **Select Action order** | Her prototype and her UI Standard disagree |
| **`Customer Special Need`** vs `Customer specific needs` | Her prototype and the live system disagree |

---

## 11b · What a design-system handover is expected to contain

The shape of this document was checked against current practice rather than
invented. The recurring list across published checklists is: **design tokens**
with their values; **component specs** with every state and variant;
**usage rules** with do and don't; **accessibility** requirements with the WCAG
thresholds named; **code examples**; **responsive** behaviour with the
breakpoints stated; **motion** with duration, easing and a reduced-motion
alternative; and **governance** — ownership, a contribution process and
versioning. Several sources also warn of the one failure mode this file is
most exposed to: documentation drifting away from the live code once the team
moves on, which is why §10.3 makes the specimen page the tie-breaker.

Sources consulted on 3 November 2026:
[Magic Patterns — Documenting Your Design System](https://www.magicpatterns.com/blog/design-system-documentation) ·
[Figr — Design System Checklist](https://figr.design/design-system-checklist) ·
[Supernova — 10 content blocks for design system guidelines](https://www.supernova.io/blog/popular-content-blocks-document-design-system-guidelines) ·
[Docsie — Design System glossary](https://www.docsie.io/blog/glossary/design-system/) ·
[Eleken — Design handoff checklist](https://www.eleken.co/blog-posts/design-handoff-checklist) ·
[UX Planet — Design Handoff Checklist](https://uxplanet.org/design-handoff-checklist-a9d40e9a7704)

These are vendor blogs and community checklists, not a standard; they agree on
the core set and differ on depth.

---

## 12 · Source index

| Document | What it settles |
|---|---|
| [`precedence.md`](precedence.md) | Which source wins when two disagree |
| [`contrast-sweep.md`](contrast-sweep.md) | Every measured contrast ratio and the method |
| [`focus-order.md`](focus-order.md) | Keyboard order and the focus ring |
| [`modal-patterns.md`](modal-patterns.md) | Dialog sizes, action placement, dismissal |
| [`table-patterns.md`](table-patterns.md) | Grid behaviour, column roles, density |
| [`motion-loading.md`](motion-loading.md) | Every loading and transition decision |
| [`kendo-control-scale-18oct.md`](kendo-control-scale-18oct.md) | The 33-rule Kendo size audit |
| [`ui-standard-review-16oct.md`](ui-standard-review-16oct.md) | Our review of the customer's UI Standard |
| [`working-agreement.md`](working-agreement.md) | The engineering rules, including the magic-number exceptions |

---

*Captured from the running build at 2× on 3 November 2026. Images live in
`docs/assets/design-system/`; each can be regenerated from `/design-system`.*
