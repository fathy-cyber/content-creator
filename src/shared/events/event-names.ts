export type EventName = 
  | 'crm.contact.created'
  | 'crm.contact.updated'
  | 'sales.order.confirmed'
  | 'sales.order.cancelled'
  | 'inventory.stock.updated'
  | 'project.created'
  | 'project.updated'
  | 'project.archived'
  | 'project.status_changed'
  | 'project.task.created'
  | 'project.task.updated'
  | 'project.task.deleted'
  | 'project.task.stage_changed'
  | 'project.task.assigned'
  | 'project.milestone.created'
  | 'project.milestone.updated'
  | 'project.milestone.completed'
  | 'project.milestone.billed'
  | 'project.timesheet.logged'
  | 'project.timesheet.updated'
  | 'project.timesheet.approved'
  | 'project.timesheet.rejected'
  | 'project.expense.added'
  | 'project.expense.updated'
  | 'project.expense.approved'
  | 'project.expense.deleted'
  | 'project.billing.status_changed'
  | 'project.payment.status_changed'
  | 'project.financial.recalculated'
  | 'project.timesheet.approved'
  | 'project.milestone.reached'
  | 'project.completed'
  | 'billing.session.opened'
  | 'billing.session.approved'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'expense.approved'
  | 'support.ticket.created'
  | 'support.sla.breached'
  | 'marketing.lead.created'
  | 'marketing.lead.scored'
  | 'marketing.campaign.launched'
  | 'marketing.campaign.ended'
  | 'marketing.asset.published'
  | 'crm.contact.converted'
  | 'crm.deal.lost'
  | 'revenue.realized';

export const EVENT_NAMES = {
  CRM_CONTACT_CREATED: 'crm.contact.created',
  CRM_CONTACT_UPDATED: 'crm.contact.updated',
  SALES_ORDER_CONFIRMED: 'sales.order.confirmed',
  SALES_ORDER_CANCELLED: 'sales.order.cancelled',
  INVENTORY_STOCK_UPDATED: 'inventory.stock.updated',
  
  // Project Domain
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_ARCHIVED: 'project.archived',
  PROJECT_STATUS_CHANGED: 'project.status_changed',
  
  PROJECT_TASK_CREATED: 'project.task.created',
  PROJECT_TASK_UPDATED: 'project.task.updated',
  PROJECT_TASK_DELETED: 'project.task.deleted',
  PROJECT_TASK_STAGE_CHANGED: 'project.task.stage_changed',
  PROJECT_TASK_ASSIGNED: 'project.task.assigned',
  
  PROJECT_MILESTONE_CREATED: 'project.milestone.created',
  PROJECT_MILESTONE_UPDATED: 'project.milestone.updated',
  PROJECT_MILESTONE_COMPLETED: 'project.milestone.completed',
  PROJECT_MILESTONE_BILLED: 'project.milestone.billed',
  
  PROJECT_TIMESHEET_LOGGED: 'project.timesheet.logged',
  PROJECT_TIMESHEET_UPDATED: 'project.timesheet.updated',
  PROJECT_TIMESHEET_APPROVED: 'project.timesheet.approved',
  PROJECT_TIMESHEET_REJECTED: 'project.timesheet.rejected',
  
  PROJECT_EXPENSE_ADDED: 'project.expense.added',
  PROJECT_EXPENSE_UPDATED: 'project.expense.updated',
  PROJECT_EXPENSE_APPROVED: 'project.expense.approved',
  PROJECT_EXPENSE_DELETED: 'project.expense.deleted',
  
  PROJECT_BILLING_STATUS_CHANGED: 'project.billing.status_changed',
  PROJECT_PAYMENT_STATUS_CHANGED: 'project.payment.status_changed',
  PROJECT_FINANCIAL_RECALCULATED: 'project.financial.recalculated',
  
  // Legacy / Generic
  PROJECT_TIMESHEET_APPROVED_LEGACY: 'project.timesheet.approved',
  PROJECT_MILESTONE_REACHED: 'project.milestone.reached',
  PROJECT_COMPLETED: 'project.completed',
  
  BILLING_SESSION_OPENED: 'billing.session.opened',
  BILLING_SESSION_APPROVED: 'billing.session.approved',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  EXPENSE_APPROVED: 'expense.approved',
  SUPPORT_TICKET_CREATED: 'support.ticket.created',
  SUPPORT_SLA_BREACHED: 'support.sla.breached',
  MARKETING_LEAD_CREATED: 'marketing.lead.created',
  MARKETING_LEAD_SCORED: 'marketing.lead.scored',
  MARKETING_CAMPAIGN_LAUNCHED: 'marketing.campaign.launched',
  MARKETING_CAMPAIGN_ENDED: 'marketing.campaign.ended',
  MARKETING_ASSET_PUBLISHED: 'marketing.asset.published',
  CRM_CONTACT_CONVERTED: 'crm.contact.converted',
  CRM_DEAL_LOST: 'crm.deal.lost',
} as const;
