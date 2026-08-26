import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SavedView, ViewColumn } from './views';

/**
 * Saved views, per screen.
 *
 * The live system stores these server-side against the user. Here they persist
 * to localStorage, keyed by screen, so a view survives a reload and a reviewer
 * can see the feature behave — but they are per-browser, which the UI says.
 */
export function useViews(screenKey: string, systemView: SavedView) {
  const storageKey = `vy.views.${screenKey}`;

  const [saved, setSaved] = useState<SavedView[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as SavedView[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* private mode */ }
  }, [saved, storageKey]);

  /* The built-in always leads, and cannot be deleted or renamed — a screen with
     no views left would otherwise have no columns at all. */
  const views = useMemo(() => [systemView, ...saved], [systemView, saved]);

  const [activeId, setActiveId] = useState<string>(() => {
    try { return localStorage.getItem(`${storageKey}.active`) ?? systemView.id; }
    catch { return systemView.id; }
  });
  useEffect(() => {
    try { localStorage.setItem(`${storageKey}.active`, activeId); } catch { /* ignore */ }
  }, [activeId, storageKey]);

  /* A view that was deleted, or a default that has since changed, must not
     leave the screen pointing at nothing. */
  const active = views.find(v => v.id === activeId)
    ?? views.find(v => v.isDefault)
    ?? systemView;

  const save = useCallback((view: SavedView) => {
    setSaved(list => {
      /* Only one default. Setting a new one clears the old, rather than leaving
         two views both claiming to open first. */
      const cleared = view.isDefault ? list.map(v => ({ ...v, isDefault: false })) : list;
      const i = cleared.findIndex(v => v.id === view.id);
      return i >= 0
        ? cleared.map(v => (v.id === view.id ? view : v))
        : [...cleared, view];
    });
    setActiveId(view.id);
  }, []);

  const remove = useCallback((id: string) => {
    setSaved(list => list.filter(v => v.id !== id));
    setActiveId(systemView.id);
  }, [systemView.id]);

  return { views, active, activeId, setActiveId, save, remove, systemView };
}

/** A fresh view seeded from whatever is on screen now. */
export function draftFrom(view: SavedView, name = ''): SavedView {
  return {
    ...view,
    id: `v${Date.now()}`,
    name,
    isDefault: false,
    system: false,
    columns: view.columns.map(c => ({ ...c })) as ViewColumn[],
    sort: view.sort.map(s => ({ ...s })),
    fields: [...view.fields],
  };
}
