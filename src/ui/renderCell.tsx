import type { ReactNode } from 'react';
import { StatusBadge } from './Badge';
import type { ColumnSpec } from '../components/column-model';
import { fmtDate, fmtDateTime, fmtLongDate, fmtMoney, fmtNumber } from './regional';

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
    case 'money':  return fmtMoney(v as number);
    case 'number': return fmtNumber(v as number);
    case 'code':   return <span className="vy-code">{String(v)}</span>;
    default:       return <span className="vy-truncate" title={String(v)}>{String(v)}</span>;
  }
}

/**
 * One date format for the whole system — and from 16 Oct 2026 the system gets
 * it from the user's Regional Format rather than from this line.
 *
 * It used to read `'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }`
 * — "09 Sept 2026" — chosen so that `09/09/2026` could not be misread between
 * US and European conventions. The customer's standard answers that better: the
 * reader picks the convention, so the ambiguity never arises. Re-exported here
 * because sixty-odd call sites import `fmtDate` from this module.
 */
export { fmtDate, fmtDateTime, fmtMoney, fmtNumber };

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
  /* Still the long, spoken form, and still no year — a greeting, not a record
     field — but the month and weekday names now come from the region. */
  return fmtLongDate(d);
}


