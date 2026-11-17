# Image box

A picture on a record, and the slot it leaves when there is none.

<!-- ds:tab examples -->

<!-- ds:specimen image-box -->

<!-- ds:tab usage -->

## One box, two states

Her sizes: as tall as the record header, **max 220 × 132**. The empty state is
the same box with a dashed border rather than a different element — which is
what keeps the form from jumping when an image arrives.

| | |
|---|---|
| **With an image** | 1px border, radius 8px, the image fits inside. Clicking opens the image popup |
| **Empty** | 1.5px dashed, *"Drop an image or Browse"*, with the accepted types underneath |

## When to use

- A part photo, a drawing thumbnail — one image that belongs to the record.

## When not to use

- **A gallery.** Several images want a strip with its own navigation; her
  image popup carries Previous and Next for exactly that.
- **An icon or a logo.** Those are not content and do not want a frame.

## Accessibility

With an image it is a `<button>`, because clicking does something. Empty it is
not, because there is nothing yet to open — the Browse control inside it is
the interactive part. An `alt` is the caller's to supply and should name the
part, not the file.

<!-- ds:tab code -->

```tsx
<ImageBox src={url} alt="Part image" onOpen={openPopup} />
<ImageBox types="PNG, JPG · max 5 MB" />
```

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page |
