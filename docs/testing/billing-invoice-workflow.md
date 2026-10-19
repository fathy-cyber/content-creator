# Project → Billing → Invoice Testing Workflow

## Overview
Test the complete revenue flow: Project creation → Billing Session generation → Invoice creation.

---

## Prerequisites
- Database running with all migrations applied
- Dev server running: `npm run dev`
- Admin user logged in
- Test data available (or create during testing)

---

## Phase 1: Database & Schema Validation

### 1.1 Verify Foreign Key Relationships
```sql
-- Check that all required tables exist
\d billing_sessions
\d billing_items
\d invoice_items
\d sales_orders (if used)

-- Verify foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('billing_sessions', 'billing_items', 'invoice_items');
```

### 1.2 Confirm Required Fields
```sql
-- Billing Session required fields
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'billing_sessions'
  AND column_name IN ('project_id', 'sales_order_id', 'status', 'gross_amount', 'net_amount');

-- Billing Item required fields  
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'billing_items'
  AND column_name IN ('billing_session_id', 'source_type', 'quantity', 'amount');
```

---

## Phase 2: Model & Service Layer Testing

### 2.1 Billing Model Instantiation
```typescript
// In browser console or test file
import { BillingManifest } from '@/modules/billing/manifest';

// Verify model definitions
console.log('BillingSessionModel fields:', BillingManifest.models[0].fields.length);
console.log('BillingItemModel fields:', BillingManifest.models[1].fields.length);

// Check field types
const itemModel = BillingManifest.models.find(m => m.name === 'billing.item');
console.log('Item source_type options:', 
  itemModel.fields.find(f => f.name === 'source_type')?.selectionOptions
);
```

### 2.2 Service Method Validation
Test the following billing service methods exist and are callable:
- `billingService.createSession(data)`
- `billingService.addItem(sessionId, itemData)`
- `billingService.approveSession(sessionId)`
- `billingService.rejectSession(sessionId)`
- `billingService.cancelSession(sessionId)`
- `billingService.getSession(sessionId)`
- `billingService.listSessions(filters)`
- `billingService.convertToInvoice(sessionId)`

---

## Phase 3: UI Component Testing

### 3.1 Navigation Test
1. Navigate to `/billing/sessions`
2. Verify sidebar link "Billing Sessions" is visible
3. Confirm page loads without errors

### 3.2 Billing Session Creation (Manual)
1. Click "New Billing Session" button
2. Select a **Project** from dropdown (must have active timesheets/tasks)
3. Optionally link a **Sales Order**
4. Select **Billing Model** (T&M, Fixed Price, Milestone, Hybrid)
5. Click "Create"
6. Verify session appears in list with status "Open"

### 3.3 Billing Item Addition
1. Open the newly created session
2. Click "Add Item"
3. Test each **Source Type**:
   - **Timesheet**: Link to a timesheet entry
   - **Task**: Link to a billable task
   - **Milestone**: Link to a completed milestone
   - **Expense**: Enter expense amount
   - **Fixed**: Enter fixed amount
   - **Retainer**: Enter retainer amount
   - **Adjustment**: Enter adjustment amount
   - **Write-off**: Enter write-off amount
4. For each item, verify:
   - Quantity × Unit Price = Amount (auto-calculated)
   - Gross Amount updates
   - Net Amount updates after adjustments
5. Add multiple items of different source types

### 3.4 Session Approval Flow
1. Review all items in session
2. Click "Approve"
3. Verify status changes to "Approved"
4. Confirm gross_amount and net_amount are locked (readonly)

### 3.5 Invoice Generation
1. With approved session, click "Create Invoice"
2. Verify invoice creation form appears with:
   - Pre-filled customer from linked project/sales order
   - Line items from billing session items
   - Correct totals matching session net_amount
3. Submit invoice
4. Verify redirect to invoice detail page
5. Confirm invoice status is "Draft"

---

## Phase 4: Integration Test Flow

### 4.1 End-to-End Scenario (Happy Path)
```typescript
// Pseudocode for automated test
const testProject = await projectService.create({
  name: 'Test Project B2B',
  customer_id: 'CUST-001',
  budget: 10000
});

const timesheet = await timesheetService.create({
  project_id: testProject.id,
  hours: 10,
  rate: 150,
  date: '2026-05-14'
});

const session = await billingService.createSession({
  project_id: testProject.id,
  billing_model: 'time_and_material'
});

const item = await billingService.addItem(session.id, {
  billing_session_id: session.id,
  source_type: 'timesheet',
  quantity: 10,
  unit_price: 150,
  amount: 1500
});

const approved = await billingService.approveSession(session.id);
assert(approved.net_amount === 1500);

const invoice = await invoiceService.createFromBilling(approved.id);
assert(invoice.total === 1500);
assert(invoice.items.length === 1);
```

### 4.2 Cross-Module Dependencies
1. Create **Sales Order** → Link to **Project** → Create **Billing Session**
2. Verify sales order appears in billing session dropdown
3. Create **Milestone** on project → Add as billing item
4. Verify milestone completion status required

### 4.3 Data Consistency Checks
```sql
-- After full flow, verify:
-- 1. Billing session references valid project
SELECT * FROM billing_sessions WHERE project_id NOT IN (SELECT id FROM projects);

-- 2. Billing items reference valid sessions
SELECT * FROM billing_items WHERE billing_session_id NOT IN (SELECT id FROM billing_sessions);

-- 3. Invoice items reference valid billing items
SELECT * FROM invoice_items WHERE billing_item_id NOT IN (SELECT id FROM billing_items);
```

---

## Phase 5: Edge Cases & Error Handling

### 5.1 Invalid Data
- Try creating session without project (should fail)
- Try adding item with negative quantity (should reject)
- Try approving session with zero items (should warn)

### 5.2 State Transitions
- Attempt to invoice an "Open" session (should block)
- Attempt to modify "Approved" session (should be readonly)
- Attempt to delete session with linked invoice (should prevent)

### 5.3 Calculation Edge Cases
- Multiple items with different tax rates
- Adjustments exceeding gross amount (net negative)
- Currency conversion if multi-currency enabled

---

## Phase 6: Permission & Access Control

1. **Non-admin user** can view billing sessions assigned to their projects
2. **Sales user** can create sessions from their sales orders
3. **Finance user** can approve and invoice sessions
4. **Project manager** can view sessions for their projects

Test with different user roles to ensure proper access.

---

## Phase 7: Performance & Scalability

### 7.1 Large Dataset Test
- Create 100+ billing items in a session
- Verify list loads quickly (< 1s)
- Verify invoice generation handles large volumes

### 7.2 Concurrent Operations
- Multiple users approving different sessions simultaneously
- No deadlocks or race conditions in amount calculations

---

## Phase 8: Automated Regression Test Script

Create a Playwright test file: `tests/billing-invoice-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('Project → Billing → Invoice full flow', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@ayech.ai');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // 2. Create project
  await page.goto('/projects/new');
  await page.fill('#name', 'E-Commerce Website Redesign');
  await page.selectOption('#customer', 'Acme Corp');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/projects/*');

  // 3. Navigate to billing
  await page.click('text=Billing');
  await page.click('text=Billing Sessions');

  // 4. Create billing session
  await page.click('text=New Billing Session');
  await page.selectOption('select[name="project_id"]', 'E-Commerce Website Redesign');
  await page.selectOption('select[name="billing_model"]', 'time_and_material');
  await page.click('button:has-text("Create")');

  // 5. Add billing item
  await page.click('text=Add Item');
  await page.selectOption('select[name="source_type"]', 'Timesheet');
  await page.fill('input[name="quantity"]', '10');
  await page.fill('input[name="unit_price"]', '150');
  await page.click('button:has-text("Save")');

  // 6. Approve session
  await page.click('text=Approve');
  await expect(page.locator('[data-status="approved"]')).toBeVisible();

  // 7. Generate invoice
  await page.click('text=Create Invoice');
  await page.click('button:has-text("Generate Invoice")');

  // 8. Verify invoice
  await expect(page).toHaveURL('/invoice/*');
  await expect(page.locator('text=1500')).toBeVisible();
});
```

---

## Phase 9: Data Migration & Cleanup

### 9.1 Test Data Seeding
```sql
-- Insert test data if needed
INSERT INTO projects (id, name, customer_id, status) 
VALUES ('proj-test-001', 'Test Project Alpha', 'CUST-001', 'active');

INSERT INTO timesheets (id, project_id, hours, rate, date, user_id)
VALUES ('ts-001', 'proj-test-001', 8, 100, '2026-05-14', 'user-001');
```

### 9.2 Cleanup After Tests
```sql
-- Remove test data
DELETE FROM invoice_items WHERE invoice_id LIKE 'inv-test-%';
DELETE FROM invoices WHERE id LIKE 'inv-test-%';
DELETE FROM billing_items WHERE billing_session_id LIKE 'session-test-%';
DELETE FROM billing_sessions WHERE id LIKE 'session-test-%';
DELETE FROM timesheets WHERE id LIKE 'ts-test-%';
DELETE FROM projects WHERE id LIKE 'proj-test-%';
```

---

## Phase 10: Monitoring & Logs

### 10.1 API Request Verification
Check network tab for:
- `POST /api/billing/sessions` → 201 Created
- `POST /api/billing/items` → 201 Created
- `POST /api/billing/:id/approve` → 200 OK
- `POST /api/billing/:id/invoice` → 201 Created

### 10.2 Event Bus Messages
Verify events published:
- `billing.session.created`
- `billing.item.added`
- `billing.session.approved`
- `invoice.created.from_billing`

---

## Checklist

- [ ] Database schema validated
- [ ] All models load without errors
- [ ] Session creation works
- [ ] All 8 item source types function correctly
- [ ] Session approval locks amounts
- [ ] Invoice generation populates line items
- [ ] Totals match across session → invoice
- [ ] Invalid operations are blocked
- [ ] Role-based access enforced
- [ ] No console errors in browser
- [ ] Automated regression test passes

---

## Known Issues & Gotchas

1. **Timesheet items require approved timesheet entries**
2. **Milestone items require completed milestones**
3. **Sales order must have confirmed status to link**
4. **Invoice number auto-generation may require sequence setup**
5. **Currency mismatch between project and billing may cause errors**

---

## Next Steps After Testing

1. Fix any failing scenarios
2. Add missing indexes on foreign keys
3. Optimize queries with N+1 issues
4. Add audit logging for billing changes
5. Implement email notifications on approval/invoice creation
