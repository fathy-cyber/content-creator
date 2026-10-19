import { eventBus, CrmContactCreatedEvent, CrmContactUpdatedEvent, EVENT_NAMES, type InvoicePaidEvent, type InvoiceOverdueEvent } from '../../shared/events';
import { supabase } from '../../lib/supabase';
import { auditLog } from '../../infrastructure/audit';

export interface Contact {
  id: number | string;
  name: string;
  company?: string;
  job_title?: string;
  type?: 'individual' | 'company';
  category?: 'customer' | 'vendor' | 'prospect' | 'partner' | 'other';
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Financial metrics
  has_overdue_invoices?: boolean;
  overdue_amount?: number;
  oldest_overdue_days?: number;
  total_revenue?: number;
  last_payment_date?: string;
  payment_count?: number;
}

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

// Build parameters for create_crm_contact RPC function
function buildCreateParams(values: Record<string, any>): Record<string, any> {
  return {
    p_name: values.name || values.company || 'New Contact',
    p_company: values.company || null,
    p_job_title: values.job_title || null,
    p_type: values.type || 'individual',
    p_category: values.category || 'prospect',
    p_email: values.email || null,
    p_phone: values.phone || null,
    p_mobile: values.mobile || null,
    p_website: values.website || null,
    p_address: values.address || null,
    p_city: values.city || null,
    p_state: values.state || null,
    p_country: values.country || 'Tunisia',
    p_notes: values.notes || null,
    p_assigned_to: values.assigned_to || null,
  };
}

// Build parameters for update_crm_contact RPC function (only changed fields)
function buildUpdateParams(values: Record<string, any>): Record<string, any> {
  const paramMap: Record<string, string> = {
    name: 'p_name', company: 'p_company', job_title: 'p_job_title',
    type: 'p_type', category: 'p_category', email: 'p_email',
    phone: 'p_phone', mobile: 'p_mobile', website: 'p_website',
    address: 'p_address', city: 'p_city', state: 'p_state',
    country: 'p_country', notes: 'p_notes', assigned_to: 'p_assigned_to',
    active: 'p_active'
  };
  const params: Record<string, any> = {};
  for (const [field, param] of Object.entries(paramMap)) {
    if (values[field] !== undefined) {
      params[param] = values[field];
    }
  }
  return params;
}

export const crmService = {
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase.rpc('get_crm_contacts');
    if (error) supabaseError('Failed to fetch contacts', error);
    return (data || []) as Contact[];
  },

  async getContact(id: string | number): Promise<Contact | undefined> {
    const { data, error } = await supabase.rpc('get_crm_contact_by_id', { p_id: Number(id) });
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      supabaseError('Failed to fetch contact', error);
    }
    return data as Contact | undefined;
  },

  async createContact(values: Record<string, any>): Promise<Contact> {
    const params = buildCreateParams(values);
    const { data, error } = await supabase.rpc('create_crm_contact', params);
    if (error) supabaseError('Failed to create contact', error);
    const contact = data as Contact;
    // Emit event with type-safe payload
    console.log(`[CRMService] Emitting CRM_CONTACT_CREATED for contact ${contact.id}`);
    void eventBus.emit<CrmContactCreatedEvent>(EVENT_NAMES.CRM_CONTACT_CREATED, { contact });
    return contact;
  },

  async updateContact(id: string | number, values: Record<string, any>): Promise<Contact> {
    const currentContact = await this.getContact(id);
    const params = buildUpdateParams(values);
    params.p_id = Number(id);

    if (Object.keys(params).length === 1) { // only p_id, nothing to update
      if (!currentContact) throw new Error('Contact not found');
      return currentContact;
    }

    const { data, error } = await supabase.rpc('update_crm_contact', params);
    if (error) supabaseError('Failed to update contact', error);
    const contact = data as Contact;
    
    await auditLog({
      module: 'crm',
      entityType: 'Contact',
      entityId: String(id),
      action: 'UPDATE',
      oldValues: currentContact as any,
      newValues: contact as any,
    });

    void eventBus.emit<CrmContactUpdatedEvent>(EVENT_NAMES.CRM_CONTACT_UPDATED, { contact });
    return contact;
  },

  async deleteContact(id: string | number): Promise<boolean> {
    const { error } = await supabase.rpc('delete_crm_contact', { p_id: Number(id) });
    if (error) supabaseError('Failed to delete contact', error);
    return true;
  },

  async updateFinancials(clientId: string, amount: number, paymentDate: string): Promise<void> {
    const { error } = await supabase.rpc('update_client_financials', {
      p_client_id: clientId,
      p_amount: amount,
      p_payment_date: paymentDate
    });
    if (error) throw new Error(`Failed to update client financials: ${error.message}`);
  },

  async updateAging(clientId: string, overdueAmount: number, oldestDays: number, hasOverdue: boolean): Promise<void> {
    const { error } = await supabase.rpc('update_client_aging', {
      p_client_id: clientId,
      p_overdue_amount: overdueAmount,
      p_oldest_days: oldestDays,
      p_has_overdue: hasOverdue
    });
    if (error) throw new Error(`Failed to update client aging: ${error.message}`);
  },

  async getClientFinancialProfile(clientId: string): Promise<Partial<Contact>> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('total_revenue, last_payment_date, payment_count, has_overdue_invoices, overdue_amount, oldest_overdue_days')
      .eq('id', clientId)
      .single();
 
    if (error) {
      if (error.code === 'PGRST116') return {};
      throw new Error(`Failed to fetch financial profile: ${error.message}`);
    }
    return data;
  },
 
  async getSupportSummary(clientId: string): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    urgentTickets: number;
  }> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('status, priority')
      .eq('client_id', clientId);
 
    if (error) throw new Error(`Failed to fetch support summary: ${error.message}`);
 
    const tickets = data || [];
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      urgentTickets: tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    };
  }
};


// ─── Event Listeners ──────────────────────────────────────────────
 
  eventBus.on('marketing.lead.scored', 'createCrmContact', 'crm', async ({ lead }) => {
    try {
      if (lead.status === 'qualified') {
        // Check if contact already exists
        const { data: existing } = await supabase
          .from('crm_contacts')
          .select('id')
          .eq('email', lead.email)
          .maybeSingle();
  
        if (!existing) {
          await crmService.createContact({
            name: lead.name,
            email: lead.email,
            category: 'prospect',
            notes: `Automated ingestion from marketing. Score: ${lead.score}`,
          });
          console.log(`[CRM] ✅ Ingested qualified lead ${lead.email} as new contact`);
        }
      }
    } catch (e) {
      console.error(`[CRM] ❌ Failed to ingest lead ${lead.email}:`, e);
    }
  });

 
  eventBus.on<InvoicePaidEvent>(EVENT_NAMES.INVOICE_PAID, 'syncClientFinancials', 'crm', async ({ clientId, amountPaid, paymentDate }) => {
 
   try {
     if (clientId) {
       await crmService.updateFinancials(clientId, amountPaid, paymentDate);
       console.log(`[CRM] ✅ Updated financials for client ${clientId} following payment`);
     }
   } catch (e) {
     console.error(`[CRM] ❌ Failed to sync payment to CRM:`, e);
   }
 });


eventBus.on<InvoiceOverdueEvent>(EVENT_NAMES.INVOICE_OVERDUE, 'updateClientAging', 'crm', async ({ clientId, amountDue, daysOverdue }) => {
  try {
    if (clientId) {
      // In a real system, we might want to get the max days overdue across all client's invoices
      // For now, we update with the current overdue invoice's info
      await crmService.updateAging(clientId, amountDue, daysOverdue, true);
      console.log(`[CRM] 🔴 Client ${clientId} marked as having overdue invoices`);
    }
  } catch (e) {
    console.error(`[CRM] ❌ Failed to sync overdue status to CRM:`, e);
  }
});


export default crmService;
