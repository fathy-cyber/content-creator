import { supabase } from '../../lib/supabase';
import { eventBus, EVENT_NAMES } from '../../shared/events';
import { auditLog } from '../../infrastructure/audit';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  client_id: number;
  project_id: number | null;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature' | 'question' | 'complaint';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_type: 'client' | 'agent' | 'system';
  message: string;
  created_at: string;
}

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase.rpc('get_support_tickets');
    if (error) supabaseError('Failed to fetch tickets', error);
    return (data || []) as SupportTicket[];
  },

  async getTicket(id: string | number): Promise<SupportTicket | undefined> {
    const { data, error } = await supabase.rpc('get_support_ticket_by_id', { p_id: Number(id) });
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      supabaseError('Failed to fetch ticket', error);
    }
    return data as SupportTicket | undefined;
  },

  async createTicket(data: Partial<SupportTicket>): Promise<SupportTicket> {
    const { data: ticket, error } = await supabase.rpc('create_support_ticket', {
      p_client_id: data.client_id,
      p_subject: data.subject || '',
      p_description: data.description || '',
      p_project_id: data.project_id || null,
      p_priority: data.priority || 'medium',
      p_category: data.category || 'question',
      p_assigned_to: data.assigned_to || null,
    });
    if (error) supabaseError('Failed to create ticket', error);
    
    const createdTicket = ticket as SupportTicket;
    
    // Emit event for CRM and Project integration
    void eventBus.emit(EVENT_NAMES.SUPPORT_TICKET_CREATED, { ticket: createdTicket }, { sourceModule: 'support', sourceEntityId: String(createdTicket.id) });
    
    return createdTicket;
  },

  async updateTicket(id: string | number, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    const currentTicket = await this.getTicket(id);
    const { data, error } = await supabase.rpc('update_support_ticket', {
      p_id: Number(id),
      p_status: updates.status,
      p_priority: updates.priority,
      p_category: updates.category,
      p_assigned_to: updates.assigned_to,
      p_description: updates.description,
    });
    if (error) supabaseError('Failed to update ticket', error);
    
    const updatedTicket = data as SupportTicket;

    await auditLog({
      module: 'support',
      entityType: 'SupportTicket',
      entityId: String(id),
      action: 'UPDATE',
      oldValues: currentTicket as any,
      newValues: updatedTicket as any,
    });

    return updatedTicket;
  },

  async getMessages(ticketId: string | number): Promise<SupportMessage[]> {
    const { data, error } = await supabase.rpc('get_support_messages_by_ticket', { p_ticket_id: Number(ticketId) });
    if (error) supabaseError('Failed to fetch messages', error);
    return (data || []) as SupportMessage[];
  },

  async addMessage(data: { ticketId: string | number, senderId: string, senderType: 'client' | 'agent' | 'system', message: string }): Promise<SupportMessage> {
    const { data: msg, error } = await supabase.rpc('create_support_message', {
      p_ticket_id: Number(data.ticketId),
      p_sender_id: data.senderId,
      p_sender_type: data.senderType,
      p_message: data.message,
    });
    if (error) supabaseError('Failed to add message', error);
    return msg as SupportMessage;
  }
};

// ─── Event Listeners ──────────────────────────────────────────────

eventBus.on('support.sla.breached', 'handleSlaBreach', 'support', async ({ ticketId, ticketNumber }) => {
  console.log(`[SupportService] 🚨 SLA Breached for ticket ${ticketNumber} (ID: ${ticketId}). Notifying manager...`);
  // In a real system, this would send an email/notification
});

export default supportService;
