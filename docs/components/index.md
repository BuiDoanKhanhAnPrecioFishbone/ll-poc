# Components

`src/ui` holds 33 files: the primitives, plus the icon set, the preference
store and three hooks. Each wrapper has a reason, and the rule that produced
them is the same every time — **the live system already ships KendoReact, so
the question is never "what should this look like" but "what does Kendo
already do, and what must we add".**


## Drawing a usage tab

A rule about **appearance** read as a sentence has to be rebuilt in the
reader's head before it means anything. *"One filled button per view"* is four
words; two cards showing one filled button and then three is instant. So the
usage tab of a page can carry Do/Don't cards, the way Atlassian, Carbon and
Polaris all do — asked for on 20 Nov 2026.

They are **live components**, not exported images. Every other house draws
these as pictures, which go stale the moment a token moves, and this system
has already moved its radius scale once.

To add them to a page:

1. Write `src/specimens/<slug>-usage.tsx` exporting `examples`, where each
   entry carries `compare: [{ verdict, caption, render }, …]` instead of
   `render`. The type is in `src/specimens/types.ts`; the registry finds the
   file on its own.
2. Put `<!-- ds:specimen <slug>-usage -->` under that page's
   `<!-- ds:tab usage -->`.

A separate slug, rather than more entries in `<slug>.tsx`, is what puts them
on the **usage** tab while the Examples tab keeps the variants and states —
the directive names a slug, and a slug is a file.

### What is drawn, and what is not

**34 of the 42 component pages** carry them, 70 pairs in all.

The eight without are not a backlog. Each was looked at and left, for one of
two reasons, and the reason is the same one that makes a card worth having:

| Page | Why not |
|---|---|
| [Dialog](dialog.md), [Toast](toast.md), [Command palette](command-palette.md), [View setting](view-setting.md) | **It cannot sit in a card.** Each covers the whole frame from a portal — two of them side by side is one on top of the other, not a comparison |
| [App shell](app-shell.md) | The same, at the size of the window |
| [View picker](view-picker.md) | **Nothing to see.** Its rules are about identity and ownership — keyed by `id` not `name`, a View is saved where a filter is this session — and the two screens look identical |
| [Support ticket](support-ticket.md) | Its one usage rule is *a recoverable failure gets Try again instead*, which is drawn on the [error state](error-state.md) cards, from the side where the right answer lives |
| [File drop](file-drop.md) | Its rules are about what happens after the drop — `autoUpload` off, no `saveUrl` — and nothing about them is visible |

**Three things learned drawing them.**

**Put the rules the page already gives on the cards, not new ones.** If a card
needs guidance the page does not have, the page is what is missing.

**Drawing a rule is a test of it.** The Field cards are what found that the
red asterisk this system has specified since the page was written had never
been rendered by `TextField` at all.

**A "Don't" has to be something that can really happen.** Most of them are the
real component used for the wrong job, which is how these mistakes reach a
screen. Some are hand-drawn markup — a shadow added to a card, a heading
written without its rule — and that is still honest, because that is what a
developer in a hurry writes. What does not work is drawing a failure the
system cannot produce: the pager's number window was going to have a card
reading *"Don't: fourteen buttons in a row"*, and this component windows at
eight pages and will never make that row. A pair whose "Don't" is an argument
with nobody was dropped rather than drawn.
