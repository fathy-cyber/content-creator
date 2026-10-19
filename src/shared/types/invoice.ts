export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  orderId: string | null;
  projectId: string | number | null;
  customerId: string | number | null;
  customerName: string;
  number: string;
  type: 'standard' | 'proforma' | 'credit_note' | 'recurring';
  status: 'draft' | 'sent' | 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string;
  createdAt: string;
  items?: InvoiceItem[];
}
