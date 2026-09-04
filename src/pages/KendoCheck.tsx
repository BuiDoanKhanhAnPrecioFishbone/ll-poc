import { useEffect, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { generateParts } from '../data/parts';

/**
 * KendoReact licence check.
 *
 * ONE PAGE, AND IT IS NOT A MIGRATION. The rest of this prototype is built on
 * MIT-licensed components, for the reason recorded in
 * `docs/kendo-license-activation.md` section 6 — and that has not changed. This
 * page exists to answer one question the licence key raised and nothing else:
 * does a build with a genuinely licensed Kendo component come out clean?
 *
 * WHY THE GRID. KendoReact's licence check is enforced per component, and the
 * Grid is the one it is most visible on: unlicensed, it renders a watermark over
 * the data and a warning in the console, and the build log says so. If this page
 * shows a plain grid and the Vercel build log carries no licence warning, the
 * key is working end to end — npm, build, and runtime.
 *
 * THE THEME IS LOADED ON THIS ROUTE ONLY. Kendo's stylesheet is ~500KB of mostly
 * `.k-` prefixed rules, but importing it at the top of a module makes it global
 * in Vite and it would ship on every page of an app that uses none of it. The
 * dynamic import below keeps it to whoever opens this page.
 */
export function KendoCheck() {
  const [themeReady, setThemeReady] = useState(false);
  /* Phase 0 of the migration scope: can our tokens drive Kendo? The toggle is
     the experiment — the same grid, the same theme, with and without the
     bridge — because the only honest way to answer "does it look like ours" is
     to look at both. See docs/kendo-migration-scope.md. */
  const [bridged, setBridged] = useState(true);

  /* On the ROOT ELEMENT, not a wrapper. Kendo declares its derived colour
     variants on `:root`, and a custom property resolves where it is declared —
     so an override on a subtree moves the base colour and leaves every hover,
     active and subtle variant deriving from Kendo's own. The spike measured
     exactly that before this line existed. */
  useEffect(() => {
    document.documentElement.toggleAttribute('data-kendo-bridged', bridged);
    return () => document.documentElement.removeAttribute('data-kendo-bridged');
  }, [bridged]);
  const rows = generateParts(12);

  useEffect(() => {
    let live = true;
    Promise.all([
      import('@progress/kendo-theme-default/dist/all.css'),
      /* Loaded AFTER the theme, so its :root wins on cascade order alone —
         no specificity tricks, no !important. */
      import('../theme/kendo-bridge.css'),
    ])
      .then(() => { if (live) setThemeReady(true); })
      .catch(() => { if (live) setThemeReady(true); });   /* unstyled still proves the licence */
    return () => { live = false; };
  }, []);

  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">KendoReact licence check</h1>
          <p className="vy-page-sub">
            One licensed component, so a build can be proved clean. Not part of the app.
          </p>
        </div>
      </div>

      <div className="vy-ds-note">
        <p>
          The grid below is a real <code>@progress/kendo-react-grid</code>, which is
          licensed software. <strong>Licensed, it renders plainly.</strong> Unlicensed, Kendo
          draws a watermark across it and logs a warning to the console.
        </p>
        <p>
          <strong>The signal is in the INSTALL step, not the build step.</strong> Vite's build
          log says nothing about licensing either way — verified by building this page both
          with and without a key. Activation happens in{' '}
          <code>@progress/kendo-licensing</code>'s postinstall, which prints whether it found
          a key and when the subscription expires. That line, plus no watermark here, is the
          proof.
        </p>
        <p>
          Everything else in this prototype uses MIT components and is unaffected either way.
        </p>
      </div>

      {!themeReady ? (
        <p className="vy-empty-inline">Loading the Kendo theme…</p>
      ) : (
        /* The toggle sets `data-kendo-bridged` on <html> — see the effect
           above and kendo-bridge.css. Off, the grid wears Kendo's own
           defaults; on, it wears our tokens. */
        <div className="vy-kendo-check">
          <div className="vy-inline-actions" style={{ marginBottom: 'var(--vy-space-5)' }}>
            <label className="vy-radio">
              <input type="checkbox" checked={bridged}
                     onChange={e => setBridged(e.target.checked)} />
              <span>Drive Kendo from our design tokens</span>
            </label>
            <span className="vy-field-hint">
              {bridged
                ? 'Our blue, our greys, 13px Inter, our 4px radius — from a 40-line variable map.'
                : 'Kendo defaults: its own red, 14px, its own neutrals.'}
            </span>
          </div>
          <Grid data={rows} style={{ height: 420 }}>
            <GridColumn field="partNumber" title="Part Number" width="200px" />
            <GridColumn field="description" title="Description" />
            <GridColumn field="customer" title="Customer" width="220px" />
            <GridColumn field="partSource" title="Source" width="110px" />
            <GridColumn field="onHand" title="On Hand" width="110px" format="{0:n0}" />
            <GridColumn field="unitCost" title="Unit Cost" width="120px" format="{0:c2}" />
          </Grid>
        </div>
      )}
    </div>
  );
}
