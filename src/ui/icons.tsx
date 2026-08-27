/* =============================================================================
   ICONS
   -----------------------------------------------------------------------------
   ONE set, for the whole app.

   There were two: this map, in the app shell, and a second in SmartButtons —
   overlapping on `parts`, `insight`, `sell`, `customer`, `quote` and `doc`, and
   silently falling back to a document glyph for any name the second one did not
   have. That is how "Setup View Template" ended up drawing a page icon after its
   own glyph was fixed in the other map, and how the fix before that had to be
   made in two places to take effect.

   All paths are drawn for a 20x20 viewBox, stroked rather than filled, so they
   inherit colour and stay legible down to 15px.
   ========================================================================== */

export const ICONS: Record<string, string> = {
  task:     'M4 5.5 6 7.5 9.5 4M4 12.5 6 14.5 9.5 11M12 6h5M12 13h5',
  chat:     'M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H8l-4 3z',
  log:      'M4 5h12M4 10h12M4 15h7',

  quote:       'M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 3v3h3M7 11h6M7 14h4',
  order:       'M4 5h12v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM7 3v4M13 3v4M7 11h6',
  return:      'M8 4 4 8l4 4M4 8h8a4 4 0 0 1 0 8H7',
  customer:    'M10 10a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4M4 17c0-3 2.7-4.6 6-4.6s6 1.6 6 4.6',
  requisition: 'M6 3h8a1 1 0 0 1 1 1v13l-5-2.5L5 17V4a1 1 0 0 1 1-1zM7.5 8h5',
  supplier:    'M3 8h9v6H3zM12 10h3l2 2v2h-5zM6 16.5a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 0 0-2.4 0m7 0a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 0 0-2.4 0',
  factory:     'M3 17V9l4 2.5V9l4 2.5V9l4 2.5V17zM3 17h14M6.5 14h1M10 14h1M13.5 14h1',
  simulate:    'M4 15V6M4 15h12M7 12l3-4 2.5 2.5L16 6',
  bom:         'M10 2.5 16 6v8l-6 3.5L4 14V6zM10 10l6-3.5M10 10v7.5M10 10 4 6.5',
  transfer:    'M4 7h9l-2.5-2.5M16 13H7l2.5 2.5',
  adjust:      'M5 4v12M5 8.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2M14 4v12M14 4.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2',
  pcb:         'M4 4h12v12H4zM7 4v3M13 4v3M7 16v-3M13 16v-3M4 7h3M4 13h3M16 7h-3M16 13h-3',
  tool:        'M12.5 3.5a3.5 3.5 0 0 0-4.3 4.6l-4.6 4.6a1.5 1.5 0 0 0 2.1 2.1l4.6-4.6a3.5 3.5 0 0 0 4.6-4.3l-2.2 2.2-1.9-.4-.4-1.9z',
  machine:     'M4 16V8h4l1-2h2l1 2h4v8zM10 9.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4',
  invoice:     'M5 3h10v15l-2.5-1.5L10 18l-2.5-1.5L5 18zM8 7h4M8 10h4',
  journal:     'M5 3h9a1 1 0 0 1 1 1v13H6a1 1 0 0 1-1-1zM5 14h10M8 7h4',
  lock:        'M6 9V7a4 4 0 0 1 8 0v2M5 9h10v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z',
  people:      'M7.5 9a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2M2.5 16.5c0-2.6 2.2-4 5-4s5 1.4 5 4M13.5 8.5a2.2 2.2 0 1 0 0-4.4M14 12.6c2 .3 3.5 1.6 3.5 3.9',
  template:    'M4 4h12v4H4zM4 10h5v6H4zM11 10h5v6h-5z',
  job:         'M10 4.5v5l3 1.8M10 17.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15',
  plug:        'M7 3v5M13 3v5M5 8h10v2a5 5 0 0 1-10 0zM10 15v3',
  menu:        'M4 5h12M4 10h12M4 15h12',
  globe:       'M10 17.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15M2.5 10h15M10 2.5c3.5 4 3.5 11 0 15-3.5-4-3.5-11 0-15',
  metadata:    'M10 3c3.3 0 6 1.1 6 2.5S13.3 8 10 8 4 6.9 4 5.5 6.7 3 10 3M4 5.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5',
  queue:       'M3 5h6M3 10h6M3 15h6M13 4v12M13 4l3.5 3.5M13 4 9.5 7.5',
  doc:         'M5 3h6l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 3v4h4',
  home: 'M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z',
  sell: 'M3 5h14l-1.5 8.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5zM7 17.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0m5 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  buy: 'M4 4h3l1.5 8.5A2 2 0 0 0 10.5 14H16M6 7h11l-1 5H7',
  parts: 'M10 2.5 17 6.5v7L10 17.5 3 13.5v-7zM10 2.5v15M3 6.5l7 4 7-4',
  stock: 'M3 6h14v11H3zM3 6l2-3h10l2 3M8 10h4',
  make: 'M4 16V9l4 3V9l4 3V9l4 3v4zM4 16h12',
  finance: 'M10 3v14M6.5 6.5h5a2 2 0 1 1 0 4h-3a2 2 0 1 0 0 4h5',
  insight: 'M4 16V8M8 16V4M12 16v-6M16 16v-9',
  /* SLIDERS, not the circle-with-rays that was here before: detached rays
     around a circle is the universal brightness glyph, and at 16px it read
     as a sun sitting in a table toolbar. Three tracks with knobs says
     "adjust how this is set up", which is what both users of this icon
     mean — System Configuration in the nav, and Setup View Template on the
     grid. A gear would also work, but not at this size in stroke only:
     its teeth have to touch the ring or it becomes a sun again. */
  settings: 'M3 5.5h2.4M8.6 5.5H17M7 3.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2M3 10h6.4M12.6 10H17M11 8.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2M3 14.5h2.4M8.6 14.5H17M7 12.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2',
};

/**
 * `size` is the only thing callers vary. The stroke weight is fixed: a heavier
 * line at a smaller size is how an icon set stops looking like one set.
 */
export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const d = ICONS[name];
  /* An unknown name is a bug, not a case to style for — rendering a document
     glyph instead is what hid the last one. Nothing draws, and the name is in
     the DOM for whoever is looking. */
  if (!d) return <svg width={size} height={size} data-unknown-icon={name} aria-hidden />;
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
