/**
 * Shared Events — Single source of truth for all event definitions.
 *
 * This module re-exports the Persistent EventBus singleton and defines typed event
 * payload interfaces for cross-module communication.
 *
 * Event Naming Convention: {module}.{resource}.{action}
 *   Examples:
 *   - crm.contact.created
 *   - crm.contact.updated
 *   - sales.order.confirmed
 *   - sales.order.cancelled
 *   - project.created
 *
 * All modules must use these typed events via eventBus.emit<T>() and
 * eventBus.on<T>() to ensure type safety and clear contracts.
 */

import { eventBus, initEventBus } from '../core/events/EventBus';
import { EVENT_NAMES, type EventName } from './events/event-names';

export { eventBus, initEventBus, EVENT_NAMES, EventName };

// ─── CRM Events ──────────────────────────────────────────────

/**
 * Emitted when a new CRM contact is created.
 * Consumed by: project module (creates onboarding project)
 */
export interface CrmContactCreatedEvent {
  contact: {
    id: number | string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    // ... other contact fields
  };
}

/**
 * Emitted when a CRM contact is updated.
 * Consumed by: (potential future modules)
 */
export interface CrmContactUpdatedEvent {
  contact: {
    id: number | string;
    name: string;
    // ... updated fields
  };
}

// ─── Sales Events ────────────────────────────────────────────

/**
 * Emitted when a sales order is confirmed.
 * Consumed by: inventory (stock deduction), project (project creation)
 */
export interface SalesOrderConfirmedEvent {
  order: {
    id: string;
    number: string;
    customerId: string;
    customerName: string;
    status: 'confirmed';
    orderDate: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      total: number;
    }>;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
}

/**
 * Emitted when a sales order is cancelled.
 * Consumed by: project (cancels linked delivery project)
 */
export interface SalesOrderCancelledEvent {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

/**
 * Emitted when inventory stock changes for a product.
 * Consumed by: inventory UI (refresh product list)
 */
export interface InventoryStockUpdatedEvent {
  productId: string;
  qtyOnHand: number;
  orderId?: string;
  reason?: string;
}

// ─── Project Events ──────────────────────────────────────────
 
  /**
   * Emitted when a new project is auto-created (from sales order or contact).
   * Consumed by: (potential future modules like notifications, analytics)
   */
  export interface ProjectCreatedEvent {
    project: {
      id: number | string;
      name: string;
      description: string;
      customer_id: number | string | null;
      customer_name: string | null;
      status: string;
      start_date: string | null;
      budget: number;
      progress: number;
      tasks_count: number;
      completed_tasks_count: number;
    };
  }
  
  export interface ProjectTimesheetApprovedEvent {
    timesheetId: string;
    projectId: number | string;
    billableHours: number;
    amount: number;
  }
  
   export interface ProjectMilestoneReachedEvent {
     milestoneId: string;
     projectId: number | string;
     amount: number;
   }
   
   export interface ExpenseApprovedEvent {
     expense: {
       id: string;
       project_id: string;
       category: string;
       description: string;
       amount: number;
       is_billable: boolean;
       receipt_url?: string;
     };
   }
 
   export interface ProjectCompletedEvent {
     projectId: number | string;
     finalBudget: number;
     completionDate: string;
   }
 
 
   export interface BillingSessionOpenedEvent {
     sessionId: string;
     projectId: string;
     itemCount: number;
     billingModel: string;
   }
 
   export interface BillingSessionApprovedEvent {
     sessionId: string;
     projectId: string;
     netAmount: number;
     billingModel: string;
     reviewedBy: string;
   }
   
   // ─── Invoice Events ────────────────────────────────────────────
  
  /**
   * Emitted when a new invoice is created.
   */
  export interface InvoiceCreatedEvent {
    invoice: {
      id: string;
      number: string;
      total: number;
      customerId: string;
      status: string;
    };
  }
  
  /**
   * Emitted when an invoice is marked as paid.
   */
  export interface InvoicePaidEvent {
    invoiceId: string;
    amountPaid: number;
    paymentDate: string;
    clientId?: string;
  }
 
  
  export interface InvoiceOverdueEvent {
    invoiceId: string;
    customerId: string;
    amountDue: number;
    daysOverdue?: number;
    clientId?: string;
  }
 
  
  /**
   * Emitted when a support ticket is created.
   * Consumed by: project module (creates bug task if category is 'bug')
   */
  export interface SupportTicketCreatedEvent {
    ticket: {
      id: number;
      ticket_number: string;
      client_id: number;
      project_id: number | null;
      subject: string;
      category: string;
      priority: string;
    };
  }
