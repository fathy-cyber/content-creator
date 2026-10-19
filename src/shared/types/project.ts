export interface Project {
  id: string | number;
  name: string;
  description: string;
  orderId: string | number | null;
  customerId: string | number | null;
  customerName: string | null;
  managerId: string | null;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'draft';
  startDate: string | null;
  endDate: string | null;
  budget: number;
  billing_model?: string;
  billing_rate?: number;
  progress: number;
  tasksCount: number;
  completedTasksCount: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}
