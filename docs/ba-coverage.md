# What of the BA's document has actually been checked

Measured on 18 Nov 2026 by walking **all 31 sections** of her principles,
rather than by remembering which ones were worked on.

**The honest headline: the widget sections are done, the document is not.**
Earlier notes here said "her Input widgets, Tab · Group · Card and Image,
files and conversation sections are built", which was true and is not the
same claim as "the document is built". Eleven sections had never been opened.

| | Sections |
|---|---|
| Compared **and** built | **12** |
| Compared, difference flagged for her | **3** |
| **Never opened until today** | **11** |
| Nothing to build (context, open items) | **5** |

---

## Opened today, and there is real work in them

### Shape and elevation — the radius scale is shifted a whole step

Hers against ours, side by side:

| Her token | Her value | Ours of that name | Ours of that value |
|---|---|---|---|
| `radius-sm` | **4px** | `--vy-radius-sm` 3px | `--vy-shape-sm` / `--vy-radius-md` |
| `radius-md` | **6px** | `--vy-radius-md` 4px | `--vy-radius-lg` |
| `radius-lg` | **8px** | `--vy-radius-lg` 6px | `--vy-shape-md` |
| `radius-pill` | 999px | ✓ matches | |

Every value she names exists here; every **name** points one step lower. The
consequence is concrete: she puts *"inputs, value boxes, buttons, icon
buttons, banners, toasts"* at **6px**, and this system draws them at **4px**.
Nothing is broken, everything is slightly tighter than she drew.

Also from this section:

- **The 3px blur behind an open popup is not implemented.** There is no
  `backdrop-filter` anywhere in this system. Her overlay is
  `rgba(19,24,32,.32) + blur 3px`; ours is `rgba(19,24,32,.45)` and no blur —
  darker, to do the same job the blur does for her.
- **Her z-index list matches ours exactly** where both name a layer: drawer
  10020, popup 10040, menu 10070, toast 12500, skip 12600. Her two lowest,
  `z-sticky 2` and `z-toolbar 10`, have no token here.
- She has **three shadows**; this system has five. Different systems rather
  than a disagreement.

### ~~Grid cells~~ — **built, 18 Nov 2026**

All of it: the five cell states, the required-column `*` and the focused line
with its 3px bar. See [Data grid](components/data-grid.md). What follows is
what was missing before.

#### Grid cells — six of her nine cell states did not exist

`renderCell` handles the column ROLES (ident, status, date, money, number,
code) and nothing else. These are specified and unbuilt:

| Her cell state | What it should look like |
|---|---|
| **Changed** | `info-bg` fill, 1px `changed-border`, `info-text` at 500 |
| **Warning · number** | `warning-bg` fill, triangle 16px on the **left** edge |
| **Warning · text** | the same, triangle on the **right** edge |
| **Error** | `danger-bg` fill, octagon 16px on the right (left for numbers) |
| **System match** | `*` at 600 in `primary-text` after the value; click opens the pick list |
| **Loading** | the value at 40% opacity |

Her **row focus** — `row-focus` fill plus a 3px bar on the left — is also
absent; this system has no focused-row treatment in the grid at all.

Her required-column header (*"red * after the name"*) is specified and not
implemented either.

### Large editable grid — a second interaction mode, entirely unbuilt

For grids over ~200 lines she specifies that editable cells draw **no box at
all** until hover, keeping only a changed cell boxed in blue until Save. Small
grids inside a form keep a visible box in every editable cell.

This system has one mode. Note this is also the section that produces one of
the open accessibility questions — *"editable and read-only cells look the
same until hover"* cannot work on the shop-floor terminals and tablets her own
Screen sizes section names.

### Buttons — four differences

| | Hers | Ours |
|---|---|---|
| Radius | 6px | **4px** (see Shape, above) |
| **Danger in a toolbar** | **outlined** — 1px danger border and danger text | `.vy-btn--danger` is **filled** everywhere |
| Danger in a confirm popup | filled `danger-fill`, white text | the same filled button |
| **No permission** | looks like Disabled, tooltip *"You don't have permission to {action}. Ask your admin."* | **no such state** — indistinguishable from disabled |
| **Smart button at zero** | grey border, `text-label` text, grey badge | the count stays visible; the button does not change its look |

The **No permission** one is worth doing: a user who cannot tell "not yet" from
"not allowed" asks support about the wrong thing.

### Busy and screen states — mostly already here

Her five states, checked one by one: busy button ✓, skeleton loading ✓,
empty ✓, error screen ✓ (`ErrorState` carries the error id, Reload, Back to
Home and Send a Support Ticket, as she specifies), not-built-yet ✓
(`Placeholder`). The one gap is **loading over data already on screen** —
her *"dim it to 45% and put the spinner and the doing-word on top; never swap
back to a skeleton"*. No 45% dim exists here.

---

## Opened today and nothing to change

**Accessibility**, **Screen sizes**, **Record form**, **Save errors**,
**Tokens and syntax**, **Content, handoff and changes**, **Example screens**.
These are prose and process rather than values, and nothing in them
contradicts what is built.

---

## The eleven that had never been opened

For the record, since the point of this page is that the list existed and was
not visible: Shape and elevation · Accessibility · App shell and page ·
Screen sizes · Popups · Record form · List and config list · Working grid and
step bar · Save errors · Buttons · Grid cells · Large editable grid · Hover
and focus · Busy and screen states · Tokens and syntax · Content, handoff and
changes.

Four of them — Buttons, Grid cells, Large editable grid, Shape and elevation —
hold real unbuilt work and are listed above with what is missing.

---

## Suggested order

1. **Shape and elevation**, because the radius names affect everything else
   and it is a token change rather than a component one.
2. **Buttons**: the outlined danger and the No-permission state.
3. **Grid cells**: changed, warning, error, system match, loading, row focus.
4. **Large editable grid**, which needs her answer on the touch question
   first — it is built on hover.
