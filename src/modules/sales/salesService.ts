import { eventBus, EVENT_NAMES, type SalesOrderConfirmedEvent, type SalesOrderCancelledEvent, type InvoicePaidEvent, type InvoiceOverdueEvent } from '../../shared/events';
import { supabase } from '../../lib/supabase';
import { auditLog } from '../../infrastructure/audit';
import { getService } from '@/core';
import type { Product } from '../inventory/inventoryService';
import { type SalesOrder, type SalesOrderItem } from '../../shared/types/salesOrder';

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

function generateNumber(): string {
  const year = new Date().getFullYear();
  return `SO-${year}-DB`;
}

function calculateLineTotal(item: Pick<SalesOrderItem, 'quantity' | 'unitPrice' | 'discount'>): number {
  const quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0;
  const unitPrice = Number.isFinite(Number(item.unitPrice)) ? Number(item.unitPrice) : 0;
  const discount = Number.isFinite(Number(item.discount)) ? Number(item.discount) : 0;
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discount / 100);
  return Math.round((Math.max(subtotal - discountAmount, 0) * 100) / 100);
}

function normalizeItems(items: SalesOrderItem[]): SalesOrderItem[] {
  return items.map(item => ({
    ...item,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    discount: Number(item.discount) || 0,
    total: calculateLineTotal(item),
  }));
}

function calculateTotals(items: SalesOrderItem[], taxRate: number): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

async function getOrdersFromDb(): Promise<SalesOrder[]> {
  const { data, error } = await supabase.rpc('get_sales_orders');
  if (error) supabaseError('Failed to fetch orders', error);
  
  const orders = (data || []) as any[];
  const ordersWithItems: SalesOrder[] = [];
  
  for (const order of orders) {
    const { data: itemsData } = await supabase.rpc('get_sales_order_items_by_order', { p_order_id: order.id });
    const items: SalesOrderItem[] = (itemsData || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discount: item.discount,
      total: item.total,
    }));
    
    ordersWithItems.push({
      id: order.id,
      number: order.number,
      customerId: order.customer_id,
      customerName: order.customer_name,
      status: order.status,
      orderDate: order.order_date,
      items,
      subtotal: order.subtotal,
      taxRate: order.tax_rate,
      taxAmount: order.tax_amount,
      total: order.total,
      notes: order.notes || '',
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  }
  
  return ordersWithItems;
}

async function getOrderFromDb(id: string): Promise<SalesOrder | undefined> {
  const { data, error } = await supabase.rpc('get_sales_order_by_id', { p_id: id });
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    supabaseError('Failed to fetch order', error);
  }
  
  if (!data) return undefined;
  const order = data as any;
  
  const { data: itemsData } = await supabase.rpc('get_sales_order_items_by_order', { p_order_id: order.id });
  const items: SalesOrderItem[] = (itemsData || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    discount: item.discount,
    total: item.total,
  }));
  
  return {
    id: order.id,
    number: order.number,
    customerId: order.customer_id,
    customerName: order.customer_name,
    status: order.status,
    orderDate: order.order_date,
    items,
    subtotal: order.subtotal,
    taxRate: order.tax_rate,
    taxAmount: order.tax_amount,
    total: order.total,
    notes: order.notes || '',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

function buildOrderPayload(data: Partial<SalesOrder> & { items?: SalesOrderItem[] }): any {
  const items = normalizeItems(data.items || []);
  const { subtotal, taxAmount, total } = calculateTotals(items, data.taxRate ?? 19);
  
  return {
    number: generateNumber(),
    customerId: data.customerId || '',
    customerName: data.customerName || '',
    orderDate: data.orderDate || new Date().toISOString().split('T')[0],
    status: 'draft',
    subtotal,
    taxRate: data.taxRate ?? 19,
    taxAmount,
    total,
    notes: data.notes || '',
  };
}

function buildOrderResponse(dbOrder: any, items: SalesOrderItem[]): SalesOrder {
  return {
    id: dbOrder.id,
    number: dbOrder.number,
    customerId: dbOrder.customer_id,
    customerName: dbOrder.customer_name,
    status: dbOrder.status,
    orderDate: dbOrder.order_date,
    items,
    subtotal: dbOrder.subtotal,
    taxRate: dbOrder.tax_rate,
    taxAmount: dbOrder.tax_amount,
    total: dbOrder.total,
    notes: dbOrder.notes || '',
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
  };
}

async function createOrderInDb(data: Partial<SalesOrder> & { items?: SalesOrderItem[] }): Promise<SalesOrder> {
  const payload = buildOrderPayload(data);
  
  const { data: dbOrder, error } = await supabase.rpc('create_sales_order', {
    p_user_id: 'user-default',
    p_customer_id: payload.customerId,
    p_customer_name: payload.customerName,
    p_reference_number: payload.number,
    p_order_date: payload.orderDate,
    p_status: payload.status,
    p_subtotal: payload.subtotal,
    p_tax: payload.taxAmount,
    p_discount: 0,
    p_total: payload.total,
    p_notes: payload.notes,
  });
  
  if (error) supabaseError('Failed to create order', error);
  
  const order = dbOrder as any;
  if (!order || !order.id) {
    supabaseError('Failed to create order: No order returned from database', { message: JSON.stringify(dbOrder) });
  }
  
  const items = normalizeItems(data.items || []);
  
      for (let i = 0; i < items.length; i++) {
       const item = items[i];
       const { error: itemError } = await supabase.rpc('create_sales_order_item', {
         p_order_id: order.id,
         p_product_id: item.productId,
         p_product_name: item.productName,
         p_quantity: item.quantity,
         p_unit_price: item.unitPrice,
         p_discount: item.discount,
         p_total: item.total,
         p_order_index: i,
       });
       
       if (itemError) {
         console.error(`[Sales] Failed to create order item ${i}:`, itemError);
         supabaseError(`Failed to create order item (${item.productName || 'Unknown'})`, itemError);
       }
       
       try {
         const inventory = getService<any>('inventory');
         const product = await inventory.getProduct(item.productId);
         if (product && product.type === 'physical') {
           const qtyToDeduct = -Math.max(Number(item.quantity) || 0, 0);
           await inventory.updateStock(item.productId, qtyToDeduct, order.id);
         }
       } catch (e) {
         console.warn(`[Sales] Error deducting inventory for ${item.productId}:`, e);
       }
     }
  
  return buildOrderResponse(order, items);
}

async function updateOrderInDb(id: string, updates: Partial<SalesOrder> & { items?: SalesOrderItem[] }): Promise<SalesOrder | null> {
  const existingOrder = await getOrderFromDb(id);
  if (!existingOrder) return null;
  
  const orderData: any = { ...existingOrder };
  
    if (updates.items !== undefined) {
      const items = normalizeItems(updates.items);
      const { subtotal, taxAmount, total } = calculateTotals(items, orderData.taxRate);
      orderData.subtotal = subtotal;
      orderData.taxAmount = taxAmount;
      orderData.total = total;
      
      const { error: deleteError } = await supabase.rpc('delete_sales_order_items_by_order', { p_order_id: id });
      if (deleteError) supabaseError('Failed to delete order items', deleteError);
      
       for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const { error: itemError } = await supabase.rpc('create_sales_order_item', {
            p_order_id: id,
            p_product_id: item.productId,
            p_product_name: item.productName,
            p_quantity: item.quantity,
            p_unit_price: item.unitPrice,
            p_discount: item.discount,
            p_total: item.total,
            p_order_index: i,
          });
         
        if (itemError) {
          console.error(`[Sales] Failed to create order item ${i}:`, itemError);
          supabaseError(`Failed to create order item (${item.productName || 'Unknown'})`, itemError);
        }
      }
    }
    
    if (updates.status !== undefined) orderData.status = updates.status;
  if (updates.customerId !== undefined) orderData.customerId = updates.customerId;
  if (updates.customerName !== undefined) orderData.customerName = updates.customerName;
  if (updates.orderDate !== undefined) orderData.orderDate = updates.orderDate;
  if (updates.notes !== undefined) orderData.notes = updates.notes;
  if (updates.taxRate !== undefined) {
    orderData.taxRate = updates.taxRate;
    const items = normalizeItems(orderData.items);
    const { subtotal, taxAmount, total } = calculateTotals(items, updates.taxRate);
    orderData.subtotal = subtotal;
    orderData.taxAmount = taxAmount;
    orderData.total = total;
  }
  
  const { data: dbOrder, error } = await supabase.rpc('update_sales_order', {
    p_id: id,
    p_customer_id: orderData.customerId,
    p_customer_name: orderData.customerName,
    p_reference_number: orderData.number,
    p_order_date: orderData.orderDate,
    p_status: orderData.status,
    p_subtotal: orderData.subtotal,
    p_tax: orderData.taxAmount,
    p_discount: 0,
    p_total: orderData.total,
    p_notes: orderData.notes,
    p_active: orderData.active,
  });
  
  if (error) supabaseError('Failed to update order', error);
  
  const updatedOrder = dbOrder as any;
  const { data: itemsData } = await supabase.rpc('get_sales_order_items_by_order', { p_order_id: id });
  const items: SalesOrderItem[] = (itemsData || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    discount: item.discount,
    total: item.total,
  }));
  
  return buildOrderResponse(updatedOrder, items);
}

async function deleteOrderInDb(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('delete_sales_order', { p_id: id });
  if (error) supabaseError('Failed to delete order', error);
  return true;
}

// Export
export const salesService = {
  async getOrders(): Promise<SalesOrder[]> {
    return getOrdersFromDb();
  },
  
  async getOrder(id: string): Promise<SalesOrder | undefined> {
    return getOrderFromDb(id);
  },
  
  async createOrder(data: Partial<SalesOrder> & { items?: SalesOrderItem[] }): Promise<SalesOrder> {
    return createOrderInDb(data);
  },
  
  async updateOrder(id: string, updates: Partial<SalesOrder> & { items?: SalesOrderItem[] }): Promise<SalesOrder | null> {
    const currentOrder = await this.getOrder(id);
    const result = await updateOrderInDb(id, updates);
    if (result) {
      await auditLog({
        module: 'sales',
        entityType: 'SalesOrder',
        entityId: id,
        action: 'UPDATE',
        oldValues: currentOrder as any,
        newValues: result as any,
      });
    }
    return result;
  },
  
  async confirmOrder(id: string): Promise<SalesOrder | null> {
    const currentOrder = await this.getOrder(id);
    if (currentOrder?.status === 'confirmed') {
      return currentOrder;
    }
    const updatedOrder = await this.updateOrder(id, { status: 'confirmed' });
    if (updatedOrder) {
      const eventPayload: SalesOrderConfirmedEvent = {
        order: updatedOrder,
        items: updatedOrder.items,
      };
      void eventBus.emit<SalesOrderConfirmedEvent>(EVENT_NAMES.SALES_ORDER_CONFIRMED, eventPayload);
    }
    return updatedOrder;
  },
  
  async cancelOrder(id: string): Promise<SalesOrder | null> {
    const updatedOrder = await this.updateOrder(id, { status: 'cancelled' });
    if (updatedOrder) {
      const eventPayload: SalesOrderCancelledEvent = {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.number,
        customerId: updatedOrder.customerId,
        customerName: updatedOrder.customerName,
        items: updatedOrder.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      void eventBus.emit<SalesOrderCancelledEvent>(EVENT_NAMES.SALES_ORDER_CANCELLED, eventPayload);
    }
    return updatedOrder;
  },
  
  async deleteOrder(id: string): Promise<boolean> {
    return deleteOrderInDb(id);
  },
  
  async recalculateTotals(id: string, newTaxRate?: number): Promise<SalesOrder | null> {
    const order = await this.getOrder(id);
    if (!order) return null;
    
    const taxRate = newTaxRate ?? order.taxRate;
    const items = normalizeItems(order.items);
    const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
    
    const updated = await this.updateOrder(id, {
      items,
      taxRate,
    });
    
    return updated;
  },
};

export default salesService;
  
// Register event listeners for financial synchronization
  
// Invoice -> Sales: Update order status and payment status when invoice is paid
eventBus.on<InvoicePaidEvent>(EVENT_NAMES.INVOICE_PAID, async ({ invoiceId }) => {
  try {
    const { data: invoice } = await supabase.rpc('get_invoice_by_id', { p_id: invoiceId });
    if (invoice) {
      if (invoice.order_id) {
        await salesService.updateOrder(invoice.order_id, { 
          status: 'delivered',
        });
        
        await supabase
          .from('sales_orders')
          .update({ payment_status: 'paid' })
          .eq('id', invoice.order_id);
          
        console.log(`[Sales] Order ${invoice.order_id} marked as delivered and paid.`);
      }
  
      if (invoice.project_id) {
        await supabase
          .from('projects')
          .update({ payment_status: 'paid' })
          .eq('id', invoice.project_id);
          
        console.log(`[Sales] Project ${invoice.project_id} marked as paid.`);
      }
    }
  } catch (e) {
    console.error(`[Sales] Failed to sync payment status for invoice ${invoiceId}:`, e);
  }
});
  
  // Invoice -> Sales: Alert on overdue invoices
  eventBus.on<InvoiceOverdueEvent>(EVENT_NAMES.INVOICE_OVERDUE, async ({ invoiceId, customerId }) => {
    try {
      console.warn(`[Sales] ALERT: Invoice ${invoiceId} for customer ${customerId} is now overdue!`);
    } catch (e) {
      console.error(`[Sales] Failed to handle overdue invoice ${invoiceId}:`, e);
    }
  });
