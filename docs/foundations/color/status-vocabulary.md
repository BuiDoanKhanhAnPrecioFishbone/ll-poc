# Status vocabulary

**Seven families, one per stage of a record's life.** Set by the BA's UI
principles of 16 Nov 2026, which also name the business words each family
holds — a mapping this system had never written down.

> **A status is a word and a colour, never a colour alone.** The pair is what
> makes it legible to someone who cannot separate the hues.

| Family | Token | Light bg / text | Dark bg / text | Holds |
|---|---|---|---|---|
| gray · not started | `draft`, `open` | `#eceff3` / `#4d5766` | `#393f48` / `#d3dae3` | New, Open, Draft, Staged, Re-open |
| teal · in progress | `progress` | `#d9f0ee` / `#0e5a52` | `#244145` / `#8be3d8` | In Progress, Kitting, In Production, In RI, Partially Shipped, Partially Received |
| blue · committed | `review` | `#e5eaf7` / `#15347e` | `#2e3a4f` / `#b4cbfa` | Quoted, Confirmed, Released, Sent, Approved |
| green · done | `done` | `#e4f1ea` / `#1a6b34` | `#28413c` / `#98e3b7` | Completed, Shipped, Closed, Posted, Active |
| red · blocked | `blocked` | `#f8e6e5` / `#9b2226` | `#423238` / `#f7ada6` | On Hold, Rejected, Shortage, NCMR, Need Info |
| amber · waiting | `waiting` | `#f8efe3` / `#7a4a05` | `#433b2b` / `#f8cc6e` | Waiting for Approval only |
| outline · ended | `cancelled` | white + `#b9c0ca` / `#4d5766` | `#161c25` + `#4a5466` / `#aab4c3` | Cancelled, Inactive, Reversed |

Measured 16 Nov 2026, light / dark: gray 6.34 / 7.53 · teal 6.78 / 7.34 ·
blue 9.56 / 7.01 · green 5.65 / 7.33 · red 6.58 / 6.58 · amber 6.57 / 7.29 ·
outline 7.32 / 8.17. All AA, and `contrast:check` re-proves them on every push.

## The border is not decoration

Every family carries `--vy-status-<name>-bd`. In light it is transparent for
six of the seven and visible on `cancelled`, which is drawn as an outline pill
rather than a filled one. In dark every family shows it: a 20% tint needs a
line to separate it from the surface behind it.

## Two tokens, one family

`draft` and `open` both render gray, because the BA's sheet puts **Open** in
the not-started family. They are kept as separate tokens rather than merged:
the words mean different things to the business, and a later sheet may split
them again.

## What this replaced

Until 16 Nov this was eight independently chosen pairs rather than seven
families. Three changed more than their shade:

- **waiting** was violet `#ede9fe`; it is now amber. Amber also means warning,
  which the BA's sheet accepts for this one word.
- **cancelled** was a filled grey pill; it is now an outline.
- **review** was cyan and is now the blue committed family, which did not
  exist here before.

The old values were measured and correct. They were a different system's
answer to the same question, and the client's own is the one the client sees.

**One knock-on, caught by looking.** `--vy-tone-short-bg` and
`--vy-tone-known-mfg-bg` were `var(--vy-status-open-bg)`, so moving Open to
gray would have turned two row tones gray with it. A tone is a row's state in
the quote, not a status, so they now hold their own `#fef3c7`.
[Accents](accents.md) explains why that amber does several jobs.
