# Accents and row tones

A tone is a row's **state in the quote**, not a severity. Three of them paint
most of a BoM grid, and the legend under the grid names all three.

**Amber does three jobs, and that is allowed because of two rules.** The same
`#fef3c7` is the `open` status, the `short` row tone and the `known-mfg` row
tone. The objection writes itself — *yellow should mean warning and nothing
else* — so here is the measured answer rather than an assertion:

1. **They never meet.** `short` paints the Quoting and Quote Result grids,
   `known-mfg` paints Review BoM, and **neither of those grids has a status
   column** — checked, not assumed: zero columns with `role: 'status'` in
   either. An amber pill and an amber row cannot appear on one screen.
2. **Every amber grid carries a legend** that names what its amber means, on
   that screen. A colour only the author can decode is a colour that means
   nothing; a colour with a key beside it is a colour with one meaning.

What amber consistently means across all three is **needs attention, nothing
is broken** — which is why `blocked` and `missing` are red and not a darker
amber.

**Which of the two ambers.** `--vy-accent-warning` `#b45309` is the default
and has twelve call sites; `--vy-accent-caution` `#d97706` has **one**, the
email-mode composer border. They are 17.9 ΔE apart, so they are genuinely
distinguishable — this is not a duplicate pair — but the system never said
which to reach for, and twice a comment in the code had to decide it in
passing. Stated now: **`warning` for anything the user should act on,
`caution` only where two amber levels appear together and the lower one needs
to recede.** One place does that today. A second token with one call site and
no rule is how a palette drifts.



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-tone-excluded-bg` | `var(--vy-grey-100)` | `#eceff3` | `#2a323f` |
| `--vy-tone-excluded-fg` | `var(--vy-grey-500)` | `#626d7e` | `#aab4c3` |
| `--vy-tone-missing-bg` | `var(--vy-red-50)` | `#fdeceb` | `#38201e` |
| `--vy-tone-missing-fg` | `var(--vy-red-700)` | `#9e231d` | `#ee9a96` |
| `--vy-tone-short-bg` | `var(--vy-status-open-bg)` | `#fef3c7` | *(same)* |
| `--vy-tone-covered-bg` | `var(--vy-status-done-bg)` | `#d1fae5` | *(same)* |
| `--vy-tone-known-mfg-bg` | `var(--vy-status-open-bg)` | `#fef3c7` | *(same)* |
| `--vy-tone-pending-bg` | `var(--vy-surface-sunken)` | `#eceff3` | *(same)* |




| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-accent-positive` | `#047857` | — | `#75f0cd` |
| `--vy-accent-caution` | `#d97706` | — | `#f0b775` |
| `--vy-accent-warning` | `#b45309` | — | `#f0aa75` |
| `--vy-accent-waiting` | `#6d28d9` | — | `#a679ec` |
| `--vy-accent-neutral` | `#4d5766` | — | `#aab4c3` |
| `--vy-accent-bar-w` | `3px` | — | *(same)* |


