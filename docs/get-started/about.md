# About this design system

The file someone needs to **build** a new Voyager IQ screen without asking,
and the file a reviewer needs to **tell a correct screen from a plausible
one**.

It is not a style guide for a drawing tool. It describes a system that is
running: the tokens are CSS custom properties, the components are React, and
the specimen page renders the real thing.

> **How far that goes today, stated rather than implied.** The foundations —
> [Foundations](../foundations/index.md) — are complete: every token in `src/theme/`
> is here at its measured value, and six checks re-prove them on every push.

> **On how far it goes.** The handover document's own opening still said four
> component families and one live specimen. Its later section — the table
> below, dated 9 November — says all 29 and nothing left on the checklist.
> The two disagreed inside one file; the dated one is carried here, and the
> count has since grown again: 29 documented, 20 with a live example.

## What a handover should contain

The shape of this document was checked against current practice rather than
invented. The November check was redone against the published systems
themselves rather than against blogs about them, and it changed the answer:
the earlier version of this section listed what a handover should contain and
did not say which of it this file actually has. Both columns are below.

| What the published systems do | Here |
|---|---|
| **Tokens** with their values, in named tiers | [A2](../foundations/tokens/index.md), [B1](../foundations/color/index.md)–[B6](../foundations/motion.md). Three tiers — ramp, role, component — the same model as Material 3's palette → role → component, and compatible with the W3C token format |
| **Accessibility** with the thresholds named | [E1](../foundations/accessibility.md), and **measured** per token pair rather than asserted. Carbon names the same thresholds but publishes no per-token values; GOV.UK names them inside one component |
| **Responsive** with the breakpoints stated | [B7](../foundations/grid.md#responsive) — all eleven, shell and component, since 1.2 |
| **Motion** with duration, easing, reduced-motion | [B6](../foundations/motion.md) |
| **Governance** — ownership, contribution, versioning | [F2](../develop.md), [F3](../release-phases.md) |
| **Component specs**: when to use · when **not** to · anatomy · variants × states · content · behaviour · accessibility · code · do and don't | **All 29**, in [`docs/components/`](../components/button.md), to that shape. [D1](../components/button.md)–[D4](../components/dialog.md) remain as the older, thinner prose |
| **Patterns** — form, filter, destructive action, notification, page template | **Eight**, in [`docs/patterns/`](../patterns/record-form.md) |
| **A lifecycle status** per component — trial · stable · deprecated | **On every page**, GOV.UK's three. Four are `trial`, each for a stated reason: file drop, rich text, support ticket, chip |
| **A changelog** per component | **On every page**, as a *Recent changes* table with dates. [F3](../release-phases.md) still holds the versioning policy |
| **Layout grid** as a foundation | [B8](../foundations/grid.md#layout) — the container ladder, the one idiom and its sixteen minimums, measured by `grid:check` |

**Nothing on the checklist is left**, as of 9 November.
`docs/chuan-design-system.md` carries the comparison in full, the component
template these 29 pages were written against, and the triage that ordered
them.

> The layout grid was last on the list on the argument that it is the least
> useful of the three until the screens stop changing shape. Writing it found
> the opposite: two of the four page shapes had no declared width at all, and
> the content box **loses 112px** at one breakpoint while the window gains
> 100. Both had been true since the shell was built, and neither was visible
> without measuring every width.

Every source also names the one failure mode this file is most exposed to:
documentation drifting away from the live code once the team moves on. That is
why [F3](../release-phases.md) makes the specimen page the tie-breaker rather than
this document, and why the numbers above are re-proved by
[`contrast:check`](../foundations/accessibility.md) rather than restated.

Read directly, 8 November 2026:
[Carbon — Button usage](https://carbondesignsystem.com/components/button/usage/) ·
[Carbon — Accessibility: colour](https://carbondesignsystem.com/guidelines/accessibility/color/) ·
[Atlassian — Foundations](https://atlassian.design/foundations) ·
[Atlassian — Button](https://atlassian.design/components/button/examples) ·
[GOV.UK — Button](https://design-system.service.gov.uk/components/button/) ·
[GOV.UK — Component lifecycle statuses](https://design-system.service.gov.uk/community/component-lifecycle-statuses/) ·
[W3C Design Tokens format (draft)](https://www.designtokens.org/tr/drafts/format/) ·
[Material 3 — Colour roles](https://m3.material.io/styles/color/roles).
The W3C format is a draft that says not to implement it yet; the rest are
each one organisation's practice, not a standard. They agree on the shape and
differ on depth.
## File map

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
| `src/ui/RocketLaunch.tsx` | The illustration, all three states |
| `/design-system` | The living specimen page |
| `docs/assets/design-system/` | The images in this document |
## Source index

| Document | What it settles |
|---|---|
| [`contrast-sweep.md`](../contrast-sweep.md) | Every measured contrast ratio, and the method |
| [`vien-control-08nov.md`](../vien-control-08nov.md) | The seven mis-picked control boundaries, and the sweep that found them |
| [`vien-state-09nov.md`](../vien-state-09nov.md) | Hover and focus boundaries, and how a state is measured without a mouse |
| [`focus-order.md`](../focus-order.md) | Keyboard order and the focus ring |
| [`modal-patterns.md`](../modal-patterns.md) | Dialog sizes, action placement, dismissal |
| [`table-patterns.md`](../table-patterns.md) | Grid behaviour, column roles, density |
| [`motion-loading.md`](../motion-loading.md) | Every loading and transition decision |
| [`kendo-control-scale-18oct.md`](../kendo-control-scale-18oct.md) | The 33-rule Kendo size audit |
| [`working-agreement.md`](../working-agreement.md) | Engineering rules, including the magic-number exceptions |
