/* =============================================================================
   UX FINDINGS
   -----------------------------------------------------------------------------
   Captured from the live production system on 19 Aug 2026 by instrumenting the
   rendered DOM (column widths, clip ratios, empty ratios) and by reading the
   menu API payload. Every number below is measured, not estimated.
   ========================================================================== */

export type Finding = {
  id: string;
  area: 'Tables' | 'Navigation' | 'Layout' | 'Content' | 'System';
  title: string;
  evidence: string;
  impact: string;
  fix: string;
  effort: 'Low' | 'Medium' | 'High';
  value: 'High' | 'Medium';
  /**
   * What decision D1 did to this finding.
   *
   * `fixed`       — a surface defect. Legibility, density, a missing state, a
   *                 broken behaviour. Built in the prototype.
   * `observation` — true, measured, and NOT being acted on, because acting on it
   *                 would mean renaming or regrouping screens users have already
   *                 learned. It stays on the record; it is not a work item.
   *
   * The split exists because a list of seventeen findings with no status reads
   * as a backlog, and eight of these are deliberately not going to be done.
   */
  status: 'fixed' | 'observation';
  /** Why an observation is not being acted on, or where a fix landed. */
  note: string;
};

export const findings: Finding[] = [
  {
    id: 'T1', area: 'Tables', effort: 'Low', value: 'High',
    title: 'Every column is the same width, so the primary identifier is unreadable',
    evidence: 'On /inventory-management/part-mst every data column is exactly 108px. Measured against the rendered rows: PART NUMBER is clipped in 85% of rows, CUSTOMER NAME in 100%, LAST CHANGE in 100%, DESCRIPTION in 60%. Four of eleven column headers are themselves clipped. On /sales-management/so-mst the same pattern appears at 77px.',
    impact: 'The part number is how people refer to a part in email, on the shop floor and to suppliers. Users must hover or open each row to read the one value that identifies it.',
    fix: 'Assign each column a role (ident / text / code / number / money / date / status) and derive width from the role. Only the text role may truncate.',
    status: 'fixed',
    note: 'Built: column roles in components/column-model.ts drive every width, and only the `text` role truncates.'
  },
  {
    id: 'T2', area: 'Tables', effort: 'Low', value: 'High',
    title: 'An always-empty column is granted the same space as the identifier',
    evidence: 'ABC is empty in 100% of rows and still occupies 108px. PART CLASS and PART TYPE are empty in 55%. Together they consume roughly a quarter of the grid width.',
    impact: 'Space is taken from columns that are being truncated and given to columns with no data in them.',
    fix: 'Hide sparse columns by default, keep them in the column chooser, and state the reason there so the choice is auditable.',
    status: 'fixed',
    note: 'Built: sparse columns are hidden by default and named in the column chooser.'
  },
  {
    id: 'T3', area: 'Tables', effort: 'Low', value: 'High',
    title: 'Row height is double the header height, and density is not adjustable',
    evidence: '50px rows against a 21px header, 20 rows per page, 21,941 records in the Part Master. About ten rows are visible on a 900px screen.',
    impact: 'Scanning a list of parts requires paging rather than reading. The header — the thing that tells you what a column means — is the least prominent element in it.',
    fix: 'Three densities as a user setting, defaulting to 36px; header in uppercase 11px with a stronger bottom border. Compact mode fits roughly 28 rows in the same space.',
    status: 'fixed',
    note: 'Built: three densities, compact by default.'
  },
  {
    id: 'T4', area: 'Tables', effort: 'Low', value: 'Medium',
    title: 'A whole column is spent on an eye icon because rows are not clickable',
    evidence: 'Both the Part Master and the Sales Order list reserve a 60px leading column for a single view button; the row itself has no click behaviour.',
    impact: 'A 60px column and an extra pointer trip on every record open.',
    fix: 'Make the IDENTIFIER the link, not the row. REVISED 22 Aug 2026 — this first read "make the row open the record", which is wrong: users copy values out of the grid daily, and a drag to select ends in mouseup on the row, firing the click and navigating away. Linking the identifier costs no column, keeps every cell selectable, and gives a visible affordance. Verified against the customer, who raised the copy case.',
    status: 'fixed',
    note: 'Built — but not as first proposed, and now standing against a client document. Making the whole ROW clickable broke text selection, which estimators rely on to copy part numbers into email, so the identifier cell is the link. The customer\'s Testing Guideline lists a leading "View Detail" column and the live system has one; it was built to match and then removed, because that column is a KendoReact default rather than a design decision and their own notes plan a second row action. Raised as question 1 in docs/open-questions.md rather than decided quietly.'
  },
  {
    id: 'T5', area: 'Tables', effort: 'Low', value: 'Medium',
    title: 'Loading and empty are rendered at the same time',
    evidence: 'On first paint of the Part Master the grid shows “No records available” while the loading indicator is still spinning beneath it.',
    impact: 'Users are told there is no data during the moment the data is arriving — the most common cause of a support ticket that resolves itself.',
    fix: 'Three distinct states: skeleton rows while loading, a real empty state with a way out, and an error state that names the failure.',
    status: 'fixed',
    note: 'Built: skeletons while loading, a sentence when genuinely empty, and never both.'
  },
  {
    id: 'N1', area: 'Navigation', effort: 'Medium', value: 'High',
    title: 'All 51 destinations are hidden behind a hamburger',
    evidence: 'The primary navigation is a collapsed drawer even at 1600px viewport width. Nothing on screen indicates the current location: there is no breadcrumb and no persistent active state.',
    impact: 'This is the single biggest contributor to the learning curve. A new user cannot build a mental model of a structure they can only see one screen at a time.',
    fix: 'Persistent 248px sidebar with the active item marked, a breadcrumb in the top bar, and ⌘K search across all destinations.',
    status: 'fixed',
    note: 'Built: a persistent rail. This exposes the existing menu rather than changing it, so D1 does not touch it.'
  },
  {
    id: 'N2', area: 'Navigation', effort: 'Low', value: 'High',
    title: '“Configuration” appears five times and “Reporting” three times',
    evidence: 'Five sibling groups each contain an item labelled exactly “Configuration”; three contain “Reporting”. The labels are identical, so the only disambiguator is the group the user has already had to expand.',
    impact: 'A label that appears five times carries no information. Search results and browser history are ambiguous.',
    fix: 'Consolidate the five Configuration screens into one Settings › Module Configuration page with tabs, and the three Reporting screens into one Insight › Reports filtered by module.',
    status: 'observation',
    note: 'NOT being fixed. Renaming five "Configuration" entries means five screens whose location every user has memorised. D2: only genuine errors are corrected, and a repeated-but-learned name is not an error.'
  },
  {
    id: 'N3', area: 'Navigation', effort: 'Low', value: 'High',
    title: 'Seven screens are served from the wrong namespace',
    evidence: 'Purchase Orders (Procurement) → /sales-management/po-mst · Work Orders (Production) → /sales-management/work-orders · Supplier Management (Procurement) → /inventory-management/supplier · Manufacturer Management (Procurement) → /system-setup/manufacturer · Sales Configuration → /system-setup/sale-setup · Purchase Requisition → /procurement/purchase-order-lines · Machine Type → /machine-type, at the URL root.',
    impact: 'The URL contradicts the menu. Anyone reading a shared link, a bookmark or a bug report is told the wrong module.',
    fix: 'Align routes to the new IA and 301 the old paths, so existing bookmarks keep working.',
    status: 'observation',
    note: 'NOT being fixed. Moving routes between namespaces breaks every bookmark and every link already shared, for a tidiness nobody sees. The prototype mirrors the live routes exactly.'
  },
  {
    id: 'N4', area: 'Navigation', effort: 'Low', value: 'Medium',
    title: 'Three group headers route to Home',
    evidence: 'Procurement Management, Production and Accounting all have path "/" in the menu payload.',
    impact: 'Clicking the section you want takes you to the dashboard — a dead end that reads as a bug.',
    fix: 'Either give each group a landing page or make the header a pure disclosure control that cannot be clicked through.',
    status: 'fixed',
    note: 'Built: group headers expand and collapse instead of navigating. Nothing is renamed and no destination becomes unreachable — a header that dumps you on Home was simply broken.'
  },
  {
    id: 'N5', area: 'Navigation', effort: 'Low', value: 'Medium',
    title: 'Menu ordering is not deterministic',
    evidence: 'Three System Configuration children all carry sequence 0. Accounting has two children at sequence 2, with 3 and 5 unused. Sales Management skips sequence 2 entirely.',
    impact: 'Items can appear in a different order between sessions or environments, which quietly undermines muscle memory.',
    fix: 'Enforce unique sequences per parent and resequence on save in Menu Management.',
    status: 'observation',
    note: 'Cannot be fixed here. The duplicate sequences are in the menu data, editable through Menu Management. The prototype renders the captured order faithfully, including its collisions.'
  },
  {
    id: 'N6', area: 'Navigation', effort: 'Low', value: 'Medium',
    title: 'Administration sits at the same level as the business modules',
    evidence: 'System Configuration holds 11 screens — including DB Encryption as its own top-level entry — alongside Sales, Procurement, Inventory, Production and Accounting.',
    impact: 'Screens used monthly by two people occupy the same visual weight as screens used hourly by everyone, and a database tool is exposed to every user who can open the menu.',
    fix: 'Move administration behind a Settings area, grouped by subject (People, Organisation, Templates, Integrations, Advanced).',
    status: 'observation',
    note: 'NOT being fixed. Moving eleven admin screens out of the primary nav is exactly the regrouping D1 rules out.'
  },
  {
    id: 'C1', area: 'Content', effort: 'Low', value: 'High',
    title: 'One screen has three different names',
    evidence: 'The nav says “Project Requirements”, the browser title says “Request for Quotation”, and the route and source folder say “quotation”. Part Management / Part Master is the same problem.',
    impact: 'Users, trainers and support cannot agree on what to call the screen, so documentation and tickets diverge from the UI.',
    fix: 'One name per screen, used in the nav, the heading, the title tag and the route. Keep the old name searchable in ⌘K during transition.',
    status: 'observation',
    note: 'NOT being fixed. Picking one of "Project Requirements", "Request for Quotation" and "quotation" means the other two stop matching what users search for. The prototype uses the nav name, verbatim.'
  },
  {
    id: 'C2', area: 'Content', effort: 'Low', value: 'Medium',
    title: 'Labels are inconsistent in case, number and abbreviation',
    evidence: '“Journal entries” in sentence case among Title Case siblings · “Branch Set up” beside “BoM Templates Setup” · “Email Template” singular among plural siblings · “Manufacture Part Number” where “Manufacturer” is meant · “What If” with no indication it is a supply simulation.',
    impact: 'Inconsistency reads as carelessness and makes scanning slower; ambiguous labels force exploratory clicking.',
    fix: 'A short content standard: Title Case, plural for lists, no abbreviations in nav, and every label a noun phrase a new user could guess.',
    status: 'observation',
    note: 'NOT being fixed — and this one was fixed and then REVERTED. Nine labels had been normalised for case and phrasing; D2 put every one of them back. Case and abbreviation are house style, not mistakes. Two genuine errors remain corrected: "Polumeric" and "Provide Alt Aml For Out Stock".'
  },
  {
    id: 'C3', area: 'Content', effort: 'Low', value: 'High',
    title: 'Stock demo data is live on the Home dashboard',
    evidence: 'The dashboard renders a Kendo sample chart titled “World Population by Broad Age Groups” beneath the real Quotation Request chart.',
    impact: 'It is the first thing every user sees on login, and it says the product is unfinished.',
    fix: 'Replace the dashboard with role-based work queues: what is assigned to me, what is overdue, what is blocked.',
    status: 'fixed',
    note: 'Built: the demo chart is gone from Home, replaced by the Quotation Request chart.'
  },
  {
    id: 'L1', area: 'Layout', effort: 'Low', value: 'Medium',
    title: 'The header collapses into itself below about 1000px',
    evidence: 'At 800px the logo and the language flag overlap; the clock, search and notification controls reflow across each other.',
    impact: 'The system is used on shop-floor terminals and laptops, where this is the default rather than the edge case.',
    fix: 'A three-region top bar (breadcrumb / search / account) with defined collapse order, and drop the clock — the OS already shows the time.',
    status: 'fixed',
    note: 'Built: breakpoints at 1180px, 980px and 820px, and a container query on the wizard stepper.'
  },
  {
    id: 'S1', area: 'System', effort: 'Medium', value: 'Medium',
    title: 'Internationalisation is wired but not populated',
    evidence: 'Every one of the 51 menu nodes returns transKey "nav.dashboards.home" and icon "dashboards.home" — the same placeholder for all of them.',
    impact: 'The language switch cannot translate navigation, and no menu item can ever have its own icon, which is why the nav is an undifferentiated wall of text.',
    fix: 'Populate real translation keys and per-item icons in Menu Management. Icons alone materially speed up scanning a 51-item structure.',
    status: 'observation',
    note: 'Out of scope for a prototype. Populating the translation resource is a content and build task on the real system.'
  },
  {
    id: 'S2', area: 'System', effort: 'Medium', value: 'Medium',
    title: 'A route change downloads dozens of separate chunks',
    evidence: 'Navigating to the Part Master issued roughly 60 additional JavaScript requests; the app ships 218 chunks and a 3.8 MB library bundle with a 2.1 MB stylesheet.',
    impact: 'Perceived slowness on every navigation, worst on the shop-floor terminals that need it most.',
    fix: 'Group chunks per module rather than per component, and prune the Kendo theme to the components actually used.',
    status: 'observation',
    note: 'Out of scope for a prototype. The chunking is a production build configuration, not a design decision.'
  },
];

export const effortValueOrder = (f: Finding) =>
  (f.effort === 'Low' ? 0 : f.effort === 'Medium' ? 1 : 2) * 10 + (f.value === 'High' ? 0 : 1);
