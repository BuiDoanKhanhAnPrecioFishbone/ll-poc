# Radix → Kendo: what a swap would actually involve

**4 September 2026.** Adoption of KendoReact is settled (open question 2). This
scopes the question that answer did *not* settle: **does Kendo replace the
primitives Radix currently owns?**

Written to be decided from, not to justify a conclusion reached in advance. The
recommendation at the bottom is "some of them", and the reasoning per component
is more useful than the verdict.

## The standard this is judged against

The customer's reason for choosing Kendo governs here too: *the system they run
today is Kendo, so the revamp should read as the same product improved rather
than as a different one.* So the test for each primitive is **not** "is Kendo's
version better" — it is:

1. **Does the live system demonstrably use the Kendo equivalent?** If it does,
   ours is a visual difference the customer did not ask for.
2. **Does swapping cost behaviour or accessibility we already built and proved?**
3. **Is the risk contained**, or does it re-open work that was hard to get right?

A swap that fails (2) or (3) needs a better reason than symmetry.

## Inventory

Radix is unusually well contained: seven of the nine primitives live in one
file, `src/ui/Overlays.tsx` (320 lines). Only Popover leaks outward.

| Ours | Radix package | Call sites | Live system evidence |
|---|---|---|---|
| `Dialog` | `react-dialog` | **22** in 13 files | `KendoReactDialog`, `k-window` ×5, `k-dialog` ×4 |
| `Select` | *(on Popover)* | **37** in 14 files | `KendoReactDropDownList` filterable; ComboBox with `allowCustom` |
| `Tabs` | `react-tabs` | **6** in 6 files | `k-tabstrip` ×12 |
| `RadioGroup` | `react-radio-group` | **7** in 5 files | *(none found — `k-switch` ×4 exists)* |
| `Checkbox` | `react-checkbox` | **6** in 5 files | `k-checkbox` ×1 |
| `Toast` | `react-toast` | **29** calls | `k-notification` ×1 |
| menus / pickers | `react-popover` | 4 files | `k-menu` ×8 |
| `Progress` | `react-progress` | **0** | — |
| `SegmentedControl` | `react-toggle-group` | **0** | — |
| `Button asChild` | `react-slot` | 1 | *n/a — not a UI component* |

Counts are JSX usages measured with a word boundary; the first attempt undercounted
`Dialog` as 1 because most call sites break the line after the tag.

## Found while scoping — worth doing whatever is decided

These are not arguments for or against the swap. They are defects and dead
weight that scoping turned up, and three of them are one-line fixes.

**1. Two Radix packages are installed and never imported.**
`@radix-ui/react-select` and `@radix-ui/react-tooltip`. Exactly the situation
TanStack was in before it was removed — an unused dependency nobody can explain
later is a liability rather than an option.

**2. Two exported components have zero call sites.** `Progress` and
`SegmentedControl` in `Overlays.tsx`. Deleting them also retires
`react-progress` and `react-toggle-group`, so **four of the eleven Radix
packages carry no user-visible behaviour at all.** That is worth knowing before
anyone estimates "migrating Radix" — a third of it is already dead.

**3. The app has THREE different checkboxes.** This one is a real, visible
defect and it is not what I expected to find:

| Where | What renders |
|---|---|
| Form fields | `<Checkbox>` — Radix, `.vy-check` |
| ViewSetting, ChecklistsTab | `.vy-check-input` — styled native |
| **Grid selection column, ColumnChooser** | **bare `<input type="checkbox">`, no class** |

`DataGrid.tsx:377` and `:403` and `ColumnChooser.tsx:46` render an unstyled
native checkbox, and no CSS rule in the theme targets one. So the 21 checkboxes
down the left of every grid are **browser defaults** sitting beside our own
styled ones. I had assumed the grid was rendering Kendo's checkbox; measuring
showed `.k-checkbox` count is zero and the inputs carry no class at all.

This is the strongest single argument in the document for adopting Kendo's
Checkbox — not because Radix's is bad, but because the most-seen checkbox in the
app is currently styled by nobody.

## Per component

### Swap — evidence is clear and risk is low

**`Tabs` → Kendo TabStrip.** `k-tabstrip` ×12 is the second-highest marker count
in the live sweep, so this is a control the customer sees constantly in their own
system. Six call sites, all passing a simple `{value, label, content}` array
through our own wrapper, so the blast radius is one file. Our `Tabs` has no
bespoke behaviour worth preserving.

**`Checkbox` → Kendo Checkbox.** Six call sites, and it lets the three
treatments above collapse into one. Do this *with* the bare-input fix rather
than separately, or the grid keeps its browser defaults and the inconsistency
survives the migration that was supposed to end it.

### Swap, but carefully — these carry work that was hard to get right

**`Dialog` → Kendo Dialog/Window.** Highest parity value (`k-window` ×5,
`k-dialog` ×4) and the highest risk in this document, for one reason:
**layering.** The z-index scale in `tokens.css` was built to fix a real bug the
customer reported — a toast rendering behind a modal — and it is deliberately
tuned around Kendo:

```
drawer 10020 · dialog 10040 (a band) · menu 10070 · palette 10075 · toast 12500 · skip 12600
```

The last two sit above **Kendo's own 12001 popups**, which is documented in the
file as the reason those numbers are where they are. Kendo's Dialog brings its
own stacking, so this swap re-opens the exact area that produced the bug — plus
scrim, focus trap, ESC handling and our four size variants, all currently
working. 22 call sites across 13 files is also the largest surface here.

Worth doing for parity. Not worth doing casually, and not worth doing in the
same change as anything else.

**`Toast` → Kendo Notification.** `k-notification` ×1 is thin evidence — one
occurrence, and the sweep is explicit that its counts prove presence, not usage.
Our toast has an **undo action** used across 29 call sites; Kendo's Notification
is a simpler control and undo would have to be rebuilt or dropped. Same layering
caveat as Dialog. **Low priority: weak evidence, real cost.**

### Hold — no evidence, or nothing to gain

**`RadioGroup`.** The live sweep found **no radio group**. It did find
`k-switch` ×4, which may mean some of our seven radio groups are switches in the
live UI — but the sweep cannot say which screen uses what, and guessing would be
inventing a requirement. **Ask the customer which fields are switches** before
touching this; that question is cheap and the answer changes the work.

**Popover menus** (`ColumnChooser`, `UserMenu`, `PeoplePicker`). `k-menu` ×8 is
solid evidence for menus, but ours are not generic menus — they anchor bespoke
controls, and `PeoplePicker` in particular was built to match a live MultiSelect
with avatars, chips and two-field filtering. Kendo Popup could host them, which
is a smaller change than replacing them. **Revisit after Dialog**, since both
touch anchoring and layering.

**`Slot`.** Not a UI component — it is the utility that lets `Button asChild`
render as a router `Link` so navigation stays a real anchor. Kendo has no
equivalent and does not need one. **Keep.**

### The one nobody asked about: `Select`

37 usages, the widest surface in the app, and it is **not Radix** — it is ours,
built on Popover. Live uses a filterable `DropDownList` and a ComboBox with
`allowCustom`.

Behavioural parity is already there: `Select` filters above 8 options, which was
added precisely because An noticed the live Customer picker filters as you type.
So the gain is visual consistency and `allowCustom`, against 37 call sites. **My
read: leave it until Dialog and Tabs prove the pattern**, then reassess — it is
the largest surface and the smallest functional delta.

## The two risks that apply to all of it

**1. Kendo's accessibility is not automatically better than Radix's.** We
measured this: Kendo's focus indicator is `2px` of **8% of the text colour**,
which computes to fully transparent, and it silently overrode our ring for every
button in the app. Radix's keyboard and focus behaviour is the strongest thing
about it. **Every swap needs its own keyboard pass** — not a visual check, which
is exactly what missed the focus regression twice.

**2. Bundle size.** The build is already **1,609 kB / 490 kB gzip** and past
Vite's 500 kB warning. A full swap adds `kendo-react-dialogs`, `-layout`,
`-inputs`, `-notification`, `-popup` and possibly `-dropdowns`. Radix is small,
so removing it recovers little. This is a real cost in a direction that is
already strained, and it argues for swapping what has evidence rather than
everything.

## Suggested order

| | Work | Risk | Why here |
|---|---|---|---|
| **A** | ~~Delete dead deps and dead exports; fix the three checkboxes to one~~ **DONE 4 Sep** | none | Independent of the decision. Done regardless. |
| **B** | ~~`Tabs` → TabStrip~~ **DONE 4 Sep** | low | Strongest evidence, smallest surface, proved the pattern |
| **C** | ~~`Checkbox` → Kendo Checkbox~~ **DONE 4 Sep** | low | Finished A properly |
| **D** | ~~`Dialog` → Kendo Dialog~~ **DONE 4 Sep** | **high** | Best parity, re-opened layering — done alone, with a keyboard pass |
| **E** | ~~Reassess `Select`, Popover menus, `Toast`~~ **DONE 5 Sep** | — | Decided with D's result in hand |
| **F** | ~~`Select` → Kendo ComboBox~~ **DONE 5 Sep** | medium | E's one recommendation, done |

**A is worth doing this week whatever is decided about B–E.** It removes four
dead packages and fixes a defect the customer can see on every grid.

## What this scope cannot answer

Following the convention `live-component-sweep.md` set after it under-reported
twice in one day:

- **Which live screen uses which control.** The bundle proves a component ships,
  not where. Every parity claim above is by kind, not by verified screen.
- **Whether `k-notification` ×1 and `k-checkbox` ×1 are load-bearing** or
  incidental. One occurrence is weak evidence either way.
- **Whether our seven radio groups are switches in the live UI.** A question for
  the customer, not for the bundle.
- **The real bundle cost**, which needs the packages installed to measure rather
  than estimated.

---

# Phase A — done, 4 September 2026

Radix is **eleven packages down to seven**, and every remaining one is imported.
Removed: `react-select` and `react-tooltip` (never imported), plus
`react-progress` and `react-toggle-group`, retired along with the `Progress` and
`SegmentedControl` exports and their now-dead CSS.

**The bundle did not shrink** — 490.42 kB gzip against 490.40 kB before. Worth
saying plainly rather than claiming a win: tree-shaking had already excluded all
four, so they cost nothing at runtime. The gain is that nobody inherits four
dependencies they cannot account for, which is the same reason TanStack went.

## The checkbox, and the two things measuring changed

The scope said "three checkboxes, one of them unstyled". Reading the code first
corrected the detail twice, and both corrections mattered:

1. **The bare inputs are wrapped in `<label class="vy-check">`**, which the scope
   did not mention — so it was worth checking whether they were styled after
   all. They were not: `.vy-check` is a layout class (flex, gap, min-height) and
   never touches the input. The finding held.
2. **The two styled treatments were different colours.** `.vy-check-box` (Radix,
   forms) is blue; `.vy-check-input` (native) is `--vy-accent-positive` green.
   Not in the scope at all, because it is only visible by reading the rules.

Green turned out to be right in exactly **one** place — a checklist item, where
a tick means *done* — and inherited everywhere else from sharing a class with
it. Selecting a grid row is not a positive outcome. So the shared default is now
blue, matching the form checkbox, and green survives as an opt-in modifier,
`.vy-check-input--done`, used only by `ChecklistsTab`.

## The regression this nearly introduced

`.vy-check-input` sets `appearance: none`. The grid's select-all box uses the
native `indeterminate` property to mean "some rows on this page, not all" — and
`appearance: none` **erases the browser's own dash**. Applying the shared class
without styling `:indeterminate` would have left the header box reading as
UNCHECKED while rows were selected: worse than the browser default it replaced,
and invisible to any check that only looks at the unselected state.

`:indeterminate` now reuses the same tick element with the clip-path swapped for
a bar. Verified with a real click on a row: header `indeterminate: true`,
background `rgb(27,79,156)`, dash at `scale(1)` with the bar clip-path.

Verified overall: 21 of 21 grid checkboxes styled and none left bare, the
ColumnChooser's 14 all blue, the checklist still green (`rgb(4,120,87)`) against
a normal checked box (`rgb(27,79,156)`), build clean, lint 0 errors, `css:check`
0 off-scale in owned stylesheets.

---

# Phase B — done, 4 September 2026

`Tabs` now renders Kendo's TabStrip. **None of the six call sites changed**: the
wrapper keeps our value-keyed API and translates to Kendo's index internally,
because a reordered tab array would silently change which tab an index selects
and a string cannot drift that way. Radix is **six packages**, `react-tabs` gone
with the swap.

## The CSS cost is zero, and not for the reason expected

Measuring it turned up something worth knowing: **the Grid subset has been
pulling the whole TabStrip stylesheet in since phase 5.**
`grid/_index.scss:57` includes `kendo-tabstrip--styles()`, so 555 TabStrip rules
have been shipping all along for a component nothing used. Our explicit
`@include` is a no-op under Kendo's `import-once` guard — byte-identical builds
with and without it, 486,838 raw either way.

The include stays anyway. It declares that this app uses TabStrip rather than
inheriting it by accident from the Grid, and if the Grid subset ever changed its
dependencies the tabs would keep their styling.

Also clarified while measuring: the build emits **two** CSS chunks, and reading
the wrong one made three consecutive measurements meaningless.

| chunk | size | when it loads |
|---|---|---|
| `index-*.css` | 486,838 raw / **73,792 gzip** | every page — the app plus the subset |
| `all-*.css` | 724,787 raw / 99,487 gzip | `/kendo-check` only, via dynamic import |

The full theme is **not** on the critical path. `ls dist/assets/*.css | head -1`
picks `all-*` alphabetically, which is how "the subset is the size of the full
theme" briefly looked true.

## Two defects the keyboard pass caught

The scope said every swap needs its own keyboard pass rather than a visual
check. It earned its place twice:

**1. The count badge rule never matched.** Kendo's tab is `.k-tabstrip-item`,
not `.k-item` — the class I had written from memory. The rule built, linted and
passed `css:check` while doing nothing at all, which is the exact failure mode
that hid the focus regression for two phases. Found by reading the rendered DOM
rather than trusting the selector.

**2. Kendo's tab focus ring fails contrast.** It is `rgb(195,203,214)` inset —
*visible*, unlike the button's transparent one, so it would have passed a glance.
But grey on a near-white tab is about **1.6:1**, under the 3:1 that WCAG 1.4.11
requires of a focus indicator. Tab items now take the same inset blue the grid
cells use — measured `2px solid rgb(42,99,184)` at `-2px`, about **5.9:1**.

Inset rather than the two-shadow ring for the same geometric reason as cells:
`.k-tabstrip-items-wrapper-scroll` clips a spreading shadow.

## Verified

Keyboard: focus lands on `role="tab"`, ArrowRight moves the selection, the panel
content changes with it and `aria-selected` follows — which also proves the
value↔index round trip through the caller's state. Structure: `role=tablist` /
`tab` / `tabpanel` intact, `.vy-tabpanel` still on the content element.

The count badge was verified by **selector resolution** — active `blue-100` on
`blue-800`, inactive `grey-100` on `grey-600` — rather than in a live dialog with
a real count. The only caller passing one is `PartBomDialog`, and the JSX is a
direct port of the Radix version, so the risk is low; it is worth a look next
time that dialog is open.

Build clean, lint 0 errors, `css:check` 0 off-scale in owned stylesheets.

---

# Phase C — done, 4 September 2026

Every checkbox in the app is Kendo's now. Radix is **five packages**. Phase A
collapsed three treatments into two; this leaves one.

## Kendo's class, deliberately not Kendo's component

`<Checkbox>` from `kendo-react-inputs` cannot express two things this app needs:

- **`indeterminate`** — there is no prop for it, and the grid's select-all box
  needs it to mean "some rows on this page, not all".
- **`aria-label`** — only `ariaLabelledBy` / `ariaDescribedBy` are offered, and
  the grid names every row's box individually ("Select 8"), because a screen
  reader moving down twenty identical labels learns nothing from "Select row".

Kendo's component renders exactly the markup we now write by hand: a native
input carrying `k-checkbox`. Using the class keeps both capabilities, gives the
same pixels, and avoids a React wrapper around each of the ~300 checkboxes a
full grid page renders. Kendo styles `.k-checkbox:indeterminate` — the native
pseudo-class — so that state needs no help.

The package was installed to read its API and then **uninstalled**, because
nothing imports it. Leaving it would have added the fifth dead dependency in a
session that removed four.

`k-checkbox-lg` is **20px measured**, exactly the size of the box it replaced.
`md` is 16px and would have shrunk every checkbox in the app by a fifth —
including the grid's, where the label's 24px target is switched off and the box
itself is the pointer target.

## Three regressions Kendo's defaults would have shipped

None of these are visible in a build, a lint, or `css:check`. All three were
found by measuring the rendered control.

**1. The unchecked border, 1.30:1.** Kendo draws the box with the global
`--kendo-color-border`, which the bridge maps to grey-200 — right for a table
rule, far too faint for a control boundary. The hand-written box was grey-400 at
**2.58:1**. Restored to grey-400 by an element-scoped rule, because remapping
that variable would darken every grid line and panel edge in the app.

> **Left for the customer:** grey-400 is *also* non-conformant. WCAG 1.4.11 asks
> 3:1 of a control boundary; grey-400 is 2.58:1 and grey-500 would be 5.24:1.
> That is a pre-existing near-miss this phase did not introduce, and darkening
> every checkbox in the app is a visible change that should be asked for rather
> than slipped into a swap.

**2. Indeterminate kept the faint border.** The first fix excluded
`:indeterminate`, on the assumption Kendo coloured that state itself. It does
colour the dash — blue-600, 5.9:1 — but the box outline still came from
`--kendo-color-border`, so the select-all header kept the 1.30:1 edge the fix
was written to remove. An indeterminate box is not a checked one and needs the
same visible boundary as an empty one.

**3. Disabled did nothing at all.** Kendo styles disabled by the `.k-disabled`
CLASS its React component applies, not by the `:disabled` attribute. Measured, a
`<input disabled class="k-checkbox">` is pixel-identical to an enabled one:
opacity 1, same border, same background. The column chooser shows a required
column as ticked-and-disabled, and it would have looked like an ordinary tick
the user can clear.

Fixed with `--vy-state-disabled` opacity rather than the grey wash the old rule
used. That rule put `:disabled` after `:checked` at equal specificity, so a
disabled *ticked* box went grey and took its white tick with it — the tick all
but vanished on precisely the control whose job is to show "this column is
always shown".

## And one Kendo simply does not have

`:hover`. Not one `.k-checkbox:hover` selector exists in the compiled
stylesheet. The customer's review asked that checkboxes "display an outer border
and update their value immediately when toggled"; the hover edge was added
because the target gave no feedback before the click, and adopting Kendo's
unchanged would have dropped it silently. It is a bridge rule for the same
reason the focus ring is — it belongs to every checkbox, and no single `.vy-`
container holds them all.

## Verified

Measured on the running app: 21 grid checkboxes, **0 legacy classes left**,
20×20px, grey-400 border, checked `rgb(27,79,156)`, header `indeterminate: true`
with a grey-400 border and a blue-600 dash, and `aria-label="Select 8"` intact.
Focus lands with our ring — `rgb(255,255,255) 0 0 0 2px, rgb(42,99,184) 0 0 0
4px` — because the bridge's focus rule already listed `.k-checkbox`. Checklist
tick still `rgb(4,120,87)` against a normal `rgb(27,79,156)`. 27 form checkboxes
and 14 in the column chooser, all on the shared class.

**Not verified, and worth saying:** the harness cannot dispatch a space key —
every spelling arrives as `key: ""` — so Space toggling was never exercised.
These are native inputs, so toggling is the browser's own behaviour, and the only
`onKeyDown` in the files holding checkboxes is on the Select. The Radix control
this replaced was a `<button role="checkbox">` that implemented Space itself, so
the swap moves toward the browser's behaviour rather than away from it. The
disabled treatment is verified by construction: no column on Part Master is
declared required, so there was no live disabled box to inspect.

Build clean, lint 0 errors, `css:check` 0 off-scale in owned stylesheets — the
bridge findings rise from 7 to 11, all of them the deliberate rules above.

---

# Phase D — done, 4 September 2026

`Dialog` is Kendo's. Radix is **four packages**. This was the risky one and it
earned the label: six things needed fixing, and one of them was an accessibility
bug that only appears when dialogs nest — which this app does, three deep.

## The layering came out simpler, not harder

The scope's main fear was the z-index scale. It turned out Kendo makes it
**easier**: scrim and panel live inside one positioned `.k-dialog-wrapper`, and
`style` lands on that wrapper. So a level needs **one** z-index where Radix
needed two, and a child's scrim dims its parent's panel automatically because
the whole child wrapper sits above the whole parent one. The `DialogDepth`
context is unchanged.

Measured with a BoM dialog open inside a Part record: wrappers at **10040** and
**10050**, each its own stacking context, so Kendo's internal `z-index: 11500` on
the panel stays contained. The toast that started all of this still lands at
**12500**, above both — verified by triggering a real one with two dialogs open.

## `className` lands on the wrapper, not the panel

This broke the layout immediately and visibly: every box rule we had — fixed
position, centring transform, width, max-height, background, radius, shadow —
was written for the panel and was now being applied to the full-screen layer.
The result was a 457px column 3288px tall with no scrim and no centring. Every
one of those rules moved down a level to `.vy-dialog .k-dialog`, and the
`translate(-50%, -50%)` centring is simply gone, because Kendo's wrapper centres
with flex.

## What Kendo's defaults would otherwise have shipped

- **The footer scrolled away with the form.** Our `<footer>` sat inside
  `.k-dialog-content`, which is the scroll box. `DialogActionsBar` renders as a
  sibling of the content and stays pinned. A dialog's buttons are the one thing
  that must not scroll out of reach.
- **Two scrollbars and doubled padding.** `.k-dialog-content` is already a
  padded, scrolling box; our `.vy-dialog-body` was a second one inside it. The
  wrapper div is gone.
- **The Save button stretched to 1140px.** Kendo gives every actions-bar child
  `flex: 1 0 0%`, which is right for its own stretched button rows and wrong for
  one button sitting to the right.
- **The scrim was half as dark as the token says.** Kendo puts `opacity: .5` on
  the overlay and expects a flat colour; our `--vy-overlay-scrim` already carries
  its own alpha, so the two multiplied.

## The bug worth the phase

**Every Kendo dialog had the same ARIA id.** Kendo builds them as
`` `${props.id ?? "accessibility"}-id` ``, so with no `id` passed, two open
dialogs both carry `dialog-title-accessibility-id`. `aria-labelledby` resolves to
the first match in the document — so the nested BoM dialog **announced itself
with its parent's title**. Confirmed by counting ids with both open: two of each.

Fixed by passing React's `useId()`. Both dialogs now resolve `aria-labelledby` to
their own titlebar and `aria-describedby` to their own content, `role="dialog"`,
`aria-modal="true"`.

## The Escape false alarm

Escape appeared not to close the dialog, through several attempts. It closes
fine. **Kendo tests `e.keyCode === 27`, and the harness delivers `keyCode: 0`**
(with `which: 0` and `code: ""`) — the same class of gap as the space key in
phase C. Reading Kendo's source rather than trusting the symptom is what caught
it; a dispatched event carrying a real `keyCode` closes the dialog, and adding a
handler would have shipped a redundant one and a possible double-close.

That test misled once more before it was believed: the check immediately after
the dispatch still said "open", because React had not re-rendered inside the same
tick. The dialog was gone a moment later.

## Verified

Focus lands inside on open and is still inside after **25 tabs** — the trap
holds. Focus returns to the triggering button on close. Maximise works:
1180 → 1228.8px wide, 676.8px tall (96vw × 94vh), `aria-pressed` and the label
flipping to "Restore down". Nested dialogs layer correctly, the toast sits above
both, and a **fresh tab shows zero console errors** with two dialogs open.

One caution about that last check: the reused tab reported "Invalid hook call"
and a null `useContext` — alarming, and entirely stale buffer from the
optimize-dep failure caused by installing a package while the dev server ran. A
new tab showed nothing. Console buffers survive restarts; read them in a fresh
tab or not at all.

**Not verified:** only the `xl` and default sizes were exercised on screen; `lg`
rests on the same base rule. And the harness cannot press Escape for real, so
that path is argued from Kendo's source rather than observed.

---

# Phase E — the reassessment, 5 September 2026

E was never a swap. It asked whether the three things the original scope held —
`Select`, the Popover menus, and `Toast` — still deserve holding once B, C and D
had actually been done. **One changes to a yes. Two stay held, and more firmly
than before.**

## What B, C and D actually taught

The scope guessed that the cost of a swap was the swap. It is not. Every phase
shipped Kendo defaults that would have silently degraded the app, and none of
them were visible to a build, a lint, or `css:check`:

| phase | regressions Kendo's defaults would have shipped |
|---|---|
| B — Tabs | 2 — a count-badge rule that matched nothing; a focus ring at 1.6:1 |
| C — Checkbox | 4 — border at 1.30:1; indeterminate keeping it; disabled styling absent entirely; no `:hover` rule in Kendo at all |
| D — Dialog | 6 — class landing on the wrapper; footer scrolling away; doubled padding; a stretched button; a half-strength scrim; **every dialog sharing one ARIA id** |

Three of those were accessibility defects, and the count rises with the size of
the component. That is the number to weigh a swap against — not the diff.

Two costs turned out to be **zero**, repeatedly: the Grid's subset already pulls
in tabstrip, checkbox and dialog CSS, so none of the three added a byte. Worth
checking per component rather than assuming either way.

## `Select` → Kendo ComboBox: **do it**

The original scope called this "the largest surface and the smallest functional
delta" and put it last. Three facts move it to first among what is left.

**1. Kendo dropdowns already render in this app.** Measured with a BoM dialog
open: **six `.k-dropdownlist` / `.k-picker`** on screen, in the MiniTable's own
filter cells, beside **zero** of ours. So `.vy-select` is now the visual outlier
— a second dropdown design sitting a few centimetres from Kendo's, in the same
product. This is the same evidence that unblocked phase 1, where twelve Kendo
Buttons were rendering while the scope said the Button was broken.

**2. It adds no dependency and no CSS.** `@progress/kendo-react-dropdowns` is
already a dependency of `kendo-react-grid` — proven the hard way below — and
`k-picker` is already 205 rules in the shipped stylesheet.

**3. The API keeps every constraint our Select encodes**, which is the part that
mattered most, because ours was built from the live bundle rather than from
taste:

| our constraint | Kendo ComboBox |
|---|---|
| lookup only — a customer who does not exist must be impossible to type | `allowCustom` defaults to **false** |
| contains, case-insensitive filtering | `filterable` + `filter` + `onFilterChange` |
| the field is the trigger, not a box that appears after opening | ComboBox's trigger **is** the text input |
| named for screen readers | `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy` |

That last row is the one to notice. `ariaLabel` is exactly the gap that forced
phase C to use Kendo's checkbox CLASS instead of its component. The ComboBox
does not have that gap, so this can be a normal component swap.

**It still needs its own phase.** 37 call sites behind one wrapper, and the
behaviour was derived from `bundle-evidence.md` rather than invented — so the
swap needs a behaviour diff, not just a render check.

## Popover menus: **hold**, and the reason is sharper now

`k-menu` ×8 is decent evidence for menus, but ours are not menus. They are a
column list of checkboxes, a user account panel, and a people picker with
avatars and chips. Kendo's Popup would replace the **container** — a white panel
with a shadow — and that container is already indistinguishable from Kendo's,
because the bridge maps our elevation onto `--kendo-elevation-*`.

So the visible gain is close to zero, against re-opening anchoring and layering:
the one place this app has already lost a day, when `Popover.Trigger asChild`
measured Kendo's ref handle forever. Given D's six regressions for a component
with a real payoff, six for one with none is not a trade worth making.

## `Toast`: **hold**, and the API settles it

The scope called `k-notification` ×1 thin evidence. Reading the component makes
it thinner:

- **No action slot.** `Notification` takes `children`, `closable`, `type`,
  `onClose` — and nothing else. Our toast's **undo** is used at 29 call sites;
  it would become an ad-hoc button inside the message body.
- **No timer.** Auto-dismiss is the caller's `setTimeout`, which we already own.
- **It is the first swap with a real cost.** `k-notification` is **0**
  occurrences in the shipped CSS, unlike every other component so far. And
  `@progress/kendo-react-notification` is present only because
  `kendo-react-conversational-ui` pulls it in — nothing we ship depends on it —
  so this one genuinely adds a package.

More cost than any previous swap, less capability than what it replaces, on the
weakest evidence in the sweep. Hold.

## A mistake worth recording

Both packages were installed with `--no-save` to read their APIs, then removed
with `rm -rf` — and **the build broke**:
`kendo-react-grid/cells/GridFilterCell.mjs` imports
`@progress/kendo-react-dropdowns`. It was never only an inspection copy; it is a
real transitive dependency of the Grid we ship. `npm install` restored it, and
`package.json` was never touched.

The lesson is narrow and useful: Kendo's packages depend on each other —
`buttons` pulls `popup`, `grid` pulls `dropdowns` and `data-tools` — so a Kendo
package sitting in `node_modules` is not evidence that nothing needs it. Let npm
remove things; never `rm -rf` inside `node_modules`.

---

# Phase F — done, 5 September 2026

`Select` is Kendo's ComboBox. **None of the 37 call sites changed**: the API is
the same, and the behaviours the old control encoded from the live bundle are
still enforced — two of them by props, one by a fix this phase had to make.

## The behaviour diff, which is the point of the phase

| behaviour, and where it came from | how it survives |
|---|---|
| **Lookup only** — `bundle-evidence.md` established Customer is a lookup, so a customer who does not exist must be impossible to type | `allowCustom={false}`. Verified: "Nonexistent Customer Ltd" is refused |
| **`contains`, case-insensitive** — read off the live filter descriptor | filtering stays ours. Verified: lowercase `controls` matches "00848 - KT **Controls** Ltd" mid-string |
| **The field is the trigger** — from An's Assigned To screenshot and `onComboBoxKeyDown` in the live app | ComboBox's trigger *is* the text input |
| The customer-code prefix rule | still fires — choosing a customer put `00455-` into Part Number |
| Blank option reads as an em dash | `itemRender`. Verified on the Status filter: first row renders `—` |
| "No option matches …" | `listNoDataRender` |
| `aria-required` / `aria-invalid` | `inputAttributes`, which puts them on the real input |

## Two defects, and the second one mattered

**1. A committed value showed as blank.** Passing `filter` back as a prop hands
Kendo a defined string every render, which puts the ComboBox permanently into
filter-display mode — so the field showed the empty filter instead of the chosen
value. The diagnosis came from a side effect rather than the control: the
selection *had* reached the form, because the Part Number field beside it had
grown its `00455-` customer prefix. Kendo owns the input text now; we own only
what the query means.

**2. Typing over a value and clicking away DELETED it.** With `allowCustom`
false, Kendo answers unmatched text by setting the value to **null**. So editing
a chosen customer and blurring cleared it — while the Part Number kept the
prefix that customer had put there, leaving a form referring to a customer it no
longer had. The control this replaces could not do that: typing filtered, and
only choosing an option changed anything.

Null is now ignored, which restores exactly the old rule, and `clearButton` is
off because it is the other route to null and would otherwise be a button that
does nothing. Neither is a loss — where empty is a legal answer the option list
already carries a blank entry.

## One thing that was wrong before this phase

Kendo's medium picker is **29px**; our `.vy-input` is **37px**. In this form a
dropdown and a text field share a column — `Part Number` above `Customer`,
`Part Description` above `Part Source` — so that was eight pixels of difference
down one column. Matched at the inner input using the same two tokens
`.vy-input` uses, so a retune of the field carries the dropdown with it.

## Cost

JS **+5.0 kB gzip** (491.56 → 496.58). CSS went **down** 0.5 kB: the hand-built
combobox took 25 lines of `app.css`, its chrome rules in `components.css` and the
`--vy-select-menu-min` token with it, and `k-picker` was already shipping. No new
dependency — `kendo-react-dropdowns` was already the Grid's.

## Verified

Selection commits by keyboard and shows in the field; junk is refused and the
previous value survives; filtering is contains and case-insensitive; the em dash
renders; heights match at 37px; the focus ring is ours
(`rgb(255,255,255) 0 0 0 2px, rgb(42,99,184) 0 0 0 4px`) because the bridge rule
already covered `.k-input-inner`; the popup anchors correctly — measured x and
width equal to the field, top flush with its bottom edge.

**A caution that cost time twice.** Arrow keys and Enter appear not to work:
`ComboBox.mjs` and `Navigation.mjs` both switch on `e.keyCode`, and the harness
delivers **0** — the third time this exact gap has appeared, after Space in C and
Escape in D. Dispatching events carrying a real `keyCode` drives it correctly.
And a popup seen rendering in the top-left corner was a stale one left by focus
juggling, not a positioning bug; re-opening cleanly measured flush.

---

# What is left, and who it is waiting on

`Select`, `Tabs`, `Checkbox` and `Dialog` are Kendo's. Radix is **four
packages**, each held for a stated reason rather than by omission:

| package | why it stays |
|---|---|
| `react-popover` | the menus — held in E: bespoke panels, no visible gain, and it re-opens anchoring |
| `react-toast` | held in E: Kendo's Notification has no action slot, and our undo is used at 29 call sites |
| `react-slot` | not a UI component — it is what lets `Button asChild` render as a router `Link` |
| `react-radio-group` | **waiting on the customer** — now question 17 |

Question 17 asks which four fields are the `k-switch` ×4 the live bundle ships.
It is written to be answerable: the ten on/off flags are listed by name, the
seven either/or choices are listed by screen, and it says plainly that we think a
switch is wrong for the second group — a switch carries one label and an on/off
state, so a choice between two *named* options would lose one of its names, and
three of those groups have three options, which a switch cannot hold at all.

Nothing is blocked by it. It is the last thing between this app and retiring the
final piece of the library the migration replaced, which is our housekeeping
rather than the customer's problem — and the question says so.
