import { supabase } from '@/lib/supabase';

export const expenseService = {
  async createExpense(data: {
    project_id: string | number;
    task_id?: string | number;
    description: string;
    amount: number;
    category: string;
    date: string;
    is_billable: boolean;
  }) {
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    return expense;
  },

  async getExpensesByProject(projectId: string | number) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
    return data || [];
  },
};

export default expenseService;
