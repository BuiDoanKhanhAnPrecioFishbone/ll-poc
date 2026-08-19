import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@progress/kendo-theme-default/dist/default-main.css';
import './theme/tokens.css';
import './theme/kendo-bridge.css';
import './theme/app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
