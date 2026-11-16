# VIQ UI Principles, 16 Nov 2026 — checked against this system

The BA's settled answers to the open design questions, received as
`VIQ_UI_Principles_26Nov16.html` and compared value by value against
`src/theme/` and the pages here.

**The headline: it agrees with us almost everywhere.** It uses our token names
(`--vy-danger`, `space-1…14`, `control-md`, `col-money`), and where both
documents state a number they match on 31 of the 38 checked. That is not a
coincidence — it is the same system written from the other side.

Three values were adopted straight away. Four are flagged below, because this
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

---

## Flagged — please settle these with her

### 1. Date and date-time column widths

| Role | Hers | Ours | |
|---|---|---|---|
| `col-date` | 110px | **150px** | |
| `col-datetime` | 170px | **190px** | |

Not adopted, because `tokens.ts` carries the reason in a comment and the
reason is a measurement of the **live system**:

> The live Part Master renders LAST CHANGE as `09/09/2026 16:35:29` and the
> MPN list renders LAST SYNCED AT the same way, so a column that carries a
> timestamp needs room for one — 150px fits "16 May 2026" and clips the time
> off the end of it.

Her widths assume the numeric format `11/14/2026` and `11/14/2026 09:14 AM`.
If that format is now settled for every date column, **her numbers are right
and ours are oversized** — but the date format itself is still listed as
unresolved (see below), so changing the width before the format would be
building on the thing that moves.

**Question for her:** is `11/14/2026` the format for every date column,
including LAST CHANGE and LAST SYNCED AT?

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
