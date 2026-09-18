import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with immediate caching for offline itineraries & packing lists
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('EasyTrip AI is offline-ready. Itineraries and packing lists are cached.');
  },
  onNeedRefresh() {
    console.log('New EasyTrip AI content available.');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
