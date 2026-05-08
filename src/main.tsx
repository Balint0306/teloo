import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Új frissítés érhető el az operációs rendszerhez. Frissítsen most?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Az operációs rendszer készen áll az offline használatra.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
