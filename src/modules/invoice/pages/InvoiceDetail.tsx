import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, X, Printer, Send, 
  User, Calendar, FileText, DollarSign, Receipt, Edit3, Plus, Trash2
} from 'lucide-react';
import { accountingService } from '../accountingService';
import { type Invoice, type InvoiceItem } from '@/shared/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;
const toNumber = (value: string | number) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
};
const calculateLineTotal = (item: Pick<InvoiceItem, 'quantity' | 'unitPrice'>) => {
  return roundMoney(toNumber(item.quantity) * toNumber(item.unitPrice));
};

export default function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await accountingService.getInvoice(invoiceId);
        if (data) {
          setInvoice(data);
          setEditData({ ...data });
          setItems([...(data.items || [])]);
        } else {
          setError('Invoice not found');
        }
      } catch (e: any) {
        console.error('[Invoice] Failed to load invoice:', e);
        setError(e.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoice();
  }, [invoiceId]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      const updated = {
        ...item,
        [field]: field === 'quantity' || field === 'unitPrice' ? toNumber(value) : value,
      };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = calculateLineTotal(updated);
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
      const total = subtotal + (editData.taxAmount || 0);
      
      const updated = await accountingService.updateInvoice(invoiceId, { 
        ...editData, 
        items, 
        subtotal: roundMoney(subtotal), 
        total: roundMoney(total) 
      });
      if (updated) {
        setInvoice(updated);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to update invoice:', e);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 space-y-4">
        <p>{error || 'Invoice not found'}</p>
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Invoice {invoice.number}</h2>
            <p className="text-zinc-500">Review and edit official invoice</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </button>
          {isEditing ? (
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> Edit Invoice
            </button>
          )}
          <button onClick={() => setIsEditing(false)} className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors", isEditing ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "hidden")}>
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                    <Receipt className="w-6 h-6" />
                    <span>AYECH AI</span>
                  </div>
                  <p className="text-sm text-zinc-500">Tunis, Tunisia</p>
                  <p className="text-sm text-zinc-500">contact@ayech.ai</p>
                </div>
                <div className="text-right space-y-1">
                  <h1 className="text-3xl font-light text-zinc-400 uppercase tracking-widest">Invoice</h1>
                  <p className="text-lg font-semibold text-zinc-900">{invoice.number}</p>
                  <p className="text-sm text-zinc-500">Issued: {isEditing ? (editData.issueDate || invoice.issueDate) : invoice.issueDate}</p>
                  <p className="text-sm text-zinc-500">Due: {isEditing ? (editData.dueDate || invoice.dueDate) : invoice.dueDate}</p>
                </div>
              </div>

              <div className="border-t border-b border-zinc-100 py-8 grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Billed To</p>
                  <p className="font-semibold text-zinc-900">{isEditing ? (editData.customerName || invoice.customerName) : invoice.customerName}</p>
                  <p className="text-sm text-zinc-500">Customer ID: {isEditing ? (editData.customerId || invoice.customerId) : invoice.customerId || 'N/A'}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Terms</p>
                  <p className="text-sm text-zinc-600">Net 30 Days</p>
                  <p className="text-sm text-zinc-600">Type: {isEditing ? (editData.type || invoice.type) : invoice.type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Description</th>
                      <th className="py-3 px-2 text-right">Qty</th>
                      <th className="py-3 px-2 text-right">Unit Price</th>
                      <th className="py-3 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-4 px-2 text-zinc-700">{item.description}</td>
                        <td className="py-4 px-2 text-right text-zinc-600">{item.quantity}</td>
                        <td className="py-4 px-2 text-right text-zinc-600">{(item.unitPrice || 0).toFixed(2)} TND</td>
                        <td className="py-4 px-2 text-right font-medium text-zinc-900">{(item.total || 0).toFixed(2)} TND</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-400 italic">No items listed</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-zinc-900 font-medium">{(items.reduce((sum, i) => sum + i.total, 0) || 0).toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Tax Amount</span>
                    <span className="text-zinc-900 font-medium">{(invoice.taxAmount || 0).toFixed(2)} TND</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 flex justify-between text-lg font-bold text-zinc-900">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">{(items.reduce((sum, i) => sum + i.total, 0) + (invoice.taxAmount || 0) || 0).toFixed(2)} TND</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-zinc-500 italic">{invoice.notes || 'No additional notes provided.'}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" /> Edit Items
                </h3>
                <button onClick={handleAddItem} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-zinc-500 uppercase">
                      <th className="pb-2 pl-2">Description</th>
                      <th className="pb-2 text-right w-24">Qty</th>
                      <th className="pb-2 text-right w-32">Unit Price</th>
                      <th className="pb-2 text-right w-24">Total</th>
                      <th className="pb-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-2 pl-2">
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="number" 
                            step="0.01"
                            value={item.unitPrice} 
                            onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </td>
                        <td className="py-2 text-right font-medium text-zinc-900 text-sm">
                          {item.total.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={cn(
          "bg-zinc-50 rounded-xl border border-zinc-200 p-6 space-y-6 transition-all",
          !isEditing && "opacity-50 grayscale pointer-events-none"
        )}>
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Customer Name</label>
              <input 
                type="text" 
                value={editData.customerName || ''} 
                onChange={e => setEditData({...editData, customerName: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">Issue Date</label>
                <input 
                  type="date" 
                  value={editData.issueDate || ''} 
                  onChange={e => setEditData({...editData, issueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">Due Date</label>
                <input 
                  type="date" 
                  value={editData.dueDate || ''} 
                  onChange={e => setEditData({...editData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Invoice Type</label>
              <select 
                value={editData.type || 'standard'} 
                onChange={e => setEditData({...editData, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="standard">Standard</option>
                <option value="proforma">Proforma</option>
                <option value="credit_note">Credit Note</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Notes</label>
              <textarea 
                value={editData.notes || ''} 
                onChange={e => setEditData({...editData, notes: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
