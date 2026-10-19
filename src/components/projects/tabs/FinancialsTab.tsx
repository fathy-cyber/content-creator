import React, { useState, useEffect } from 'react';
import { ProjectFinancials, ExpenseDetail } from '@/types/project.types';
import { 
  createExpense, 
  deleteExpense 
} from '@/lib/projects/projects.mutations';
import { 
  fetchProjectFinancials as getFinancials,
  fetchProjectExpenses 
} from '@/lib/projects/projects.queries';
import { KpiCard } from '../ui/KpiCard';
import { EmptyState } from '../ui/EmptyState';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { formatCurrency } from '@/lib/projects/projects.helpers';
import { cn } from '@/lib/utils';

type FinancialsTabProps = {
  projectId: number;
  isEditMode: boolean;
  onUpdateProject: (data: any) => Promise<void>;
};

export const FinancialsTab = ({ projectId, isEditMode, onUpdateProject }: FinancialsTabProps) => {
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [expenses, setExpenses] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fin, exp] = await Promise.all([
        getFinancials(projectId),
        fetchProjectExpenses(projectId)
      ]);
      setFinancials(fin);
      setExpenses(exp);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createExpense({
        project_id: projectId,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string) || 0,
        date: formData.get('date') as string,
        is_billable: formData.get('is_billable') === 'on',
      });
      setShowExpenseForm(false);
      await loadData();
    } catch (e) {
      alert('Failed to create expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      await loadData();
    } catch (e) {
      alert('Failed to delete expense');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading financials...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!financials) return <EmptyState icon="💰" title="No financial data" description="Budget and financial settings not configured" />;

  return (
    <div className="space-y-8">
      {isEditMode && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Contract Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Budget ($)</label>
              <input 
                type="number" 
                className="w-full p-2 border border-slate-300 rounded-md text-sm" 
                defaultValue={financials.budget}
                onBlur={(e) => onUpdateProject({ budget: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Billing Model</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md text-sm" 
                defaultValue={financials.billing_model}
                onBlur={(e) => onUpdateProject({ billing_model: e.target.value })}
              >
                <option value="time_and_material">Time & Material</option>
                <option value="fixed">Fixed Price</option>
                <option value="retainer">Retainer</option>
                <option value="milestone">Milestone Based</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Retainer Amount ($)</label>
              <input 
                type="number" 
                className="w-full p-2 border border-slate-300 rounded-md text-sm" 
                defaultValue={financials.retainer_amount || 0}
                onBlur={(e) => onUpdateProject({ retainer_amount: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          label="Contract Value" 
          value={formatCurrency(financials.budget)} 
          borderColor="border-l-blue-500" 
          icon={DollarSign}
        />
        <KpiCard 
          label="Total Expenses" 
          value={formatCurrency(financials.total_expenses)} 
          borderColor="border-l-red-500" 
          sub={`Labor: ${formatCurrency(financials.labor_cost)}`}
          icon={TrendingDown}
        />
        <KpiCard 
          label="Gross Profit" 
          value={formatCurrency(financials.gross_profit)} 
          borderColor={financials.gross_profit > 0 ? "border-l-green-500" : "border-l-red-500"} 
          valueColor={financials.gross_profit > 0 ? "text-green-600" : "text-red-600"}
          icon={TrendingUp}
        />
        <KpiCard 
          label="Profit Margin" 
          value={financials.profit_margin != null ? `${financials.profit_margin.toFixed(1)}%` : 'N/A'} 
          borderColor={financials.profit_margin != null && financials.profit_margin > 30 ? "border-l-green-500" : "border-l-yellow-500"} 
          valueColor={financials.profit_margin != null && financials.profit_margin > 30 ? "text-green-600" : "text-yellow-600"}
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700">P&L Statement</h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Contract Budget</span>
            <span className="font-medium text-slate-900">{formatCurrency(financials.budget)}</span>
          </div>
          <div className="flex justify-between text-sm py-1 font-bold border-t border-slate-100 pt-2">
            <span className="text-slate-700">Total Revenue</span>
            <span className="text-slate-900">{formatCurrency(financials.budget)}</span>
          </div>
          
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 uppercase font-bold tracking-wider">
              <span>Expenses</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Labor Cost ({financials.total_logged_hours}h)</span>
              <span className="text-red-500">-{formatCurrency(financials.labor_cost)}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Project Expenses</span>
              <span className="text-red-500">-{formatCurrency(financials.expenses_total)}</span>
            </div>
            <div className="flex justify-between text-sm py-1 font-bold border-t border-slate-100 pt-2">
              <span className="text-slate-700">Total Expenses</span>
              <span className="text-red-600">-{formatCurrency(financials.total_expenses)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-base font-bold text-slate-800">Gross Profit</span>
            <div className="text-right">
              <div className={cn("text-xl font-bold", financials.gross_profit > 0 ? "text-green-600" : "text-red-600")}>
                {formatCurrency(financials.gross_profit)}
              </div>
               <div className="text-xs text-slate-500">
                 {financials.profit_margin != null ? `${financials.profit_margin.toFixed(1)}%` : 'N/A'} margin
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">Expenses Detail</h4>
          <button 
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Expense
          </button>
        </div>

        {showExpenseForm && (
          <form onSubmit={handleCreateExpense} className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Category *</label>
                <select name="category" required className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="travel">Travel</option>
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                  <option value="meals">Meals</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Amount ($) *</label>
                <input name="amount" type="number" step="0.01" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Date *</label>
                <input name="date" type="date" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div className="flex items-center gap-2 py-6">
                <input name="is_billable" type="checkbox" id="billable" className="w-4 h-4 text-blue-600" />
                <label htmlFor="billable" className="text-xs font-medium text-slate-600">Billable to Client</label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Description *</label>
              <input name="description" required className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowExpenseForm(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700">Add Expense</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Billable</th>
                <th className="px-4 py-3 text-center">Billed</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600">{exp.category_label}</td>
                  <td className="px-4 py-3 text-slate-800">{exp.description}</td>
                  <td className="px-4 py-3 text-slate-500">{exp.date}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(exp.amount)}</td>
                  <td className="px-4 py-3 text-center">{exp.is_billable ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center">{exp.is_billed ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No expenses recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
