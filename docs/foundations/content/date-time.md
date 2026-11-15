# Date and time

> How a date, a time, a number and an amount of money take their shape. The
> code is `src/ui/regional.ts`. **One part of this is not decided; read
> *The open question* before relying on any date format.**

## What the code does

Every formatter is `Intl` with the active region's locale. Nothing in
`regional.ts` decides a separator or the order of day, month and year.

| Region (setting label) | Locale | Currency |
|---|---|---|
| English (United States), **the default** | `en-US` | USD |
| English (United Kingdom) | `en-GB` | USD |
| German (Germany) | `de-DE` | EUR |
| Vietnamese (Vietnam) | `vi-VN` | USD |

German is there to find a screen that assumed a dot is a decimal point. US
English is the default because it is what this customer's users see in Voyager
today.

| Function | Gives | Note |
|---|---|---|
| `fmtDate` | Numeric year, 2-digit month and day | Not `dateStyle: 'short'`, which gives a two-digit year in `en-US`. Order comes from the locale |
| `fmtDateTime` | Date, a space, then time with seconds, 24-hour | The comma `Intl` inserts is replaced by a space; the **order** is still the locale's, so Vietnamese puts the clock first |
| `fmtTime` | Medium time, 24-hour | The activity log |
| `fmtLongDate` | `dateStyle: 'full'` | A heading that names today |
| `fmtNumber` | `Intl.NumberFormat` | |
| `fmtMoney` | Currency, **accounting sign** (negatives in parentheses), 2 decimals by default | The standard asks for six; a unit price can be $0.000012. Callers pass `decimals` |

Screens call these. They never hard-code a locale: before this module,
**seventeen calls across eleven files** passed `'en-GB'` as a literal.

## Where the choice lives

In a module store, not a React context, because `renderCell` and `bom.ts` format
a cell before any component asks. It is read from `localStorage` key `vy.region`
and falls back to the default. The file's comment says the format belongs to the
**account**, so a shipping date does not change shape with the hardware, and
rejects `Intl`'s browser-guessed locale for that reason. **As written it is stored
per browser**, not on a user record. The exact-or-relative date choice is a
separate preference, held in `prefs.tsx` per the same comment.

**The formatters pass no `timeZone`.** The shell has its own timezone picker and
clock, but nothing in `regional.ts` reads it.

## The open question

**Two of the client's own documents disagree, and it is not settled.**
[Open questions §4](../../open-questions.md) records it.

| Source | Says |
|---|---|
| **Testing Guideline** | Date and time columns use the format set in *System Configuration → Region Language Format Config*. An administrator setting: one format for everyone |
| **Design review** | The user chooses between an exact date and a count from today. A per-user preference |
| **Create PR sheet** (update, 27 Aug) | Due Date "accepts the date in MM/DD/YYYY format"; Created Date "displays in MM/DD/YYYY HH:MM:SS format" |

The first two cannot both be true. The build treats the format as a user
preference and flags it. The third source is more specific than either, and
`open-questions.md` asks the client to confirm MM/DD/YYYY before it is pinned. **No
answer is recorded.**

Two things this page cannot reconcile:

- `regional.ts` cites the **VIQ UI Standard of 14 Oct 2026**: "Date, time, number
  and currency come from the system-wide Regional Format setting." That is the
  later source, but §4 has no entry for it and was not updated to say it settles
  anything. This page does not treat it as the answer.
- §4 says the prototype renders `15 Oct 2026`. `regional.ts` supersedes the
  earlier "09 Sept 2026" decision (change 1.10) and renders numeric dates. §4's
  description of the build is out of date.

**What is safe to say today:** with the default region, `fmtDate` gives
month/day/year, which is the Create PR sheet's order. Under `en-GB` it gives
day/month/year. A screen that needs one fixed format has no way to ask for it.

## Related

[Designing messages](designing-messages.md) ·
[Open questions](../../open-questions.md)

## Recent changes

| Date | Change |
|---|---|
| 15 Nov 2026 | This page |
