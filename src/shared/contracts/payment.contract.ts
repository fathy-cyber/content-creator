import { z } from 'zod';

export const PaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['bank_transfer', 'card', 'cash', 'check', 'crypto']),
  reference: z.string().optional(),
  paidAt: z.string().optional(),
  recordedBy: z.string().uuid().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const RecordPaymentDTO = PaymentSchema.omit({ paidAt: true, recordedBy: true });
export type RecordPaymentDTO = z.infer<typeof RecordPaymentDTO>;
