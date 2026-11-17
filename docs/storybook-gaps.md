# Storybook: what is covered, and what is not

Measured on 17 Nov 2026, not estimated. "Live example" means a specimen that
renders the real component in an iframe on its Examples tab — the thing you
can click, tab through and read in both themes.

## Where it stands

| | |
|---|---|
| Components in the system | **39** |
| With a live example | **29** |
| Live examples in total | **85** |

*Updated 17 Nov 2026. The BA's **Input widgets** section is now fully built:
every widget in it either exists here or is one she ruled out.*

The BA's principles of 16 Nov 2026 name roughly **60 widgets and states**
across her five widget sections. The gap below is measured against those.

---

## A · Components that exist but have no live example — 10

These are built, used in the app, and documented in prose. They are missing
only the thing you can click.

| Component | Why it is not there yet |
|---|---|
| `data-grid` | The heaviest one: the Grid chunk is 663 KB and a specimen has to seed its own rows. Also the one most worth having |
| `column-chooser` · `filter-toolbar` · `view-picker` · `view-setting` | All four are grid satellites. Each needs the grid around it to make sense, so they follow the grid |
| `people-picker` | Needs a people fixture; otherwise straightforward |
| `command-palette` | Opens over the whole page, so a specimen needs a frame it can own |
| `app-shell` | A specimen of the shell is a specimen of the whole app. Probably a screenshot rather than an iframe |
| `icon` | Should be a grid of all 45, which is easy and overdue |
| `support-ticket` | Straightforward |

**Three of these also have no tab structure at all** — `icon`, `app-shell` and
`command-palette` have a page but not the four-tab layout every other
component has.

**Suggested order:** `icon` first (easy, high use), then `support-ticket` and
`people-picker`, then the grid and its four satellites as one piece, then
`command-palette`. `app-shell` last, and probably not as an iframe.

---

## B · Thin examples

Twenty-three specimens hold sixty-six examples, so just under three each. The
thinnest are the ones to look at first, because a single example cannot show a
state:

| Specimen | Examples |
|---|---|
| `toast` | **1** |
| `checkbox` · `chip` · `error-state` · `file-drop` · `grid-skeleton` · `priority` · `record-skeleton` · `rich-text` · `tabs` | **2** each |

`toast` is the clearest case: it now has four kinds and shows them through one
button row rather than as four examples.

By contrast `field-row` has six, including the two added today, and that is
roughly the right shape for anything with states.

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

### Images and conversation — no package needed

**Image** in three states, plus **Conversation**, **Email**, **Notes**,
**Preview** and **Download**, are specified and absent. `file-drop` and the
file row cover the upload half of that section and nothing else.

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
