import { supabase } from '@/lib/supabase';
 
export interface KPI {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}
 
export interface ClientLTV {
  clientId: string;
  totalLifetimeValue: number;
  lastInvoiceDate: string;
}
 
export const analyticsService = {
  /**
   * Calculate Customer Acquisition Cost (CAC)
   * Formula: (Marketing Spend + Sales Spend) / New Customers Acquired
   */
  async calculateCAC(startDate: string, endDate: string): Promise<number> {
    const { data: campaigns } = await supabase
      .from('marketing_campaigns')
      .select('actual_spend')
      .gte('startDate', startDate)
      .lte('endDate', endDate);
 
    const totalSpend = (campaigns || []).reduce((sum, c) => sum + (c.actual_spend || 0), 0);
 
    const { data: newCustomers, count } = await supabase
      .from('crm_contacts')
      .select('id', { count: 'exact', head: false })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('category', 'customer');
 
    const customerCount = count || 0;
    return customerCount === 0 ? 0 : totalSpend / customerCount;
  },
 
  /**
   * Calculate Lifetime Value (LTV) per client
   */
  async calculateLTVs(): Promise<ClientLTV[]> {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('client_id, total')
      .eq('status', 'paid');
 
    if (error) throw error;
 
    const ltvMap: Record<string, number> = {};
    const lastDateMap: Record<string, string> = {};
 
    (invoices || []).forEach(inv => {
      ltvMap[inv.client_id] = (ltvMap[inv.client_id] || 0) + inv.total;
      // Simplified: we'd usually need the invoice date here
    });
 
    return Object.entries(ltvMap).map(([clientId, total]) => ({
      clientId,
      totalLifetimeValue: total,
      lastInvoiceDate: '', // Would require joining with invoice table
    }));
  },
 
  /**
  * Calculate Resource Utilization
  * Formula: (Actual Hours / Available Hours) * 100
  */
  async calculateUtilization(startDate: string, endDate: string): Promise<number> {
    const { data: entries, error } = await supabase
      .from('project_tasks') // Simplified: should be timesheet entries
      .select('actual_hours')
      .gte('updated_at', startDate)
      .lte('updated_at', endDate);
 
    if (error) throw error;
 
    const totalHours = (entries || []).reduce((sum, e) => sum + (e.actual_hours || 0), 0);
    const availableHours = 160 * 10; // Mock: 10 employees * 160h/month
 
    return (totalHours / availableHours) * 100;
  },
 
  /**
   * Materialize KPIs into a summary table for fast reporting
   */
  async materializeKPIs(): Promise<void> {
    const cac = await this.calculateCAC('2026-01-01', new Date().toISOString());
    const utilization = await this.calculateUtilization('2026-01-01', new Date().toISOString());
 
    await supabase.from('analytics_kpis').upsert({
      kpi_name: 'CAC',
      value: cac,
      updated_at: new Date().toISOString(),
    });
 
    await supabase.from('analytics_kpis').upsert({
      kpi_name: 'ResourceUtilization',
      value: utilization,
      updated_at: new Date().toISOString(),
    });
  },
};
 
export default analyticsService;
