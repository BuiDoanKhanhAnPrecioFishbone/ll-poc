# How many sizes does this system actually have?

Asked on 24 Nov: *do the components need several sizes, or one consistent
one — and if several are in use, are they all declared?*

Measured rather than remembered: every interactive control on the list screen
and on the record screen was asked for its computed height, and every size
prop in `src/ui` was counted against its call sites.

---

## The control scale

Four rungs are declared, and all four are real:

| Token | | Used by |
|---|---|---|
| `--vy-control-row` | **26px** | the icon button inside a grid row |
| `--vy-control-sm` | **28px** | avatar, brand mark |
| `--vy-control-dense` | **32px** | Kendo `small` — toolbars, the search box |
| `--vy-control-md` | **34px** | Kendo `medium` — inputs, buttons, the value box |

**One consistent size would be the wrong answer here**, and the reason is in
the fourth column: 26 is what fits inside a 40px grid row beside a value, 34
is what a form field needs to be typed into, and 44 is what a finger needs.
Those are three different jobs, not three opinions. The rungs are also not
ours alone — `kendo-subset.scss` derives Kendo's own button and input padding
from these three tokens, so collapsing them would mean re-deriving Kendo's.

## What the screens actually render

Six values on the record, seven on the list — against four declared rungs.
Two of the extras are legitimate and one was a gap:

| Height | What | Verdict |
|---|---|---|
| **20px** | status pill | **was the gap — fixed 24 Nov**, see below |
| 24px | pager numbers, the back link | the **pointer** minimum target (WCAG 2.5.8), taken from `--vy-space-10`. Not a control rung, and deliberately not 26 |
| 26 · 28 · 32 · 34 | — | the declared rungs |
| 30px | the caret button inside a combobox | **Kendo's own**, inside our 32px control. Not a rung of ours to declare |
| 40px | a grid row | `--vy-row-h-comfortable`, declared with 34 and 48 |

### The status pill had no declared height at all

It fell out of `padding + line-height`, so the same component measured
**23.1px on the list and 23.4px on the record** — one pill, two heights,
because the two screens' text differs. Her sheet gives **20px** with padding
`0 · 10px`, and the comparison of 16 Nov recorded the difference — *"Hers
20px / Ours: from padding"* — without closing it.

Applied, and it closes a second thing with it: she writes the radius as
`10px` where this system writes a pill, and those are the same shape **only**
at 20px tall. Measured after: 20 of 20 badges at exactly 20px on both screens.

> Still open from that same table: her label weight is **500**, ours is
> semibold. That is typography rather than geometry, and `badge.md` states the
> semibold deliberately, so it stays a difference to raise rather than a gap
> to close.

---

## Size props on components

| Component | Rungs | In use |
|---|---|---|
| `Button` | `xs` 26 · `sm` 32 · `md` 34 | **`xs`: 0 call sites.** `sm` 28, `md` 8 explicit + 106 implicit |
| `Select` | `small` · `medium` | 3 call sites pass one |
| `Loader` | `small` · `medium` · `large` | 3 · 1 · 3 — all three earn their place |
| `Dialog` | `sm` 420 · `md` 640 · `lg` 960 · `xl` 1180 | `sm` **added 24 Nov**, see below |
| `Icon` | one prop, a number | **five values in the build** — see below |

### `Button`'s `xs` rung has never been used

Recorded on the [Button](components/button.md) page on 8 Nov and still true.
The grid-row icon buttons it was built for are `.vy-view-btn`, a hand-written
button with its own 26px rule, so the rung and the thing it was meant for
both exist and have never met. One of the two should go, and which is a
decision rather than a measurement.

### `--vy-dialog-sm` was declared and unreachable

Her popup ladder is 420 · 640 · 960 · 1180. The 420 was added as a token on
18 Nov and the component's own type read `'md' | 'lg' | 'xl'` — so the token
could not be reached by anything, which is worse than not having it: it reads
as supported. `sm` is in the union now. Nothing asks for a 420px dialog today.

### Icons are the one place with several sizes and one token

The set is drawn on a 20×20 box and takes a `size` prop as a plain number.
The build passes **five different values**: 16 (×2), 15 (×4), 14 (×5),
13 (×5), 11 (×1). One token exists — `--vy-icon-sm`, which is **16px**.

Her sheet names two rungs and says where each goes: **`icon-md` 16px** in
toolbars, banners and menus, **`icon-sm` 14px** inside icon buttons and grid
rows. So the answer to "one size or several" is *two*, by place — but
adopting it means renaming our `--vy-icon-sm` away from 16px, which the app
shell's own rules use.

**That is already an open question with her** (`ba-questions.md`, *Icon token
names*), so the five literals are left alone here rather than resolved by
whoever happened to be measuring. It is the one real "used but not declared"
finding in the system, and it is one question away from being closed.
