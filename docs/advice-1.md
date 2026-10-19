# Complete Inter-Module Communication & Dependencies Plan

> **Current Implementation Status** (2026-05-09)
> - Event Bus (`EventBus` + `eventBus` singleton) is in production.
> - Typed shared events defined in `src/shared/events.ts`.
> - CRM → Project onboarding (`crm.contact.created`) implemented.
> - Sales → Project creation (`sales.order.confirmed`) and cancellation (`sales.order.cancelled`) implemented.
> - Project module emits `project.created` on auto-creation.
> - `sales.order.confirmed` also consumed by Inventory for stock deduction.
> - All modules use Supabase RPCs with service-role fallback.
> - See `TODOS.md` for full refactor progress.

## 🗺️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW MASTER MAP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [MARKETING] ──leads──► [CRM] ──won deal──► [SALES]            │
│       │                   │                    │                │
│       │                   │              ┌─────┴──────┐         │
│       │                   │              ▼            ▼         │
│       │                   │         [PROJECT]    [INVOICE]      │
│       │                   │              │            │         │
│       │                   │         [HR/TEAM]   [PAYMENTS]      │
│       │                   │              │            │         │
│       │                   └──────► [SUPPORT]          │         │
│       │                                 │             │         │
│       └─────────────────────────────────┴─────────────┘         │
│                                         │                       │
│                              [ANALYTICS DASHBOARD]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 DETAILED INTER-MODULE COMMUNICATION MAP

### Communication Matrix

```
MODULE          → SENDS TO          → WHAT IT SENDS
─────────────────────────────────────────────────────────────────
CRM             → Sales             → Contact, Company, Deal data
CRM             → Support           → Client ID, Account info
CRM             → Analytics         → Lead count, source, CAC data
CRM             → Marketing         → Contact segments, lead status

Sales           → Project           → Order confirmed event + line items
Sales           → Invoice           → Order data, pricing, client info
Sales           → CRM               → Deal status updates
Sales           → Analytics         → Revenue, LTV data

Project         → HR/Team           → Resource requests, task assignments
Project         → Invoice           → Billable hours (timesheets)
Project         → Support           → Project context for tickets
Project         → Analytics         → Utilization, profitability data

Invoice         → Sales             → Payment status sync
Invoice         → Analytics         → Revenue, cash flow data
Invoice         → CRM               → Payment history per client

HR/Team         → Project           → Employee availability, skills
HR/Team         → Analytics         → Utilization rate, performance
HR/Team         → Invoice           → Employee cost rates

Support         → CRM               → Ticket history per client
Support         → Project           → Bug → Task conversion
Support         → Analytics         → Ticket volume, SLA data
Support         → HR/Team           → Ticket assignment

Marketing       → CRM               → New leads, campaign data
Marketing       → Analytics         → Spend, campaign ROI
Marketing       → Content Hub       → Campaign assets requests
```

---

## 📊 DEPENDENCY GRAPH

```
LEVEL 0 (Foundation - No Dependencies)
├── 👤 HR/Team Module
│   └── Standalone: Employee data is the base
└── 📣 Marketing Module
    └── Standalone: Campaigns run independently

LEVEL 1 (Depends on Level 0)
├── 🤝 CRM Module
│   ├── Needs: Marketing (lead source data)
│   └── Needs: HR (assign account managers)
└── ─────────────────────────────────────

LEVEL 2 (Depends on Level 1)
├── 💼 Sales Module
│   ├── Needs: CRM (client/contact data)
│   └── Needs: HR (assign sales rep)
└── ─────────────────────────────────────

LEVEL 3 (Depends on Level 2)
├── 🗂️ Project Module
│   ├── Needs: Sales (trigger + data)
│   ├── Needs: HR (resource allocation)
│   └── Optional: CRM (client context)
├── 💰 Invoice Module
│   ├── Needs: Sales (order data)
│   ├── Needs: Project (billable hours)
│   └── Optional: HR (cost rates)
└── 🎫 Support Module
    ├── Needs: CRM (client identity)
    └── Optional: Project (project context)

LEVEL 4 (Depends on ALL)
└── 📊 Analytics Dashboard
    ├── Needs: Marketing (spend/ROI)
    ├── Needs: CRM (leads/CAC)
    ├── Needs: Sales (revenue/LTV)
    ├── Needs: Project (utilization)
    ├── Needs: Invoice (cash flow)
    ├── Needs: HR (team performance)
    └── Needs: Support (satisfaction)
```

---

## 🔄 EVENT-DRIVEN COMMUNICATION SYSTEM

### Core Events Architecture

```javascript
// EVENT BUS SYSTEM
// Every module publishes and subscribes to events

const EventBus = {

  // ═══════════════════════════════════════
  // CRM EVENTS
  // ═══════════════════════════════════════
  'crm.lead.created': {
    publisher: 'CRM',
    subscribers: ['Marketing', 'Analytics'],
    payload: {
      lead_id, contact_name, email,
      source, campaign_id, created_at
    }
  },

  'crm.deal.won': {
    publisher: 'CRM',
    subscribers: ['Sales', 'Analytics'],
    payload: {
      deal_id, client_id, value,
      account_manager_id, won_at
    }
  },

  'crm.deal.lost': {
    publisher: 'CRM',
    subscribers: ['Marketing', 'Analytics'],
    payload: {
      deal_id, loss_reason,
      competitor_mentioned, lost_at
    }
  },

  // ═══════════════════════════════════════
  // SALES EVENTS
  // ═══════════════════════════════════════
  'sales.order.confirmed': {
    publisher: 'Sales',
    subscribers: ['Project', 'Invoice', 'Analytics'],
    payload: {
      order_id, client_id, total_amount,
      line_items[], delivery_date,
      order_type: 'service|product|hybrid'
    }
  },

  'sales.order.cancelled': {
    publisher: 'Sales',
    subscribers: ['Project', 'Invoice', 'CRM'],
    payload: { order_id, reason, cancelled_at }
  },

  // ═══════════════════════════════════════
  // PROJECT EVENTS
  // ═══════════════════════════════════════
  'project.created': {
    publisher: 'Project',
    subscribers: ['HR', 'Analytics', 'Support'],
    payload: {
      project_id, client_id, order_id,
      deadline, budget, project_type
    }
  },

  'project.milestone.reached': {
    publisher: 'Project',
    subscribers: ['Invoice', 'CRM', 'Support'],
    payload: {
      project_id, milestone_id,
      milestone_name, completion_date
    }
  },

  'project.timesheet.approved': {
    publisher: 'Project',
    subscribers: ['Invoice', 'HR', 'Analytics'],
    payload: {
      timesheet_id, project_id,
      employee_id, hours, billable_hours,
      hourly_rate, total_amount
    }
  },

  'project.completed': {
    publisher: 'Project',
    subscribers: ['Invoice', 'CRM', 'Support', 'Analytics'],
    payload: {
      project_id, client_id,
      actual_hours, planned_hours,
      actual_cost, planned_budget
    }
  },

  // ═══════════════════════════════════════
  // INVOICE EVENTS
  // ═══════════════════════════════════════
  'invoice.created': {
    publisher: 'Invoice',
    subscribers: ['CRM', 'Analytics'],
    payload: {
      invoice_id, client_id, amount,
      due_date, invoice_type
    }
  },

  'invoice.paid': {
    publisher: 'Invoice',
    subscribers: ['Sales', 'CRM', 'Analytics'],
    payload: {
      invoice_id, amount_paid,
      payment_method, paid_at
    }
  },

  'invoice.overdue': {
    publisher: 'Invoice',
    subscribers: ['CRM', 'Analytics', 'Automation'],
    payload: {
      invoice_id, client_id,
      days_overdue, amount_due
    }
  },

  // ═══════════════════════════════════════
  // HR EVENTS
  // ═══════════════════════════════════════
  'hr.employee.available': {
    publisher: 'HR',
    subscribers: ['Project'],
    payload: {
      employee_id, available_hours,
      skills[], hourly_cost
    }
  },

  'hr.employee.overcapacity': {
    publisher: 'HR',
    subscribers: ['Project', 'Analytics'],
    payload: {
      employee_id, current_load,
      capacity_percentage
    }
  },

  // ═══════════════════════════════════════
  // SUPPORT EVENTS
  // ═══════════════════════════════════════
  'support.ticket.created': {
    publisher: 'Support',
    subscribers: ['HR', 'CRM', 'Analytics'],
    payload: {
      ticket_id, client_id, priority,
      category, project_id, created_at
    }
  },

  'support.sla.breached': {
    publisher: 'Support',
    subscribers: ['HR', 'CRM', 'Analytics', 'Automation'],
    payload: {
      ticket_id, sla_hours,
      hours_elapsed, priority
    }
  },

  'support.ticket.resolved': {
    publisher: 'Support',
    subscribers: ['CRM', 'Analytics'],
    payload: {
      ticket_id, resolution_time,
      satisfaction_score, resolved_by
    }
  },

  // ═══════════════════════════════════════
  // MARKETING EVENTS
  // ═══════════════════════════════════════
  'marketing.campaign.launched': {
    publisher: 'Marketing',
    subscribers: ['Analytics', 'CRM'],
    payload: {
      campaign_id, type, budget,
      target_segment, channels[]
    }
  },

  'marketing.lead.scored': {
    publisher: 'Marketing',
    subscribers: ['CRM', 'Automation'],
    payload: {
      lead_id, score, threshold_reached,
      recommended_action
    }
  }
}
```

---

## 🗄️ SHARED DATA MODELS (Database Schema)

```sql
-- ═══════════════════════════════════════════════════
-- CORE SHARED TABLES (Used by multiple modules)
-- ═══════════════════════════════════════════════════

-- CLIENTS (Shared by CRM, Sales, Project, Invoice, Support)
CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  VARCHAR(255) NOT NULL,
  industry      VARCHAR(100),
  tier          ENUM('A', 'B', 'C') DEFAULT 'C',
  status        ENUM('lead','prospect','active','churned'),
  account_manager_id UUID REFERENCES employees(id),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- CONTACTS (CRM → Sales → Support)
CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE,
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(50),
  role          VARCHAR(100), -- "CEO", "IT Manager"...
  is_primary    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- EMPLOYEES (HR → Project → Invoice → Support)
CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  role            VARCHAR(100),
  department      VARCHAR(100),
  hourly_cost     DECIMAL(10,2),  -- internal cost
  billable_rate   DECIMAL(10,2),  -- client-facing rate
  capacity_hours  INTEGER DEFAULT 40, -- per week
  skills          TEXT[],  -- ['React', 'SEO', 'Copywriting']
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════
-- MODULE-SPECIFIC TABLES WITH FOREIGN KEYS
-- ═══════════════════════════════════════════════════

-- CRM MODULE
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id),
  contact_id      UUID REFERENCES contacts(id),
  title           VARCHAR(255) NOT NULL,
  value           DECIMAL(12,2),
  stage           ENUM('new','qualified','proposal','negotiation','won','lost'),
  type            ENUM('service','product','hybrid'),
  probability     INTEGER CHECK (probability BETWEEN 0 AND 100),
  owner_id        UUID REFERENCES employees(id),
  source          VARCHAR(100), -- 'website','referral','campaign'
  campaign_id     UUID REFERENCES campaigns(id),
  expected_close  DATE,
  won_at          TIMESTAMP,
  lost_reason     TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- SALES MODULE
CREATE TABLE sales_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID REFERENCES deals(id),
  client_id       UUID REFERENCES clients(id),
  contact_id      UUID REFERENCES contacts(id),
  order_number    VARCHAR(50) UNIQUE NOT NULL,
  status          ENUM('draft','confirmed','delivered','cancelled'),
  type            ENUM('service','product','hybrid'),
  subtotal        DECIMAL(12,2),
  tax_rate        DECIMAL(5,2) DEFAULT 20.00,
  tax_amount      DECIMAL(12,2),
  total           DECIMAL(12,2),
  delivery_date   DATE,
  confirmed_at    TIMESTAMP,  -- ← TRIGGERS project + invoice
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES sales_orders(id),
  item_type       ENUM('service','product'),
  description     VARCHAR(500),
  quantity        DECIMAL(10,2),
  unit_price      DECIMAL(10,2),
  subtotal        DECIMAL(12,2),
  -- For service items
  estimated_hours DECIMAL(8,2),
  billing_type    ENUM('fixed','hourly','milestone','retainer'),
  -- For product items
  product_id      UUID REFERENCES products(id),
  sku             VARCHAR(100)
);

-- PROJECT MODULE
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES sales_orders(id),  -- ← KEY LINK
  client_id       UUID REFERENCES clients(id),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  type            ENUM('fixed','time_material','retainer'),
  status          ENUM('planning','active','on_hold','completed','cancelled'),
  project_lead_id UUID REFERENCES employees(id),
  budget          DECIMAL(12,2),
  planned_hours   DECIMAL(8,2),
  actual_hours    DECIMAL(8,2) DEFAULT 0,
  start_date      DATE,
  deadline        DATE,
  completed_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id  UUID REFERENCES tasks(id), -- sub-tasks
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  status          ENUM('todo','in_progress','review','done'),
  priority        ENUM('low','medium','high','urgent'),
  assigned_to     UUID REFERENCES employees(id),
  estimated_hours DECIMAL(6,2),
  actual_hours    DECIMAL(6,2) DEFAULT 0,
  due_date        DATE,
  completed_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE timesheets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id),
  task_id         UUID REFERENCES tasks(id),
  employee_id     UUID REFERENCES employees(id),
  date            DATE NOT NULL,
  hours           DECIMAL(6,2) NOT NULL,
  billable_hours  DECIMAL(6,2),
  description     TEXT,
  status          ENUM('draft','submitted','approved','rejected'),
  approved_by     UUID REFERENCES employees(id),
  approved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  due_date        DATE,
  reached_at      TIMESTAMP,
  invoice_trigger BOOLEAN DEFAULT FALSE, -- auto-invoice on reach
  invoice_amount  DECIMAL(12,2),
  status          ENUM('pending','reached','missed')
);

-- INVOICE MODULE
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES sales_orders(id),
  project_id      UUID REFERENCES projects(id),  -- for service invoices
  client_id       UUID REFERENCES clients(id),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  type            ENUM('standard','proforma','credit_note','recurring'),
  status          ENUM('draft','sent','unpaid','partial','paid','overdue','cancelled'),
  issue_date      DATE,
  due_date        DATE,
  subtotal        DECIMAL(12,2),
  tax_amount      DECIMAL(12,2),
  total           DECIMAL(12,2),
  amount_paid     DECIMAL(12,2) DEFAULT 0,
  amount_due      DECIMAL(12,2),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES invoices(id),
  amount          DECIMAL(12,2) NOT NULL,
  method          ENUM('bank_transfer','card','cash','check','crypto'),
  reference       VARCHAR(255),
  paid_at         TIMESTAMP DEFAULT NOW(),
  recorded_by     UUID REFERENCES employees(id)
);

CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id),
  employee_id     UUID REFERENCES employees(id),
  category        ENUM('software','contractor','travel','hardware','marketing','other'),
  description     VARCHAR(500),
  amount          DECIMAL(10,2),
  is_billable     BOOLEAN DEFAULT FALSE,
  receipt_url     VARCHAR(500),
  date            DATE,
  approved_by     UUID REFERENCES employees(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- SUPPORT MODULE
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id),    -- ← FROM CRM
  contact_id      UUID REFERENCES contacts(id),
  project_id      UUID REFERENCES projects(id),   -- optional
  ticket_number   VARCHAR(50) UNIQUE NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  type            ENUM('bug','feature_request','question','complaint'),
  priority        ENUM('low','medium','high','urgent'),
  status          ENUM('open','in_progress','pending_client','resolved','closed'),
  assigned_to     UUID REFERENCES employees(id),
  sla_hours       INTEGER DEFAULT 24,
  first_response_at TIMESTAMP,
  resolved_at     TIMESTAMP,
  closed_at       TIMESTAMP,
  satisfaction_score INTEGER CHECK (score BETWEEN 1 AND 5),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- MARKETING MODULE
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  type            ENUM('email','social','ads','content','event','mixed'),
  status          ENUM('draft','active','paused','completed'),
  budget          DECIMAL(10,2),
  spent           DECIMAL(10,2) DEFAULT 0,
  target_leads    INTEGER,
  actual_leads    INTEGER DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  owner_id        UUID REFERENCES employees(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lead_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID REFERENCES contacts(id),
  score           INTEGER DEFAULT 0,
  -- Score breakdown
  demographic_score  INTEGER DEFAULT 0,
  behavioral_score   INTEGER DEFAULT 0,
  engagement_score   INTEGER DEFAULT 0,
  last_scored_at  TIMESTAMP DEFAULT NOW()
);
```

---

## ⚡ AUTOMATION TRIGGERS (The Glue)

```javascript
// ═══════════════════════════════════════════════════
// TRIGGER 1: Sales Order Confirmed → Create Project
// ═══════════════════════════════════════════════════

async function onSalesOrderConfirmed(order_id) {

  const order = await db.sales_orders.findOne({
    where: { id: order_id },
    include: ['line_items', 'client', 'deal']
  });

  // Only create project for service/hybrid orders
  if (['service', 'hybrid'].includes(order.type)) {

    const project = await db.projects.create({
      order_id:        order.id,
      client_id:       order.client_id,
      name:            `${order.client.company_name} - ${order.order_number}`,
      type:            order.type === 'hybrid' ? 'fixed' : 'time_material',
      status:          'planning',
      budget:          order.total,
      planned_hours:   order.line_items
                         .filter(i => i.item_type === 'service')
                         .reduce((sum, i) => sum + i.estimated_hours, 0),
      start_date:      new Date(),
      deadline:        order.delivery_date,
      project_lead_id: order.deal?.owner_id  // assign deal owner
    });

    // Auto-create default tasks from line items
    for (const item of order.line_items.filter(i => i.item_type === 'service')) {
      await db.tasks.create({
        project_id:      project.id,
        title:           item.description,
        status:          'todo',
        estimated_hours: item.estimated_hours,
        priority:        'medium'
      });
    }

    // Notify project lead
    await notify({
      to:      project.project_lead_id,
      type:    'project_assigned',
      message: `New project created: ${project.name}`,
      link:    `/projects/${project.id}`
    });

    // Publish event
    eventBus.publish('project.created', {
      project_id: project.id,
      client_id:  order.client_id,
      order_id:   order.id
    });
  }

  // Also trigger invoice creation
  await onCreateInvoiceFromOrder(order_id);
}

// ═══════════════════════════════════════════════════
// TRIGGER 2: Sales Order Confirmed → Create Invoice
// ═══════════════════════════════════════════════════

async function onCreateInvoiceFromOrder(order_id) {

  const order = await db.sales_orders.findOne({
    where: { id: order_id },
    include: ['line_items', 'client']
  });

  // For product orders → immediate invoice
  // For service orders → invoice on milestone or timesheet approval
  const invoiceStatus = order.type === 'product' ? 'sent' : 'draft';

  const invoice = await db.invoices.create({
    order_id:       order.id,
    client_id:      order.client_id,
    invoice_number: await generateInvoiceNumber(),
    type:           'standard',
    status:         invoiceStatus,
    issue_date:     new Date(),
    due_date:       addDays(new Date(), 30),
    subtotal:       order.subtotal,
    tax_amount:     order.tax_amount,
    total:          order.total,
    amount_due:     order.total
  });

  eventBus.publish('invoice.created', {
    invoice_id: invoice.id,
    client_id:  order.client_id,
    amount:     invoice.total
  });
}

// ═══════════════════════════════════════════════════
// TRIGGER 3: Timesheet Approved → Update Invoice
// ═══════════════════════════════════════════════════

async function onTimesheetApproved(timesheet_id) {

  const timesheet = await db.timesheets.findOne({
    where: { id: timesheet_id },
    include: ['project', 'employee']
  });

  // Update project actual hours
  await db.projects.increment('actual_hours', {
    by: timesheet.billable_hours,
    where: { id: timesheet.project_id }
  });

  // Find draft invoice for this project
  const invoice = await db.invoices.findOne({
    where: {
      project_id: timesheet.project_id,
      status: 'draft'
    }
  });

  if (invoice && timesheet.project.type === 'time_material') {
    const billableAmount =
      timesheet.billable_hours * timesheet.employee.billable_rate;

    // Update invoice amount
    await db.invoices.update({
      subtotal:   invoice.subtotal + billableAmount,
      total:      invoice.total + billableAmount,
      amount_due: invoice.amount_due + billableAmount
    }, { where: { id: invoice.id } });
  }

  // Publish for analytics
  eventBus.publish('project.timesheet.approved', {
    project_id:    timesheet.project_id,
    employee_id:   timesheet.employee_id,
    hours:         timesheet.hours,
    billable_hours: timesheet.billable_hours
  });
}

// ═══════════════════════════════════════════════════
// TRIGGER 4: Support Ticket → Link to CRM Client
// ═══════════════════════════════════════════════════

async function onTicketCreated(ticket_data) {

  // Find client from CRM by email
  const contact = await db.contacts.findOne({
    where: { email: ticket_data.email },
    include: ['client']
  });

  const ticket = await db.tickets.create({
    ...ticket_data,
    client_id:  contact?.client_id,
    contact_id: contact?.id,
    ticket_number: await generateTicketNumber(),
    sla_hours:  getSLAByPriority(ticket_data.priority)
    // urgent: 4h, high: 8h, medium: 24h, low: 48h
  });

  // Start SLA timer
  scheduleSLACheck(ticket.id, ticket.sla_hours);

  // Update CRM client last contact
  if (contact?.client_id) {
    await db.clients.update(
      { last_contact: new Date() },
      { where: { id: contact.client_id } }
    );
  }

  eventBus.publish('support.ticket.created', {
    ticket_id:  ticket.id,
    client_id:  ticket.client_id,
    priority:   ticket.priority
  });
}

// ═══════════════════════════════════════════════════
// TRIGGER 5: SLA Breach Alert
// ═══════════════════════════════════════════════════

async function checkSLABreach(ticket_id) {
  const ticket = await db.tickets.findOne({
    where: {
      id: ticket_id,
      status: { $in: ['open', 'in_progress'] },
      first_response_at: null
    }
  });

  if (!ticket) return; // Already responded

  const hoursElapsed =
    (Date.now() - ticket.created_at) / (1000 * 60 * 60);

  if (hoursElapsed >= ticket.sla_hours) {
    // Alert team
    await notify({
      to:      ticket.assigned_to || 'support_manager',
      type:    'sla_breach',
      message: `⚠️ SLA breached on Ticket #${ticket.ticket_number}`,
      urgent:  true
    });

    eventBus.publish('support.sla.breached', {
      ticket_id:     ticket.id,
      hours_elapsed: hoursElapsed,
      priority:      ticket.priority
    });
  }
}

// ═══════════════════════════════════════════════════
// TRIGGER 6: Invoice Overdue → CRM Alert + Auto Follow-up
// ═══════════════════════════════════════════════════

async function checkOverdueInvoices() {
  const overdueInvoices = await db.invoices.findAll({
    where: {
      status: 'unpaid',
      due_date: { $lt: new Date() }
    },
    include: ['client']
  });

  for (const invoice of overdueInvoices) {
    const daysOverdue =
      Math.floor((Date.now() - invoice.due_date) / (1000 * 60 * 60 * 24));

    // Update status
    await invoice.update({ status: 'overdue' });

    // Send automated reminder based on days overdue
    if (daysOverdue === 1)  sendPaymentReminder(invoice, 'gentle');
    if (daysOverdue === 7)  sendPaymentReminder(invoice, 'firm');
    if (daysOverdue === 14) sendPaymentReminder(invoice, 'final');
    if (daysOverdue === 30) escalateToAccountManager(invoice);

    eventBus.publish('invoice.overdue', {
      invoice_id:   invoice.id,
      client_id:    invoice.client_id,
      days_overdue: daysOverdue,
      amount_due:   invoice.amount_due
    });
  }
}
```

---

## 📊 ANALYTICS DASHBOARD DATA QUERIES

```javascript
// ═══════════════════════════════════════════════════
// ANALYTICS: All Cross-Module KPIs
// ═══════════════════════════════════════════════════

const AnalyticsDashboard = {

  // CAC = Total Marketing Spend / New Clients Acquired
  async getCAC(period) {
    const marketingSpend = await db.campaigns.sum('spent', {
      where: { created_at: { $gte: period.start } }
    });
    const newClients = await db.clients.count({
      where: {
        status: 'active',
        created_at: { $gte: period.start }
      }
    });
    return {
      cac: marketingSpend / newClients,
      marketing_spend: marketingSpend,
      new_clients: newClients
    };
  },

  // LTV = Total Revenue per Client (from Sales/Invoice)
  async getLTV(client_id) {
    const totalRevenue = await db.invoices.sum('total', {
      where: { client_id, status: 'paid' }
    });
    const monthsActive = await getClientAge(client_id);
    return {
      total_ltv: totalRevenue,
      monthly_value: totalRevenue / monthsActive,
      months_active: monthsActive
    };
  },

  // Utilization Rate = Billable Hours / Total Available Hours
  async getUtilizationRate(period) {
    const billableHours = await db.timesheets.sum('billable_hours', {
      where: {
        status: 'approved',
        date: { $between: [period.start, period.end] }
      }
    });
    const employees = await db.employees.findAll({
      where: { is_active: true }
    });
    const totalAvailableHours = employees.reduce(
      (sum, emp) => sum + emp.capacity_hours * getWeeksInPeriod(period), 0
    );
    return {
      billable_hours:       billableHours,
      available_hours:      totalAvailableHours,
      utilization_rate:     (billableHours / totalAvailableHours * 100).toFixed(1) + '%',
      target:              '75%'
    };
  },

  // Churn Rate = Clients Lost / Total Clients at Start of Period
  async getChurnRate(period) {
    const startCount = await db.clients.count({
      where: { created_at: { $lt: period.start }, status: 'active' }
    });
    const churned = await db.clients.count({
      where: {
        status: 'churned',
        updated_at: { $between: [period.start, period.end] }
      }
    });
    return {
      churn_rate:   (churned / startCount * 100).toFixed(1) + '%',
      churned:      churned,
      total_start:  startCount
    };
  },

  // Revenue Split: Service vs Product
  async getRevenueSplit(period) {
    const serviceRevenue = await db.invoices
      .join('sales_orders', 'invoices.order_id = sales_orders.id')
      .sum('invoices.total', {
        where: {
          'sales_orders.type': { $in: ['service', 'hybrid'] },
          'invoices.status': 'paid',
          'invoices.issue_date': { $between: [period.start, period.end] }
        }
      });

    const productRevenue = await db.invoices
      .join('sales_orders', 'invoices.order_id = sales_orders.id')
      .sum('invoices.total', {
        where: {
          'sales_orders.type': 'product',
          'invoices.status': 'paid'
        }
      });

    return {
      service: serviceRevenue,
      product: productRevenue,
      total:   serviceRevenue + productRevenue,
      split:   `${Math.round(serviceRevenue/(serviceRevenue+productRevenue)*100)}% / ${Math.round(productRevenue/(serviceRevenue+productRevenue)*100)}%`
    };
  },

  // Project Profitability
  async getProjectProfitability(project_id) {
    const project = await db.projects.findOne({
      where: { id: project_id }
    });

    const laborCost = await db.timesheets
      .join('employees', 'timesheets.employee_id = employees.id')
      .sum('timesheets.hours * employees.hourly_cost', {
        where: { project_id }
      });

    const expenses = await db.expenses.sum('amount', {
      where: { project_id }
    });

    const revenue = await db.invoices.sum('total', {
      where: { project_id, status: 'paid' }
    });

    return {
      revenue,
      labor_cost:   laborCost,
      expenses,
      total_cost:   laborCost + expenses,
      gross_profit: revenue - laborCost - expenses,
      margin:       ((revenue - laborCost - expenses) / revenue * 100).toFixed(1) + '%'
    };
  }
};
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1 — Foundation 
```
PRIORITY: Build the shared data layer first

Week 1:
□ Create shared DB tables
  └── clients, contacts, employees

□ Set up Event Bus system
  └── publish/subscribe architecture

□ Define API contracts between modules
  └── OpenAPI/Swagger specs

Week 2:
□ Project Module
  └── tables: projects, tasks, milestones, timesheets
  └── CRUD APIs
  └── Kanban board UI

Week 3:
□ Invoice Module
  └── tables: invoices, payments, expenses
  └── PDF generation
  └── Payment tracking UI
```

### Phase 2 — Automation Layer 
```
Week 4:
□ Wire Trigger 1: Sales → Project auto-creation
□ Wire Trigger 2: Sales → Invoice auto-creation
□ Wire Trigger 3: Timesheet → Invoice update

Week 5:
□ Wire Trigger 4: Support → CRM link
□ Wire Trigger 5: SLA breach alerts
□ Wire Trigger 6: Invoice overdue reminders
```

### Phase 3 — HR & Support 
```
Week 6:
□ HR Module
  └── Resource allocation dashboard
  └── Skills registry
  └── Capacity planning view

Week 7:
□ Support/Ticketing Module
  └── Ticket portal
  └── SLA engine
  └── CRM integration
```

### Phase 4 — Analytics 
```
□ Executive Dashboard
  └── CAC widget (Marketing + CRM)
  └── LTV widget (Sales + Invoice)
  └── Utilization rate (Project + HR)
  └── Churn rate (CRM)
  └── Revenue split chart (Sales)
  └── Project profitability table
```

---

