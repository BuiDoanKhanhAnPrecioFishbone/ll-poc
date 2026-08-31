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
  const rows = generateParts(12);

  useEffect(() => {
    let live = true;
    import('@progress/kendo-theme-default/dist/all.css')
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
        <div className="vy-kendo-check">
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
