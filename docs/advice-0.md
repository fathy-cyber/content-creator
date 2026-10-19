Excellent.  
Now you're designing **real revenue governance**, not just invoice automation.

What you're describing is exactly how professional ERP systems (SAP, Oracle, Odoo Enterprise) handle project billing.

Let’s design this **enterprise-grade**, with:

- Clear domain separation
- Proper billing lifecycle
- Traceability
- Double-billing prevention
- Multi-model support
- Auditability

---

# 🧠 1️⃣ First: Separate the Concepts Properly

Many systems fail because they mix these concepts:

| Concept | Responsibility |
|---------|---------------|
| Project | Delivery execution |
| Billing | Revenue extraction |
| Invoice | Financial document |
| Accounting | Ledger & compliance |

✅ The key architectural rule:

> Project does NOT create invoices directly.  
> Project produces **billable data**.  
> Billing module converts that into invoice.

That’s your missing enterprise layer.

---

# 🏗 2️⃣ Introduce a Dedicated Billing Domain

Instead of:

```
Project Completed → Invoice
```

You want:

```
Project Completed
    ↓
Billing Session Created
    ↓
Billing Review
    ↓
Invoice Generated
```

---

# 🧱 3️⃣ Introduce a New Entity: `billing_sessions`

This is critical.

### billing_sessions

```sql
id UUID PK
project_id UUID FK
billing_model TEXT CHECK (...)
status TEXT CHECK (...)
period_start DATE
period_end DATE
subtotal NUMERIC
adjustments NUMERIC
total NUMERIC
reviewed_by UUID
reviewed_at TIMESTAMP
created_at TIMESTAMP
```

### Status Flow:

```
pending_extraction
→ under_review
→ approved
→ invoiced
→ cancelled
```

---

# 🧮 4️⃣ Introduce Billable Sources (Traceability Layer)

All billable elements must be normalized.

## A. Timesheets

Add:

```sql
is_billable BOOLEAN
billed BOOLEAN DEFAULT FALSE
billing_session_id UUID NULL
```

---

## B. Project Expenses

```sql
is_billable BOOLEAN
billed BOOLEAN DEFAULT FALSE
billing_session_id UUID NULL
```

---

## C. Milestones

```sql
amount NUMERIC
billed BOOLEAN DEFAULT FALSE
billing_session_id UUID NULL
```

---

# ✅ Enterprise Rule

Once linked to a billing session:

```
billed = true
```

Cannot be modified without audit log.

---

# 🔍 5️⃣ Billing Review Workflow (Enterprise-Grade)

When project moves to Completed:

System does NOT create invoice.

Instead:

### Step 1 — Extract Billable Data

Create billing session:

```
SELECT timesheets
WHERE project_id = X
AND is_billable = true
AND billed = false
```

Same for:
- expenses
- milestones

Attach all to billing session.

---

### Step 2 — Manager Review UI

Manager can:

- Write off hours
- Change rates
- Apply discount
- Add manual adjustment
- Split billing

Store adjustments separately:

```sql
billing_adjustments (
  id,
  billing_session_id,
  type ('writeoff','discount','manual'),
  amount,
  reason
)
```

Never override raw timesheet values.

---

### Step 3 — Approve Billing

Only when status = `approved`
→ allow invoice generation.

---

# 🧾 6️⃣ Invoice Generation from Billing Session

Invoice is derived entity.

```ts
createInvoiceFromBillingSession(sessionId)
```

Invoice lines must reference origin:

```sql
invoice_items
  id
  invoice_id
  source_type ('timesheet','expense','milestone','manual')
  source_id UUID
  description
  quantity
  unit_price
  total
```

✅ This gives full traceability.

---

# 🔁 7️⃣ Prevent Double Billing (Critical)

When invoice is created:

Inside transaction:

```
UPDATE timesheets
SET billed = true
WHERE billing_session_id = X;
```

Add DB constraint:

```sql
CHECK (NOT (billed = true AND billing_session_id IS NULL))
```

---

# 💼 8️⃣ Support Multiple Billing Models (Enterprise Design)

Add to project:

```sql
billing_model ENUM (
  'time_material',
  'fixed_price',
  'milestone',
  'hybrid',
  'retainer'
)
```

---

## ✅ A. Time & Material

Extract:
- billable timesheets
- billable expenses

Invoice = sum(actual work)

---

## ✅ B. Fixed Price

Ignore timesheet totals for invoice calculation.

Instead:

```sql
project.fixed_price_amount
```

Billing session:
- Shows internal cost vs fixed revenue
- Margin visible
- But invoice fixed

---

## ✅ C. Milestone

Billing triggered by milestone completion event.

Milestone:
```sql
status = 'completed'
billed = false
```

Extraction logic:
```
SELECT milestones WHERE completed AND billed = false
```

---

## ✅ D. Hybrid

Project has:

```sql
base_retainer_amount
```

Billing session includes:
- Base retainer (fixed line)
- Extra hours (T&M)

---

# 🧠 9️⃣ Enterprise-Level Control Features

---

## A. Lock After Invoice

After invoice created:

```
billing_session.status = 'invoiced'
```

Block modifications.

---

## B. Audit Log Everything

- Rate changes
- Write-offs
- Manual adjustments
- Invoice creation
- Reversals

---

## C. Allow Credit Notes Instead of Editing

Enterprise rule:

Never modify issued invoice.
Create credit note.

---

# 🔐 10️⃣ Transactional Safety

Invoice creation must:

```
BEGIN;

create invoice
create invoice items
mark timesheets billed
mark expenses billed
mark milestones billed
update billing_session status

COMMIT;
```

---

# 📊 11️⃣ Profitability Visibility

Billing session enables:

| Metric | Source |
|--------|--------|
| Revenue | Invoice |
| Cost | Employee cost × hours |
| Write-offs | Adjustments |
| Margin | Revenue - cost |

Project dashboard shows:

- Estimated margin
- Real margin
- Write-off %

---

# 🏛 12️⃣ Enterprise Architecture Separation

Do NOT let:

Project module create invoice directly.

Instead:

```
Project emits: PROJECT_COMPLETED
Billing module listens
Billing creates session
Invoice module only generates financial document
```

Clear bounded contexts.

---

# 🧭 FINAL IDEAL FLOW

```
Project Completed
    ↓
Billing Session Created
    ↓
Extract Unbilled Items
    ↓
Manager Review
    ↓
Approve Billing
    ↓
Invoice Generated
    ↓
Accounting Entry
```

---

# 🎯 What This Gives You

✅ No accidental double billing  
✅ Manager approval gate  
✅ Full traceability  
✅ Multi-model support  
✅ Write-offs properly tracked  
✅ Clean separation of concerns  
✅ Enterprise-grade auditability  

---

# ⚖️ Startup vs Enterprise Difference

Startup:

```
Project Done → Auto Invoice
```

Enterprise:

```
Project Done → Revenue Governance Workflow → Controlled Financial Output
```

---

