/**
 * PARKED — not in scope, and not wired into anything.
 *
 * Customer decision, 25 Aug 2026: "My Queue is low priority, so for now just
 * note that we will have it in the future rather than handling it — let's focus
 * on the list view and form view of Project Requirement first."
 *
 * The work below is kept rather than deleted because it is most of the way
 * done and will be wanted later. Nothing imports it, so it costs nothing to
 * leave; if it starts costing something, delete it and read it back out of
 * git history.
 *
 * What is still missing before it could ship: the role has to come from the
 * JWT rather than a local preference, and every module's counts except Project
 * Requirements are illustrative — those record types are not modelled here.
 */

import { legacyNav } from './sitemap';

/**
 * Roles and permissions.
 *
 * SHAPE FROM THE LIVE SYSTEM. The production JWT carries `role` as a bare GUID
 * and a `/Permission` claim of `<menuId>.<level>` pairs — a LEVEL per MENU
 * ENTRY, not a set of named abilities. `/api/account/get/info` returns neither
 * a role name nor a designation, so the name a user would recognise is not in
 * the token at all; it has to be looked up from the role id.
 *
 * That shape is what this models. Permissions here are per menu path, and a
 * role is a named bundle of them — which is what the live pairs amount to once
 * you resolve the ids.
 *
 * The 25 Aug review: "each user will be assigned roles/permissions for
 * different apps, so they will only see the tasks and modules they are allowed
 * to access according to their work."
 */

/**
 * Levels, ordered. The live claim is numeric, so this keeps the ordering
 * meaningful — a check is "at least view", not "equals view".
 */
export const LEVELS = ['none', 'view', 'edit', 'full'] as const;
export type Level = typeof LEVELS[number];
export const atLeast = (have: Level, need: Level) =>
  LEVELS.indexOf(have) >= LEVELS.indexOf(need);

export type RoleId = 'estimator' | 'buyer' | 'planner' | 'accountant' | 'manager' | 'admin';

export type Role = {
  id: RoleId;
  name: string;
  /** What this person actually does, so the demo switcher is readable. */
  summary: string;
  /**
   * Menu paths to level. A path prefix grants the whole branch, so a role can
   * be stated in a few lines rather than one line per screen — the live pairs
   * are per entry, but per entry is not how anyone reasons about a role.
   */
  grants: Record<string, Level>;
};

/**
 * The roles an EMS of this shape actually has.
 *
 * Deliberately NOT "user / power user / admin". A permission model whose levels
 * describe how much software someone is trusted with, rather than what job they
 * do, cannot answer "should this person see purchase orders" — and that is the
 * only question it is ever asked.
 */
export const ROLES: Role[] = [
  {
    id: 'estimator', name: 'Estimator', summary: 'Prices customer enquiries',
    grants: {
      '/': 'view',
      '/sales-management/quotation': 'full',
      '/sales-management/so-mst': 'view',
      '/sales-management/cust-mst': 'view',
      '/inventory-management': 'view',
    },
  },
  {
    id: 'buyer', name: 'Buyer', summary: 'Sources parts and raises purchase orders',
    grants: {
      '/': 'view',
      '/procurement': 'full',
      '/sales-management/po-mst': 'full',
      '/inventory-management': 'edit',
      '/sales-management/quotation': 'view',
    },
  },
  {
    id: 'planner', name: 'Production Planner', summary: 'Schedules the shop floor',
    grants: {
      '/': 'view',
      '/production': 'full',
      '/sales-management/work-orders': 'full',
      '/machine-type': 'full',
      '/inventory-management': 'view',
      '/sales-management/so-mst': 'view',
    },
  },
  {
    id: 'accountant', name: 'Accountant', summary: 'Invoices, bills and the ledger',
    grants: {
      '/': 'view',
      '/accounting': 'full',
      '/sales-management/so-mst': 'view',
      '/sales-management/po-mst': 'view',
    },
  },
  {
    id: 'manager', name: 'Manager', summary: 'Oversees every module, changes little',
    grants: {
      '/': 'view',
      '/sales-management': 'edit',
      '/procurement': 'view',
      '/inventory-management': 'view',
      '/production': 'view',
      '/accounting': 'view',
    },
  },
  {
    id: 'admin', name: 'Administrator', summary: 'Everything, including system setup',
    grants: { '/': 'full' },
  },
];

export const roleById = (id: RoleId) => ROLES.find(r => r.id === id)!;

/**
 * The level a role has on a path.
 *
 * Longest matching prefix wins, so a specific grant can override a broader one
 * — a Buyer has `view` across Sales Management but `full` on Purchase Orders,
 * and stating that needs the specific rule to beat the general one.
 *
 * `/` is excluded from prefix matching or it would match everything; it is
 * checked last, as the explicit fallback it is meant to be.
 */
export function levelFor(role: Role, path: string): Level {
  let best: Level = 'none';
  let bestLen = -1;
  for (const [prefix, level] of Object.entries(role.grants)) {
    if (prefix === '/') continue;
    const hit = path === prefix || path.startsWith(prefix + '/');
    if (hit && prefix.length > bestLen) { best = level; bestLen = prefix.length; }
  }
  if (bestLen === -1 && role.grants['/']) {
    /* The root grant covers Home for everyone, but only opens the rest of the
       system for a role that is genuinely meant to see all of it. */
    return role.id === 'admin' ? role.grants['/'] : (path === '/' ? role.grants['/'] : 'none');
  }
  return best;
}

export const can = (role: Role, path: string, need: Level = 'view') =>
  atLeast(levelFor(role, path), need);

/**
 * Menu entries this role may open, as a set of paths.
 *
 * A group survives if any of its children do — hiding a group whose children
 * are all forbidden is the point, but hiding one that still has two reachable
 * screens would strand them.
 */
export function visibleMenu(role: Role) {
  const paths = new Set<string>();
  for (const g of legacyNav) {
    const kids = g.children.filter(c => can(role, c.path));
    if (g.children.length === 0) {
      if (can(role, g.path)) paths.add(g.path);
    } else if (kids.length) {
      paths.add(g.path);
      kids.forEach(c => paths.add(c.path));
    }
  }
  return paths;
}
