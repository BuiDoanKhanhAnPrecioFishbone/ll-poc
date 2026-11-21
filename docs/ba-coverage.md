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

- ~~**The 3px blur behind an open popup is not implemented.**~~ **Built
  21 Nov 2026.** Her overlay is `rgba(19,24,32,.32) + blur 3px`; ours was
  `rgba(19,24,32,.45)` and no blur — darker, doing by opacity what she does by
  defocusing. Hers is the better of the two, and the reason is that the two
  are not the same thing: opacity makes the page behind dimmer and leaves it
  just as readable, where a blur makes it unreadable and leaves it just as
  bright. A row of part numbers at 55% is still a row of part numbers the eye
  can try to read. Measured after: `rgba(19,24,32,.32)` + `blur(3px)` light,
  `rgba(0,0,0,.5)` + `blur(3px)` dark. The `.45` stays as the fallback behind
  an `@supports` guard, because at `.32` with no blur the scrim is too weak to
  be the only separator.
- **Her z-index list matches ours exactly** where both name a layer: drawer
  10020, popup 10040, menu 10070, toast 12500, skip 12600. ~~Her two lowest,
  `z-sticky 2` and `z-toolbar 10`, have no token here.~~ **Added 21 Nov.**
  `--vy-z-sticky` replaced a bare `1` on the activity log's sticky date;
  `--vy-z-toolbar` has **no user today** — nothing in this build has a toolbar
  that scrolls under anything — and is there so the first one that does takes
  her number instead of inventing one.
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

### ~~Buttons~~ — **built, 20 Nov 2026**

All four differences closed. See [Button](components/button.md). What follows
is what they were.

| | Hers | Ours, before | Now |
|---|---|---|---|
| Radius | 6px | **4px** | 6px, with the radius scale |
| **Danger in a toolbar** | **outlined** — 1px danger border and danger text | filled everywhere | outlined, and the component picks by reading whether it is in a dialog |
| Danger in a confirm popup | filled `danger-fill`, white text | the same filled button | unchanged — and now it is the only place the fill appears |
| **No permission** | looks like Disabled, tooltip *"You don't have permission to {action}. Ask your admin."* | **no such state** | `unavailable`, with `noPermission()` holding her wording |
| **Smart button at zero** | grey border, `text-label` text, grey badge | the count stays visible | already so — her `text-label` **is** our `--vy-on-surface-muted`. One dead duplicate rule removed |

Three things came out of building it that were not in the comparison:

- **The outlined danger could not use Kendo's own `outline-error`.** Its colour
  is `--vy-danger` (red-600), which is **5.52:1** on white and **3.10:1** on
  the dark surface — fine as a border, a 1.4.3 failure as a label. It takes
  `--vy-danger-text` and `--vy-danger-boundary` instead, 7.74 / 4.30 light and
  7.16 / 5.04 dark.
- **A tooltip on a disabled button never opens.** Kendo's `.k-disabled` sets
  `pointer-events: none`. Two reasons already written in this codebase —
  ViewSetting's *"A new view needs a name"* and *"Built-in views cannot be
  deleted"* — had been on screen unread since the day they were typed. Both
  moved to `unavailable`, which is `aria-disabled` and stays hoverable.
- **No permission is not wired to anything**, because this prototype has no
  permission model. The state exists and is documented; the first screen that
  knows a user's role passes the prop.

### Busy and screen states — mostly already here

Her five states, checked one by one: busy button ✓, skeleton loading ✓,
empty ✓, error screen ✓ (`ErrorState` carries the error id, Reload, Back to
Home and Send a Support Ticket, as she specifies), not-built-yet ✓
(`Placeholder`). And **loading over data already on screen** — her *"dim it
to 45% and put the spinner and the doing-word on top; never swap back to a
skeleton"* — ✓ as well.

> **This page said "No 45% dim exists here", and that was wrong.** It is
> `BusyOverlay`, it has been in the build since **25 October**, and it does
> exactly what she asks: `opacity: .45` on the content, `pointer-events: none`,
> a converging spinner and the doing-word over the top in a `role="status"`.
> Measured 21 Nov on the Loader page's own cards. The claim was written on
> 18 Nov by walking her document and searching this one for the figure `45`,
> which the stylesheet writes as `.45` — a grep that answered its own question
> and not the one being asked. Corrected rather than deleted, because a
> coverage page that quietly drops its own mistakes is worth less than one
> that keeps them.

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

1. ~~**Shape and elevation**~~ — built 18 Nov.
2. ~~**Grid cells**~~ — built 18 Nov.
3. ~~**Buttons**~~ — built 20 Nov.
4. **Large editable grid**, which needs her answer on the touch question
   first — it is built on hover.

The three small items listed above are **done, 21 Nov**: the 3px blur behind
an open popup is built, the two layer tokens are in, and the 45% dim over
reloading data turned out to have been built on 25 October — this page had it
wrong. That leaves **Large editable grid** as the only unbuilt section of her
document, and it is waiting on her answer about touch.
