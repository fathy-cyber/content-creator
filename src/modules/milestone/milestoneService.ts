import { supabase } from '@/lib/supabase';

export const milestoneService = {
  async getMilestonesByProject(projectId: string | number) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to fetch milestones: ${error.message}`);
    return data || [];
  },

  async createMilestone(data: {
    project_id: string | number;
    name: string;
    due_date: string;
    amount: number;
  }) {
    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create milestone: ${error.message}`);
    return milestone;
  },
};

export default milestoneService;
