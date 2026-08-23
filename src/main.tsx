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
import './theme/components.css';  // the component layer
import './theme/app.css';         // application chrome
import './theme/responsive.css';  // breakpoints — must load last
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
