import { supabase } from '@/lib/supabase';
import { 
  ProjectListRow, 
  ProjectFinancials, 
  ProjectTaskDetail, 
  TimesheetDetail, 
  MilestoneDetail, 
  ExpenseDetail 
} from '@/types/project.types';

export const fetchProjects = async (): Promise<ProjectListRow[]> => {
  const { data, error } = await supabase
    .from('v_project_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchProjectById = async (id: number) => {
  // Fetch basic info from table, explicitly excluding aggregated columns to avoid conflicts with the view
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id, name, description, manager_id, start_date, end_date, 
      customer_id, status, budget, billing_model, retainer_amount, 
      billing_status, payment_status, billing_notes, active,
      created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (projectError) throw projectError;

  // Fetch real-time calculated summary from the view
  const { data: summary, error: summaryError } = await supabase
    .from('v_project_list')
    .select('*')
    .eq('id', id)
    .single();

  if (summaryError) {
    console.error('[queries] Error fetching project summary view:', summaryError);
    return project;
  }

  // Merge: Summary (calculated) overrides base table data
  return {
    ...project,
    ...summary,
  };
};

export const fetchProjectFinancials = async (id: number): Promise<ProjectFinancials> => {
  const { data, error } = await supabase
    .from('v_project_financials')
    .select('*')
    .eq('project_id', id)
    .single();

  if (error) throw error;
  return data;
};

export const fetchProjectTasks = async (id: number): Promise<ProjectTaskDetail[]> => {
  const { data, error } = await supabase
    .from('v_project_tasks_detail')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchProjectTimesheets = async (id: number): Promise<TimesheetDetail[]> => {
  const { data, error } = await supabase
    .from('v_project_timesheets_detail')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchProjectMilestones = async (id: number): Promise<MilestoneDetail[]> => {
  const { data, error } = await supabase
    .from('v_project_milestones_detail')
    .select('*')
    .eq('project_id', id)
    .order('target_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchProjectExpenses = async (id: number): Promise<ExpenseDetail[]> => {
  const { data, error } = await supabase
    .from('v_project_expenses_detail')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchContacts = async () => {
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};
