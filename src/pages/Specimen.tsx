import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { specimens } from '../specimens/registry';
import { applyTheme, type Theme } from '../theme/applyTheme';

/**
 * One component's live examples, with no shell around them, so the design
 * system site can frame it.
 *
 * It renders outside `BootGate` and `AppShell` for the same reason `/login`
 * does: there is no workspace to load and no navigation to show.
 *
 * TWO MESSAGES CROSS THE FRAME, both same-origin:
 *   in   vy-specimen-theme   the site's own light/dark toggle, forwarded, so
 *                            the example never disagrees with the page around it
 *   out  vy-specimen-height  measured on every resize, because an iframe has
 *                            no intrinsic height and a scrollbar inside an
 *                            example is a bug a reader would blame on us
 */
/**
 * The tick and the cross on a Do / Don't card.
 *
 * Drawn here rather than added to `ui/icons.tsx`, which is the PRODUCT's
 * glyph set — 43 names, every one of them a thing a user clicks or a record
 * type they recognise. A verdict mark on a documentation card is not one of
 * those, and putting it in the set would make the count disagree with the
 * page that prints it.
 *
 * `aria-hidden`, because the word beside it already says Do or Don't. The
 * colour is the only thing the shape adds, and colour is never the only
 * carrier here — the word is.
 */
function Verdict({ kind }: { kind: 'do' | 'dont' }) {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden
         fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="7" fill="currentColor" stroke="none" />
      {kind === 'do'
        ? <path d="m4.8 8.3 2.1 2.1 4.3-4.6" stroke="var(--vy-surface)" />
        : <path d="m5.5 5.5 5 5m0-5-5 5" stroke="var(--vy-surface)" />}
    </svg>
  );
}

export default function Specimen() {
  const { name = '' } = useParams();
  const list = specimens[name];
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; theme?: Theme };
      if (d?.type === 'vy-specimen-theme' && d.theme) applyTheme(d.theme);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const post = () => window.parent?.postMessage(
      { type: 'vy-specimen-height', name, height: Math.ceil(el.getBoundingClientRect().height) },
      window.location.origin,
    );
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, [name]);

  return (
    <div ref={root} className="vy-specimen">
      {!list && <p className="vy-specimen-missing">No live example is written for <code>{name}</code> yet.</p>}
      {list?.map(ex => (
        <section key={ex.title}>
          <h2>{ex.title}</h2>
          {ex.note && <p>{ex.note}</p>}
          {ex.render && <div className="vy-specimen-stage">{ex.render()}</div>}
          {ex.compare && (
            <div className="vy-dodont">
              {ex.compare.map(c => (
                <figure key={c.caption} className="vy-dodont-card" data-verdict={c.verdict}>
                  <div className="vy-specimen-stage vy-dodont-stage">{c.render()}</div>
                  <figcaption>
                    <span className="vy-dodont-verdict">
                      <Verdict kind={c.verdict} />
                      {c.verdict === 'do' ? 'Do' : "Don't"}
                    </span>
                    {c.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
