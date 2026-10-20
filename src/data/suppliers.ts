/**
 * The supplier master, and what one quote may do with it.
 *
 * ASKED FOR by the customer's Quoting BoM mockup of 16 Oct, which is the first
 * document to say how a supplier is CHOSEN rather than merely recorded:
 * "preferred suppliers carry a priority group; the others are approved but not
 * preferred", and "Auto-pick tries Group 1 first, then Group 2."
 *
 * WHAT THAT REPLACES. Until today the prototype had one supplier per part,
 * baked into the seed, and "running the quote" meant copying it onto the line.
 * There was nothing to choose between, so Quote Focus could not express a
 * preference and the Supplier dropdown offered six names that no line had a
 * price for. `docs/testing/quick-quote-results.md` recorded prices-per-supplier
 * as deliberately unbuilt; this is it being built.
 *
 * THE GROUPS ARE THE COMPANY'S, THE TICKS ARE THE QUOTE'S. Which group a
 * supplier sits in is a standing commercial decision — franchised distributors
 * first, the rest behind them. A quote may move or drop one for its own reasons
 * (a customer who will not accept broker stock, a part on allocation), and that
 * belongs to the quote and not to the master, which is why the dialog says
 * "this quote only" and offers Reset to Master.
 */
export type SupplierId = string;

/** Display name per id. The id is what offers and setups are keyed on. */
export const SUPPLIERS: Record<SupplierId, string> = {
  arrow: 'Arrow', avnet: 'Avnet', digikey: 'Digi-Key', mouser: 'Mouser',
  newark: 'Newark', tti: 'TTI',
  future: 'Future Electronics', heilind: 'Heilind', master: 'Master Electronics',
  online: 'Online Components', rs: 'RS Americas', sager: 'Sager',
  /* Approved, not preferred: a marketplace seller and a machine shop. Neither
     carries a priority group, so auto-pick never reaches them — a quoter can
     still choose one by hand, which is exactly the distinction the two lists in
     the Supplier dropdown draw. */
  freelance: 'Freelance Electronics', protolabs: 'Protolabs',
};

export const GROUPS = [1, 2] as const;
export type Group = (typeof GROUPS)[number];

/** The standing priority. A supplier missing from this is approved, not preferred. */
export const MASTER_GROUP: Record<SupplierId, Group> = {
  arrow: 1, avnet: 1, digikey: 1, mouser: 1, newark: 1, tti: 1,
  future: 2, heilind: 2, master: 2, online: 2, rs: 2, sager: 2,
};

/** What one quote decided about one supplier. */
export type SupplierChoice = { group: Group; on: boolean };
export type SupplierSetup = Record<SupplierId, SupplierChoice>;

/** A fresh copy of the master, which is where every quote starts. */
export function masterSuppliers(): SupplierSetup {
  return Object.fromEntries(
    Object.entries(MASTER_GROUP).map(([id, group]) => [id, { group, on: true }]),
  );
}

export function supplierStats(setup: SupplierSetup) {
  const ids = Object.keys(setup);
  return {
    total: ids.length,
    inUse: ids.filter(id => setup[id].on).length,
    off: ids.filter(id => !setup[id].on).length,
    moved: ids.filter(id => MASTER_GROUP[id] !== setup[id].group).length,
  };
}

/** True when this quote has departed from the master in any way. */
export function suppliersChanged(setup: SupplierSetup): boolean {
  const master = masterSuppliers();
  return Object.keys(master).some(id =>
    !setup[id] || setup[id].on !== master[id].on || setup[id].group !== master[id].group);
}

export function sameSuppliers(a: SupplierSetup, b: SupplierSetup): boolean {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...ids].every(id =>
    a[id]?.on === b[id]?.on && a[id]?.group === b[id]?.group);
}

/**
 * The one line the setup strip has room for.
 *
 * Says what is DIFFERENT when anything is — "2 not used · 1 moved" — and what
 * is in force when nothing is. A count of what is on tells a reader nothing
 * they did not assume; a count of what was changed is the whole message.
 */
export function supplierSummary(setup: SupplierSetup): string {
  const st = supplierStats(setup);
  const changes = [st.off && `${st.off} not used`, st.moved && `${st.moved} moved`]
    .filter(Boolean).join(' · ');
  return changes || `${st.inUse} in use · ${GROUPS.length} groups`;
}
