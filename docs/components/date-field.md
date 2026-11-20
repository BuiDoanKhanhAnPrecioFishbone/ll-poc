# Date field

**Date**, **Datetime** and **Date range** — three of the BA's Input widgets,
and three this system did not have. It formatted dates for display from the
first week; nothing here let a user pick one.

<!-- ds:tab examples -->

<!-- ds:specimen date-field -->

<!-- ds:tab usage -->

<!-- ds:specimen date-field-usage -->

## Three shapes, one control

| | |
|---|---|
| **Date** | `10/13/2026` with a calendar at the right |
| **Datetime** | the same box with a clock in the popup |
| **Date range** | **two boxes, 8px apart** — her drawing, not one box with a two-month popup |

Two boxes rather than Kendo's `DateRangePicker` because that is what she drew,
and because two boxes survive a narrow column and a phone while one box and a
two-month calendar does not.

## When to use

- Any date a person chooses. Typing still works — the box accepts the pattern
  directly — but the calendar is what makes a date a date rather than a string
  that has to be guessed at.

## When not to use

- **A timestamp the system wrote.** An audit line or a "last run" is
  [read-only text](field-row.md), formatted by `fmtDateTime`.
- **A duration.** "30 days" is a [number field](number-field.md); her own
  example for Integer is *Due in (Days)*.

## The pattern follows the region

The placeholder and the value both come from the region setting, so switching
to German reorders them. The **order** is the locale's; the padding is ours,
for the reason `DATE_PARTS` gives — a two-digit year on a quotation that
spans 2026 and 2027 is exactly the ambiguity the setting exists to remove.

## Open with the BA: 12-hour or 24-hour

Her Datetime example reads `10/13/2026 10:30 AM`. This app reads `10:30`, and
`fmtDateTime` writes `10:56:15`. The picker follows this app rather than
splitting the difference, and the question is still open — it is listed in
[the comparison](../ba-principles-16nov.md).

Seconds are deliberately absent from the picker even though `fmtDateTime` has
them: a log line is stamped, a picker is typed into, and a field that demands
`:00` before it will accept an answer is rejecting what the user meant.

## Accessibility

The popup is a Kendo calendar with its own roving focus and `Escape` to
dismiss. The placeholder states the expected pattern, which is what makes the
field usable without opening the calendar at all.

<!-- ds:tab code -->

```tsx
<DateField label="Ship Date" value={v} onChange={setV} />
<DateField label="Pickup Time" withTime value={v} onChange={setV} />
<DateRangeField label="Date Needed" from={a} to={b} onFrom={setA} onTo={setB} />
```

**KendoReact here, unlike [Number field](number-field.md).** A date is the one
field where typing is the fallback rather than the point, so the calendar is
the component — and her spec describes that popup in its own right.

Kendo cannot read `Intl`, and its own intl wants CLDR data loaded per locale;
four locales of CLDR is a large download to make one calendar agree with the
rest of the app. So `datePattern()` reads the order out of `Intl` — the same
source `fmtDate` uses, so the two cannot drift — and hands Kendo a pattern.

The popup itself is styled by one bridge rule for `.k-popup`, which also
reaches the dropdown lists. It is the first thing in this system to use
`--vy-surface-raised`: the token had existed, unused, since the theme was
written.

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 20 Nov 2026 | Usage tab drawn: 2 Do/Don't card pairs, from rules already on this page. Live components, so a card cannot go stale against a token change |
| 17 Nov 2026 | This component and this page. Also the first use of `--vy-surface-raised` — the BA's rule that a floating surface sits one step lighter in dark now applies to every Kendo popup |
