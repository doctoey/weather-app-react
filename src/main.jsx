import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline support (if supported)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/src/sw.js')
      .then((reg) => {
        console.log('Service worker registered:', reg.scope);
      })
      .catch((err) => console.warn('SW register failed:', err));
  });
}
