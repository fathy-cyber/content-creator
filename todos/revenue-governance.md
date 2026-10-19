# 🚀 Revenue Governance Implementation Roadmap
*Project $\rightarrow$ Billing $\rightarrow$ Invoice*

## 🟢 Phase 1: Core Infrastructure (Completed)
- [x] Define `BillingModel` and `BillingStatus` enums
- [x] Create `BillingSession` and `BillingItem` contracts
- [x] Implement `BillingService` core logic (`openBillingSession`, `adjustItem`, `writeOffItem`)
- [x] Register `Billing` module in the app registry
- [x] Implement basic `InvoiceDetail` and `InvoiceList` views

## 🟡 Phase 2: Event-Driven Orchestration (In Progress)
- [ ] Implement `PROJECT_COMPLETED` $\rightarrow$ `BillingService.openBillingSession` event trigger
- [ ] Implement `BILLING_SESSION_APPROVED` $\rightarrow$ `InvoiceService.createInvoiceFromSession` event trigger
- [ ] Ensure transactional safety during invoice generation (Atomic update of `is_billed` flags)

## 🟠 Phase 3: Traceability & Governance
- [ ] Update `InvoiceItem` to include `source_type` and `source_id` for full audit trail
- [ ] Implement strict double-billing prevention (DB constraints or service-level locks)
- [ ] Create `getBillingSummary` to track:
    - [ ] Gross Revenue vs. Net Revenue
    - [ ] Write-off percentages per project
    - [ ] Real Margin (Revenue - Employee Cost)
- [ ] Implement Financial Immutability: Lock issued invoices from editing

## 🔴 Phase 4: Management UI (The "Business Gap")
- [ ] Build `BillingSessionsList` (Dashboard for pending reviews)
- [ ] Build `BillingSessionDetail` (The Manager Review UI):
    - [ ] Itemized list of extracted billable data
    - [ ] Quick-adjustment controls (Quantity/Price)
    - [ ] One-click "Write-off" with reason requirement
    - [ ] Approval workflow trigger
- [ ] Implement Credit Note system for issued invoice corrections

## 🏁 Final Validation
- [ ] End-to-end test: Project Completion $\rightarrow$ Billing Review $\rightarrow$ Approved $\rightarrow$ Invoice Generated
- [ ] Verify that no item can be billed twice across different sessions
- [ ] Validate that issued invoices cannot be edited
