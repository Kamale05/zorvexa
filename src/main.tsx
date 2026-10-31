import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Android PWA & Offline Support with Unstable Connection Strategy
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Zorvexa Service Worker active:', reg.scope);

        // Auto-check for updates if connected
        if (navigator.onLine && reg.update) {
          reg.update().catch(() => {});
        }

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Zorvexa: New content available, cached for offline access.');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
