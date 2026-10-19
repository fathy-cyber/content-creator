// src/workers/index.ts
import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { registerAllJobs } from '../infrastructure/jobs/jobHandlers';
import { initEventBus } from '../core/events/EventBus';
import { stopQueue }       from '../infrastructure/simpleQueue';
import { processPendingEvents } from './eventProcessor';
import { startKeepalive }  from '../infrastructure/keepalive';
import { checkUsageLimits } from '../infrastructure/usageMonitor';
import { registerAllEventHandlers } from '../shared/events/eventHandlerRegistry';

// ── Register all module event handlers ────────────────────────
import '../modules/crm/crmService';
import '../modules/sales/salesService';
import '../modules/project/projectService';
import '../modules/billing/billingService';
import '../modules/invoice/accountingService';
import '../modules/support/supportService';
import '../modules/marketing/index';
import '../modules/analytics/analyticsService';

async function main() {
  console.log('[Workers] 🚀 Starting...');
  try {
    // 1. Register handlers first so the bus knows how to process events
    await registerAllEventHandlers();
    console.log('[Workers] ✅ Module handlers registered');

    await initEventBus();
    console.log('[Workers] ✅ Event bus initialized');

    await registerAllJobs();
    console.log('[Workers] 🟢 Jobs and Queue running');

    // ── Keepalive & Monitoring ────────────────────────────────
    startKeepalive();
    await checkUsageLimits();

    // ── Event Processor Loop ──────────────────────────────────
    const EVENT_POLL_MS = 5_000;
    const runEventProcessor = async () => {
      try {
        await processPendingEvents();
      } catch (err: any) {
        console.error('[Workers] EventProcessor error:', err.message);
      }
      setTimeout(runEventProcessor, EVENT_POLL_MS);
    };

    runEventProcessor();
    console.log(`[Workers] 🔄 Event processor polling every ${EVENT_POLL_MS}ms`);

    process.on('SIGTERM', async () => {
      await stopQueue();
      process.exit(0);
    });
    process.on('SIGINT', async () => {
      await stopQueue();
      process.exit(0);
    });

  } catch (error: any) {
    console.error('[Workers] ❌ Fatal:', error.message);
    process.exit(1);
  }
}

main();



