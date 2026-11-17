# App shell

**Ours**: it imports neither KendoReact nor Radix. Production is KendoReact.

<!-- ds:tab examples -->

<!-- ds:specimen app-shell -->

**The example is the narrow shell, and deliberately so.** A specimen frame
here is about 560px; the rail collapses to icons below 1180px and goes
off-canvas below 820px, so what fits in the frame is the narrow state.

A scaled copy was tried and does not work, which is worth recording because it
looks like it should: rendering the shell in a 1280px box and scaling it down
puts the right pixels on screen and leaves the rail off-canvas anyway. The
breakpoints are `@media` queries and those read the **viewport**, not the box
the element sits in. The scale applied at 0.39 and the sidebar stayed
translated -248px.

**For the full-width rail, open the product itself** — it is the same build,
one origin over, and every screen in it is wearing this component.

<!-- ds:tab usage -->

## When to use

It wraps **every routed screen**: sidebar, top bar and `<Outlet />`. A screen
does not render it; the router does.

## When not to use

| Instead of the shell | Use | Why |
|---|---|---|
| A page that must not carry the nav | None is documented | The shell has no props. Nothing in `AppShell.tsx` turns the sidebar off |
| A breadcrumb for orientation | The record's own "← Quotations" control | The breadcrumb was removed after the 25 Aug review: it restated a group name, the page title and a raw record id |

## What it is made of

| Region | Holds |
|---|---|
| **Skip link** | `Skip to content`, first in the DOM, targets `#vy-main` |
| **Sidebar** `aside.vy-sidebar` | Brand (V mark, **VOYAGER IQ**, Linh Long Engineering), `liveNav` groups, **About this prototype** (`reviewPages`, decision D7), and the collapse control |
| **Top bar** | Nav toggle (phones), ⌘K search button, clock, timezone and language pickers, queue bell, notifications, user menu |
| **Content** `main#vy-main` | `ErrorBoundary` around the `Outlet`, keyed on `pathname` |
| **Palette** | [Command palette](command-palette.md), mounted once |

The boundary wraps the outlet, not the shell, so a screen that throws keeps the
navigation needed to leave it, and the key resets it on the next route.

## How it takes width

[Grid](../foundations/grid.md) measures this and states it as an identity:
**rail + gutters + content = viewport.** The 248px sidebar becomes a 56px icon
rail at ≤ 1180px and leaves the flow at ≤ 820px, behind a menu button. Crossing
1180 upward, the content box *shrinks* by 112px (1096 → 984); that is the only
negative step, and it is declared rather than fixed.

## How it behaves

- **Collapsed is one derived value:** `collapsed || dialogOpen`. A dialog forces
  the rail closed; the user's own choice returns when it closes.
- **One group open at a time**, because the fully expanded nav measured 1352px in
  a 628px rail at 1024×768. Collapsed, every group is open and headers are hidden.
  A closed group holding the current screen shows a dot.
- **Navigation closes the drawer and opens the route's group,** during render
  rather than in two effects. The effects painted one frame of stale state.
- **⌘K / Ctrl+K toggles the palette,** from a `window` listener.
- **Timezone and language persist per browser** (`vy.tz`, `vy.lang`); the file says
  a real build would read them from the user record.
- **Badge counts what is late and mine,** not total workload: a permanently lit
  badge stops being read.

## Accessibility

| | |
|---|---|
| Landmarks | `aside`, `nav`, `header`, and `main` with `tabIndex={-1}` so the skip link can land on it |
| Collapse | `aria-pressed` follows the derived state; `aria-label` follows only the user's own choice. While a dialog forces the rail shut, the label says "Collapse sidebar" and the tooltip says "Expand sidebar" |
| Nav toggle | `aria-expanded`, but the label is always "Open navigation" |
| Rail | Collapsed items carry `title` only, `Group › Item`; the label is not rendered |

<!-- ds:tab code -->

## API

`<AppShell />` takes no props. State lives in the component; the nav comes from
`liveNav` and `reviewPages` in `src/data/sitemap`.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | Live examples, and the four-tab layout every other component already had |
| 15 Nov 2026 | This page |
