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

---

## Touch targets, swept 12 Sep 2026

`npm run touch:check` — `scripts/touch-targets.mjs`, 12 routes at 375×812 with
touch emulation, overlays opened so their contents are measured.

**No WCAG 2.5.8 AA failure.** Nothing is under 24×24 without the 24px spacing
that the criterion accepts in its place. The grid's row checkbox is 20×20, which
would fail on its own; its rows are 33px apart, which is what rescues it. That
is worth knowing before anyone makes the grid denser — Compact density is a
customer-facing preference, and it is the thing standing between this sweep and
a conformance failure.

**59 controls are under 44×44**, the size Apple and Material converge on for a
finger. Split evenly between ours and Kendo's: 29 `vy-`, 29 `k-`.

The useful finding is the shape of it, not the count:

| | controls |
|---|---|
| too short only | 43 |
| too short and too narrow | 16 |
| too narrow only | **0** |

Not one control in this app is too narrow. Heights cluster hard — 21 sit at
29px (the standard button), 15 at 24–25px (pager pages, text links, the page-size
select), 8 at 33–35px (Kendo inputs and comboboxes). The 16 that fail both
dimensions are the square ones: the topbar icons at 25–26, the avatar and the
funnel at 28, the row checkbox at 20.

So this is one decision about height, taken once, not fifty-nine fixes.

### What is NOT decided here

Raising these on the desktop would undo the density this system was asked for.
The obvious move is `@media (pointer: coarse)` — a floor applied only where
there is a finger, leaving the mouse layout untouched. Two reasons it is not
done in the same commit as the sweep:

1. It collides with **row density**. Lifting the row checkbox to 44 sets a floor
   under row height, and Compact is a preference the customer chose. Whether
   Compact stays compact on a phone is theirs to answer, not ours.
2. Half the list is **Kendo's own controls**. Overriding a vendor's internals is
   the thing this project has been careful about all along, and `.k-checkbox`,
   `.k-button` and the pager are all theirs.

Sign out was raised to 44 on 12 Sep because it was the one control that broke
its own menu's rhythm — every other row there is 50px. That was a local
inconsistency, not this decision.

### Login, fixed 12 Sep 2026

Six controls, all now 44: Sign In (was 40 — the primary action on the page, four
pixels short), Sign in with Microsoft (29, Kendo's default height, on the path
most staff will take), Remember me (24), Forgot Password?, Privacy Notice and
Term of service (24).

Taken unconditionally rather than behind `pointer: coarse`. The density
trade-off that holds up the decision above is real on a grid and absent here:
this is one centred form with room to spare, a larger click target costs a mouse
nothing, and it is the screen most likely to be opened on a phone.

The three text-style buttons grew their HIT AREA and not their appearance —
padding to 44, an equal negative margin returning the space to the layout. Type
size and vertical rhythm are unchanged; the alternative was a 44px slab under
three short phrases. Verified afterwards that no two hit areas overlap and each
still hit-tests to itself: 12px of clearance remains between the Remember-me row
and Sign In, 19px between the two legal links.

`.vy-check` stays 24px everywhere else. It sits in every grid row on every list
screen, which is exactly where 44 would set a floor under row height and collide
with Compact.

### A correction to the sweep itself

The first run reported the login's text fields at 335x37. They are not a defect:
`TextField` wraps its input in a `<label>`, so tapping the label text focuses the
field and the real target is taller than 44. The sweep was measuring the painted
box instead of the area that activates the control, and it now takes the union of
a control and its associated label — wrapping or `label[for]`.

That also moved the Remember-me checkbox from 20x20 to 117x24: still short, but
short by 20px rather than 24, and for a different reason than first reported. The
self-test gained a fixture for it — a 20px box inside a 44px label, which must
come back MISSED while the three planted failures are still caught.


### The rest of the app, 12 Sep 2026

Done, behind `@media (pointer: coarse)`. **55 controls under 44 → 2. No AA
failure. No overlapping targets. A desktop is untouched** — the same controls
measured at 1440 before and after are identical to the pixel: avatar 28×28,
funnel 28×28, pager page 24×24, Kendo button 58×29, cell link 239×29, row 32.

Ours are in responsive.css, Kendo's in kendo-bridge.css, which is where styling
their classes is permitted. Nothing maps: Kendo publishes 453 custom properties
and not one sizes a button or a checkbox, so that section sets properties rather
than remapping them.

**On touch the three row densities converge.** A 44px floor is taller than
Compact (28) and Comfortable (36); Relaxed is already 44. The preference still
does exactly what it says on a desktop, which is where it is set. This is the
consequence of the decision, stated rather than buried.

#### The select column, closed 12 Sep 2026

**Every target in the app is now at least 44×44 on touch. FAIL 0, THIN 0,
overlaps 0.**

The last two were the grid's select column at 40px wide. The fix is not CSS:
Kendo writes column widths into a colgroup from a prop, so a media query cannot
reach them, and an earlier attempt to raise the cell from CSS only made it
overflow the column it was not allowed to resize — four overlapping pairs.

So the width follows the pointer in React instead, via a new `useMediaQuery`
hook reading `(pointer: coarse)`. 40 for a cursor, 44 for a finger. It uses
`useSyncExternalStore` rather than an effect so the value is right during the
first render; an effect would paint the desktop width and then correct it, which
on a grid is every column visibly shifting on load.

This keeps a documented decision intact rather than overruling it. The constant
carried the note that the checkbox track is narrow because *"it holds one control
whose size never changes, so a role width would only make it wider than its
content"*. That is true of a cursor and false of a finger — the box is the same
20px either way, but the target is not. A blunt 40 → 44 would have made the
track wider than its content on every desktop, which is exactly what that note
rules out.

Verified in both modes: touch gives header 44 and body 44×56 with zero column
drift; desktop still reports 40×32, row height 32, avatar 28×28 — unchanged.

#### What the sweep got wrong, twice, while doing this

Both found by the checks rather than by eye, and both would have shipped:

1. **`.vy-back` overlapped the smart buttons by 982px².** Its hit area was grown
   with padding and a negative margin — the login technique — and on the RFQ
   page that put it on top of the row below. Invisible on screen; a tap near the
   seam would have opened the wrong thing. It takes real space now.
2. **The overlap check itself reported two collisions that no finger could
   produce**, between a grid's last row and the pager. A row clipped by the
   grid's `overflow: hidden` still reports its whole box. The check now
   intersects with every clipping ancestor.

Fixing (2) then broke the size tier — 1 finding became 11, all rows at a grid's
edge measured at their clipped height. Size and overlap want different boxes:
overlap uses the clipped box, because a hidden half cannot be mis-tapped; size
uses the full box and skips anything more than 10% clipped, because a row
scrolled half out of view is not an undersized control.

The self-test now carries eight fixtures: two that must FAIL, one THIN, one
label-wrapped box that must be MISSED, a deliberate overlap that must be caught,
and a half-clipped pair that must not be.