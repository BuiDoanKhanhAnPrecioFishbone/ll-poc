# The live Activity Logs tab, read 15 October 2026

The customer rebuilt this tab in Voyager and asked us to follow it. Read on the
live RFQ record — `/sales-management/quotation/<id>`, Activity Logs — on 15 Oct
2026, at 1440x900. Tier 2 evidence under `docs/precedence.md`: this is the live
system, not a written requirement, but the customer asked for it by name, which
makes the ask itself tier 1.

Nothing was clicked that writes. The record was opened through the row's View
button and only tab and entry selections were made.

## What it is

Three parts, top to bottom:

```
STATUS FLOW
  [2026]   New                      ····>   Quoted
           System Administrator             System Administrator
           - → RFQ was created              New → Quoted
           10/13/2026                       10/13/2026

[All users ▾] [month/day/…] [month/day/…]   │  S  System Administrator   13:44:40 10/14/2026
10/14/2026                                  │
  S  System Administrator   13:44:40        │  FIELD CHANGES
     1 field changes                        │  ┌──────────────────────────────────┐
  S  System Administrator   17:00:26        │  │ Excess Moq      OK  →  None      │
     1 field changes                        │  └──────────────────────────────────┘
10/13/2026                                  │
  S  System Administrator   16:21:07        │   (before a selection:
     1 field changes                        │    "No activity selected.")
```

## How it is built, where that matters

| Part | Live implementation |
|---|---|
| Status flow | `section.status-log-flow` with `h3.status-log-flow__heading` (13px / 600 / 1px tracking / uppercase / `#718ba0`), wrapping a **Kendo Timeline in horizontal mode** (`k-timeline k-timeline-horizontal`) |
| Year flag | A timeline track item, `#7bd2f6` fill, black text, 4px radius, 4px 8px padding |
| Entry list | Kendo ListView. Rows 56px, padding 10px 12px, 1px `#e5e7eb` bottom rule; selected row `bg-blue-100` |
| Avatar | 32px circle, `#14b8a6` (teal), white, 500 weight |
| Old value | `bg-[#fbe7ea] text-[#d95b6e]`, **line-through**, `rounded-md`, px-2 py-1 |
| New value | `bg-[#fff7db] text-[#a16207]`, same shape |
| Date group heading | `text-gray-400`, 14px, 400 weight, no fill |

The page is Kendo components with Tailwind utility classes over them.

## What we built, and the three places it differs

Built the same day: `src/components/quotation/ActivityTab.tsx`, with its rules in
the ACTIVITY LOG section of `src/theme/app.css`.

**1. It opens on the newest entry.** The live tab opens on "No activity
selected." — two thirds of the tab spent on an instruction to click. The entry
almost everyone wants is the most recent one, so it is already open. The empty
state is kept for the case that earns it: a filter that matched nothing.

**2. Order inside a day.** On the record we read, one date group ran 13:44 then
17:00 and the next ran 16:21 then 14:47 — opposite directions. One of them is
wrong whichever rule was intended. Ours is always the order things happened,
under a newest-first list of days.

**3. The new value is not amber.** `#a16207` on `#fff7db` is a warning colour,
and in this product amber means "look out" — it is the overdue chip and the
warning banner. The value in that chip is not a warning; it is simply what the
field says now. Struck red for what it was, brand blue for what it is, which
reads the same way round without borrowing a signal that means something else
three screens away.

Also not copied: `1 field changes`. Ours says `1 field changed`.

## What it cost us to find

The flow is **derived** from the log rather than stored beside it. Every status
change is already an entry — `action: 'Status'` with `Status: from → to` in its
changes — so a second list of the same facts could only disagree with the first.
The live screen reads the same way: its first card says `- → RFQ was created`,
which is the creation entry rendered with no diff on it.

Two defects fixed on the way:

- **`.vy-avatar--sm` was declared twice**, globally, at 28px and at 20px. The
  activity-log copy came second, so it won on all nine screens that use the
  modifier — none of which are the activity log. One declaration now, at the
  value that was winning, so no screen moved; the log scopes its own 28px.
- **The demo data had nothing to show.** A record carried a creation and at most
  a status change, so the tab was two lines with no diff in it. Field edits are
  now generated from the record index and **never from the random stream** — one
  extra `rnd()` call inside that generator re-rolls every record after it, which
  is how a customer's RFQ count moved from 43 to 55 the last time something was
  added there. Canary after the change: still 43.
