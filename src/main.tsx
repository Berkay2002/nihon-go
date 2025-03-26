
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/custom.css'

// Handle service worker based on environment
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Check if we're in development or production mode
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        // In development: unregister service workers for immediate updates
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service Worker unregistered for development');
        }
      } else {
        // In production: register the service worker for PWA features
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    } catch (error) {
      console.error('Service Worker operation failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
