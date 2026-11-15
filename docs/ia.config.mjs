/**
 * Voyager IQ design system — information architecture.
 *
 * ONE source of truth for the site tree, the component groups and the lifecycle
 * phases. Shape copied from atlassian.design, read directly on 14 Nov 2026.
 * Every deliberate difference is recorded in `docs/_plan/deviations.md`.
 *
 * Anyone building a page reads this file and `docs/_plan/split-map.md`, and
 * nothing else. Do not read `docs/design-system.md` whole; the split map gives
 * the line range for each target page.
 *
 * TWO RULES FOR THIS FILE
 *
 *   1. Every `basis` is something that was MEASURED, and says what was measured.
 *      A phase label with no evidence is a guess, and `ia:check` fails on it.
 *      "N files" always means: N files under src/ that import it, counted by
 *      grep on 14 Nov 2026. Not call sites — files.
 *   2. Every `origin` is verified against the code by `ia:check`. A component
 *      that says KendoReact must import that package; one that says it wears
 *      Kendo's CSS classes must contain the class. Nothing here is from memory.
 *
 * Node fields
 *   slug    last URL segment, unique among siblings
 *   title   nav label and <h1>
 *   src     source markdown, repo-relative. Absent for generated pages.
 *   kind    overview | page | component | pattern | generated
 *   status  shipped (default) | planned — planned means no file yet
 *   group   components only; one of GROUPS
 *   phase   components and foundations only (Atlassian phases only these two)
 *   basis   the measurement behind that phase
 *   origin  the library underneath, and what was changed. See ORIGIN_NOTE.
 *   impl    src/ui files this page documents, `File.tsx` or `File.tsx#Export`.
 *           `ia:check` asserts every src/ui/*.tsx is documented somewhere.
 */

/**
 * HOW THE USE-SITE COUNTS ARE TAKEN, since getting this wrong is easy and the
 * first attempt did. A component is imported two ways — `from '../ui/Badge'`
 * from a screen, and `from './Badge'` by a sibling inside `src/ui` — and
 * counting only the first undercounted fifteen components, Icon by five. The
 * counts here match BOTH forms, exclude the file itself, and exclude
 * `src/specimens/`, because an example written to document a component is not
 * evidence that the product uses it.
 *
 * Where the Kendo in this system actually sits.
 *
 * Production is KendoReact, so the component layer is Kendo wherever Kendo has
 * a control, and ours where it does not. Stated once here rather than repeated
 * on every node.
 *
 *   - Every KendoReact component below is RESTYLED, never used stock. The
 *     restyling lives in `src/theme/kendo-bridge.css` (520 lines), which maps
 *     Voyager tokens onto Kendo's own CSS-variable API, plus
 *     `src/theme/kendo-subset.scss` and `_kendo-size.scss`.
 *   - Two controls (`checkbox`, `radio-group`) are a NATIVE html input wearing
 *     Kendo's CSS classes rather than Kendo's React component. That was a
 *     decision, not an accident — the reason is in each page's own doc.
 *   - Four primitives Kendo does not cover come from Radix: popover, toast,
 *     slot, and formerly radio group (moved to Kendo classes on 15 Oct 2026,
 *     see docs/radix-to-kendo-scope.md).
 *   - Anything with no `origin` is ours, drawn entirely from tokens.
 */
export const ORIGIN_NOTE = 'src/theme/kendo-bridge.css';

export const site = {
  title: 'Voyager IQ Design System',
  outDir: 'docs/site',
  defaultLocale: 'en',
  // The Vietnamese edition is a generated single-file handover, not a parallel
  // site. See deviation DEV-09.
  locales: ['en'],
};

/** atlassian.design/release-phases, verbatim. Components and foundations only. */
export const PHASES = {
  ea:         { label: 'Early Access',        badge: 'Early Access' },
  beta:       { label: 'Beta',                badge: 'Beta' },
  ga:         { label: 'General Availability', badge: null },
  caution:    { label: 'Intent to Deprecate', badge: 'Caution' },
  deprecated: { label: 'Deprecated',          badge: 'Deprecated' },
};

/** Atlassian's thirteen component groups, in their order. Ours omits Primitives (DEV-01). */
export const GROUPS = [
  'Forms and input', 'Images and icons', 'Labels', 'Layout and structure',
  'Loading', 'Messaging', 'Navigation', 'Overlays and layering',
  'Status indicators', 'Text and data display', 'Libraries', 'Tooling',
];

const KENDO = {
  buttons:   '@progress/kendo-react-buttons',
  grid:      '@progress/kendo-react-grid',
  dialogs:   '@progress/kendo-react-dialogs',
  dropdowns: '@progress/kendo-react-dropdowns',
  layout:    '@progress/kendo-react-layout',
  upload:    '@progress/kendo-react-upload',
  indicators:'@progress/kendo-react-indicators',
  excel:     '@progress/kendo-react-excel-export',
};
const RADIX = { popover: '@radix-ui/react-popover', toast: '@radix-ui/react-toast', slot: '@radix-ui/react-slot' };

const c = (slug, title, group, phase, basis, impl = [], extra = {}) => ({
  slug, title, group, phase, basis, impl, kind: 'component',
  src: extra.status === 'planned' ? null : `docs/components/${slug}.md`,
  ...extra,
});

export const nav = [
  { slug: '', title: 'Overview', src: 'docs/_pages/home.md', kind: 'overview' },

  {
    slug: 'get-started', title: 'Get started', kind: 'overview',
    src: 'docs/get-started/index.md',
    children: [
      { slug: 'design',         title: 'For designers',  src: 'docs/get-started/design.md',         kind: 'page' },
      { slug: 'develop',        title: 'For developers', src: 'docs/get-started/develop.md',        kind: 'page' },
      { slug: 'content-design', title: 'For content',    src: 'docs/get-started/content-design.md', kind: 'page' },
      { slug: 'about',          title: 'About this design system', src: 'docs/get-started/about.md',kind: 'page' },
    ],
  },

  {
    slug: 'foundations', title: 'Foundations', kind: 'overview',
    src: 'docs/foundations/index.md',
    children: [
      {
        slug: 'tokens', title: 'Tokens', kind: 'overview', phase: 'ga',
        basis: '238 custom properties in src/theme/tokens.css, declared 414 times across :root and the two dark blocks; three layers (ramp → role → component) as set out in A2',
        src: 'docs/foundations/tokens/index.md',
        children: [
          { slug: 'design-tokens',        title: 'Design tokens',        src: 'docs/foundations/tokens/design-tokens.md',        kind: 'page' },
          { slug: 'use-tokens-in-code',   title: 'Use tokens in code',   src: 'docs/foundations/tokens/use-tokens-in-code.md',   kind: 'page' },
          { slug: 'use-tokens-in-design', title: 'Use tokens in design', src: 'docs/foundations/tokens/use-tokens-in-design.md', kind: 'page' },
          { slug: 'all-tokens', title: 'All tokens', kind: 'page',
            src: 'docs/foundations/tokens/all-tokens.md',
            generator: 'scripts/tokens-build.mjs' },
        ],
      },
      { slug: 'accessibility', title: 'Accessibility', src: 'docs/foundations/accessibility.md', kind: 'page', phase: 'ga',
        basis: 'contrast:check reads 184 token pairs out of tokens.css with no browser, in .githooks/pre-push' },
      {
        slug: 'content', title: 'Content', kind: 'overview', phase: 'beta',
        basis: 'grows from D6, a single 14-line table; all five sub-pages are new',
        src: 'docs/foundations/content/index.md',
        children: [
          { slug: 'voice-tone',           title: 'Voice and tone',       src: 'docs/foundations/content/voice-tone.md',           kind: 'page' },
          { slug: 'language-and-grammar', title: 'Language and grammar', src: 'docs/foundations/content/language-and-grammar.md', kind: 'page' },
          { slug: 'inclusive-writing',    title: 'Inclusive writing',    src: 'docs/foundations/content/inclusive-writing.md',    kind: 'page' },
          { slug: 'date-time',            title: 'Date and time',        src: 'docs/foundations/content/date-time.md',            kind: 'page' },
          { slug: 'designing-messages',   title: 'Designing messages',   src: 'docs/foundations/content/designing-messages.md',   kind: 'page' },
        ],
      },
      { slug: 'spacing', title: 'Spacing', src: 'docs/foundations/spacing.md', kind: 'page', phase: 'ga',
        basis: '13 space tokens in B3.1, and the same 13 in tokens.css; the scale starts at 2px and steps by 2px at the bottom' },
      { slug: 'grid', title: 'Grid', src: 'docs/foundations/grid.md', kind: 'page', phase: 'ga',
        basis: 'B8.4 sets sixteen column minimums; grid:check measures them in CI (.github/workflows/check.yml)' },
      {
        slug: 'color', title: 'Color', kind: 'overview', phase: 'ga',
        basis: 'every pair in B1.2–B1.5 carries its measured ratio and a date; contrast:check guards 184 pairs on push',
        src: 'docs/foundations/color/index.md',
        children: [
          { slug: 'color-palette',            title: 'Color palette',         src: 'docs/foundations/color/color-palette.md',            kind: 'page' },
          { slug: 'accents',                  title: 'Accents and row tones', src: 'docs/foundations/color/accents.md',                  kind: 'page' },
          { slug: 'status-vocabulary',        title: 'Status vocabulary',     src: 'docs/foundations/color/status-vocabulary.md',        kind: 'page', phase: 'ga',
            basis: 'eight statuses in the B1.6 table; progress joined them on 8 Nov 2026' },
          { slug: 'data-visualization-color', title: 'Data visualization',    src: 'docs/foundations/color/data-visualization-color.md', kind: 'page', phase: 'beta',
            basis: 'five chart fills entered contrast:check on 9 Nov 2026 (B1.6b); the usage guidance is not written' },
        ],
      },
      { slug: 'typography', title: 'Typography', src: 'docs/foundations/typography.md', kind: 'page', phase: 'ga',
        basis: '12px floor agreed with the client on 22 Oct 2026, recorded in B2 and on the specimen page' },
      { slug: 'motion', title: 'Motion', src: 'docs/foundations/motion.md', kind: 'page', phase: 'ga',
        basis: 'B6: one loading clock, and reduced motion treated as a state rather than a switch' },
      { slug: 'iconography', title: 'Iconography', src: 'docs/foundations/iconography.md', kind: 'page', phase: 'ga',
        basis: 'C1; the set is src/ui/icons.tsx, imported by 9 files' },
      { slug: 'illustrations', title: 'Illustrations', src: 'docs/foundations/illustrations.md', kind: 'page', phase: 'beta',
        basis: 'C2 describes seven assets and how to regenerate them; none of the eight checks looks at an image',
        impl: ['RocketLaunch.tsx'] },
      { slug: 'logos', title: 'Logos', src: 'docs/foundations/logos.md', kind: 'page', phase: 'ea',
        basis: 'docs/logo-ideas.md, 26 Sep 2026: "Nothing here is built yet". Decision D3 put a new mark after the revamp' },
      { slug: 'elevation', title: 'Elevation', src: 'docs/foundations/elevation.md', kind: 'page', phase: 'beta',
        basis: 'three shadows, one scrim and a flat z-index list in B4; decision D7 (depth) is listed as still open' },
      { slug: 'border', title: 'Border', src: 'docs/foundations/border.md', kind: 'page', phase: 'ga',
        basis: 'B1.4, 82 lines; border:check measures it in CI' },
      { slug: 'radius', title: 'Radius', src: 'docs/foundations/radius.md', kind: 'page', phase: 'beta',
        basis: 'four radii in B4; decision D8 (radius) is listed as still open' },
      // DEV-02: a fifteenth foundation Atlassian does not have.
      { slug: 'sizing', title: 'Sizing', src: 'docs/foundations/sizing.md', kind: 'page', phase: 'ga',
        basis: 'B5: control heights, row density, column roles, dialog and shell widths; touch:check measures the target floor in CI' },
    ],
  },

  {
    slug: 'components', title: 'Components', kind: 'overview',
    src: 'docs/components/index.md',
    children: [
      // ---- Forms and input
      c('button', 'Button', 'Forms and input', 'ga', '40 files import it — the most used component in the system',
        ['Button.tsx'], { origin: { pkg: KENDO.buttons, as: 'Button', also: RADIX.slot } }),
      c('checkbox', 'Checkbox', 'Forms and input', 'ga', '7 files import it',
        ['Overlays.tsx#Checkbox'],
        { origin: { css: 'k-checkbox',
          note: 'a native <input type="checkbox"> wearing Kendo’s classes, NOT KendoReact’s <Checkbox>, which cannot express two things this app needs. The bridge also corrects two Kendo defaults — see checkbox.md §"Why the class, not Kendo’s React component"' } }),
      c('radio-group', 'Radio group', 'Forms and input', 'ga', '7 call sites in 5 files (radix-to-kendo-scope.md)',
        ['Overlays.tsx#RadioGroup'],
        { origin: { css: 'k-radio',
          note: 'a native <input type="radio"> wearing Kendo’s classes. WAS Radix react-radio-group; moved on 15 Oct 2026 because the live sweep found no radio group to match (open question 17)' } }),
      c('select', 'Select', 'Forms and input', 'ga', '20 files import it',
        ['Overlays.tsx#Select'], { origin: { pkg: KENDO.dropdowns, as: 'ComboBox' } }),
      c('field', 'Field', 'Forms and input', 'ga', '18 files import it', ['Field.tsx']),
      c('field-row', 'Field row', 'Forms and input', 'ga', '10 files import it', ['FieldRow.tsx']),
      c('file-drop', 'File drop', 'Forms and input', 'beta', '5 files import it',
        ['FileDrop.tsx'], { origin: { pkg: KENDO.upload, as: 'Upload' } }),
      c('people-picker', 'People picker', 'Forms and input', 'ea', '1 file imports it',
        ['PeoplePicker.tsx'], { origin: { pkg: RADIX.popover, as: 'Popover' } }),
      c('rich-text', 'Rich text', 'Forms and input', 'ea', '1 file imports it', ['RichText.tsx']),

      // ---- Images and icons
      c('icon', 'Icon', 'Images and icons', 'beta', '14 files import src/ui/icons.tsx \u2014 9 through ui/icons, 5 more from inside src/ui itself',
        ['icons.tsx'], { src: `docs/components/icon.md` }),

      // ---- Labels
      c('badge', 'Badge', 'Labels', 'ga', '5 files import it directly, plus every status cell through renderCell', ['Badge.tsx']),
      c('chip', 'Chip', 'Labels', 'beta', '5 files import it; last changed 10 Nov 2026', ['Chip.tsx']),
      c('priority', 'Priority', 'Labels', 'beta',
        '3 files import it; two of the client’s own sources still disagree on stars vs label (open-questions §6)', ['Priority.tsx']),

      // ---- Layout and structure
      c('app-shell', 'App shell', 'Layout and structure', 'beta',
        'src/components/AppShell.tsx; built, and the sitemap restructure was declined (decision D1). No KendoReact or Radix import \u2014 ours. No page written',
        [], { src: `docs/components/app-shell.md` }),

      // ---- Loading
      c('loader', 'Loader', 'Loading', 'beta', '2 files import it',
        ['Loader.tsx'], { origin: { pkg: KENDO.indicators, as: 'Loader' } }),
      c('grid-skeleton', 'Grid skeleton', 'Loading', 'beta', 'imported only by DataGrid.tsx', ['GridSkeleton.tsx']),
      c('record-skeleton', 'Record skeleton', 'Loading', 'beta', '1 file imports it', ['RecordSkeleton.tsx']),

      // ---- Messaging
      c('toast', 'Toast', 'Messaging', 'ga', '23 files import it',
        ['Toast.tsx'], { origin: { pkg: RADIX.toast, as: 'Toast' } }),
      c('error-state', 'Error state', 'Messaging', 'beta', 'imported only by ErrorBoundary.tsx', ['ErrorState.tsx']),
      c('support-ticket', 'Support ticket', 'Messaging', 'beta', 'imported only by ErrorState.tsx and ErrorBoundary.tsx', ['SupportTicket.tsx']),

      // ---- Navigation
      c('tabs', 'Tabs', 'Navigation', 'ga', '6 files import it',
        ['Overlays.tsx#Tabs'], { origin: { pkg: KENDO.layout, as: 'TabStrip' } }),

      // ---- Overlays and layering
      c('dialog', 'Modal dialog', 'Overlays and layering', 'ga', '19 files import it; ConfirmDialog is built on it',
        ['Overlays.tsx#Dialog', 'ConfirmDialog.tsx'],
        { origin: { pkg: KENDO.dialogs, as: 'Dialog + DialogActionsBar' } }),
      c('more-menu', 'More menu', 'Overlays and layering', 'beta', '2 files import it',
        ['MoreMenu.tsx'], { origin: { pkg: RADIX.popover, as: 'Popover' } }),
      c('command-palette', 'Command palette', 'Overlays and layering', 'ea',
        'src/components/CommandPalette.tsx; built, no KendoReact or Radix import \u2014 ours. No page written', [], { src: `docs/components/command-palette.md` }),

      // ---- Status indicators
      c('stepper', 'Stepper', 'Status indicators', 'ea', '1 file imports it', ['Stepper.tsx']),

      // ---- Text and data display
      {
        ...c('data-grid', 'Data grid', 'Text and data display', 'ga', '7 files import it',
          ['DataGrid.tsx'], { origin: { pkg: KENDO.grid, as: 'Grid', also: '@progress/kendo-data-query' } }),
        // A family, the way Button is a family on atlassian.design. These five
        // exist only to serve the grid, and their slugs say so.
        children: [
          c('column-chooser', 'Column chooser', 'Text and data display', 'ga', '4 files import it',
            ['ColumnChooser.tsx'], { origin: { pkg: RADIX.popover, as: 'Popover' } }),
          c('filter-toolbar', 'Filter toolbar', 'Text and data display', 'ga', '6 files import it', ['FilterToolbar.tsx']),
          c('view-picker',    'View picker',    'Text and data display', 'ga', '6 files import it', ['ViewPicker.tsx']),
          c('view-setting',   'View setting',   'Text and data display', 'ga', '6 files import it', ['ViewSetting.tsx']),
          c('pager',          'Pager',          'Text and data display', 'ga', 'imported only by DataGrid.tsx; ours, not Kendo’s pager', ['Pager.tsx']),
        ],
      },
      c('mini-table', 'Mini table', 'Text and data display', 'ga', '13 files import it',
        ['MiniTable.tsx'], { origin: { pkg: KENDO.grid, as: 'Grid', also: '@progress/kendo-data-query' } }),
    ],
  },

  // DEV-03. Patterns carry no phase: Atlassian's release phases cover
  // "components and foundations", and nothing was measured that would justify
  // labelling a pattern.
  {
    slug: 'patterns', title: 'Patterns', kind: 'overview',
    src: 'docs/patterns/index.md',
    children: [
      { slug: 'record-form',        title: 'Record form',            src: 'docs/patterns/record-form.md',        kind: 'pattern' },
      { slug: 'list-screen',        title: 'List screen',            src: 'docs/patterns/list-screen.md',        kind: 'pattern' },
      { slug: 'destructive-action', title: 'Destructive action',     src: 'docs/patterns/destructive-action.md', kind: 'pattern' },
      { slug: 'search',             title: 'Search',                 src: 'docs/patterns/search.md',             kind: 'pattern' },
      { slug: 'wizard',             title: 'Wizard',                 src: 'docs/patterns/wizard.md',             kind: 'pattern' },
      { slug: 'feedback',           title: 'Feedback',               src: 'docs/patterns/feedback.md',           kind: 'pattern' },
      { slug: 'file-upload',        title: 'File upload',            src: 'docs/patterns/file-upload.md',        kind: 'pattern' },
      { slug: 'dashboard',          title: 'Dashboard',              src: 'docs/patterns/dashboard.md',          kind: 'pattern' },
      // New in this restructure: Part D5 becomes a pattern of its own.
      { slug: 'screen-states',      title: 'The four screen states', src: 'docs/patterns/screen-states.md',      kind: 'pattern' },
    ],
  },

  { slug: 'tools',          title: 'Tools',          src: 'docs/tools.md',          kind: 'page' },
  { slug: 'release-phases', title: 'Release phases', src: 'docs/release-phases.md', kind: 'page' },
  { slug: 'whats-new',      title: "What's new",     kind: 'generated', generator: 'scripts/whats-new.mjs' },
];

/**
 * Infrastructure, not components. One line each on /components, no page.
 * `Overlays.tsx` is NOT here: it implements five documented components
 * (dialog, tabs, checkbox, radio-group, select) and is listed against each.
 */
export const libraries = [
  { name: 'Kendo bridge',   impl: [],                    note: 'src/theme/kendo-bridge.css, 520 lines — maps Voyager tokens onto Kendo’s CSS-variable API. Every KendoReact control above is restyled through it' },
  { name: 'Error boundary', impl: ['ErrorBoundary.tsx'],  note: 'catches, then renders Error state' },
  { name: 'Boot gate',      impl: ['BootGate.tsx'],       note: 'holds the app behind the launch illustration' },
  { name: 'Preferences',    impl: ['prefs.tsx'],          note: 'density and theme, persisted per user' },
  { name: 'Cell renderer',  impl: ['renderCell.tsx'],     note: '10 files import it — the column role model in code' },
  { name: 'Excel export',   impl: ['useExcelExport.tsx'], note: '5 files import it', origin: { pkg: '@progress/kendo-react-excel-export', as: 'ExcelExport' } },
];

/**
 * Where each page's words already exist.
 *
 * `status: 'planned'` only means "no file yet". It hides two very different
 * situations, and the difference is the whole Phase 1 work order:
 *
 *   in splitSources      the words exist in docs/design-system.md and must be
 *                        MOVED, not written. Keys are section ids from
 *                        docs/_plan/split-map.md, which carries the line range.
 *   in material          nothing is written; these name the scraps to draft from.
 */
export const splitSources = {
  'get-started/about':                        ['A1', 'F1', 'F4', 'F5'],
  'get-started/develop':                      ['A3', 'F2'],
  'release-phases':                           ['F3'],
  'foundations/tokens':                       ['A2'],
  'foundations/color':                        ['B1.0', 'B1.2', 'B1.3', 'B1.5', 'B1.8'],
  'foundations/color/color-palette':           ['B1.1'],
  'foundations/color/status-vocabulary':       ['B1.6a'],
  'foundations/color/data-visualization-color':['B1.6b'],
  'foundations/color/accents':                 ['B1.7'],
  'foundations/border':                       ['B1.4'],
  'foundations/typography':                   ['B2'],
  'foundations/spacing':                      ['B3'],
  'foundations/radius':                       ['B4a'],
  'foundations/elevation':                    ['B4b', 'B4c'],
  'foundations/sizing':                       ['B5'],
  'foundations/motion':                       ['B6'],
  'foundations/grid':                         ['B7', 'B8'],
  'foundations/iconography':                  ['C1'],
  'foundations/illustrations':                ['C2'],
  'components':                               ['D0', 'D0a'],
  'patterns':                                 ['D0b'],
  'patterns/screen-states':                   ['D5'],
  'foundations/content':                      ['D6'],
  'foundations/accessibility':                ['E1'],
  'tools':                                    ['E2'],
};

/**
 * Sections of the old document that are NOT moved, because the 28 component
 * pages already say it better. Phase 1 reads each one once, confirms nothing
 * unique is lost, records the confirmation in the split map, then drops it.
 */
export const mergeChecks = {
  'D1': 'docs/components/button.md',
  'D2': 'docs/components/field.md',
  'D3': 'docs/components/data-grid.md',
  'D4': 'docs/components/dialog.md',
};

/** Pages with nothing written yet, and the files to draft them from. */
export const material = {
  '':                                       ['README.md'],
  'get-started':                            ['README.md'],
  'get-started/design':                     ['README.md'],
  'get-started/content-design':             ['docs/design-system.md'],
  'foundations':                            ['docs/_plan/deviations.md'],
  'foundations/tokens/design-tokens':       ['src/theme/tokens.css', 'src/theme/tokens.ts', 'docs/chuan-design-system.md'],
  'foundations/tokens/use-tokens-in-code':  ['src/theme/kendo-bridge.css', 'docs/gap-register.md'],
  'foundations/tokens/use-tokens-in-design':['src/pages/DesignSystem.tsx'],
  'foundations/logos':                      ['docs/logo-ideas.md'],
  'foundations/content/voice-tone':         ['docs/working-agreement.md'],
  'foundations/content/language-and-grammar':['docs/guideline-2.1-soat-step234.md'],
  'foundations/content/inclusive-writing':  ['docs/components/badge.md'],
  'foundations/content/date-time':           ['src/ui/regional.ts', 'docs/open-questions.md'],
  'foundations/content/designing-messages': ['docs/modal-patterns.md', 'docs/components/toast.md', 'docs/components/error-state.md'],
  'components/icon':                        ['src/ui/icons.tsx'],
  'components/app-shell':                   ['src/components/AppShell.tsx'],
  'components/command-palette':             ['src/components/CommandPalette.tsx', 'docs/patterns/search.md'],
  'patterns/screen-states':                 ['docs/design-system.md'],
};

/**
 * The single-file handover is now an OUTPUT, not the source. ds-handover.mjs
 * walks `nav` in order, with these two pages pulled to the front; the old
 * document opened on them and a reader taking over still needs them first.
 */
export const handoverFirst = ['get-started/about', 'get-started/develop'];
