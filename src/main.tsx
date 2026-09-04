import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
/* Self-hosted, so there is no request to Google and no flash of fallback text.
   Variable Inter is one file for every weight. */
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import './theme/tokens.css';      // primitives — the only raw values
import './theme/base.css';        // reset + document defaults
import './theme/md3.css';         // Material 3 structure: elevation, state, motion
/* Kendo, then the map from our tokens onto it. ORDER IS LOAD-BEARING: the
   bridge overrides Kendo's :root variables on cascade order alone, so it must
   follow the subset; both precede components.css so our own rules still win
   where the two ever target the same element. */
import './theme/kendo-subset.scss';
import './theme/kendo-bridge.css';
import './theme/components.css';  // the component layer
import './theme/app.css';         // application chrome
import './theme/responsive.css';

/* The bridge is written as `html[data-kendo-bridged]` so `/kendo-check` can show
   Kendo's own defaults beside ours. Adoption means it is simply always on, and
   it must sit on the ROOT — Kendo declares its 72 derived colour variants on
   `:root`, and a custom property resolves where it is declared, not where it is
   inherited. See kendo-bridge.css. */
document.documentElement.setAttribute('data-kendo-bridged', '');  // breakpoints — must load last
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
