# Voice and tone

The product talks like a colleague who knows the job: plain, specific, and
never cheerful about a problem.

There is no tone spectrum here — no "friendly on success, formal on error"
scale — because nothing in this project has measured one. What exists instead
are four rules that already govern the words in the running build, and they
are enough to write most screens.

## Say what happens, not what the system did

A control is named for its outcome, and the confirmation uses the same word:
`Publish`, then a toast saying `Published`. A reader should not have to map
one vocabulary onto another to know the thing worked.

## An error says what to do next

Not "Something went wrong". The [error state](../../components/error-state.md)
has three slots because a person has three questions — *what failed · what it
means for me · what I can do next* — and only the first is generic. Where
there is no action, say so plainly rather than offering a Retry that cannot
help.

## Never pretend

This is the rule the rest of the system leans on hardest, and it is the one
that would be easiest to drop.

- Nothing is "not implemented" silently. A toast says what the action *would*
  have done.
- A derived figure says it is derived: *"Derived from this run — the live
  system takes them from the customer's purchase history"*.
- A session-only change says so: *"Added in this session… nothing here is
  saved"*.

## Length is set by the surface, not by taste

A toast is one line. A dialog title is a question or a noun phrase, never a
sentence. A field hint is shorter than the label it explains. Where a surface
has a limit, [Designing messages](designing-messages.md) states it.

## What this page does not settle

Tone for marketing or onboarding copy, Vietnamese-language style, and how
formal the product should be with a named user. None of them has a source in
this project yet, and a guess here would be copied into screens.
