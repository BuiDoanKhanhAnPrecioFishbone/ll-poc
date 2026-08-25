import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ROLES, roleById, type Role, type RoleId } from '../data/permissions';

/**
 * User preferences.
 *
 * The 25 Aug review moved row density out of the list view: "do not show
 * settings in the list view, please move this into User Preference... we can set
 * a default Theme, Row density — the UI elements you want to show should be
 * configured here for consistency and to reduce unnecessary content on the list
 * view."
 *
 * Both halves of that matter. CONSISTENCY: density was per-grid state, so the
 * same user could have a compact Quotations list and a relaxed Part Master and
 * no way to make them agree. And the list view is where people work, not where
 * they configure — a settings control on it is paid for on every visit by
 * everyone, to serve a choice made once.
 */
export type Density = 'compact' | 'comfortable' | 'relaxed';

/**
 * How dates read in a grid.
 *
 * The 25 Aug review: "you should allow choosing either a specific date or count
 * date from today. Do not use the current display format because it makes the
 * layout inconsistent."
 *
 * The old cell printed BOTH — "12 Aug 2026" with "7d late" beside it, but only
 * on rows that were late or due soon. So a column of dates had two different
 * shapes depending on the row, and its width had to allow for the longer one on
 * every row that did not need it. One format, chosen once, applied everywhere.
 */
export type DateStyle = 'exact' | 'relative';

type Prefs = {
  density: Density; setDensity: (d: Density) => void;
  dateStyle: DateStyle; setDateStyle: (d: DateStyle) => void;
  /**
   * The signed-in user's role.
   *
   * In the real system this is resolved from the JWT's role GUID, and the user
   * cannot change it. It is switchable here because a permission model is
   * impossible to review otherwise — a reviewer has to be able to SEE what a
   * Buyer sees. The switcher is labelled as a prototype control so nobody reads
   * it as a feature.
   */
  role: Role; setRole: (id: RoleId) => void;
};

const Ctx = createContext<Prefs>({
  density: 'compact', setDensity: () => {},
  dateStyle: 'exact', setDateStyle: () => {},
  role: ROLES[0], setRole: () => {},
});
export const usePrefs = () => useContext(Ctx);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem('vy.density') as Density) ?? 'compact',
  );
  useEffect(() => { localStorage.setItem('vy.density', density); }, [density]);

  const [dateStyle, setDateStyle] = useState<DateStyle>(
    () => (localStorage.getItem('vy.dateStyle') as DateStyle) ?? 'exact',
  );
  useEffect(() => { localStorage.setItem('vy.dateStyle', dateStyle); }, [dateStyle]);

  const [roleId, setRole] = useState<RoleId>(
    () => (localStorage.getItem('vy.role') as RoleId) ?? 'estimator',
  );
  useEffect(() => { localStorage.setItem('vy.role', roleId); }, [roleId]);
  const role = roleById(roleId);

  const value = useMemo(
    () => ({ density, setDensity, dateStyle, setDateStyle, role, setRole }),
    [density, dateStyle, role],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
