# Toast

> **Status: stable** · `src/ui/Toast.tsx` · **68 call sites**, reached
> through `useToast()` rather than rendered directly.
> Written to the template set by [`button.md`](button.md).

The behaviour and the four kinds are in
[Feedback](../patterns/feedback.md). This page is the component: how to call
it, and what it does that you did not have to build.

---

## When to use

To confirm something **that is already done** and that the user does not have
to act on.

## When not to use

| Instead of a toast | Use | Why |
|---|---|---|
| Something the user must act on | A banner or a [dialog](dialog.md) | A toast that must be read will be missed |
| A condition that lasts | A banner | A toast outlives its reason by 4.5 seconds, then stops existing |
| A field being wrong | An error on the field | The toast is in the corner; the field is where the eye is |

---

## The API is four verbs, not a `kind` prop

```tsx
const toast = useToast();
toast.success('Published');
toast.error('2 required fields are missing.');
toast.undoable('Priority set to High', () => restore());
toast.notImplemented('export this list to Excel');
```

**Four named methods instead of `push(text, kind)`** — because the kind is not
a style, it is a decision about duration, announcement and whether a way back
is offered. A single `push` lets a caller pick green for a failure, which is
exactly what happened before.

| Method | Duration | Announcement | Call sites |
|---|---|---|---|
| `success` | 4.5s | polite | 27 |
| `error` | **9s** | **assertive** | 8 |
| `undoable` | 4.5s | polite, with **Undo** | 5 |
| `notImplemented` | 4.5s | polite | 28 |

`notImplemented` takes the **rest of a sentence**: `what` completes *"This
would …"*, so the message cannot drift from screen to screen.

---

## What Radix handles, and why that is the whole reason

Radix Toast was taken for the parts that are **easy to get wrong**:

- **a live region**, so a screen reader announces it at all;
- **the timer pausing while the pointer is over it**;
- **swipe dismissal**, down, on touch.

> And one that is easy to get wrong *invisibly*: the Undo button is a Radix
> `Action`, not a plain button. It **keeps the toast alive while focus is
> inside it**, so tabbing to Undo cannot race the timeout. A way back that
> disappears while you are reaching for it is not a way back.

---

## Anatomy

| Part | Rule |
|---|---|
| **Text** | One sentence. It is a description, not a heading plus a body |
| **Undo** | Only on `undoable` |
| **Close** | Always. `aria-label="Dismiss"` |
| **Viewport** | Bottom, stacked; swipe direction is down |

## Content

- **The toast repeats the button's word.** `Publish` → `Published`. Not
  `Publish` → `Success`.
- An error names **what to fix**, never *Something went wrong*.
- `notImplemented` never apologises and never says *coming soon* — it says
  what the action would do.

## Accessibility

| | |
|---|---|
| Live region | Provided by Radix; `error` is `foreground` (assertive), the rest `background` |
| Timer | Pauses on hover and while focus is inside |
| Undo | `altText="Undo this change"` |
| Close | A real button with a label; the glyph is `aria-hidden` |
| Swipe | Never the only way to dismiss |

## API

```tsx
const { success, error, undoable, notImplemented } = useToast();
```

Mounted once, by `ToastProvider`, around the app. There is no `<Toast>` to
render and no place to put one — which is why the call-site count is 68 and
the component count is one.

---

## Related

[Feedback](../patterns/feedback.md) · [Button](button.md) ·
[D6 · Words](../design-system.md#d6--words) ·
[A3 · Five rules before you build](../design-system.md#a3--five-rules-before-you-build)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
