import { useState, useEffect } from 'react';
import { Search, Plus, Receipt, Send, CheckCircle, Clock, AlertTriangle, Ban, Eye, ChevronRight, MoreVertical } from 'lucide-react';
import { accountingService } from '../accountingService';
import { type Invoice } from '@/shared/types/invoice';
import InvoiceDetail from './InvoiceDetail';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-zinc-100 text-zinc-600' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-600' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-600' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-600' },
  cancelled: { label: 'Cancelled', color: 'bg-zinc-100 text-zinc-400' },
};

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [outstanding, setOutstanding] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);
 
  useEffect(() => { refreshInvoices(); }, []);
 
  const refreshInvoices = async () => {
    try {
      const [invData, outData, paidData] = await Promise.all([
        accountingService.getInvoices(),
        accountingService.getTotalOutstanding(),
        accountingService.getTotalPaid(),
      ]);
      setInvoices(invData || []);
      setOutstanding(outData || 0);
      setPaid(paidData || 0);
    } catch (e) {
      console.error('Failed to refresh invoices:', e);
      setInvoices([]);
    }
  };
 
  const filtered = (invoices || []).filter(inv => {
    const matchSearch = !searchQuery || inv.number.toLowerCase().includes(searchQuery.toLowerCase()) || inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a);
 
  const handleSend = async (id: string) => { await accountingService.sendInvoice(id); refreshInvoices(); };
  const handlePaid = async (id: string) => { await accountingService.markPaid(id); refreshInvoices(); };
  const handleInvoiceClick = (id: string) => { setSelectedInvoiceId(id); };
  const handleBack = async () => { 
    setSelectedInvoiceId(null); 
    await refreshInvoices(); 
  };
 
  if (selectedInvoiceId) {
    return <InvoiceDetail invoiceId={selectedInvoiceId} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Invoices</h2>
          <p className="text-zinc-500 mt-1">Manage customer invoices</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium capitalize', statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-600 border border-zinc-200')}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Due</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.map(inv => (
              <tr 
                key={inv.id} 
                className="hover:bg-zinc-50 cursor-pointer transition-colors" 
                onClick={() => handleInvoiceClick(inv.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium text-zinc-900">{inv.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600">{inv.customerName}</td>
                <td className="px-6 py-4 text-zinc-500">{inv.invoiceDate}</td>
                <td className="px-6 py-4 text-zinc-500">{inv.dueDate}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                <td className="px-6 py-4">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig[inv.status].color)}>{statusConfig[inv.status].label}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded" title="More options">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleInvoiceClick(inv.id)} className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> View Invoice
                        </DropdownMenuItem>
                        {inv.status === 'sent' && (
                          <DropdownMenuItem onClick={() => handlePaid(inv.id)} className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="w-4 h-4" /> Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleSend(inv.id)} className="flex items-center gap-2 text-blue-600">
                          <Send className="w-4 h-4" /> {inv.status === 'draft' ? 'Send' : 'Resend'} Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-zinc-400"><Receipt className="w-12 h-12 mx-auto mb-4" /><p>No invoices</p></div>}

       <div className="grid grid-cols-4 gap-4">
         <div className="bg-white rounded-xl border border-zinc-200 p-4">
           <div className="text-2xl font-bold text-zinc-900">{invoices.length}</div>
           <div className="text-sm text-zinc-500">Total Invoices</div>
         </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(outstanding)}</div>
            <div className="text-sm text-zinc-500">Outstanding</div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(paid)}</div>
            <div className="text-sm text-zinc-500">Paid</div>
          </div>
         <div className="bg-white rounded-xl border border-zinc-200 p-4">
           <div className="text-2xl font-bold text-red-600">{invoices.filter(i => i.status === 'overdue').length}</div>
           <div className="text-sm text-zinc-500">Overdue</div>
         </div>
       </div>
    </div>
  );
}