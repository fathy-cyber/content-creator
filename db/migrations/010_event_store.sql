BEGIN;

-- ══════════════════════════════════════════════════════════════
-- EVENT STORE: Every business event persisted before processing
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS event_store (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id   UUID        NOT NULL DEFAULT gen_random_uuid(),
  causation_id     UUID,                    -- ID of event that caused this one,
  
  -- Event identity
  event_name       TEXT        NOT NULL,    -- 'sales.order.confirmed'
  event_version    INTEGER     NOT NULL DEFAULT 1,

  -- Source module
  source_module    TEXT        NOT NULL,    -- 'sales', 'project', etc.
  source_entity    TEXT,                   -- 'SalesOrder', 'Project'
  source_entity_id TEXT,                   -- the actual record ID

  -- Payload
  payload          JSONB       NOT NULL DEFAULT '{}',

  -- Processing state
  status           TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                      'pending',    -- not yet processed
                      'processing', -- currently being handled
                      'processed',  -- successfully handled
                      'failed',     -- all retries exhausted → DLQ
                      'dead'        -- in dead-letter queue
                    )),

  -- Reliability
  attempts         INTEGER     NOT NULL DEFAULT 0,
  max_attempts     INTEGER     NOT NULL DEFAULT 3,
  last_error       TEXT,
  process_after    TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- for delayed events
  processed_at     TIMESTAMPTZ,
  locked_until     TIMESTAMPTZ,            -- optimistic lock for processing,

  -- Audit
  created_by       UUID,                   -- employee who triggered
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for event processor queries
CREATE INDEX idx_event_store_status_process_after
  ON event_store(status, process_after)
  WHERE status IN ('pending', 'failed');

CREATE INDEX idx_event_store_correlation
  ON event_store(correlation_id);

CREATE INDEX idx_event_store_source
  ON event_store(source_module, source_entity_id);

CREATE INDEX idx_event_store_event_name
  ON event_store(event_name, status);

-- ══════════════════════════════════════════════════════════════
-- DEAD LETTER QUEUE: Failed events after max retries
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dead_letter_queue (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_store_id   UUID        NOT NULL REFERENCES event_store(id),
  event_name       TEXT        NOT NULL,
  payload          JSONB       NOT NULL,
  failure_reason   TEXT        NOT NULL,
  attempts         INTEGER     NOT NULL,
  failed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved         BOOLEAN     NOT NULL DEFAULT FALSE,
  resolved_at      TIMESTAMPTZ,
  resolved_by      UUID,
  resolution_notes TEXT
);

CREATE INDEX idx_dlq_resolved
  ON dead_letter_queue(resolved, failed_at DESC);

CREATE INDEX idx_dlq_event_name
  ON dead_letter_queue(event_name);

-- ══════════════════════════════════════════════════════════════
-- EVENT SUBSCRIPTIONS: Which handlers process which events
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS event_subscriptions (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name      TEXT  NOT NULL,
  handler_name    TEXT  NOT NULL,    -- 'createProjectFromOrder'
  target_module   TEXT  NOT NULL,    -- 'project'
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_name, handler_name)
);

-- Seed known subscriptions (documentation + monitoring)
INSERT INTO event_subscriptions
  (event_name, handler_name, target_module)
VALUES
  ('sales.order.confirmed',       'createInvoiceFromOrder',   'invoice'),
  ('sales.order.confirmed',       'createProjectFromOrder',   'project'),
  ('project.completed',           'openBillingSession',       'billing'),
  ('billing.session.approved',    'generateInvoice',          'invoice'),
  ('invoice.paid',                'syncClientFinancials',     'crm'),
  ('invoice.overdue',             'updateClientAging',        'crm'),
  ('support.ticket.created',      'escalateToBugTask',        'project'),
  ('marketing.lead.scored',       'createCrmContact',         'crm')
ON CONFLICT DO NOTHING;

COMMIT;
