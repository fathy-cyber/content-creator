export interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
