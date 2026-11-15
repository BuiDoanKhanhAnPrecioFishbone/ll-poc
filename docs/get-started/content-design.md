# For content

Whoever writes the words in the product. Less is settled here than elsewhere:
[Content](../foundations/content/index.md) holds the rules so far, and its
five sub-pages — voice and tone, language and grammar, inclusive writing, date
and time, designing messages — are planned and not written. What follows is
only what the existing pages state.

## The settled rules

| Rule | Example |
|---|---|
| Casing | Title Case for labels, sentence case for prose — see [Typography](../foundations/typography.md#casing--three-levels-drawn-differently-on-purpose) |
| A control says what happens | `Publish`, then a toast saying `Published` |
| An error says what to do | Not "Something went wrong" |
| Nothing is "not implemented" silently | A toast says what it *would* do |
| A derived figure says it is derived | *"Derived from this run — the live system takes them from the customer's purchase history"* |
| A session-only change says so | *"Added in this session… nothing here is saved"* |

## Toasts

For something **already done** that the user need not act on. One sentence; a
description, not a heading plus a body. The toast repeats the button's word:
`Publish` becomes `Published`, not `Success`. See [Toast](../components/toast.md).

- An error toast names **what to fix**, and stays 9 seconds against 4.5 for the rest.
- `notImplemented` takes the rest of the sentence *"This would …"*. It never
  apologises and never says *coming soon*.

## Error screens

Three slots, one per question a person has — [Error state](../components/error-state.md):

| Slot | Question | Rule |
|---|---|---|
| Title | What failed | In the user's words. Never an exception message |
| Body | What it means for them, and what it does not | 60 characters wide at most |
| Actions | What they can do next | At least two |

*Something went wrong* tells the user to try the thing that just failed, with
nothing to go on. The error id is always shown and can be copied, so the user
can paste it to a colleague.

## Not covered yet

Tone, grammar, inclusive language and date formats have no page to cite, so
nothing is claimed about them here.
