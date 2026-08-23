import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/tokens.css';      // primitives — the only raw values
import './theme/md3.css';         // Material 3 structure: elevation, state, motion
import './theme/components.css';  // the component layer
import './theme/app.css';         // application chrome
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
