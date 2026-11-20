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

Drawn so far: [Button](button.md), [Banner](banner.md), [Field](field.md).

**Two things learned building the first three.** Put the rules you are drawing
on the cards, not new ones — if a card needs guidance the page does not
already give, the page is what is missing. And drawing a rule is a test of it:
the Field cards are what found that the red asterisk this system has specified
since the page was written had never been rendered by `TextField` at all.
