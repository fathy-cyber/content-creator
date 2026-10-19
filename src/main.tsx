import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initEventBus } from './core/events/EventBus';
import { bootCore } from './core/boot';

async function startApp() {
  try {
    // 1. Initialize core services (AI, Audit, RBAC, etc.)
    await bootCore();

    // 2. Replay pending events in background to avoid blocking app boot
    initEventBus().catch(err => console.error('[Boot] EventBus init error:', err));

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error('[Boot] Critical Application Failure:', err);
  }
}

startApp();
