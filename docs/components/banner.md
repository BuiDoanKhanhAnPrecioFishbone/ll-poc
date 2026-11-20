# Banner

An inline notice that sits in the flow of a page, above the thing it is about.
It does not float, it does not time out and it has no dismiss — if a message
needs any of those, it is a [Toast](toast.md).

<!-- ds:tab examples -->

<!-- ds:specimen banner -->

<!-- ds:tab usage -->


<!-- ds:specimen banner-usage -->

> The three rules below, drawn — asked for on 20 Nov. Live components, so a
> "Don't" card cannot quietly stop being wrong.

## Two kinds, and only two

| Kind | Says | Tokens |
|---|---|---|
| Information *(default)* | Something worth knowing that changes nothing you must do | `--vy-info-bg` / `--vy-info-text` |
| Warning | Something to check that does not block the next step | `--vy-warning-bg` / `--vy-warning-text` |

There is no error banner. An error that blocks the next step belongs where the
block is — on the field, or in the error alert that stays on screen — not in a
band the reader has already scrolled past. The BA's principles of 16 Nov 2026
set the same division.

## When to use

- A fact about the record the reader would otherwise have to know already:
  *"First order for this customer."*
- A condition they should check before continuing, which does not stop them:
  *"2 parts have no supplier."*

## When not to use

- **To confirm something the user just did.** That is a toast; a banner has no
  beginning, so it reads as a standing fact rather than as a result.
- **To carry an error.** See above.
- **More than one at a time.** Two banners stacked read as a form of noise
  rather than two messages, and the second is the one that gets skipped.

## Accessibility

The kind is carried by colour alone in the markup, which is the one thing this
system does not allow — so the **words** must carry it. *"2 parts have no
supplier"* is a warning in any colour; *"Supplier status"* is not. Write the
sentence so that turning the page greyscale loses nothing.

This is the reason the banner has no icon while
[Toast](toast.md) does: a toast arrives unbidden and may be read in a glance,
while a banner is read in place, in a sentence, by someone already looking at
the record.

<!-- ds:tab code -->

```tsx
<Banner>First order for this customer.</Banner>
<Banner kind="warning">2 parts have no supplier.</Banner>
```

The kind is a typed prop rather than a class, so a misspelling is a build
error instead of an unstyled banner. `info` is the default and writes no
attribute at all — the common case costs nothing to read in the DOM.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: three Do/Don't card pairs — one at a time, the words carrying the meaning, and not for what just happened |
| 17 Nov 2026 | This page. The element existed and was brand-tinted, which read as a link; it now draws the BA's information and warning pairs |
