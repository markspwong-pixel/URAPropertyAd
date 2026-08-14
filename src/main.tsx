import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress opaque cross-origin script errors from third-party widgets (e.g. Disqus/trackers in sandboxed iframes)
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('disqus')) {
    event.preventDefault();
    console.debug('Caught cross-origin third-party script event:', event.message);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
