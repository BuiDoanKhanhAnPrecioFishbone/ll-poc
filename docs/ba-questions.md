# Questions on the UI principles, 16 Nov 2026

> Vietnamese version, written to send to her:
> [Một số câu hỏi về bản UI Principles 16/11](ba-questions-vi.md)

Everything below is a question for the BA, not a decision taken without her.
Each one quotes her document and, where a number decides it, gives the
measurement rather than an opinion.

**The document is good, and that is why this list is worth having.** It is
specific enough to be checked, which most design documents are not: 91 colour
values, ratios printed beside the pairs, sizes per widget. Eight of her
contrast figures were re-measured here and all eight matched to the second
decimal. The items below are the ones that did not survive the same treatment.

---

## A · Three that will fail an accessibility review

### A1. Focus on a primary button is a fill change and nothing else

> *"Focus: lighter fill primary-focus #2754BC · #4A6FCC, one step lighter;
> **no ring, no border**"*

WCAG 2.4.11 asks a focus indicator to reach **3:1 against the unfocused
state**. Measured:

| | Resting → focused | |
|---|---|---|
| Light | `#1A419E` → `#2754BC` | **1.34:1** |
| Dark | `#3B63C4` → `#4A6FCC` | **1.18:1** |

A keyboard user cannot see where focus is. Her secondary button does not have
this problem — it takes *"border focus #2754BC at 2px"*, which is a real
indicator — so this looks like an oversight on one row rather than a position.

**Question:** can the primary button take the same 2px focus border as the
secondary one?

### A2. Two controls have no focus state at all

> Menu item — Focus: *"**The same as hover**; no outline"*
> Link — Focus: *"Underline, **as on hover**; no outline"*

If focus looks exactly like hover, then with a mouse resting anywhere on the
page there are two identical highlights and no way to tell which one the
keyboard will act on. This is WCAG 2.4.7, and it is also simply confusing.

**Question:** may these take a focus treatment distinct from hover?

### A3. Three things can only be discovered by hovering

Her own user profile and devices make this the sharpest one:

> *"program managers, purchasing managers, planners, warehouse and accounting
> staff … **not tech-savvy**. Age: **30 to 60+**"*
> *"VIQ runs on office screens and on **shop-floor terminals**"* — and her own
> device list includes **iPad 820** and **iPhone 390**.

On a shop-floor terminal or a tablet there is no hover. These three are
hover-only:

| Her rule | What is unreachable without a mouse |
|---|---|
| *"The reason … shows in a tooltip **on hover** of the box. **Never a lock icon**"* | Why a field cannot be edited |
| *"Field help … **Hover or keyboard focus** opens a tooltip … No help line under the field"* | The field help itself |
| *"Editable and read-only cells **look the same until hover**"* | Which grid cells can be edited |

The lock line is the one to look at first, because the rule removes the only
signal that works without a pointer. This system currently draws a lock glyph
**and** the reason in words, from a 14 Oct decision — *"read only with lock
icon and disable fill bg"* — so adopting her rule would be a step back on
exactly the devices she names.

**Question:** on touch, what replaces hover for these three?

---

### A4. Large editable grid — the one section of her document we have not built

This is the **last unbuilt section**, and it is stopped at the question above
rather than at anything hard to make.

Her *Large editable grid* (paraphrased, not quoted): a grid over roughly
**200 lines** draws **no box at all** on an editable cell until hover, keeping
only a changed cell boxed in blue until Save; a small grid inside a form keeps
a visible box in every editable cell.

The reasoning is right, and this build already agrees with it: the quoting
grid has **22 columns** and only **4 cells** in it can be typed into. Bordering
all 22 is a wall of boxes with the four live ones lost inside it — which is
why `.vy-cell-input` is **already transparent at rest** here and the border
arrives on hover. Her mode is running, on the small grid.

What is left is one sentence: **the hover border is the only thing that says
the cell can be typed into.** Without a pointer there is nothing.

#### A proposal, for her to confirm or replace

This system already has a `@media (pointer: coarse)` layer, built for exactly
this kind of decision — the 44px touch floor applies only where there is a
finger, and a mouse keeps the density, because density is what makes an ERP
workable.

The same split, applied to the four hover cases:

| With a mouse | On touch |
|---|---|
| Exactly as she writes it: no box until hover | Draw the box at rest, on editable cells only |
| The locked reason in a tooltip, no lock glyph | Keep the lock glyph |
| Field help on hover or keyboard focus | Unchanged — keyboard focus still reaches it, but it needs a way to open by touch |

What it costs: on an iPad the quoting grid shows 4 bordered cells among 22
columns — **not** the wall of 22 boxes she is avoiding, and not a blank screen
either.

Two alternatives, for comparison:

- **Box at rest everywhere.** Drops the two modes entirely, and loses the
  thing she is protecting.
- **A user setting.** One more preference, and one more decision for the
  person her own document describes as *not tech-savvy*.

**Question:** can she confirm the table above — mouse unchanged, touch draws
the box at rest? A yes unblocks the section.

---

## B · Four places the document disagrees with itself

### B1. The icons are emoji

Her Icons section is unambiguous:

> *"One set, drawn the same way: a **20 × 20 box, strokes only, no fill**, one
> stroke width (1.5px), round ends. **Icons take the color of the text around
> them**."*

The examples then use **11 different emoji** — 👁 ×13, 🔍 ×5, 📅 ×5, 🗑 ×4,
✏ ×4, ☰ ×3, 🔗 ×2, 📎 ×2, 📄, 🧾, 🔔 — and emoji are filled, multicoloured,
drawn by the operating system's font rather than by anyone here, and
different on Windows, macOS and Android. They are the opposite of every clause
in that sentence.

Nothing in the document says they stand in for icons still to be drawn, and
her *"Open for design"* list does name 19 icons as undrawn — so that is
probably what they are. It needs saying in the document, because anyone
implementing it literally ships emoji.

**Question:** confirm the emoji are placeholders, and that the 19 undrawn
icons are the real list?

### B2. 9px text, under her own floor

> *"Nothing below 12px on desktop"* — and the file row's type chip is
> *"9px 700"*.

Built as 9px here, because a three-letter mark in a fixed 30×20 box is
recognised rather than read, and named `--vy-text-chip` so the exception is
visible rather than buried. It is still her floor being crossed by her own
spec.

### B3. The file row's two numbers cannot both hold

> *"Row **34px** · padding **6px** 10px"* — with her own download button in a
> row at **26px**.

26 + 6 + 6 = 38. The height was kept and the vertical padding dropped, because
a list of files is read down its left edge and rows that vary by 4px because
one has a button read as ragged.

### B4. The checkbox is 3px, and her radius scale has no 3px

> Checkbox (bare): *"radius **3px**"* — while her Shape and elevation section
> names four radii: **4 · 6 · 8 · pill**.

The same shape as the 9px item above: a one-off value outside the scale she
sets herself. Drawn here at 4px, the nearest rung on her own scale.

### B5. The type scale defines two steps it then forbids

> `2xs` 10px, `xs` 11px — Role: *"**Not used on desktop** (below the 12px
> floor)"*

A scale with rungs nobody may stand on invites someone to use them by
accident. This system sets both to 12px outright; same result on screen, and
her reasoning is the better-written half.

---

## C · Five that are simply not stated

| | |
|---|---|
| **Dark values for the file-type chips** | She gives light for PDF, XLS and DOC and names IMG teal and ZIP gray. Nothing for dark. These use her dark values for the nearest family she names |
| **The status pill's width** | Not mentioned. This system fixes a 104px slot, because badges of different lengths in a status column left a ragged edge |
| **12-hour or 24-hour** | Her Datetime example reads `10:30 AM`; this app reads `10:30` and stamps logs at `10:56:15`. Her own open list still carries date format as unresolved |
| **`control-row` on which Kendo step** | She writes *"26px (Kendo sm)"*; this system's sizing page says the same 26px is Kendo's `xs`. The value agrees, the rung name does not, and one of them will mislead whoever configures the scale |
| **Icon names** | → **C1 below**: after the measurement of 24 Nov this is no longer a naming question |

### C1. Icons are drawn at five sizes, and one is declared

Pulled out of the table because measuring it made it answerable.

The set is drawn on a 20×20 box and takes its size as a plain number. Counted
in the running code:

| Size | Call sites |
|---|---|
| 16px | 2 |
| 15px | 4 |
| 14px | 5 |
| 13px | 5 |
| 11px | 1 |

Plus **4 call sites that pass no size** and take the default 16. So: **five
sizes, one token** — and that token, `--vy-icon-sm`, is **16px**.

Her sheet names **two** rungs, and names where each one goes:

> *icon-md **16px*** — toolbars, banners, menus
> *icon-sm **14px*** — inside icon buttons and grid rows

Her rule is the right one and we would like to take it whole: two rungs, split
by PLACE rather than by nearest number. One thing is in the way —
`--vy-icon-sm` here carries 16px, so adopting hers means renaming the token,
and that name is used by the app shell's own rules.

**Question:** can she confirm the two rungs, 16 and 14, and where each goes?
The 17 sites that state a size then move onto them, and the token is renamed to match. If a
third rung is needed, we need its number and its place.

---

## D · Two where we hold a measurement she may not have

Not errors — cases where her number is right and the ground it was measured
against is worth revisiting.

### D1. `border-input` clears 3:1 on white only

She states 3.06:1 for `#8A94A6`, which is correct against white. Her own spec
puts inputs on surfaces that are not white:

| Ground | Hers `#8A94A6` | Ours `#758096` |
|---|---|---|
| `surface` `#FFFFFF` | 3.06:1 ok | 3.97:1 ok |
| her `ground` `#F5F7FA` | **2.85:1 fails** | 3.70:1 ok |
| her `section-bg` `#F1F4FA` | **2.78:1 fails** | 3.61:1 ok |
| her `value-box` `#F1F3F6` | **2.75:1 fails** | 3.57:1 ok |

WCAG 1.4.11 asks 3:1 for a control boundary. Recommend keeping ours.

### D2. The priority dot

Hers is High red `#C62D26`, Medium amber `#C27A12`. Those are the two colours
this product already spends on *"something is wrong"*. On a list showing
Priority and Status together, a high-priority row and a blocked row are both
red. This system draws three steps of one ink instead, so the ranking survives
greyscale — which is also her own *"never a colour alone"* rule applied to a
ranking.

**Question:** on a list showing both, how should a reader tell a high-priority
row from a blocked one?

---

## What this list is not

It is not a disagreement about direction. Her structure, her palette, her
sizes and her status vocabulary have been taken as written here —
79 of her 91 colour values are in the system, every widget in her Input
widgets section is built, and the eight contrast figures she published were
reproduced exactly. These are the places where following the document
literally would produce something she would not want.
