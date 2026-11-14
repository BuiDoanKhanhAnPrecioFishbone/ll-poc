# Accessibility

Measured, not asserted — and measured **on every push**, which until 8
November it was not. The keyboard work is in
[`focus-order.md`](../focus-order.md).

| Requirement | Threshold | Status | Re-run |
|---|---|---|---|
| Text contrast — WCAG 1.4.3 | 4.5:1 normal · 3:1 large (≥24px, or ≥18.66px at ≥700) | **184 token pairs, both themes, 0 below threshold.** Tightest text pair 4.53:1 | `contrast:check`, every push |
| Non-text contrast — WCAG 1.4.11 | 3:1 for control boundaries **and their states**, measured on **every ground** a control can sit on | Resting boundary, hovered boundary, focus ring and focus edge all clear 3 on all eight grounds; tightest **3.05:1**. Seven controls were below on 8 Nov ([`vien-control-08nov.md`](../vien-control-08nov.md)); two tokens and five rules on 9 Nov ([`vien-state-09nov.md`](../vien-state-09nov.md)) | `contrast:check`, every push |
| Non-text contrast — **fills that carry no text** | 3:1 against the card they are drawn on | The five chart series, both themes. In-Progress was **1.12:1** light and **1.37:1** dark until 9 Nov, because it read a chip background; tightest now **3.03:1** ([Dashboard](../patterns/dashboard.md)) | `contrast:check`, every push |
| Target size — WCAG 2.5.5 | 44×44 | Enforced under `pointer: coarse` | `touch:check`, every push |
| Keyboard focus | visible, on screen | 1305 controls across 10 routes × 3 widths · 0 obscured, 0 without an indicator | `focus:check`, every push |
| Control boundaries, **as drawn**, in three states | 3:1 against what is behind them, at rest **and** on hover **and** on focus | 1122 measurements across 12 routes × 2 themes × 3 states · 0 under. 442 controls draw an edge on hover against 340 at rest — the extra 102 are transparent until you point at them | `border:check`, every push |
| The content box | rail + gutters + content = viewport · capped shapes never exceed `--vy-page-max` · the list shape stays uncapped · one declared step | 72 measurements across 6 routes × 12 widths · 2 planted faults, each caught · 0 findings ([Layout](grid.md#layout)) | `grid:check`, every push |
| Reduced motion | respected | [Motion](motion.md) | — |

**Two measurements, and they answer different questions.**
[`contrast-sweep.md`](../contrast-sweep.md) of 5 September is the real one: a
browser, a canvas pixel per element, backgrounds composited up the ancestor
chain, because Kendo emits `oklch()` and no regex over `getComputedStyle`
survives it. That sweep is what found the three control borders. It is also a
one-off — it ran once, against the palette of that day, and the dark theme,
the status vocabulary and the 12px floor all landed afterwards.

`contrast:check` is the cheap half, kept honest about being the cheap half. It
reads `tokens.css`, resolves every `var()` chain in both themes, and checks
the pairs the system promises: each text tier on each ground it can sit on,
brand and danger, all eight status pills, the row tones, and the two non-text
boundaries. No browser, no server. It cannot see a component that puts text on
a ground the system never intended, or an opacity that makes the real ground
something no token states — those still need the browser sweep. What it does
catch is the palette drifting out from under this document, which is what
happened between September and November, and it caught one the day it was
written: `subtle` on `surface-strong` at 4.02:1. See [Text colour — six tiers](color/index.md#text-colour--six-tiers).

**Why the harness can be trusted.** Colours in the September sweep are read
through a canvas pixel rather than parsed from strings. Before the results
were believed, a `#bbbbbb`-on-white element was planted in the page and caught
at **1.92:1**. `contrast:check` plants the same value on every run and exits
non-zero if it fails to detect it — a sweep that reports no failures is only
worth reading if it can prove it would have found one.

Four rules that are easy to get wrong and are already settled:

- A **status is a word and a colour**, never a colour alone.
- A **hint is a sibling of the label**, never inside it.
- **`role="alert"` for an error, `role="status"` for a loading state.** One
  interrupts, the other does not.
- A **decorative glyph is `aria-hidden`** and the state it marks gets words of
  its own — a padlock plus a screen-reader-only "read-only".
