# Language and grammar

The conventions that have actually been decided. Where a convention exists
only as a habit, this page says so rather than promoting it to a rule.

## Casing

Two levels, and the line between them is the surface, not the importance.

| | |
|---|---|
| **Labels, buttons, column headers, menu items** | Title Case, with prepositions lowercase unless they lead — for, to, of, by, as, in, on, at, from, with, via, per, into |
| **Prose, hints, toasts, error bodies** | Sentence case |

The full rule, including the third level drawn for column headers, is in
[Typography](../typography.md#casing--three-levels-drawn-differently-on-purpose).

## Numbers

**Money carries six decimal places** — `$6,839.290000` — matching the format
the client's own guideline 2.1 specifies and the live system renders. It looks
wrong at first glance and is not: a unit price multiplied across thousands of
boards loses money at two.

Quantities are plain integers. Percentages carry the sign where a direction
matters: `↓ 100.00%`.

## Dates and times

Unsettled, and deliberately not decided here. Two of the client's own
documents specify different formats; [Date and time](date-time.md) sets out
all three sources and picks none.

## Names in the product are facts, not choices

Field names, option lists and status words are **facts about the business**.
They are looked up, not drafted — rule 2 of the five in
[For developers](../../get-started/develop.md). Where this build guessed a
vocabulary, the page that uses it says so and says it will be swapped on
sight.

## What this page does not settle

Abbreviations, pluralisation of unit names, serial commas, and Vietnamese
grammar for a bilingual edition. There is no source for any of them yet.
