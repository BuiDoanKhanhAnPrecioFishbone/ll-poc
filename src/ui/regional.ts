import { useSyncExternalStore } from 'react';

/**
 * Regional Format — the one place a date, a number or a money value learns its
 * shape.
 *
 * ASKED FOR by the VIQ UI Standard, 14 Oct 2026: "Date, time, number and
 * currency come from the system-wide Regional Format setting (region and
 * language). Screens never hard-code a format." Voyager already has that
 * screen; this is the prototype's side of it.
 *
 * WHAT IT REPLACES. Seventeen calls across eleven files passed `'en-GB'` as a
 * literal — four of them in `renderCell`, the rest one-offs in a tab, a dialog,
 * a header clock. Each was a small decision about somebody else's locale, taken
 * by whoever wrote that line.
 *
 * AND IT SUPERSEDES A DECISION OF OUR OWN. Change 1.10 moved dates to
 * "09 Sept 2026" because `09/09/2026` cannot be read without knowing whether
 * the writer was American. That reasoning was sound and the fix was wrong: we
 * answered an ambiguity by choosing for the user, when the answer is to let
 * them say. A reader whose setting is English (United States) sees 09/09/2026
 * and knows exactly what it means, because they picked it.
 *
 * NOT `Intl.DateTimeFormat().resolvedOptions().locale`, which is the browser's
 * guess at the machine. An ERP's regional format belongs to the ACCOUNT: the
 * same user on a shared workstation in Ho Chi Minh City and on a laptop bought
 * in Texas must see one format, and a shipping date that changes shape with the
 * hardware is a support call.
 */
export type Region = {
  id: string;
  /** What the setting calls itself, in the user menu. */
  label: string;
  /** BCP 47 tag handed to Intl. */
  locale: string;
  currency: string;
};

export const REGIONS: Region[] = [
  { id: 'en-US', label: 'English (United States)', locale: 'en-US', currency: 'USD' },
  { id: 'en-GB', label: 'English (United Kingdom)', locale: 'en-GB', currency: 'USD' },
  { id: 'de-DE', label: 'German (Germany)', locale: 'de-DE', currency: 'EUR' },
  { id: 'vi-VN', label: 'Vietnamese (Vietnam)', locale: 'vi-VN', currency: 'USD' },
];

/**
 * English (United States) is the default because it is what this customer's
 * users see in Voyager today, and every example in their standard is written in
 * it. German is in the list for one reason: it is the cheapest way to find a
 * screen that assumed a dot was a decimal point.
 */
const DEFAULT = REGIONS[0];

/**
 * WHY A MODULE STORE AND NOT `prefs.tsx`, which holds density, theme and the
 * exact/relative date choice. Those are read by components, so a React context
 * serves them. This one is read by `renderCell`, by `bom.ts`, by plain
 * functions that format a cell long before any component asks — and a context
 * cannot reach them. The preference that non-React code must see lives where
 * non-React code can see it; the rest stay in `prefs`.
 */
const KEY = 'vy.region';

function restore(): Region {
  try {
    const saved = localStorage.getItem(KEY);
    return REGIONS.find(r => r.id === saved) ?? DEFAULT;
  } catch { return DEFAULT; }   /* private window, blocked storage */
}

let current: Region = restore();
const listeners = new Set<() => void>();

export function setRegion(id: string): void {
  const next = REGIONS.find(r => r.id === id);
  if (!next || next.id === current.id) return;
  current = next;
  try { localStorage.setItem(KEY, next.id); } catch { /* not worth failing for */ }
  listeners.forEach(l => l());
}

export function region(): Region {
  return current;
}

/** Subscribe a component, so a change of region repaints what it formatted. */
export function useRegion(): Region {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => current,
    () => DEFAULT,
  );
}

/* ---- The formatters ------------------------------------------------------
   Every one of these is `Intl` with the region's locale. Nothing here decides
   a separator, a digit group or the position of a currency symbol: that is the
   whole point, and it is why the German option finds bugs. */

/* EXPLICIT PARTS, NOT `dateStyle: 'short'`. Short gives en-US "10/1/26" — a
   two-digit year, which on a quotation that carries a 2026 due date and 2027
   delivery is exactly the ambiguity the whole setting exists to remove. The
   standard's own example is 10/13/2026. Day, month and year ORDER still come
   from the locale; only the padding is ours. */
const DATE_PARTS: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: '2-digit', day: '2-digit',
};

export function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat(current.locale, DATE_PARTS).format(d);
}

/* Date then time, separated by a space. One formatter would do it, but `Intl`
   joins the two with the locale's own separator — en-US gives
   "10/13/2026, 10:56:15" — and the standard writes it without the comma. The
   ORDER still belongs to the locale: Vietnamese puts the clock first, and
   composing the two parts here would have forced the English order on it. */
export function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat(current.locale, {
    ...DATE_PARTS, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
    .formatToParts(d)
    .map(part => (part.type === 'literal' && part.value.trim() === ',' ? ' ' : part.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A moment without its date — the activity log's timestamps. */
export function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat(current.locale, { timeStyle: 'medium', hour12: false }).format(d);
}

/** The long form, for a heading that names today. */
export function fmtLongDate(d: Date): string {
  return new Intl.DateTimeFormat(current.locale, { dateStyle: 'full' }).format(d);
}

export function fmtNumber(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(current.locale, opts).format(n);
}

/**
 * Money. The standard asks for six decimals — a unit price here can be
 * $0.000012 — and for negatives in parentheses, which is an accounting
 * convention `Intl` supports through `currencySign: 'accounting'`.
 */
export function fmtMoney(n: number, { decimals = 2 } = {}): string {
  return new Intl.NumberFormat(current.locale, {
    style: 'currency', currency: current.currency,
    currencySign: 'accounting',
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(n);
}
