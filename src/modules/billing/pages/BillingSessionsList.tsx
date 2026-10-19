import { useState, useEffect } from 'react';
import { Search, Plus, Receipt, ChevronRight, Filter, Calendar, DollarSign } from 'lucide-react';
import { billingService } from '../billingService';
import { type BillingSession } from '@/shared/contracts/billing.contract';
import BillingSessionDetail from './BillingSessionDetail';
import { cn } from '@/lib/utils';

export default function BillingSessionsList() {
  const [sessions, setSessions] = useState<BillingSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSessions();
  }, []);

  const refreshSessions = async () => {
    setLoading(true);
    try {
      const data = await billingService.getSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to refresh billing sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sessions.filter(s => {
    const matchSearch = !searchQuery ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.projectName && s.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND' }).format(a);

  if (selectedSessionId) {
    return <BillingSessionDetail sessionId={selectedSessionId} onBack={() => setSelectedSessionId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Billing Sessions</h2>
          <p className="text-zinc-500 mt-1">Revenue review and invoice preparation</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by session ID or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
          {['all', 'open', 'approved', 'rejected', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                statusFilter === s
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p>Loading sessions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No billing sessions found.</p>
            <p className="text-sm text-zinc-400 mt-1">Complete a project to automatically create a billing session.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Net Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Items</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(s => (
                <tr
                  key={s.id}
                  className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                  onClick={() => setSelectedSessionId(s.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-zinc-500">{s.id.slice(0, 8)}…</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{s.projectName || `Project #${s.projectId}`}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 capitalize">
                      {s.billingModel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                    {formatCurrency(s.netAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium">
                      {s.items?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-zinc-300 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

