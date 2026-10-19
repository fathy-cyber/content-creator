import { supabase } from '@/lib/supabase';

export const timesheetService = {
  async createEntry(data: {
    task_id: string | number;
    project_id: string | number;
    employee_id: string;
    hours: number;
    date: string;
    notes: string;
  }) {
    const { data: entry, error } = await supabase
      .from('timesheets')
      .insert({
        task_id: data.task_id,
        project_id: data.project_id,
        employee_id: data.employee_id,
        hours: data.hours,
        date: data.date,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create timesheet entry: ${error.message}`);
    return entry;
  },

  async getEntriesByTask(taskId: string | number) {
    const { data, error } = await supabase
      .from('timesheets')
      .select('*')
      .eq('task_id', taskId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Failed to fetch timesheet entries: ${error.message}`);
    return data || [];
  },
};

export default timesheetService;
