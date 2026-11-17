# Number field

Four widgets that differ by their decimals and by nothing else: **Integer**,
**Decimal**, **Currency** and **Percent**. The BA's principles of 16 Nov 2026
name all four; until 17 Nov this system had none of them and every number in
every form was typed into a plain text box.

<!-- ds:tab examples -->

<!-- ds:specimen number-field -->

<!-- ds:tab usage -->

## The four kinds

| `kind` | Decimals | Her example |
|---|---|---|
| `integer` | 0 | `30` |
| `decimal` | 2 | `2,134.00` |
| `currency` | **6** | `$1.240000` |
| `percent` | 2 | `12.00` |

Six decimals on currency is not a flourish. `fmtMoney` already carried the
note that a unit price in this business can be `$0.000012`, and her own
example is written to six places. The two documents arrived at the same number
separately.

## The unit goes in the label

*"Markup (%)"*, *"Unit Price (USD)"* — her examples are written that way and
the reason stands on its own: a suffix inside the box is something the user
has to type around, and a user who types `12%` into a field that already shows
`%` has made an error the field invented.

## When to use

- Any number a person types. All four kinds, including Integer — a quantity
  typed into a text field loses its alignment and its grouping.

## When not to use

- **A number that is read, not typed.** That is a grid cell or a
  [read value](field-row.md); this is a control.
- **An identifier that happens to be digits.** A part number, a PO number and
  a phone number are text: they have leading zeros to keep, they are never
  summed, and right-aligning them hides the prefix that tells them apart.

## Right-aligned, tabular, no spin buttons

Her three rules, and the alignment is the one that earns its keep: a column of
prices that agrees on the decimal point can be **scanned** for an outlier,
while a ragged one has to be read. `tabular-nums` is what holds the digits in
their columns while the value is still being typed.

No spin buttons, which is also why this is not Kendo's `NumericTextBox` — see
the Code tab.

## Formatted at rest, raw while editing

Click in and the grouping disappears; click away and it returns. A formatter
that runs on every keystroke fights the person typing — delete the `.` in
`1,240.00` and a live formatter puts one back somewhere else.

Clearing the box is how a value becomes empty, and it is the only way, so it
has to keep working. Text that is not a number leaves the previous value
alone rather than silently writing nothing.

## Accessibility

`inputMode="decimal"` brings up the right keypad on a touch device.
Right-aligned text stays left-to-right; this does not reorder the digits.

<!-- ds:tab code -->

```tsx
<NumberField kind="currency" label="Unit Price (USD)"
             value={price} onChange={setPrice} />
```

**Not `@progress/kendo-react-inputs`.** It was considered and left out for two
measured reasons. Her spec says *no spin buttons*, which is the one thing
`NumericTextBox` adds over an `<input>`; and it formats through Kendo's own
intl rather than through `regional.ts`, so a German user would have got a
German grid beside an American number box. A plain input formatted by the same
`fmtNumber` and `fmtMoney` as the rest of the app cannot drift from the rest
of the app.

[Date field](date-field.md) went the other way, and says why.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | This component and this page. Four of the BA's widgets that had no implementation at all |
