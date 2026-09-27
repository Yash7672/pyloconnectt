import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import StartupErrorBoundary from './components/StartupErrorBoundary';
import './styles/global.css';

// Defensive mount: if #root is missing (broken HTML or a stale server page),
// show a visible message instead of silently failing to attach React.
const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('PYLO Web: #root element not found in index.html');
  document.documentElement.innerHTML = `
    <body style="font-family: system-ui, sans-serif; background: #0B0B16; color: #F2F3F7;
                 display: grid; place-items: center; min-height: 100vh; margin: 0; text-align: center;">
      <div>
        <h1>PYLO failed to start</h1>
        <p>The page container (#root) is missing from the HTML.</p>
        <p style="font-size: 0.85rem; opacity: 0.7;">Re-run <code>npm run build</code> and redeploy the <code>dist/</code> folder.</p>
      </div>
    </body>`;
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <StartupErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StartupErrorBoundary>
    </React.StrictMode>
  );
}