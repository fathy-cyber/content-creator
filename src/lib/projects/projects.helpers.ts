import { ProjectFinancials, TaskStage, TaskPriority, BillingModel } from '@/types/project.types';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatHours = (hours: number): string => {
  return `${hours}h`;
};

export const getDaysLabel = (days: number): string => {
  if (days === 0) return 'today';
  if (days > 0) return `${days}d left`;
  return `${Math.abs(days)}d overdue`;
};

export const getProfitMarginStatus = (margin: number): 'healthy' | 'low' | 'critical' | 'loss' => {
  if (margin >= 30) return 'healthy';
  if (margin >= 10) return 'low';
  if (margin >= 1) return 'critical';
  return 'loss';
};

export const getTaskStageColor = (stage: TaskStage): string => {
  switch (stage) {
    case 'todo': return 'bg-gray-100 text-gray-600';
    case 'in_progress': return 'bg-blue-100 text-blue-600';
    case 'review': return 'bg-yellow-100 text-yellow-600';
    case 'done': return 'bg-green-100 text-green-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'low': return 'bg-blue-100 text-blue-600';
    case 'medium': return 'bg-green-100 text-green-600';
    case 'high': return 'bg-orange-100 text-orange-600';
    case 'critical': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getBillingModelLabel = (model: BillingModel): string => {
  switch (model) {
    case 'time_and_material': return 'Time & Material';
    case 'fixed': return 'Fixed Price';
    case 'retainer': return 'Retainer';
    case 'milestone': return 'Milestone Based';
    default: return model;
  }
};

export interface ProfitabilityResult {
  status: 'healthy' | 'low' | 'critical' | 'loss';
  color: string;
  label: string;
}

export const calcProjectProfitability = (financials: ProjectFinancials): ProfitabilityResult => {
  const margin = financials.profit_margin;
  if (margin >= 30) return { status: 'healthy', color: 'text-green-600', label: 'Healthy' };
  if (margin >= 10) return { status: 'low', color: 'text-yellow-600', label: 'Low' };
  if (margin >= 1) return { status: 'critical', color: 'text-orange-600', label: 'Critical' };
  return { status: 'loss', color: 'text-red-600', label: 'Loss' };
};
