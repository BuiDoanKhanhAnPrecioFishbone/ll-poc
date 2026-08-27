/* =============================================================================
   SITEMAP — CURRENT vs PROPOSED
   -----------------------------------------------------------------------------
   `legacyNav` is not invented. It is the verbatim payload of
   GET /api/account/get/menus on the production system (51 nodes), captured
   2026-08-19. The `issues` on each node are the defects that payload exposes.
   ========================================================================== */

export type LegacyNode = {
  title: string;
  path: string;
  seq: number;
  /** Defects observable in the live menu payload. */
  issues?: string[];
};

export type LegacyGroup = {
  title: string;
  path: string;
  seq: number;
  children: LegacyNode[];
  issues?: string[];
};

export const legacyNav: LegacyGroup[] = [
  { title: 'Home', path: '/', seq: 1, children: [] },
  {
    title: 'Sales Management', path: '/sales-management', seq: 2,
    issues: ['Sequence 2 is missing — a deleted item left a permanent gap in ordering.'],
    children: [
      { title: 'Project Requirements', path: '/sales-management/quotation', seq: 1,
        issues: ['Three names for one thing: nav says "Project Requirements", the browser title says "Request for Quotation", the route and source folder say "quotation".'] },
      { title: 'Sales Orders', path: '/sales-management/so-mst', seq: 3,
        issues: ['Route exposes the database table name (`so-mst` = sales order master).'] },
      { title: 'RMA Lists', path: '/sales-management/rma', seq: 4,
        issues: ['"Lists" is an implementation word, not a user word. No other module is called a "List".'] },
      { title: 'Customer Management', path: '/sales-management/cust-mst', seq: 5,
        issues: ['Lives under `system-setup/` in the source tree but under Sales in the menu.'] },
      { title: 'Reporting', path: '/sales-management/reporting', seq: 6,
        issues: ['One of three identically-named "Reporting" entries.'] },
      { title: 'Configuration', path: '/system-setup/sale-setup', seq: 7,
        issues: ['One of five identically-named "Configuration" entries.', 'Label says Sales, route says system-setup.'] },
    ],
  },
  {
    title: 'Procurement Management', path: '/', seq: 3,
    issues: ['Group header routes to `/` — clicking the section you want dumps you on Home.'],
    children: [
      { title: 'Purchase Requisition', path: '/procurement/purchase-order-lines', seq: 1,
        issues: ['Label and route disagree: a requisition is not a purchase order line.'] },
      { title: 'Purchase Orders', path: '/sales-management/po-mst', seq: 2,
        issues: ['A Procurement screen served from the `sales-management` namespace.'] },
      { title: 'Supplier Management', path: '/inventory-management/supplier', seq: 3,
        issues: ['A Procurement screen served from the `inventory-management` namespace.'] },
      { title: 'Manufacturer Management', path: '/system-setup/manufacturer', seq: 4,
        issues: ['A Procurement screen served from the `system-setup` namespace.'] },
      { title: 'Reporting', path: '/procurement/reporting', seq: 5 },
      { title: 'What If', path: '/procurement/what-if', seq: 6,
        issues: ['Unguessable label. Nothing tells a new user this is supply/demand simulation.'] },
      { title: 'Configuration', path: '/procurement/configuration', seq: 7 },
    ],
  },
  {
    title: 'Inventory Management', path: '/inventory-management', seq: 4,
    children: [
      { title: 'Manufacture Part Number', path: '/inventory-management/mpn', seq: 1,
        issues: ['Should read "Manufacturer Part Number" (MPN). The current label is grammatically a verb phrase.'] },
      { title: 'Part Management', path: '/inventory-management/part-mst', seq: 2,
        issues: ['Nav says "Part Management", the page heading says "Part Master". Two names, one screen.'] },
      { title: 'Bill of Materials', path: '/inventory-management/bom-list', seq: 3 },
      { title: 'BoM Templates Setup', path: '/system-setup/bom-templates', seq: 4,
        issues: ['"BoM" here, "Bill of Materials" one row above — inconsistent casing and abbreviation.'] },
      { title: 'Transfers Management', path: '/inventory-management/transfer', seq: 5 },
      { title: 'Adjustments', path: '/inventory-management/adjustments', seq: 6 },
      { title: 'Reporting', path: '/inventory-management/reporting', seq: 7 },
      { title: 'Configuration', path: '/inventory-management/configuration', seq: 8 },
    ],
  },
  {
    title: 'Production', path: '/', seq: 5,
    issues: ['Group header routes to `/`.'],
    children: [
      { title: 'PCB Viewer', path: '/production/pcb-viewer', seq: 1 },
      { title: 'Work Orders', path: '/sales-management/work-orders', seq: 2,
        issues: ['A Production screen served from the `sales-management` namespace.'] },
      { title: 'Tool Type', path: '/production/tool-type', seq: 3,
        issues: ['"Tool Type" and "Tools" are two adjacent nav entries for one concept — a list and its lookup table.'] },
      { title: 'Tools', path: '/production/tools', seq: 4 },
      { title: 'Machine Type', path: '/machine-type', seq: 5,
        issues: ['Sits at the URL root with no namespace at all.', 'A lookup table promoted to top-level navigation.'] },
      { title: 'Configuration', path: '/production/configuration', seq: 6 },
    ],
  },
  {
    title: 'Accounting', path: '/', seq: 6,
    issues: ['Group header routes to `/`.', 'Sequences collide: two children share seq 2, and 3 and 5 are unused — ordering is not deterministic.'],
    children: [
      { title: 'Customer Invoices', path: '/accounting/customer-invoices', seq: 1 },
      { title: 'Supplier Bills', path: '/accounting/supplier-bills', seq: 2 },
      { title: 'Journal entries', path: '/accounting/journal-entries', seq: 2,
        issues: ['Sentence case in a Title Case list.', 'Duplicate sequence number with Supplier Bills.'] },
      { title: 'Payments', path: '/accounting/payments', seq: 4 },
      { title: 'Configuration', path: '/accounting/configuration', seq: 6 },
    ],
  },
  {
    title: 'DB Encryption', path: '/db-encryption', seq: 7,
    issues: ['A database administration tool sitting at the same level as Sales and Accounting.', 'Named after the implementation, visible to every user who can see the menu.'],
    children: [],
  },
  {
    title: 'System Configuration', path: '/user-management', seq: 8,
    issues: ['Eleven admin screens flattened into one list, at the same level as the six business modules.', 'Three children all carry sequence 0 — their order is whatever the API happens to return.', 'Group title says "System Configuration" but its path is `/user-management`.'],
    children: [
      { title: 'Job Management', path: '/system-setup/job-management', seq: 0 },
      { title: 'Employee Management', path: '/system-setup/employee-management', seq: 0 },
      { title: 'API Provider', path: '/system-setup/api-provider', seq: 0 },
      { title: 'Branch Set up', path: '/system-setup/branch', seq: 1,
        issues: ['"Set up" as two words; "Setup" as one word elsewhere in the same menu.'] },
      { title: 'User Management', path: '/user-management/user-list', seq: 2 },
      { title: 'Email Template', path: '/system-setup/email-template', seq: 3,
        issues: ['Singular, where every sibling list is plural.'] },
      { title: 'Departments', path: '/system-setup/departments', seq: 4 },
      { title: 'Menu Management', path: '/system-setup/menu-management', seq: 5 },
      { title: 'Region Language Format Config', path: '/system-setup/region-language-format-config', seq: 6,
        issues: ['Four nouns and an abbreviation in one label.'] },
      { title: 'User Designation', path: '/system-setup/user-designation', seq: 7,
        issues: ['Overlaps Employee Management and User Management — three screens about people, no stated boundary.'] },
      { title: 'Metadata Type Set up', path: '/system-setup/metadata-type', seq: 8 },
    ],
  },
];

/* -------------------------------------------------------------------------- */

export type NavItem = {
  title: string;
  path: string;
  /**
   * The icon shown when the rail is collapsed.
   *
   * Every item needs its OWN. The 25 Aug review asked for a collapsed icon-only
   * menu that can still be navigated, and items were inheriting their group's
   * icon — so collapsing Sales Management gave six identical trolley glyphs and
   * the rail became decoration you had to expand to read.
   */
  icon?: string;
  /** Where this lived before, so the migration is auditable and searchable. */
  wasCalled?: string;
  /** Plain-language description used by the command palette and empty states. */
  hint?: string;
  admin?: boolean;
  /** Mirrors the production URL on purpose, so the two can be compared side by side. */
  keepsLegacyRoute?: boolean;
};

export type NavGroup = {
  title: string;
  icon: string;
  /** Rendered as a single link with no group header (live "Home", "DB Encryption"). */
  leaf?: boolean;
  /** The question this section answers. Shown under the group in the nav. */
  purpose: string;
  items: NavItem[];
};

/* =============================================================================
   PROPOSED IA — NOT BUILT. Kept as a record of a proposal the customer declined.
   -----------------------------------------------------------------------------
   Decision D1 (24 Aug 2026): "same workflow, clearer surface". Renaming and
   regrouping 51 screens invalidates what every user has already learned, and the
   value being bought is legibility, not a different information architecture.
   `liveNav` below is what the product actually renders. This constant now feeds
   only the Sitemap page, which shows it marked as declined.

   The three rules it was built on, for the record:

   1. VERB-FIRST GROUPING. Sections are named after the work, not the database.
      A new user asks "where do I raise a purchase order", not "where is the
      procurement master".
   2. NO REPEATED LABELS. "Configuration" appeared 5x and "Reporting" 3x in the
      legacy menu; a label that appears five times carries no information. Each
      is now qualified by its module, and all setup screens are consolidated.
   3. ADMIN IS NOT A MODULE. The 11 System Configuration screens move out of the
      primary nav into a separate Settings area, because they are used monthly
      by two people while the business modules are used hourly by everyone.
   ========================================================================== */

export const proposedNav: NavGroup[] = [
  {
    title: 'Overview', icon: 'home', purpose: 'What needs me today',
    items: [
      { title: 'My Work', path: '/', hint: 'Queues assigned to you across every module', wasCalled: 'Home' },
    ],
  },
  {
    title: 'Sell', icon: 'sell', purpose: 'Demand — from enquiry to cash',
    items: [
      /* Quotations deliberately keeps the PRODUCTION route rather than /sell/quotations,
         so this mockup and the live system can be opened at the same URL and compared
         directly. /sell/quotations redirects here, which is exactly the migration this
         audit recommends for the other mis-namespaced screens (finding N3): move the
         route, keep the old link working. */
      { title: 'Quotations', path: '/sales-management/quotation', wasCalled: 'Sales Management › Project Requirements', hint: 'Customer RFQs and the quotes you send back', keepsLegacyRoute: true },
      { title: 'Sales Orders', path: '/sell/sales-orders', wasCalled: 'Sales Management › Sales Orders', hint: 'Confirmed customer demand' },
      { title: 'Returns (RMA)', path: '/sell/returns', wasCalled: 'Sales Management › RMA Lists', hint: 'Authorised customer returns' },
      { title: 'Customers', path: '/sell/customers', wasCalled: 'Sales Management › Customer Management', hint: 'Accounts, contacts, ship-to addresses' },
      { title: 'Invoices', path: '/sell/invoices', wasCalled: 'Accounting › Customer Invoices', hint: 'What you have billed and what is owed' },
    ],
  },
  {
    title: 'Buy', icon: 'buy', purpose: 'Supply — from requisition to payment',
    items: [
      { title: 'Requisitions', path: '/buy/requisitions', wasCalled: 'Procurement › Purchase Requisition', hint: 'Internal requests to purchase' },
      { title: 'Purchase Orders', path: '/buy/purchase-orders', wasCalled: 'Procurement › Purchase Orders', hint: 'Committed orders to suppliers' },
      { title: 'Suppliers', path: '/buy/suppliers', wasCalled: 'Procurement › Supplier Management', hint: 'Vendors you buy from' },
      { title: 'Manufacturers', path: '/buy/manufacturers', wasCalled: 'Procurement › Manufacturer Management', hint: 'Who makes the part, as distinct from who sells it to you' },
      { title: 'Supplier Bills', path: '/buy/bills', wasCalled: 'Accounting › Supplier Bills', hint: 'What suppliers have billed you' },
      { title: 'Supply Simulation', path: '/buy/simulation', wasCalled: 'Procurement › What If', hint: 'Model demand changes before committing' },
    ],
  },
  {
    title: 'Parts', icon: 'parts', purpose: 'What things are, and what they are made of',
    items: [
      { title: 'Part Master', path: '/parts', wasCalled: 'Inventory › Part Management', hint: 'The single record for every part you buy, make or sell' },
      { title: 'Manufacturer Part Numbers', path: '/parts/mpn', wasCalled: 'Inventory › Manufacture Part Number', hint: 'Approved manufacturer equivalents for a part' },
      { title: 'Bills of Materials', path: '/parts/bom', wasCalled: 'Inventory › Bill of Materials', hint: 'What a product is assembled from' },
    ],
  },
  {
    title: 'Stock', icon: 'stock', purpose: 'Where things physically are',
    items: [
      { title: 'Transfers', path: '/stock/transfers', wasCalled: 'Inventory › Transfers Management', hint: 'Moves between locations' },
      { title: 'Adjustments', path: '/stock/adjustments', wasCalled: 'Inventory › Adjustments', hint: 'Corrections to on-hand quantity' },
    ],
  },
  {
    title: 'Make', icon: 'make', purpose: 'Turning parts into product',
    items: [
      { title: 'Work Orders', path: '/make/work-orders', wasCalled: 'Production › Work Orders', hint: 'Jobs on the shop floor' },
      { title: 'PCB Viewer', path: '/make/pcb-viewer', wasCalled: 'Production › PCB Viewer', hint: 'Inspect board layouts against the BoM' },
      { title: 'Tooling', path: '/make/tooling', wasCalled: 'Production › Tools + Tool Type', hint: 'Tools and their types, merged into one screen' },
      { title: 'Machines', path: '/make/machines', wasCalled: 'Production › Machine Type', hint: 'Equipment and capability' },
    ],
  },
  {
    title: 'Finance', icon: 'finance', purpose: 'The books',
    items: [
      { title: 'Payments', path: '/finance/payments', wasCalled: 'Accounting › Payments', hint: 'Money in and money out' },
      { title: 'Journal Entries', path: '/finance/journals', wasCalled: 'Accounting › Journal entries', hint: 'Manual ledger postings' },
    ],
  },
  {
    title: 'Insight', icon: 'insight', purpose: 'One reporting home, not three',
    items: [
      { title: 'Reports', path: '/insight/reports', wasCalled: 'Sales › Reporting + Procurement › Reporting + Inventory › Reporting', hint: 'All three legacy Reporting screens, filtered by module' },
    ],
  },
];

/** Admin lives outside the primary nav, reached from the user menu. */
export const settingsNav: NavGroup[] = [
  {
    title: 'Settings', icon: 'settings', purpose: 'Configure once, rarely revisited',
    items: [
      { title: 'Module Configuration', path: '/settings/modules', admin: true, wasCalled: 'The five separate "Configuration" screens', hint: 'Sales, Procurement, Inventory, Production and Accounting settings on one page with tabs' },
      { title: 'People', path: '/settings/people', admin: true, wasCalled: 'Employee Management + User Management + User Designation', hint: 'Employees, their logins and their roles — previously three screens' },
      { title: 'Organisation', path: '/settings/org', admin: true, wasCalled: 'Branch Set up + Departments', hint: 'Branches and departments' },
      { title: 'Templates', path: '/settings/templates', admin: true, wasCalled: 'Email Template + BoM Templates Setup', hint: 'Email and BoM templates' },
      { title: 'Navigation', path: '/settings/navigation', admin: true, wasCalled: 'Menu Management', hint: 'Edit this menu' },
      { title: 'Regional Formats', path: '/settings/formats', admin: true, wasCalled: 'Region Language Format Config', hint: 'Date, number and currency display' },
      { title: 'Integrations', path: '/settings/integrations', admin: true, wasCalled: 'API Provider', hint: 'Outbound API connections' },
      { title: 'Advanced', path: '/settings/advanced', admin: true, wasCalled: 'DB Encryption + Metadata Type Set up + Job Management', hint: 'Database encryption, metadata types and scheduled jobs' },
    ],
  },
];

/* =============================================================================
   LIVE IA — what the product renders
   -----------------------------------------------------------------------------
   Derived from `legacyNav`, not retyped, so a title or an order can never drift
   from the captured GET /api/account/get/menus payload. Groups with no children
   in the live menu (Home, DB Encryption) render as single links.

   One entry is added: My Queues (decision D3/D6). It is additive — no live entry
   is renamed, moved or removed to make room for it.
   ========================================================================== */

const LIVE_ICONS: Record<string, string> = {
  'Home': 'home',
  'Sales Management': 'sell',
  'Procurement Management': 'buy',
  'Inventory Management': 'parts',
  'Production': 'make',
  'Accounting': 'finance',
  'DB Encryption': 'settings',
  'System Configuration': 'settings',
};

/**
 * One icon per destination, keyed on the words in its own label.
 *
 * Matched on the label rather than the path because the paths are the part of
 * this menu that is unreliable — seven of them sit in the wrong namespace, so a
 * Procurement screen served from `sales-management` would inherit a sales icon.
 * The label is what the user reads and what the icon has to agree with.
 */
const ITEM_ICONS: [RegExp, string][] = [
  [/requirement|quotation|rfq/i, 'quote'],
  [/sales order/i,               'order'],
  [/rma|return/i,                'return'],
  [/customer/i,                  'customer'],
  [/requisition/i,               'requisition'],
  [/purchase order/i,            'buy'],
  [/supplier/i,                  'supplier'],
  [/manufactur/i,                'factory'],
  [/what if|simulat/i,           'simulate'],
  [/part manage|part master|mpn|manufacture part/i, 'parts'],
  [/bill of material|bom/i,      'bom'],
  [/transfer/i,                  'transfer'],
  [/adjust/i,                    'adjust'],
  [/pcb/i,                       'pcb'],
  [/work order/i,                'make'],
  [/tool/i,                      'tool'],
  [/machine/i,                   'machine'],
  [/invoice/i,                   'invoice'],
  [/bill/i,                      'invoice'],
  [/journal/i,                   'journal'],
  [/payment/i,                   'finance'],
  [/report/i,                    'insight'],
  [/configuration|set ?up|config/i, 'settings'],
  [/encryption/i,                'lock'],
  [/employee|user|department|designation/i, 'people'],
  [/email|template/i,            'template'],
  [/job/i,                       'job'],
  [/api|integration/i,           'plug'],
  [/menu/i,                      'menu'],
  [/branch|region|language/i,    'globe'],
  [/metadata/i,                  'metadata'],
  [/queue/i,                     'queue'],
  [/home/i,                      'home'],
];

export const iconFor = (title: string) =>
  ITEM_ICONS.find(([re]) => re.test(title))?.[1] ?? 'doc';

function toLiveGroup(g: LegacyGroup): NavGroup {
  const icon = LIVE_ICONS[g.title] ?? 'settings';
  if (!g.children.length) {
    return { title: g.title, icon, purpose: '', leaf: true,
             items: [{ title: g.title, path: g.path, icon: iconFor(g.title) }] };
  }
  return {
    title: g.title, icon, purpose: '',
    items: g.children.map(c => ({ title: c.title, path: c.path, icon: iconFor(c.title) })),
  };
}

/** The queues page. The only entry in the nav that does not exist in the live menu. */
export const QUEUES_PATH = '/my-queues';

/**
 * The live menu, unchanged. NOTHING is added to it.
 *
 * My Queues used to sit here as an extra entry. It was removed once it became
 * an icon in the global header, for two reasons — one from the reviewer and one
 * from the screen itself.
 *
 * The reviewer, 25 Aug: "I think the My Queues menu can be reduced if we follow
 * the approach below (reason: the system's operation menu is quite long, so
 * reducing excessive items)." She asked for the header icon INSTEAD of the menu
 * entry, and the icon was added without the entry being taken away.
 *
 * And two doors to one room is a cost with no benefit: a user who finds it in
 * the menu never learns the badge exists, which is the half that tells them
 * something needs doing.
 */
export const liveNav: NavGroup[] = legacyNav.map(toLiveGroup);

/**
 * Reviewer-facing pages. NOT in the product nav (decision D7) — reached from a
 * footer entry, so a stakeholder demo shows the ERP rather than the case for it.
 */
export const reviewPages: NavItem[] = [
  { title: 'UX Audit', path: '/audit', hint: 'Findings measured from the live system' },
  { title: 'Sitemap', path: '/sitemap', hint: 'The live menu, and the restructure that was declined' },
  { title: 'Design System', path: '/design-system', hint: 'Tokens, status vocabulary and column roles' },
];

/** Flattened, for the command palette. Live destinations only. */
export const allDestinations = liveNav.flatMap(g =>
  g.items.map(i => ({ ...i, group: g.leaf ? '' : g.title }))
);

export const legacyStats = {
  totalNodes: 51,
  topLevelGroups: 8,
  repeatedConfiguration: 5,
  repeatedReporting: 3,
  namespaceMismatches: 7,
  groupsRoutingToRoot: 3,
  duplicateSequences: 4,
};
