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
| **A** | Delete dead deps and dead exports; fix the three checkboxes to one | none | Independent of the decision. Do it regardless. |
| **B** | `Tabs` → TabStrip | low | Strongest evidence, smallest surface, proves the pattern |
| **C** | `Checkbox` → Kendo Checkbox | low | Finishes A properly |
| **D** | `Dialog` → Kendo Dialog | **high** | Best parity, re-opens layering — alone, with a keyboard pass |
| **E** | Reassess `Select`, Popover menus, `Toast` | — | Decide with D's result in hand, not before |

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
