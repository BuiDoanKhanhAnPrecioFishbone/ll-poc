# Storybook: what is covered, and what is not

Measured on 17 Nov 2026, not estimated. "Live example" means a specimen that
renders the real component in an iframe on its Examples tab — the thing you
can click, tab through and read in both themes.

## Where it stands

| | |
|---|---|
| Components in the system | **42** |
| With a live example | **42 — all of them** |
| Live examples in total | **124** |

*Updated 17 Nov 2026. The BA's **Input widgets** section is now fully built:
every widget in it either exists here or is one she ruled out.*

The BA's principles of 16 Nov 2026 name roughly **60 widgets and states**
across her five widget sections. The gap below is measured against those.

---

## A · ~~Components with no live example~~ — **closed, 17 Nov 2026**

All ten now have one: `icon` (the whole set, counted from `ICONS` so the
number on the page cannot go stale), `support-ticket`, `people-picker`,
`command-palette`, `data-grid` with its four satellites, and `app-shell`.
`icon`, `app-shell` and `command-palette` also gained the four-tab layout
every other component already had.

**Three things worth keeping from the work:**

**The app shell cannot be shown at desktop width in a 560px frame, and
scaling does not fix it.** A 1280px box transformed down puts the right pixels
on screen and leaves the rail off-canvas anyway: the shell's breakpoints are
`@media` queries, which read the viewport rather than the box an element sits
in. Measured at 0.39 scale with the sidebar still translated -248px. The page
says so and points at the product.

**`ROW_H` was dead and had drifted.** `DataGrid` exported
`{compact: 28, comfortable: 36, relaxed: 44}` with a comment saying
`GridSkeleton` sized its rows from it. Nothing imported it, the skeleton uses
padding, and by the time it was found the tokens said `{34, 40, 48}` — the
BA's density change on 16 Nov moved the tokens and left this behind. Deleted;
the row height lives in `--vy-row-h-*` and there is one copy of it.

**The icon count on the Icon page was wrong, and had been copied onward.**
It said 45; the set has 43, and the figure had already reached the comparison
with the BA's principles under a heading saying it was checked. The Examples
tab now counts the set itself. The stroke moved to her 1.5 at the same time;
it had been 1.6, which nobody chose.


---

## B · ~~Thin examples~~ — **worked through, 17 Nov 2026**

Eighteen examples added across nine specimens, and the useful finding is why
the rest were not touched.

**Two of them were thin because the COMPONENT was thin, and her spec said so.**
`Checkbox` took `checked`, `onCheckedChange` and `label` — no disabled, no
error — while her spec names *"view and read-only: muted, not clickable"* and
*"error: red border"*. A read-only checkbox was being drawn as an ordinary one
that quietly ignored clicks. `Tabs` had no way to mark a tab holding a field
the user must fix, which her spec draws as a red `*` after the name with the
label keeping its colour. Both props added, then shown.

**Where a second example was the whole argument for the component**, it was
worth writing: `view-picker` now shows **two views that share a name** — legal,
because a view name is user-typed and nothing checks it — and prints the
chosen id, so you can see that a picker keyed on the label would hand back the
wrong one. `column-chooser` shows the real Quotation list where **6 of 11
columns are required**, because that changes what the control is.

**Fifteen specimens still sit at two examples and should stay there.** In each
the component has two states and no more: `card` is Card and Split card,
`chip` is selected and not, `image-box` is with an image and without,
`view-setting` is a view you own and one you cannot overwrite. `app-shell` and
`command-palette` have one each, for the same reason. A third example there
would be a copy of the first with different words — one was written for
`toast`, noticed, and deleted.


---

## C · Widgets the BA specifies that do not exist here at all

This is not a storybook gap — there is nothing to put in it. These are
components to build, and the first two groups need Kendo packages that are
**not installed**.

### ~~Dates~~ and ~~numbers~~ — **built, 17 Nov 2026**

**Date**, **Datetime**, **Date range**, **Integer**, **Decimal**, **Currency**
and **Percent** — seven of her widgets, none of which existed. See
[Number field](components/number-field.md) and
[Date field](components/date-field.md).

Only one package was needed in the end, `@progress/kendo-react-dateinputs`,
and it was already in `node_modules` as a transitive dependency; it is now
declared directly. Numbers did **not** take `@progress/kendo-react-inputs` —
the reason is on the Number field page.

**A correction to this page.** It listed **Switch** among the missing widgets.
Her spec names Switch only to rule it out — the row reads *"Not used"* — so
there is nothing to build, and building one would have added a control she
has decided against. The row is a decision, not a gap.

### ~~Yes / no field~~ and ~~Multi-column list~~ — **built, 17 Nov 2026**

The last two of her Input widgets. The yes/no field is a boolean that reads as
a word written for its field — *Required* / *Not required* — which is what
separates it from a bare checkbox. The multi-column list is a lookup whose
popup is a small grid, and it exists for one reason: `0455-300-0017-11` and
`0455-300-0017-12` differ in the last character of sixteen.

It also put `--vy-grid-header` in the system, one more of her values. In light
it is what Kendo was already using; in dark hers is lighter than ours was.

### ~~Cards and groups~~ — **built, 17 Nov 2026**

All four: [Card](components/card.md) and Split card,
[Group](components/group.md), Section heading and Collapsible group. The
division she draws is the useful part — a card is a surface of its own, a
group divides one surface, and her whole note on the group is *"no box, no
fill"*.

It gave `--vy-section-bg` its first use. The token had nowhere to go while
this system had no card.

**Tab was already here but did not match her spec**, which only measuring
showed: 33px tall, touching, and 400 weight for both states, so the active tab
was marked by its underline alone. Now 36px, 24px apart, 500 with the active
at 600. She writes *22px apart* and 22 is not on the spacing scale — not on
ours and not on hers, which agree step for step — so it takes the 24px step,
written down rather than quietly rounded.

### ~~Images and conversation~~ — **built, 17 Nov 2026**

[File row](components/file-row.md) with its five type chips and four states,
[Image box](components/image-box.md) in both states, and
[Conversation](components/conversation.md), which also covers Notes — she
specifies Notes as *"As Conversation"*, so building two would only guarantee
they drift.

**Still open from that section:** the image popup and the file **Preview** are
both her *Popup Large 960px*, which is a dialog size this system already has;
the dialog that goes in it is a screen, not a component. **Email** is her
*Popup Medium 640px* with inputs that now all exist.

**Two things to raise with her.** She gives **no dark values for the file-type
chips** — these use her dark values for the nearest family she names. And her
chip text is **9px**, below the 12px desktop floor her own type scale sets;
it is kept because a three-letter mark in a fixed 30×20 box is recognised
rather than read, and it is named `--vy-text-chip` so the exception is
visible instead of buried in a rule.

---

## What this adds up to

**A and B are finishing work** on things that already exist — a few days, no
decisions, and they make the storybook genuinely complete for what the system
holds today.

**C is product scope.** Seven of those widgets are now built; the rest need
components designed from scratch. That is a plan to agree with
her and with you, not a gap to quietly fill — and it is worth saying to her
that her own spec is ahead of the build in these four areas, since she may be
specifying for a milestone this mockup was never meant to reach.
