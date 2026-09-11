# UX audit — Voyager Cloud ERP

**System:** `erp.linhlongengineering.com` · React + Vite + KendoReact on an Azure .NET backend
**Date:** 19 August 2026
**Method:** authenticated walkthrough with DOM instrumentation (column widths, clip and empty
ratios measured from the rendered grid) plus analysis of the `/api/account/get/menus` payload and
the published Vite manifest.

The machine-readable version — with effort and value ratings per finding — is
[`src/data/findings.ts`](../src/data/findings.ts), rendered on the **UX Audit** page.

## Summary

17 findings. **7 are low-effort / high-value** and could ship independently of the wider revamp:
T1, T2, T3, N2, N3, C1, C3.

| Area | Findings | Headline |
| --- | --- | --- |
| Tables | 5 | Uniform 108px columns clip the primary identifier in 85% of rows |
| Navigation | 6 | All 51 destinations behind a hamburger, with no breadcrumb |
| Content | 3 | One screen has three different names; demo data is live on the dashboard |
| Layout | 1 | The header collapses into itself below ~1000px |
| System | 2 | i18n keys and icons are stubbed for all 51 menu nodes |

## The learning-curve argument

The brief calls for drastically reducing the learning curve. Four findings account for most of it:

1. **N1 — nothing is visible.** Navigation is a collapsed drawer, so a user can only ever see one
   part of the structure. There is no way to build a mental model of a system you cannot see.
2. **N2 — labels do not discriminate.** "Configuration" appears five times, "Reporting" three.
   The user must already know the structure to disambiguate them, which is exactly what a newcomer
   does not have.
3. **C1 — names are not stable.** Nav, page heading, browser title and URL disagree on what a
   screen is called, so training material and the UI diverge immediately.
4. **N3 — the URL lies.** Seven screens resolve into a module they do not belong to, so the one
   piece of orientation a user could rely on contradicts the menu.

The proposal addresses these with a persistent sidebar, a breadcrumb, deduplicated labels, and
⌘K search that matches on the **former** name — so retraining is additive rather than a reset.

## Quick wins, in the order I would take them

| # | Finding | Effort | Why first |
| --- | --- | --- | --- |
| 1 | C3 — remove the "World Population" demo chart | Hours | It is on the login landing page of a production system |
| 2 | T1 — per-column widths | 1–2 days | Fixes the single most damaging defect; no data model change |
| 3 | T2 — hide empty columns | Hours | Frees ~25% of grid width; pairs with T1 |
| 4 | T3 — density and header hierarchy | 1–2 days | Roughly 60% more rows per screen |
| 5 | C1 — one name per screen | 1–2 days | Content-only; unblocks documentation and training |
| 6 | N2 — consolidate Configuration and Reporting | ~1 week | Removes 6 of 51 nav entries |
| 7 | N3 — align routes, redirect the old ones | ~1 week | Makes URLs trustworthy; old bookmarks keep working |

## Not examined

RMA, PCB Viewer, the Accounting module, What-If, and the BoM import wizard were not opened in
depth. The record/detail pattern was only partially observed. A second pass should cover the
create-and-edit flows, which is where a standardised form pattern would matter most.

---

# Responsive and accessibility check — the three new packages, 31 Aug 2026

Create New Part, Create the new BoM and MFG–MPN (AML) were verified for
*behaviour* as they were built, and never checked at narrow widths or for
assistive technology. They are the densest surfaces in the app — a 31-field
form, an 11-column AML table, a 9-column stock report, and dialogs nested three
deep — so this closes that gap.

**Nothing had to be fixed.** That is the finding, and it is worth writing down
rather than leaving as an assumption nobody tested.

## Responsive, at 375 × 812

| Surface | Result |
|---|---|
| Part Master list | page does not scroll sideways (375 vs 375) |
| Add Part Master Detail | dialog 360w inside 375, no element past the right edge |
| Create BoM step 1 | dialog 360w; the config grid collapses to **one** column |
| MPN Mapping table | 1690px wide and scrolls **inside its own** `overflow-x: auto` — the page and the dialog both stay put |

The table result is the one that mattered. Eleven fixed-width columns cannot fit
375px and should not try; the requirement is that the *page* never scrolls
sideways, and it does not.

## Accessibility

| Surface | Interactive controls | Without an accessible name |
|---|---|---|
| Add Part Master Detail | 41 | 0 |
| — its Quantity Info tab | 37 | 0 |
| Create BoM | 19 | 0 |
| Stock Report | 13 | 0 |
| MPN Mapping detail | 9 | 0 |
| Add MPN Mapping | 10 | 0 |

**One false positive, checked rather than counted.** The audit first flagged
three unnamed `.vy-select-caret` buttons on Create BoM — and that control is
inside the shared `Select`, so a real defect there would have affected every
dropdown in the app. It carries `tabindex="-1"` and `aria-hidden="true"`: not a
tab stop, not announced, correctly decorative.

**Dialogs nested three deep** — Part record → Stock Report → Update Quantity —
move focus into the top dialog on open.

~~and Escape closes only the innermost. That is the hardest case in the new work
and it behaves.~~ **WRONG, corrected 6 Sep 2026.** One Escape from inside the
innermost closes **all three**: Kendo handles the key with a React `onKeyDown`,
and React propagates through the React tree rather than the DOM, so a portalled
child's keydown runs its parents' handlers too. Measured in
`docs/modal-patterns.md`, which carries the mechanism and the fix that is owed.

The claim was reached by pressing Escape once with three dialogs open — which
does close the innermost, and also everything behind it. The observation
recorded the half it was looking for. A dismissal check has to count what is
left on screen, not confirm that the top one went.

## Not examined here

Colour contrast on the new surfaces was not re-measured; the tokens they use
were measured when they were set. Keyboard traversal was checked for focus
containment, not for tab ORDER within each dialog — **closed 5 Sep**: dialogs run
column by column, matching their headings, with no group left and returned to.
See `docs/focus-order.md`.

---

# Responsive and accessibility check — the six surfaces added since 8 Sep, 11 Sep 2026

Manufacturers, Part Numbers (MPN), Packing Lists, the two new RFQ record
actions and the redesigned Login were built and verified for behaviour, and
never checked at narrow widths, in dark, or for assistive technology. Same
method as the 31 August pass.

**Nothing had to be fixed.** Two things had to be *corrected in the check*,
which is the part worth writing down.

## Responsive, at 375 × 812

| Surface | Result |
|---|---|
| Manufacturers | page does not scroll sideways (375 vs 375); grid scrolls inside its own box, 1478 → 345 |
| Part Numbers (MPN) | same; 1726 → 345 |
| Packing Lists | same; 1310 → 345 |
| Login | no sideways scroll; the scope list correctly drops out below 860px, brand mark stays |
| Cancel RFQ dialog | 360w inside 375, fully within the viewport |

The sidebar is `position: fixed` at `x: -248` on a phone — off-canvas, with
`main` taking the full 375. That is correct, and it is what first made seven
correctly-labelled nav links look unnamed.

## Accessibility

| Surface | Interactive controls | Without an accessible name |
|---|---|---|
| Manufacturers | 60 | 0 |
| Part Numbers (MPN) | 65 | 0 |
| Packing Lists | 64 | 0 |
| Login | 8 | 0 |
| Cancel RFQ dialog | all | 0 |

## Contrast, in dark

| Surface | Text nodes checked | Failures |
|---|---|---|
| Manufacturers | 120 | 0 |
| Part Numbers (MPN) | 111 | 0 |
| Packing Lists | 83 | 0 |
| Login | 12 | 0 (brand panel floor 5.96:1) |

The sweep was given a positive control — a low-contrast colour injected into
`.vy-truncate` — and reported 65 failures at 1.58:1, then returned to 0 when it
was removed. A sweep that has never been seen to fail is not evidence.

## Two checks that were wrong before the code was

**`innerText` returns `''` while the browser pane is hidden**, so the first
accessible-name pass reported eight unnamed controls — seven sidebar links and
the search button, all of which carry text. `textContent` does not depend on
rendering and is the right tool for this.

**`color(srgb r g b)` components are already gamma-encoded.** The first contrast
sweep re-applied the sRGB transfer function to them and reported 40 failures at
1.09:1 — which is not a contrast result, it is a parser comparing a colour with
itself. The same bug produced a wrong underline measurement earlier in the same
week. Alpha is now composited rather than skipped, so an 11% row stripe is read
as the surface it actually is.
