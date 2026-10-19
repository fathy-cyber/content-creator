import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export const BillingModelSchema = z.enum([
  'time_and_material',
  'fixed_price',
  'milestone',
  'hybrid',
]);
export type BillingModel = z.infer<typeof BillingModelSchema>;

export const BillingStatusSchema = z.enum([
  'not_started',
  'pending_review',
  'in_review',
  'approved',
  'invoiced',
  'partially_invoiced',
  'written_off',
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const BillingSessionStatusSchema = z.enum([
  'open',
  'approved',
  'rejected',
  'cancelled',
]);
export type BillingSessionStatus = z.infer<typeof BillingSessionStatusSchema>;

export const BillingItemSourceSchema = z.enum([
  'timesheet',
  'task',
  'milestone',
  'expense',
  'fixed',
  'retainer',
  'adjustment',
  'writeoff',
]);
export type BillingItemSource = z.infer<typeof BillingItemSourceSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING ITEM
// ─────────────────────────────────────────────────────────────

export const BillingItemSchema = z.object({
  id:                z.string().uuid(),
  billingSessionId:  z.string().uuid(),
  sourceType:        BillingItemSourceSchema,

  // Source traceability FKs (can be UUID or BIGINT depending on source table)
  taskId:            z.union([z.string().uuid(), z.number()]).nullable().optional(),
  timesheetId:       z.string().uuid().nullable().optional(),
  milestoneId:       z.string().uuid().nullable().optional(),
  expenseId:         z.string().uuid().nullable().optional(),

  // Financials
  description:       z.string().min(1),
  quantity:          z.number().nonnegative(),
  unitPrice:         z.number().nonnegative(),
  amount:            z.number(),

  // Audit trail of adjustments
  originalQuantity:  z.number().nonnegative().nullable().optional(),
  originalUnitPrice: z.number().nonnegative().nullable().optional(),
  originalAmount:    z.number().nullable().optional(),
  adjustmentReason:  z.string().nullable().optional(),

  // Billing decisions
  isBillable:        z.boolean().default(true),
  isWrittenOff:      z.boolean().default(false),
  writeoffReason:    z.string().nullable().optional(),

  // Anti-double-billing
  isBilled:          z.boolean().default(false),
  billedAt:          z.string().datetime().nullable().optional(),
  invoiceLineItemId: z.string().uuid().nullable().optional(),

  createdAt:         z.string().datetime(),
  updatedAt:         z.string().datetime(),
});
export type BillingItem = z.infer<typeof BillingItemSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING SESSION
// ─────────────────────────────────────────────────────────────

export const BillingSessionSchema = z.object({
  id:            z.string().uuid(),
  projectId:     z.union([z.string(), z.number()]),  // BIGINT from projects
  salesOrderId:  z.string().uuid().nullable().optional(),
  reviewedBy:    z.string().uuid().nullable().optional(),
  status:        BillingSessionStatusSchema,
  billingModel:  BillingModelSchema,
  grossAmount:   z.number().nonnegative(),
  adjustments:   z.number(),
  netAmount:     z.number().nonnegative(),
  currency:      z.string().length(3),
  reviewNotes:   z.string().nullable().optional(),
  approvedAt:    z.string().datetime().nullable().optional(),
  submittedAt:   z.string().datetime().nullable().optional(),
  items:         z.array(BillingItemSchema).default([]),
  createdAt:     z.string().datetime(),
  updatedAt:     z.string().datetime(),
  // Extended fields for UI
  projectName:   z.string().nullable().optional(),
});
export type BillingSession = z.infer<typeof BillingSessionSchema>;

// ─────────────────────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────────────────────

export const AdjustBillingItemSchema = z.object({
  quantity:         z.number().nonnegative().optional(),
  unitPrice:        z.number().nonnegative().optional(),
  description:      z.string().optional(),
  isBillable:       z.boolean().optional(),
  adjustmentReason: z.string().min(1),    // REQUIRED for audit trail
});
export type AdjustBillingItemDTO = z.infer<typeof AdjustBillingItemSchema>;

export const WriteOffItemSchema = z.object({
  writeoffReason: z.string().min(10),    // enforce meaningful reason
  partialHours:   z.number().nonnegative().optional(), // partial write-off
});
export type WriteOffItemDTO = z.infer<typeof WriteOffItemSchema>;

export const ApproveBillingSessionSchema = z.object({
  reviewNotes:    z.string().optional(),
  reviewedBy:     z.string().uuid(),
});
export type ApproveBillingSessionDTO = z.infer<typeof ApproveBillingSessionSchema>;

// ─────────────────────────────────────────────────────────────
// BILLING SUMMARY (computed view for UI)
// ─────────────────────────────────────────────────────────────

export interface BillingSummary {
  projectId:        string;
  projectName:      string;
  billingModel:     BillingModel;
  billingStatus:    BillingStatus;
  totalLoggedHours: number;
  totalBillableHours: number;
  totalWrittenOffHours: number;
  grossAmount:      number;
  totalAdjustments: number;
  netAmount:        number;
  currency:         string;
  itemCount:        number;
  writtenOffCount:  number;
  adjustedCount:    number;
}

// ─────────────────────────────────────────────────────────────
// BILLING POLICY (per-project configuration)
// ─────────────────────────────────────────────────────────────

export interface BillingPolicy {
  model:              BillingModel;
  defaultRate?:       number;          // fallback if employee has no rate
  requiresApproval:   boolean;         // always true for enterprise
  autoExtract:        boolean;         // auto-extract on project completion
  splitInvoices:      boolean;         // allow multiple invoices per project
  retainerAmount?:    number;          // for hybrid model
  taxRate:            number;
  currency:           string;
}
