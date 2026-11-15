# Inclusive writing

Most of what this page would say in another design system is enforced here by
a token or a check rather than by advice. What is left is short.

## Never a colour alone

**A status is a word and a colour.** That is the rule the whole
[status vocabulary](../color/status-vocabulary.md) is built on, and it is an
inclusive-writing rule before it is a colour one: the pair is what makes a
state legible to someone who cannot separate the hues.

The same holds wherever meaning is carried visually. A priority is a dot
**and** a word. A row tone is a tint **and** a label. If you find yourself
explaining a screen by pointing at a colour, the screen is not finished.

## Never position alone

"The button on the right" means nothing read aloud. Name the control:
*"Discard Changes"*, not *"the second button"*. The same applies in hints
that reference layout — a screen reader hears the words in order, not the
arrangement.

## Motion is a state, not a preference to ignore

Under `prefers-reduced-motion: reduce` the loading illustration holds its
pose and the step bar still fills: the information survives, the movement
does not. Removing the animation must never remove the meaning —
[Motion](../motion.md) sets out why an arm with no sparks says something
different from what the state means.

## Plain words beat precise ones when they disagree

An error body is read by someone who is already stuck. *"The pricing service
did not answer"* lands; *"upstream dependency timeout"* does not. Precision
that only a developer can decode belongs in the error id, which is there so
support can be precise without the reader having to be.

## What this page does not settle

Pronouns and gendered language, honorifics for a Vietnamese-language edition,
and how to name people in the product. Nothing in this project has decided
them, and inventing a convention here would be worse than the gap: it would
look settled.
