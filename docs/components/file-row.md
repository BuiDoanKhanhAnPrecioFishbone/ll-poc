# File row

One file in a list: a type chip, a name, its meta, and one control. The BA's
principles of 16 Nov 2026 give it four states and a 34px row.

<!-- ds:tab examples -->

<!-- ds:specimen file-row -->

<!-- ds:tab usage -->

## The chip is the point

At 30×20 and 9px at 700, the chip says what a file is before the name has
been read. Her five families: **PDF** red, **XLS** green, **DOC** blue,
**IMG** teal, **ZIP and anything else** gray.

The *label* is the real extension, trimmed to three; the *colour* is the
family. So a `.docx` reads DOC in blue, a `.heic` reads HEI in teal, and an
unknown type still says what it is rather than "FILE".

## Four states

| State | What it is |
|---|---|
| `view` | The name is a **link** that opens the preview, with Download at the end |
| `edit` | The same row with **More** instead of Download; Delete lives in that menu, last and in danger |
| `added` | An edit row not yet saved — her information tint, the same colour a changed field uses |
| `uploading` | A 90×4 bar and a percentage |
| `rejected` | The danger tint, the reason instead of the meta, and an octagon |

**No eye icon.** Her note is explicit, and it is right: a separate preview
button is a second control for what the name already does.

## When to use

- Any list of attachments: a record's documents, a checklist task, a BoM
  import.

## When not to use

- **A single file being chosen.** That is [File drop](file-drop.md).
- **A grid of files.** Past about a dozen rows a list stops being scannable
  and wants columns that sort.

## Accessibility

The rejected row carries an **octagon**, not just a tint — the same shape an
error toast uses, for the same reason: colour never carries the meaning on its
own. The chip is decorative in the sense that matters, because the extension
is also in the name beside it.

## One number of hers that cannot hold

She writes *"Row 34px · padding 6px 10px"*, and her own download button in a
row is 26px. 26 + 6 + 6 is 38. The **height** is the number kept — a list of
files is read down its left edge, and rows that vary by 4px because one has a
button read as ragged. The row is 34 and the button centres inside it.

<!-- ds:tab code -->

```tsx
<FileRow name="Apple_RFQ_drawing.pdf" meta="ver. 1 · 2.4 MB" action={<Download />} />
<FileRow state="uploading" name="Gerber_Rev1.zip" progress={60} />
<FileRow state="rejected" name="photo.heic" reason="File type not allowed" />
```

`FileTypeChip` is exported on its own, because a grid cell wants the chip
without the row.

**On the chip colours.** Her light values for PDF, XLS and DOC come from her
own example markup. IMG and ZIP she names only by colour, so they take the
teal and the gray she herself defines. **She gives no dark values for chips at
all** — these use her dark values for the nearest family she names, and that
is flagged in [the comparison](../ba-principles-16nov.md) rather than left as
a surprise.

They are deliberately **not** the status pill tints, though three are within a
shade: her PDF is `#fbe9e9` and her blocked pill is `#f8e6e5`. A file type is
not a state, and tying them would make one move the other.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page, with the five file-type tokens |
