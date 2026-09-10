import type { ReactNode } from 'react';
import { StatusBadge } from './Badge';
import type { ColumnSpec } from '../components/column-model';

/**
 * ONE cell renderer, shared by every table.
 *
 * Roles drive rendering, so a date cannot be formatted two ways on two screens
 * and a number cannot be left-aligned on one and right on another. This lived
 * inside DataGrid; MiniTable had its own path that used roles for WIDTH but
 * fell back to String(value) for content — so identifiers lost their monospace
 * and dates rendered as raw Date objects in every in-record table. Two
 * renderers is one renderer too many.
 */
export function renderCell<T>(spec: ColumnSpec<T>, row: T): ReactNode {
  if (spec.render) return spec.render(row);
  const v = row[spec.field] as unknown;

  if (v === null || v === undefined || v === '') {
    /* aria-hidden, so a screen reader gets a genuinely empty cell rather than
       "em dash" repeated for every blank on the page — 47 of them on one screen
       of Part Master. The dash is a VISUAL placeholder: it tells a sighted
       reader the cell is empty rather than narrow, and that job does not
       survive being read aloud. */
    return <span className="vy-empty" aria-hidden>—</span>;
  }

  switch (spec.role) {
    case 'ident':  return <span className="vy-ident" title={String(v)}>{String(v)}</span>;
    case 'status': return <StatusBadge value={String(v)} />;
    case 'date':   return fmtDate(v as Date);
    /* A column whose value is a MOMENT renders the moment. Part Master's
       LAST CHANGE was going through `fmtDate` and losing the time entirely:
       the live grid shows `09/09/2026 16:35:29` and we showed `16 May 2026`.
       See gap M10. */
    case 'datetime': return fmtDateTime(v as Date);
    case 'money':  return (v as number).toLocaleString('en-GB', { style: 'currency', currency: 'USD' });
    case 'number': return (v as number).toLocaleString();
    case 'code':   return <span className="vy-code">{String(v)}</span>;
    default:       return <span className="vy-truncate" title={String(v)}>{String(v)}</span>;
  }
}

/** One date format for the whole system. */
export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Today, as a person would say it — "Tuesday 9 September".
 *
 * Exists because Home and My Queues both had that sentence written as a STRING
 * LITERAL, frozen on 19 August, the day those screens were built. Three weeks
 * later both greeted every visitor with the wrong day, on a screen whose own
 * header carries a live clock — so the page disagreed with itself, two inches
 * apart. A date that is decoration on the day it is written becomes a lie
 * afterwards; the only safe version is a computed one.
 *
 * Deliberately no year: this is a greeting, not a record field, and `fmtDate`
 * remains the one format for anything that IS one.
 */
export function fmtToday(d: Date = new Date()) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Date AND time, for the fields the guideline says carry both.
 *
 * It is explicit about several: Created Date "displays the date and time when
 * the RFQ was created", Run Date "the date and time when the quotation process
 * was executed", and the draft's Created Date likewise. We were formatting all
 * of them with `fmtDate` and dropping the time, on data that carries a real
 * working-hours timestamp — so the information existed and the screen threw it
 * away.
 *
 * HH:MM:SS, and it took a look at the live system to earn the last two digits.
 * This comment used to say HH:MM, on the reasoning that the seed sets seconds to
 * zero so a seconds field would read ":00" on every row — "worth confirming with
 * the customer whether seconds carry meaning". Confirmed on 10 Sep: Part Master's
 * LAST CHANGE column shows `09/09/2026 16:35:29`, `15:51:03`, `10:48:17`. The
 * seconds are real, they are displayed, and the guideline asked for them all
 * along. The generators now vary seconds so the column is not a row of `:00`.
 */
export function fmtDateTime(d: Date) {
  return `${fmtDate(d)} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}
