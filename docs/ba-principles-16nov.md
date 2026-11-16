# VIQ UI Principles, 16 Nov 2026 — checked against this system

The BA's settled answers to the open design questions, received as
`VIQ_UI_Principles_26Nov16.html` and compared value by value against
`src/theme/` and the pages here.

**The headline: it agrees with us almost everywhere.** It uses our token names
(`--vy-danger`, `space-1…14`, `control-md`, `col-money`), and where both
documents state a number they match on 31 of the 38 checked. That is not a
coincidence — it is the same system written from the other side.

Most of it is now adopted — the status palette, the sizes and the scroll
bars. Four things are flagged below, because this
system holds a measurement that disagrees, and a measurement is worth raising
before it is overwritten.

---

## Adopted, in this change

| | Was | Now | Why |
|---|---|---|---|
| `--vy-row-h-compact` | 28px | **34px** | A density figure is the BA's to set. Used in one rule, so the change is contained. Her note that cell inputs and row buttons stay **26px in both** densities matches `--vy-control-row` unchanged |
| `COLUMN_WIDTH.view` | — | **40px** | The eye column that opens a line. We had the column; it had no role |
| `COLUMN_WIDTH.person` | — | **160px** | A user name. Role did not exist here |
| `--vy-dialog-sm` | — | **420px** | Her popup ladder is 420 · 640 · 960 · 1180; we had the last three |
| `COLUMN_WIDTH.date` | 150px | **110px** | The 150 was measured against the **live** system, which renders `09/09/2026 16:35:29`. This app's `regional.ts` formats 2-digit day and month — `11/14/2026`, her format at her width. The old number was sized for a format we no longer produce |
| `COLUMN_WIDTH.datetime` | 190px | **170px** | `11/14/2026 09:14 AM` and our `10/13/2026 10:56:15` are both 19 characters, so 170 holds either |

---

## Flagged — please settle these with her

### 1. The date-time FORMAT, now that the width is settled

Adopting her widths surfaced a difference the widths were hiding. Both
examples are 19 characters, so 170px fits either — but they are not the same
format:

| | Example |
|---|---|
| Her principles | `11/14/2026 09:14 AM` — 12-hour, no seconds |
| `fmtDateTime` here | `10/13/2026 10:56:15` — 24-hour, with seconds |

The date-only format matches exactly. Only the time part differs, and her own
list still carries date format as unresolved, so this is the question to close
next: **12-hour without seconds, or 24-hour with them?**

### 2. Which Kendo step `control-row` sits on

She writes `control-row 26px … (Kendo sm)`. This system's `sizing` page says
the same 26px is **Kendo's `xs` step**. The value agrees; the name of the rung
does not, and one of the two is wrong in a way that will mislead whoever next
configures the Kendo size scale.

### 3. Icon token names

| | Hers | Ours |
|---|---|---|
| Toolbars, banners, menus | `icon-md` **16px** | `--vy-icon-sm` **16px** |
| Inside icon buttons and grid rows | `icon-sm` **14px** | — |

Same 16px for the common case, different name, and we have no 14px step.
Renaming `--vy-icon-sm` would touch the app shell's own rules, so it is left
alone pending her confirmation that a 14px icon is wanted.

### 4. Status pill geometry

| | Hers | Ours |
|---|---|---|
| Height | 20px | from padding |
| Padding | 0 · 10px | 2px · 8px |
| Radius | 10px | pill (`--vy-shape-full`) — same result at 20px |
| Text | 12px / **500** | 12px / **semibold** |
| Width | not stated | **fixed 104px slot** (GAP-01) |

The fixed-width slot is ours and deliberate: badges of different lengths in a
status column left a ragged edge. Worth confirming she wants it kept, since
her spec does not mention a width.

---

## Checked and matching

Type scale (all nine steps, and the touch column rises exactly 2px for 2xs–lg
as ours does) · the whole spacing scale including the gap where `space-13`
would be · motion, all four curves and three durations · `control-md` 34px ·
`control-row` 26px · `target-min` 44px · shell 248 · 56 · 52 · popup 640 ·
960 · 1180 · column roles ident 240, text 280, code 96, number 104, money 124,
status 128, priority 104 · the icon set at 45.

**One difference that is not a conflict.** Her type scale gives `2xs` 10px and
`xs` 11px and says they are "not used on desktop, below the 12px floor"; ours
sets both to 12px outright. Same result on screen, and hers states the reason
better.

**Status words.** She names seven business statuses — New · In Progress ·
Quoted · Waiting for Approval · Completed · On Hold · Cancelled. This system
has eight `--vy-status-*` token pairs. These are different lists, not a
disagreement: hers is the vocabulary a user reads, ours is the palette it is
drawn from. It also explains a confusion already recorded here — `Badge.tsx`
says "seven-token vocabulary" while B1.6 says "eight statuses", and both are
right about different things. **Worth asking her which token each of the seven
words maps to**, and writing that mapping down.

---

## What she leaves open

Her own "Open for design" list, so nobody designs these and finds out later:

Dashboard · what the Filters button opens · search suggestions · row selection
in a list · Group By result · list on a phone · import from Excel ·
notification list · **nineteen icons still to draw** (edit, upload, close,
add, copy, link-out, info, warning, error, success, search, calendar, drag,
minimize, expand, restore, image, filter, columns) · screen-reader
announcements and tab order, to define with the developers · and an Inter
check against real part numbers for `I l 1 0 O`.

Two of these overlap work already done here and should be told back to her:
the **Filters panel** she describes as starting from "the current VIQ View
Setting panel" exists as [View setting](components/data-grid/view-setting.md),
and the **screen-reader and keyboard order** she defers is already specified
in [Accessibility](foundations/accessibility.md) and measured by `focus:check`
on every push.

---

## What has NOT been compared yet

The check above covered the numeric foundations. Her document has **46
sections**; nine were compared, and **45 remain — about 60,000 characters**,
including the two densest specs in it. Listing them so nobody assumes this
reconciliation is finished.

| Her section | Size | New colour values | |
|---|---|---|---|
| **More tokens · light and dark** | 1.6k | **33** | the status pill sheet — see below |
| **Input widgets** | **10.1k** | 11 | 180 px values; the full spec for every field state |
| Color meaning | 2.6k | 15 | |
| Toast · Banner · Popup | 2.1k | 13 | |
| Image, files and conversation | 3.5k | 10 | |
| Grid cells · Colors · Large editable grid | 5.6k | 10 · 10 · 9 | |
| Buttons · Hover and focus · Tab/Group/Card | 5.0k | 6 · 5 · 4 | |
| App shell · Busy and screen states | 3.4k | 3 · 1 | |
| Component specs · Popups · Text styles | 5.5k | **0** | likely already matching |

Of the 87 hex values in her document, **48 appear nowhere in `src/`**, and she
uses **17 semantic token names we do not have**: `input-bg`, `value-box`,
`value-box-line`, `changed-border`, `info-bg`, `info-text`, `primary-text`,
`danger-bg`, `danger-fill`, `disabled-bg`, `disabled-text`, `section-bg`,
`success-bg`, `success-text`, `warning-bg`, `warning-text`, `col-text`.

Some are ours under another name — her `primary-text` `#1A419E` is our
`--vy-brand`. Others are states this system has no token for at all: the
**read-only value box** and the **changed** field. We have `data-changed` on
exactly one button, not as a field state.

### The one that is not a detail: the status pills

Her pills are **seven stage families**, and they are not our eight tokens
recoloured — the structure differs too.

| Her family | Her light bg / text | Nearest token here | Ours |
|---|---|---|---|
| gray · not started | `#ECEFF3` / `#4D5766` | `draft` | `grey-100` / `grey-600` — close |
| teal · in progress | `#D9F0EE` / `#0E5A52` | `progress` | `#cffafe` / `#155e75` — **cyan, not teal** |
| **blue · committed** | `#E5EAF7` / `#15347E` | — | **no blue status family exists here** |
| green · done | `#E4F1EA` / `#1A6B34` | `done` | `#d1fae5` / `#065f46` — different |
| red · blocked | `#F8E6E5` / `#9B2226` | `blocked` | `red-50` / `red-700` — different |
| **amber · waiting** | `#F8EFE3` / `#7A4A05` | `waiting` | `#ede9fe` / `#5b21b6` — **violet, not amber** |
| **outline · ended** | white + `#B9C0CA` border | `cancelled` | a filled grey pill — **not an outline** |

She also names the business words each family holds, which this system has
never had written down — *Quoted, Confirmed, Released, Sent, Approved* all
sit in her blue family, and we have no blue.

**This is not a patch.** Changing it rewrites the status palette, which
`contrast:check` measures at 184 pairs, which B1.6 documents pair by pair with
dates, and which the row tones and the five chart fills are built on. It needs
a decision, not an edit: her palette is the one the client will see, and ours
is the one that has been measured. The work is real either way, and it should
be planned rather than slipped in.

Also unapplied from that same sheet: **priority dot colours** (High `#C62D26`,
Medium `#C27A12`, Low `#8A94A6`), **scroll bar thumb** colours, and a **dark
tooltip** (`#131820` / `#FFFFFF`).


---

## Second pass, 16 Nov

After the status palette landed, the count of her colour values missing from
`src/` fell from **48 to 20**. That sheet was the bulk of the difference.

**Also adopted:** the scroll bar thumb, `#b9c0ca` / hover `#8a94a6` light and
`#3a4352` / `#5a6577` dark, with no colour on the track. It now applies to
**every** scroll bar; before this only the navigation rail was styled and the
rest were the browser's default.

### Flagged: the priority dot

Hers is **High `#C62D26` red · Medium `#C27A12` amber · Low `#8A94A6` grey**.
This system draws three steps of one ink — solid, half, hollow — and the
reason is in the code:

> High was red and Medium amber, which borrowed the two colours this product
> uses for "something is wrong" and spent them on a CATEGORY. A high-priority
> RFQ is not an error; an overdue one is, and on a list that shows both the
> reader had no way to tell the two reds apart.

That change was made on the stated grounds that **"the standard never mentions
Priority, so the palette was ours to choose"**. Her document now does mention
it, so that premise is gone — but the collision it describes is not. Under her
palette a High priority dot is red and a blocked status pill is red, on the
same row.

**Question for her:** on a list showing Priority and Status together, how
should a reader tell a high-priority row from a blocked one?

### Still not applied *(at the time of the second pass — see below)*

`value-box` / `value-box-line`, `changed-border`, `disabled-bg` /
`disabled-text`. All five landed in the third pass.

---

## Third pass — Input widgets

Her largest section turned out to be far smaller than its size suggested.
10,100 characters and 180 px values, and **only four colour values in it were
new to this system**: the rest name ramp values we already had under our own
names — her `border-input` is our grey-400, her `focus` is blue-500, her
`text-label` is grey-600, her `changed-border` is the brand.

Five tokens added, and wired: `--vy-value-box` and `--vy-value-box-line` (the
read-only value box, which this system already drew but with borrowed
tokens), `--vy-changed-border`, `--vy-disabled-bg` and `--vy-disabled-text`.
`contrast:check` now measures 188 pairs rather than 184.

**One number she should see.** Her disabled pair measures **2.47:1 in light
and 2.95:1 in dark**. WCAG 1.4.3 exempts an inactive control, so this is
permitted and the check declares it rather than failing — but a disabled label
at 2.47:1 is hard to read for more people than the exemption implies, and some
teams deliberately exceed it. The figure is now printed by `contrast:check` on
every run rather than buried.

**Two Kendo traps, both already written down here, both walked into anyway.**
The disabled rule had to be prefixed `html[data-kendo-bridged]` to outweigh
the bridge, and it had to target `.k-disabled` — Kendo disables with a class,
not the `:disabled` attribute, and a Button never carries `.vy-btn` at all.
The first two versions of the rule matched nothing and the button stayed
brand blue. Only opening it in a browser showed that.

### Where the reconciliation actually stands

Measured, not estimated: her document carries **91 colour values in its spec
text** (the other 36 in the file are the HTML page's own styling, not part of
the spec). **71 are now in `src/`. Twenty are not**, and they are not
scattered — they are four coherent pieces:

| Still missing | Count | |
|---|---|---|
| **Her dark counterparts** for surfaces she gave us in light — card header `#1B2433`, grid column header `#1B222D`, smart-button `#2A3A5C`, shell open-nav item `#1F2A3D` with its `#7F9CE1` bar, brand steps `#3B63C4` / `#4A6FCC` / `#9DB4EC` | ~8 | the light halves were adopted; the dark halves are still ours |
| **Message surfaces** — her info / success / warning / error backgrounds and text, both themes, each with the contrast ratio already measured | ~8 | `info-bg`, `success-bg`, `warning-bg`, `danger-bg` — no tokens here |
| **File-type chips** — PDF `#FBE9E9`/`#9B2226`, XLS `#E2F3E6`/`#1A6B34`, DOC `#E7EDF9`/`#15347E` | 3–4 | a palette this system does not have at all |
| **Priority dot** amber `#C27A12`, and `#1F8A4C` | 2 | flagged above; waiting on her answer, not on work |

**The status palette is finished.** Light, dark, and the 1px border each dark
pill carries — all seven families match her values exactly, checked value by
value. That was the big one, and it is closed.

**One correction to an earlier claim here.** The second pass said 48 of 87
values were missing and that the number fell to 20. Both numbers were right;
the 87 undercounted because it skipped her three-digit hex values. The count
is 91, and the remaining 20 are the ones tabled above.
