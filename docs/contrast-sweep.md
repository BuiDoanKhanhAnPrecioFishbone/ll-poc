# Contrast sweep — 5 September 2026

Recorded as undone in three places (`kendo-migration-scope.md` twice,
`ux-audit.md` once) since the Kendo surfaces landed. This is that measurement.

**Headline: all text passes. Three control BORDERS fail, and the reason is a gap
in the palette rather than a mistake in any one component.**

## Method, and why it can be trusted

Colours are read through a **canvas pixel** rather than parsed from strings —
Kendo emits `oklch()`, which no regex over `getComputedStyle` handles. Backgrounds
are composited up the ancestor chain, so a semi-transparent surface is measured
against what is actually behind it rather than assumed to be white.

**The harness was validated before its results were believed.** A `#bbbbbb`-on-
white element was planted in the page: it was caught at **1.92:1** against an
expected ~2.0. A sweep that reports no failures is only worth reading if it can
prove it would have found one.

## Text — passes everywhere measured

| surface | distinct colour/size/weight combinations | failures |
|---|---|---|
| Part Master (grid, toolbar, pager, filters) | 35 | **0** |
| Add Part Master Detail (form, tabs, buttons) | 43 | **0** |

Thresholds applied per WCAG 1.4.3: 4.5:1 normal, 3:1 for large text
(≥24px, or ≥18.66px at weight ≥700).

## States — all pass

| indicator | ratio | |
|---|---|---|
| Checked checkbox fill vs surface | **7.94** | pass |
| Tick glyph vs its own fill | **7.94** | pass |
| Inactive tab text | **10.74** | pass |
| Active tab text | **7.85** | pass |
| Focus ring vs white | **5.87** | pass |
| Outlined button border | **10.12** | pass |

The first three of these initially read as failures at ~1.0. They were not:
setting `checked` on a React-controlled input does not survive its next render,
and the active tab is not marked by a bottom border, which is what the probe had
assumed. Measured properly, all three are comfortable.

## Non-text — three real failures (WCAG 1.4.11, 3:1)

| control boundary | colour | ratio |
|---|---|---|
| Combobox / picker | `#dde2e9` grey-200 | **1.30** |
| Text input, textarea | `#c3cbd6` grey-300 | **1.64** |
| Checkbox, unchecked | `#97a2b2` grey-400 | **2.55** |

These are the three most-used controls in the application, and the boundary is
the only thing that says where the control is when it is empty.

**Not counted as failures**, though the raw numbers look similar: the grid's
header rule and cell dividers (~1.21), and an inactive tab's bottom border.
1.4.11 covers user-interface components and graphical objects — a table rule is
structural decoration, and reporting it would pad the list without helping
anyone.

## The actual finding: the palette has no step that conforms

| token | hex | vs white |
|---|---|---|
| grey-200 | `#dde2e9` | 1.30 |
| grey-300 | `#c3cbd6` | 1.64 |
| grey-400 | `#97a2b2` | 2.58 |
| **— nothing here —** | | **3.00 needed** |
| grey-500 | `#626d7e` | 5.24 |
| grey-600 | `#4d5766` | 7.32 |

grey-400 misses by **0.42**, and the next step overshoots to nearly double what
is required. So this was never fixable by "pick the next grey" — which is
presumably why the checkbox was left at grey-400 in phase C, and why it stayed
at 2.55 after being explicitly flagged.

**Applied** — `--vy-border-control: #8a94a3`, measured **3.07:1**: the lightest
value that conforms, one shade off grey-400 and in the same blue-grey family, so
it buys the conformance and changes as little as possible about how the app
looks. It governs boundaries only — input, textarea, combobox, checkbox, radio.
Panel edges, card outlines, table rules and dashed drop zones stay on the grey
scale, because 1.4.11 does not cover structure.

`.vy-input:hover` moved from grey-400 to grey-500 with it. The resting border is
now darker than grey-400, so the old hover was lighter than the state it was
meant to emphasise.

### Verified after applying

| boundary | before | after |
|---|---|---|
| Combobox / picker | 1.30 | **3.07** |
| Text input, textarea | 1.64 | **3.07** |
| Checkbox, unchecked | 2.55 | **3.03** |
| Radio, unchecked | 2.58 | **3.07** |

Text re-swept on the same page afterwards: 40 combinations, **0 failures** — the
change is confined to borders.

## A fifth failure, found while verifying rather than by the sweep

`.vy-chip` renders on one screen, conditionally, so it was on neither page
swept — it only appears when a queue filter is active, and always in its
selected state. Its border was **blue-300 at 2.50**.

It is a real failure rather than a technicality: the chip's fill is blue-50,
which measures **1.11:1** against the page — effectively white — so the border
is the only thing defining the chip's shape.

Unlike the grey scale, the blue scale already had a conforming step, so this
needed no new token: **blue-400 at 3.88**.

## One thing that is weak rather than failing

The active tab is distinguished from its neighbours essentially **by colour**:
active blue against inactive grey is **1.37:1** between the two text colours. A
non-colour cue does exist — Kendo boxes the active tab on three sides — but that
box is grey-200 at **1.21:1**, so it carries very little of the load. Not a hard
1.4.1 failure, because the cue is present; worth knowing that it is thin.

## Not covered

Only two surfaces were swept — the Part Master grid and a large form dialog.
They cover the grid, toolbar, pager, filter row, form fields, tabs, buttons and
dialog chrome, which is most of the component surface. The quotation Run
wizard, the Result tab and the checklist screens were not walked, and dark mode
does not exist to sweep.
