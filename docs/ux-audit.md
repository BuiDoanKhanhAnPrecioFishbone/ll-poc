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

**Compact stays tight on touch; Comfortable and Relaxed take the 44px floor.**
The floor is guidance, not conformance — WCAG 2.5.8 AA asks 24×24 — and someone
who picks Compact has asked for the most rows on screen and is the last person
who wants each one grown by 16px. So Compact is exempt from 44 and held to its
own floor instead.

| on a phone | row | checkbox target | rows per 812px screen |
|---|---|---|---|
| Compact | 32px | 44×28 | ~25 |
| Comfortable (default) | 56px | 44×44 | ~14 |

Compact is 32px on a phone against 24px on a desktop, so it is not quite
desktop parity. That 8px is the conformance margin, and it was bought for a
reason — see below.

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

### Compact on touch, 12 Sep 2026 — and what a green tick hid

Exempting Compact from the 44px floor was one line. Verifying it found the
problem.

With no floor at all a Compact row on a phone rendered **24px tall with a 44×20
checkbox**. The sweep passed it, correctly: WCAG 2.5.8 allows an undersized
target when a 24px circle centred on it touches no other, and the rows were
**exactly 24px between centres**. Conformant — by zero pixels. Any later change
to line height, cell padding or font size would have turned it into a failure,
and nothing would have said so.

So Compact now has its own floor: `--vy-row-h-compact`, 28px, a token that had
been declared since the density work and never used. At 28 the targets clear
24×24 **on size**, so conformance no longer rests on the spacing exception at
all. The measured result is a 32px row — 4px of real margin instead of none —
and still half of Comfortable's 56.

**Two things changed in the sweep because of this**, both because the first
version could not have caught it:

1. It now runs a **second pass at Compact density** over the six grid routes,
   setting the preference in localStorage and reloading — the same path a user
   takes — and asserting the page actually rendered Compact, so a pass that
   silently ran at the default cannot report the default's numbers as Compact's.
2. It **prints the margin** rather than a verdict: `smallest target 28px,
   closest centres 28px (AA needs 24)`, and says in words whether conformance
   rests on size or on the spacing exception. "It passes" and "it passes by
   nothing" looked identical before; they cannot now.

If you want true desktop parity — 24px rows on a phone too — that is available,
but it puts the targets back to 20px and conformance back onto the spacing
exception with no margin. Worth doing deliberately, not by accident.

## The system on a phone, swept 12 Sep 2026

`npm run mobile:check` — 12 routes at 375×812 with touch emulation. This is the
half `touch:check` does not cover: not "can I hit it" but "can I see it, and
does it fit".

**No defects.** No route scrolls sideways, nothing paints off the edge, no text
is cut off without an ellipsis, and the viewport meta is right everywhere.
Checked by hand on top of that: all three grid dialogs (New Part, AML Search,
Import) go full-screen at 375×812 and fit exactly, and the nav drawer opens and
closes correctly.

**Small text: 126 instances under 12px on customer screens, 266 more on the two
internal reference pages — now zero.** See below.

### Three ways the check lied before it told the truth

Worth recording, because each one looked like a real finding:

1. **91 escapes, none real.** The check compared against `innerWidth`. Under
   device emulation the visual viewport GROWS to cover whatever overflows —
   inject something 60px too wide and `innerWidth` goes 375 → 435 — so every
   comparison passes by definition. The self-test caught it on the first run:
   the injected fault came back undetected while the other two were found.
   `documentElement.clientWidth` stays at 375.
2. **Then 91 escapes again, still none real.** With the width fixed, it reported
   what MEASURES outside rather than what PAINTS outside: Kendo grid columns at
   x=1400 inside a header that clips at 375, the nav drawer parked off-canvas,
   and 38 `<col>` elements that paint nothing at all. It now intersects each
   element with every clipping ancestor.
3. **Both "cut off" findings were `.vy-sr-only`** — a 1px box clipping text on
   purpose, which is the entire point of the pattern.

### And one that nearly became a bug report

Mid-audit the mobile nav drawer appeared to be broken: `data-nav-open="true"`,
the scrim rendered, and the sidebar stayed at `translateX(-248px)` — unmovable
by a stylesheet, by toggling the attribute, or by inline `transform: none
!important`, which should beat everything.

It was the harness. The preview pane was hidden, so the page had stopped
compositing: `visibilityState: "hidden"`, zero rAF frames in 1.3 seconds,
`document.timeline.currentTime` stuck at 0. The drawer's CSS transition was
therefore frozen at `currentTime: 0`, pinned to its start value — and **a
running transition sits above important declarations in the cascade**, so
nothing could override it. Disabling the transition showed the drawer working
exactly as written: closed −248, open 0.

The probe now switches off transitions and animations before measuring, so
every number it reports is a property of the CSS rather than of the frame it
was caught on. Add it to the list of harness traps alongside `innerText`
returning `''` and `elementFromPoint` returning null while the pane is hidden.

## The type scale on touch, 12 Sep 2026

Shifted, not floored. **Nothing on any screen is under 12px on a phone**, and a
desktop is untouched.

| token | desktop | touch |
|---|---|---|
| 2xs | 10 | 12 |
| xs | 11 | 13 |
| sm | 12 | 14 |
| base | 13 | 15 |
| md | 14 | 16 |
| lg | 16 | 18 |

A floor would have collapsed the scale: clamping everything to 12 makes `2xs`,
`xs` and `sm` one size and throws away the hierarchy the scale exists to carry —
the bottom of this scale steps in single pixels, so 10, 11 and 12 are barely
three sizes at all. A constant +2 across the body range keeps every relationship
exactly as it is and lifts the smallest step to 12. `xl` and up do not move:
they are already 20px or more, and growing a heading on a 375px screen buys
nothing and costs a wrap. Stopping at `lg` also preserves the gap to `xl` —
without lifting `lg`, `md` and `lg` would both be 16.

### What it exposed: the list was the thing being squeezed

Bigger type made a pre-existing defect impossible to miss. `.vy-grid-k` is
`flex: 1; min-height: 0`, so it takes whatever is left after the page head, the
KPI tiles, the toolbar and the pager. On a desktop that is most of the screen.
On a 375×812 phone, measured:

| | toolbar | pager | grid content | rows visible |
|---|---|---|---|---|
| old type scale | 187px | 129px | 72px | 0 of a 56px row |
| new type scale | 187px | 161px | 28px | 0 |
| with the floor | 187px | 161px | 345px | **6** |

A list screen whose list is the first thing to disappear has its priorities
backwards, and it was already backwards before the type changed — 72px is one
row that does not fit either. `.vy-content` already scrolls, so the grid now
claims `min-block-size: 50vh` and the page scrolls past it: about six rows on a
tall phone, four on a short one.

**The floor goes on the grid, not on the shell.** Putting it on
`.vy-grid-shell` did nothing at all — the shell also holds the toolbar and the
pager, so a 440px shell still left the grid 89px and the rows 28. Worth knowing
before anyone moves it.

The toolbar and pager were trimmed on 12 Sep — see below.

## Toolbar and pager on a phone, 12 Sep 2026

**348px of chrome above the list, down to 258.** Both were three rows; both are
two. Nothing is hidden and nothing is renamed — every control keeps its label,
its count and its purpose (`docs/precedence.md` tier 2: layout may be
redesigned, content and purpose may not). A desktop is untouched: toolbar 66px,
pager 54px, original order.

| at 375px | before | after |
|---|---|---|
| toolbar | 187px, 3 rows | 131px, 2 rows |
| pager | 161px, 3 rows | 127px, 2 rows |

The third row in both cases came from `.vy-toolbar-spacer`, a flex-grow spacer
whose only job is pushing two groups apart on **one** line. Once the container
wraps it separates nothing and just occupies a slot, shoving the next control
over. app.css already said so — *"the spacer only earns its keep on one line"* —
and then left it in; below 820px that line never exists.

### Three things that had to be measured, not reasoned

Each looked settled and wasn't:

1. **`flex: 1 1 auto` on the view picker made it greedy.** With an auto basis it
   is measured at its content width, 257px, and flexbox wraps a line before
   shrinking an item below that — so the picker *grew* into the space and pushed
   the second icon button and Columns onto a third row, which is the fault the
   rule existed to remove.
2. **A zero basis then went too far.** At `flex: 1 1 0` the picker contributed
   nothing to the line measurement, got pulled onto the search's row, and left
   the icon buttons on a row of their own again. 140px is the basis that packs
   correctly.
3. **Four controls do not fit on one row at 313px.** With all of them together
   the picker was left 109px and rendered the active view as `Def…` — a picker
   that cannot show what is picked, which is worse than a second row. Columns
   moved up to the search's row; the picker now has 201px and reads `Default`.

### And two figures that differ per screen

Both were found by checking a second screen rather than assuming the first
generalised:

- **The search basis is 160px, not 200.** At 200 the search fitted beside
  `Columns` (80px) on Manufacturer Part Numbers but not beside `Columns (8/14)`
  (126px) on Part Master, where the count makes the label half as wide again —
  so that screen went back to three rows while the other had two.
- **The pager needed 4px off each side and 2px off its gap.** `1 - 20 of 600
  items` fits beside the page-size control at standard spacing; `1 - 20 of 2,000
  items` was six pixels over.

`ColumnChooser` gained a `vy-columns-btn` class. It is a layout hook, not a
style — there was nothing to select the button by.

## Page actions on a phone, 12 Sep 2026

**96px to 48px** on Part Master, the only screen with four of them. One
scrolling row instead of two wrapped ones, primary first.

Four buttons — Import, AML Search, Export Part Master Data, New Part — measure
438px of labels plus gaps against 347px of screen, so one row showing every
label is arithmetically impossible. The two options that would have fixed the
width were both refused: shortening *"Export Part Master Data"* is a content
change and not ours to make (`docs/precedence.md` tier 2), and hiding the
overflow behind a *"More"* menu needs the `actions` slot to be a list rather
than an opaque `ReactNode` — a change to every caller, for 52px.

So the row scrolls, and that makes **order** matter, because whatever sits off
to the right needs a swipe. The primary action leads, so the thing most people
came to do is always on screen, and the buttons after it are cut mid-width
rather than ending neatly — the peek is the affordance. No fade: a mask over the
right edge would dim the label of whichever button happened to be there.

**The trade, plainly:** four actions visible at once for 96px, against the
primary plus a peek for 48px. On a phone the list is what the screen is for. If
you would rather see all four, deleting the rule restores the two rows.

It only engages where it is needed: BoM (`Upload BoM`, `BoM Comparison`) and
Quotations (`Add New`, `Export`) have two actions that already fit, so they do
not scroll and nothing truncates — checked rather than assumed.

`.vy-page-actions .k-button-primary` is safe to reorder against because
`Button.tsx` puts one `filled` per view by the MD3 variant ladder.

### A tidy-up the checks asked for

`css:orphans` reported `.vy-login-sso` defined in both components.css and
app.css — *"later file wins, silently"*. That was mine, from raising the SSO
button to 44px on the login screen. Both declarations applied because they set
different properties, so nothing was broken, but a class split across two files
is how one half quietly stops mattering later. Merged into components.css beside
the rule it belongs with; the button still measures 44×335.