import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { proposedNav, settingsNav, reviewNav } from '../data/sitemap';
import { CommandPalette } from './CommandPalette';

const ICONS: Record<string, string> = {
  home: 'M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z',
  sell: 'M3 5h14l-1.5 8.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5zM7 17.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0m5 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  buy: 'M4 4h3l1.5 8.5A2 2 0 0 0 10.5 14H16M6 7h11l-1 5H7',
  parts: 'M10 2.5 17 6.5v7L10 17.5 3 13.5v-7zM10 2.5v15M3 6.5l7 4 7-4',
  stock: 'M3 6h14v11H3zM3 6l2-3h10l2 3M8 10h4',
  make: 'M4 16V9l4 3V9l4 3V9l4 3v4zM4 16h12',
  finance: 'M10 3v14M6.5 6.5h5a2 2 0 1 1 0 4h-3a2 2 0 1 0 0 4h5',
  insight: 'M4 16V8M8 16V4M12 16v-6M16 16v-9',
  settings: 'M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6M10 2v2M10 16v2M4 10H2M18 10h-2M5 5 3.6 3.6M16.4 16.4 15 15M15 5l1.4-1.4M3.6 16.4 5 15',
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none"
         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.home} />
    </svg>
  );
}

/** Builds a trail from the proposed IA so every screen states where it sits. */
function useBreadcrumb() {
  const { pathname } = useLocation();
  const all = [...proposedNav, ...settingsNav, reviewNav];
  for (const g of all) {
    const hit = g.items.find(i => i.path === pathname);
    if (hit) return { group: g.title, title: hit.title, wasCalled: hit.wasCalled, record: null };
  }
  /* A record route (/sell/quotations/rfq-5) belongs to its list. Without this
     the trail collapses to the app name on exactly the screens where knowing
     where you are matters most. */
  for (const g of all) {
    const parent = g.items.find(i => i.path !== '/' && pathname.startsWith(i.path + '/'));
    if (parent) {
      return {
        group: g.title, title: parent.title, wasCalled: parent.wasCalled,
        record: decodeURIComponent(pathname.slice(parent.path.length + 1)),
        parentPath: parent.path,
      };
    }
  }
  return null;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  /* Which nav group is open. Measured at 1024x768: the fully-expanded nav was
     1352px tall in a 628px rail, so 724px of it — more than half — could only
     be reached by scrolling, with nothing on screen saying so. Group headers
     stay visible either way, so the whole structure is still legible at a
     glance; that was the point of replacing the hamburger, and it survives. */
  const groupOf = (p: string) =>
    proposedNav.find(g => g.items.some(i => i.path === p || (i.path !== '/' && p.startsWith(i.path + '/'))))?.title;
  const [openGroup, setOpenGroup] = useState<string | null>(() => groupOf(pathname) ?? 'Sell');
  useEffect(() => {
    const g = groupOf(pathname);
    if (g) setOpenGroup(g);
  }, [pathname]);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const crumb = useBreadcrumb();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="vy-shell" data-collapsed={collapsed}>
      <a className="vy-skip" href="#vy-main">Skip to content</a>
      {/* ---- Sidebar: persistent, not a drawer -----------------------------
          The production app hides all 51 destinations behind a hamburger, so
          the user never sees where they are in the structure. A persistent
          rail costs 248px and buys permanent orientation. */}
      <aside className="vy-sidebar" aria-label="Main navigation">
        <div className="vy-brand">
          <div className="vy-brand-mark" aria-hidden>V</div>
          {!collapsed && (
            <div className="vy-brand-text">
              <strong>VOYAGER</strong>
              <span>Linh Long Engineering</span>
            </div>
          )}
        </div>

        <nav className="vy-nav">
          {proposedNav.map(g => {
            const open = collapsed || openGroup === g.title;
            const hasActive = g.items.some(i => i.path === pathname || (i.path !== '/' && pathname.startsWith(i.path + '/')));
            return (
            <div className="vy-nav-group" key={g.title} data-open={open}>
              {!collapsed && (
                <button className="vy-nav-group-head" aria-expanded={open}
                        onClick={() => setOpenGroup(o => o === g.title ? null : g.title)}>
                  <span className="vy-nav-group-title">
                    {g.title}
                    {!open && hasActive && <span className="vy-group-dot" aria-label="contains the current screen" />}
                  </span>
                  <span className="vy-nav-group-purpose">{g.purpose}</span>
                  <span className="vy-nav-chevron" aria-hidden>{open ? '⌄' : '›'}</span>
                </button>
              )}
              {open && g.items.map(i => (
                <NavLink key={i.path} to={i.path} end={i.path === '/'}
                         className={({ isActive }) => 'vy-nav-item' + (isActive ? ' is-active' : '')}
                         title={collapsed ? `${g.title} › ${i.title}` : i.hint}>
                  <Icon name={g.icon} />
                  {!collapsed && <span>{i.title}</span>}
                </NavLink>
              ))}
            </div>
          );})}
          <div className="vy-nav-group vy-nav-group--review" data-open key={reviewNav.title}>
            {!collapsed && (
              <div className="vy-nav-group-head">
                <span className="vy-nav-group-title">{reviewNav.title}</span>
                <span className="vy-nav-group-purpose">{reviewNav.purpose}</span>
              </div>
            )}
            {reviewNav.items.map(i => (
              <NavLink key={i.path} to={i.path}
                       className={({ isActive }) => 'vy-nav-item' + (isActive ? ' is-active' : '')}
                       title={collapsed ? `Review › ${i.title}` : i.hint}>
                <Icon name={reviewNav.icon} />
                {!collapsed && <span>{i.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="vy-sidebar-foot">
          <NavLink to="/settings/modules" className={({ isActive }) => 'vy-nav-item' + (isActive ? ' is-active' : '')}>
            <Icon name="settings" />{!collapsed && <span>Settings</span>}
          </NavLink>
          <button className="vy-collapse" onClick={() => setCollapsed(c => !c)}
                  aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>
      </aside>

      <div className="vy-main">
        <header className="vy-topbar">
          {/* ---- Breadcrumb: the orientation the production app has none of --- */}
          <div className="vy-crumb">
            {crumb ? (
              <>
                <span className="vy-crumb-group">{crumb.group}</span>
                <span className="vy-crumb-sep">/</span>
                {crumb.record
                  ? <><NavLink className="vy-crumb-link" to={crumb.parentPath!}>{crumb.title}</NavLink>
                      <span className="vy-crumb-sep">/</span>
                      <span className="vy-crumb-title">{crumb.record}</span></>
                  : <span className="vy-crumb-title">{crumb.title}</span>}
                {crumb.wasCalled && !crumb.record && <span className="vy-crumb-was" title="Where this screen lived in the current system">was: {crumb.wasCalled}</span>}
              </>
            ) : <span className="vy-crumb-title">Voyager</span>}
          </div>

          <button className="vy-search" onClick={() => setPaletteOpen(true)}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" strokeLinecap="round" />
            </svg>
            <span>Search screens, orders, parts…</span>
            <kbd>⌘K</kbd>
          </button>

          <div className="vy-topbar-right">
            <button className="vy-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 8a4 4 0 1 1 8 0c0 3 1 4 1 4H5s1-1 1-4M8.5 15a1.5 1.5 0 0 0 3 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="vy-dot" />
            </button>
            <div className="vy-avatar" title="Huyen NTN">H</div>
          </div>
        </header>

        <main className="vy-content" id="vy-main" tabIndex={-1}><Outlet /></main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
