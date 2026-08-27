import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { liveNav, reviewPages } from '../data/sitemap';
import { CommandPalette } from './CommandPalette';
import { HeaderClock, TimezonePicker, LanguagePicker, QueueBell } from './GlobalHeader';
import { UserMenu } from './UserMenu';
import { generateQuotations } from '../data/quotations';
import { MEASURES, ME } from '../data/queues';
import { Icon } from '../ui/icons';

/**
 * One glyph per destination. The collapsed rail is icon-only, so these ARE the
 * navigation at that width — an item without its own icon is an item you cannot
 * find without expanding.
 */


/**
 * The breadcrumb is GONE.
 *
 * The 25 Aug review asked for it to be removed. It was added because the
 * production app gives no orientation at all, but the trail it produced was
 * "Sales Management / Project Requirements / rfq-3" — a group name the user
 * just clicked, a screen name already in the page title, and a raw record id.
 * Three lines of chrome restating what the screen says louder underneath.
 *
 * What it was actually for — getting back to the list from a record — is now
 * the explicit "← Quotations" control on the record itself, which says where it
 * goes instead of making the reader parse a path.
 */

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  /* Which nav group is open. Measured at 1024x768: the fully-expanded nav was
     1352px tall in a 628px rail, so 724px of it — more than half — could only
     be reached by scrolling, with nothing on screen saying so. Group headers
     stay visible either way, so the whole structure is still legible at a
     glance; that was the point of replacing the hamburger, and it survives. */
  const groupOf = (p: string) =>
    liveNav.find(g => !g.leaf && g.items.some(i => i.path === p || (i.path !== '/' && p.startsWith(i.path + '/'))))?.title;
  const [openGroup, setOpenGroup] = useState<string | null>(() => groupOf(pathname) ?? 'Sales Management');
  useEffect(() => {
    const g = groupOf(pathname);
    if (g) setOpenGroup(g);
  }, [pathname]);

  /* Shell-level preferences. In a real build these come from the user record;
     here they persist per browser so the choice at least survives a reload. */
  const [tz, setTz] = useState(() => localStorage.getItem('vy.tz') ?? 'Asia/Ho_Chi_Minh');
  const [lang, setLang] = useState(() => localStorage.getItem('vy.lang') ?? 'en');
  useEffect(() => { localStorage.setItem('vy.tz', tz); }, [tz]);
  useEffect(() => { localStorage.setItem('vy.lang', lang); }, [lang]);

  /* The badge counts what is LATE and mine, not everything outstanding. A badge
     showing total workload is permanently lit, and a permanently lit badge stops
     being read. */
  const overdueForMe = useMemo(() => {
    const isOverdue = MEASURES.find(m => m.key === 'overdue')!.match;
    return generateQuotations(330).filter(q => q.assignedTo === ME && isOverdue(q)).length;
  }, []);

  const [paletteOpen, setPaletteOpen] = useState(false);
  /* Below 820px the sidebar overlays rather than squeezing the content. It
     closes on navigation, because leaving it open over the screen you just
     asked for is the classic mobile-drawer mistake. */
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => { setNavOpen(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="vy-shell" data-collapsed={collapsed} data-nav-open={navOpen}>
      <a className="vy-skip" href="#vy-main">Skip to content</a>
      {/* ---- Sidebar: persistent, not a drawer -----------------------------
          The production app hides all 51 destinations behind a hamburger, so
          the user never sees where they are in the structure. A persistent
          rail costs 248px and buys permanent orientation. */}

      {navOpen && <div className="vy-nav-scrim" onClick={() => setNavOpen(false)} aria-hidden />}

      <aside className="vy-sidebar">
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
          {liveNav.map(g => {
            /* Home and DB Encryption have no children in the live menu. Rendering
               a group header above a single item that repeats its title reads as
               a bug, so a childless group is just a link. */
            if (g.leaf) {
              const i = g.items[0];
              return (
                <div className="vy-nav-group vy-nav-group--leaf" key={g.title}>
                  <NavLink to={i.path} end={i.path === '/'}
                           className={({ isActive }) => 'vy-nav-item' + (isActive ? ' is-active' : '')}
                           title={collapsed ? i.title : i.hint}>
                    <Icon name={i.icon ?? g.icon} />
                    {!collapsed && <span>{i.title}</span>}
                  </NavLink>
                </div>
              );
            }
            /* Collapsed, every group is open — there is no header to click, so
               a closed group would simply be missing. */
            const open = collapsed || openGroup === g.title;
            const hasActive = g.items.some(i => i.path === pathname || (i.path !== '/' && pathname.startsWith(i.path + '/')));
            return (
            <div className="vy-nav-group" key={g.title} data-open={open}>
              {!collapsed && (
                /* In the live menu these headers are links, and three of the eight
                   route to `/` — clicking the section you want lands you on Home.
                   Expand/collapse is the behaviour the header already implies, and
                   it takes nothing away: no destination is reachable only via the
                   header. */
                <button className="vy-nav-group-head" aria-expanded={open}
                        onClick={() => setOpenGroup(o => o === g.title ? null : g.title)}>
                  <span className="vy-nav-group-title">
                    {g.title}
                    {!open && hasActive && <span className="vy-group-dot" aria-label="contains the current screen" />}
                  </span>
                  <span className="vy-nav-chevron" aria-hidden>{open ? '⌄' : '›'}</span>
                </button>
              )}
              {open && g.items.map(i => (
                <NavLink key={i.path} to={i.path} end={i.path === '/'}
                         className={({ isActive }) => 'vy-nav-item' + (isActive ? ' is-active' : '')}
                         title={collapsed ? `${g.title} › ${i.title}` : i.hint}>
                  <Icon name={i.icon ?? g.icon} />
                  {!collapsed && <span>{i.title}</span>}
                </NavLink>
              ))}
            </div>
          );})}
        </nav>

        <div className="vy-sidebar-foot">
          {/* ---- Reviewer material, deliberately outside the product nav ------
              Decision D7. These three pages document the revamp; they are not
              screens the customer is buying. Sitting them beside Quotations made
              a stakeholder demo read as an argument rather than as the system.
              They stay one click away, below the fold, visually quieter than
              anything in the nav proper. */}
          {!collapsed && (
            <details className="vy-about">
              <summary>About this prototype</summary>
              <div className="vy-about-links">
                {reviewPages.map(r => (
                  <NavLink key={r.path} to={r.path}
                           className={({ isActive }) => 'vy-about-link' + (isActive ? ' is-active' : '')}
                           title={r.hint}>{r.title}</NavLink>
                ))}
              </div>
            </details>
          )}

          {/* Shaped like a nav item, because that is what it sits among.
              It was a 224x30 empty bordered box holding one text character,
              which read as an input rather than a button, and was the only
              icon in the app that was a glyph instead of an SVG.

              The icon states the CURRENT state rather than the action: the
              left pane is solid while the sidebar is open and hollow once it
              is collapsed, so the button reflects what you are looking at.
              The tooltip and label carry the action. */}
          <button
            type="button"
            className="vy-nav-item vy-collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
              <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.5"
                    fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="4" y="5" width="4" height="10" rx="1.25"
                    fill="currentColor" opacity={collapsed ? 0.3 : 1} />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="vy-main">
        <header className="vy-topbar">
          <button className="vy-icon-btn vy-nav-toggle" aria-label="Open navigation"
                  aria-expanded={navOpen} onClick={() => setNavOpen(o => !o)}>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>

          <button className="vy-search" onClick={() => setPaletteOpen(true)}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" strokeLinecap="round" />
            </svg>
            <span>Search screens, orders, parts…</span>
            <kbd>⌘K</kbd>
          </button>

          <div className="vy-topbar-right">
            {/* Clock and zone travel together: every timestamp in this system is
                only readable against a stated zone, and users work across
                Vietnam, the US and Europe. */}
            <HeaderClock tz={tz} />
            <TimezonePicker value={tz} onChange={setTz} />
            <LanguagePicker value={lang} onChange={setLang} />
            <span className="vy-topbar-sep" aria-hidden />
            <QueueBell count={overdueForMe} />
            <button className="vy-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 8a4 4 0 1 1 8 0c0 3 1 4 1 4H5s1-1 1-4M8.5 15a1.5 1.5 0 0 0 3 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="vy-dot" />
            </button>
            {/* Row density moved here from every list toolbar (25 Aug review).
                It is set once and applies to every grid, which is the point:
                as per-screen state the same user could have a compact
                Quotations list and a relaxed Part Master with no way to make
                them agree. */}
            <UserMenu />
          </div>
        </header>

        <main className="vy-content" id="vy-main" tabIndex={-1}><Outlet /></main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
