# Field

> `src/ui/Field.tsx` · **91 call sites** — the most used component in the
> product.

Three controls in one file, because they are one idea wearing three shapes:
`TextField`, `TextArea`, `SearchField`.

---

<!-- ds:tab examples -->

<!-- ds:specimen field -->

<!-- ds:tab usage -->


<!-- ds:specimen field-usage -->

> The three rules on this page that are about **where something sits**, drawn
> — asked for on 20 Nov. Two of the "Don't" cards are hand-drawn markup,
> because `Field` has no way to produce the wrong shape; each says so.

## When to use

| Control | For |
|---|---|
| **TextField** | One line of typed text, a date, a number |
| **TextArea** | Prose the user writes — notes, a description |
| **SearchField** | Narrowing a list by a value the user already knows |

## When not to use

| Instead of a Field | Use | Why |
|---|---|---|
| Choosing from a known list | [Select](select.md) | A field that accepts anything cannot accept only what exists |
| A value this screen does not own | A read-only box with a padlock | [D2](../design-system.md#d2--fields): grey means not editable, and the padlock carries the reason |
| A yes/no | Checkbox | A field for "Yes"/"No" is three ways to be wrong |
| Filtering a list | [Filter toolbar](filter-toolbar.md) | Search finds a record you can name; filters describe a set |

---

<!-- ds:tab examples -->

## Anatomy

A `<label>` wrapping everything, so the whole thing is one hit target and the
label needs no `for`.

| Part | Rule |
|---|---|
| **Label** | **Above** the value, never beside it. Title Case, 12px, 600 |
| **Required** | A **red asterisk** right after the label, in view **and** edit mode |
| **Optional** | No mark. Never the word *(optional)* |
| **Input** | `--vy-border-control` in edit mode; a sunken box in view mode |
| **Hint** | Below the field, italic, at or below the label's size |

**A hint is a sibling of the label, never inside it** — inside, it joins the
accessible name and gets read as part of the field's title.

**A hint and an error never appear together.** Two lines, each claiming to say
what to do next, is one line too many.

---

<!-- ds:tab usage -->

## Errors arrive on blur

Not on every keystroke. A field that goes red while you are still typing the
third character of a part number is telling you that you are wrong before you
have finished being right.

The message is red text below the field — and wherever the system settles
that placement, **the timing does not change**.

---

## SearchField is its own component on purpose

> Search is the single most-used control on every list screen and must look
> identical on all of them.

It is a `type="search"` input with a leading magnifier, and it is the one
field with no label — the icon and the placeholder carry it, which is only
acceptable because the control is in the same place on every screen.

---

## `ref` is declared, not inherited

React 19 passes `ref` to a function component as an ordinary prop, but
`InputHTMLAttributes` does not carry it, so TypeScript rejects it.

It is declared because **Login needs it**: to put the cursor in the first
field, and to send it back there when a submit finds the field empty.

## The three edges, measured

`.vy-input` draws its own boundary in three states, and all three are
1.4.11's business. On the panel, transitions stopped:

| | rest | hover | focus |
|---|---|---|---|
| light | 3.97 | 5.24 | 6.82 |
| dark | 4.04 | 5.23 | 9.58 |

> **Two of those six numbers were wrong until 9 November**, and both only in
> dark. `:hover` pointed at `--vy-border-heavy` — darker than the resting
> border on white, *lighter* than it is what dark needs — so the hover edge
> measured **2.68** on the panel and **2.02** on `surface-strong`: fainter
> than the state it replaced, and under the threshold. `:focus` pointed at
> `--vy-brand-boundary-strong`, which kept blue-400 at **2.88** after the note
> beside it had already measured that number and moved the focus *ring* off
> it.
>
> Neither check could see them: one reads the palette, the other swept a page
> nobody was pointing at. Both measure states now —
> [`vien-state-09nov.md`](../vien-state-09nov.md).

The hover edge has its own token, `--vy-border-control-hover`, because *more
visible* means darker on white and lighter on near-black, so one value cannot
carry it. Light is unchanged.

## Accessibility

| | |
|---|---|
| Label | The `<label>` wraps the control, so no `for`/`id` pairing to get wrong |
| Required | The asterisk is visible; the control carries `required` |
| Hint | A sibling, not inside the label |
| Error | On blur, below the field, in red text — and the summary banner carries `role="alert"` |
| Search | `type="search"`, so the browser offers its own clear control |
| Hover and focus | Both edges clear 3:1 on every ground in both themes, and `border:check` sweeps all three states — see above |

<!-- ds:tab code -->

## API

```tsx
<TextField label="Project Name" required value={name} onChange={…} />
<TextArea label="Internal Notes" hint="Not sent to the customer." />
<SearchField placeholder="Search RFQ number, project or customer" />
```

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` *(optional)* | Omit only where the control is labelled by its surroundings |
| `hint` | `string` *(optional)* | |
| `ref` | `Ref<HTMLInputElement>` | TextField only |
| …rest | `InputHTMLAttributes` / `TextareaHTMLAttributes` | |

---

<!-- ds:tab usage -->

## Related

[Select](select.md) · [Dialog](dialog.md) ·
[D2 · Fields](../design-system.md#d2--fields) ·
[Record form](../patterns/record-form.md) ·
[B1.4 · Lines](../design-system.md#b14-lines)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | **The required asterisk is now rendered.** This page has specified *"a red asterisk right after the label"* since it was written; `required` reached the `<input>`, where it drives native validation, and nothing reached the label. Found by drawing the Do/Don't card for that exact rule and finding the Do card had nothing to point at. It uses `RequiredMark`, the same one the record form uses, so the two cannot drift. No product screen changes — every call site passing `required` was a specimen |
| 20 Nov 2026 | Usage tab drawn: three Do/Don't card pairs. Two of the "Don't" cards are hand-written markup, because `Field` has no way to produce the wrong shape |
| 8 Nov 2026 | This page |
| 8 Nov 2026 | `--vy-border-control` re-measured against every ground: 2.35–3.06 → 3.05–3.97 |
| 9 Nov 2026 | `:hover` moved to the new `--vy-border-control-hover`: 2.68 → 5.23 on the dark panel, 2.02 → 3.95 on its worst ground. Light unchanged |
| 9 Nov 2026 | `:focus` edge fixed in dark — `--vy-brand-boundary-strong` blue-400 → blue-200, 2.88 → 7.22 on its worst ground |
