export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  due_date: string;
  amount: number;
  is_billed: boolean;
  created_at: string;
  updated_at: string;
}
