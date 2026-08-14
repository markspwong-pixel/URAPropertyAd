import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress opaque cross-origin script errors from third-party widgets (e.g. Disqus/trackers in sandboxed iframes)
window.addEventListener('error', (event) => {
  if (!event.message || event.message === 'Script error.' || event.message.includes('disqus') || event.message.includes('clarity')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason ? String(event.reason) : '';
  if (reason.includes('disqus') || reason.includes('clarity') || reason.includes('Script error')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
