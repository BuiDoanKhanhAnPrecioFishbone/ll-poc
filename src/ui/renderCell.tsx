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
 * Date AND time, for the fields the guideline says carry both.
 *
 * It is explicit about several: Created Date "displays the date and time when
 * the RFQ was created", Run Date "the date and time when the quotation process
 * was executed", and the draft's Created Date likewise. We were formatting all
 * of them with `fmtDate` and dropping the time, on data that carries a real
 * working-hours timestamp — so the information existed and the screen threw it
 * away.
 *
 * HH:MM, not the guideline's HH:MM:SS. The seed sets seconds to zero on every
 * record, so a seconds field would read ":00" on every row of every screen —
 * precision the data does not have. Worth confirming with the customer whether
 * seconds carry meaning for them; against real timestamps this becomes a
 * one-word change.
 */
export function fmtDateTime(d: Date) {
  return `${fmtDate(d)} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}
