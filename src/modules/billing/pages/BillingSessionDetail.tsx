import React, { useState, useEffect, type ReactNode } from 'react';
import {
  ArrowLeft, Save, Trash2, Plus, CheckCircle, X,
  Edit2, FileText, Timer, Target, Receipt, Briefcase,
  AlertTriangle, Loader2, Send, DollarSign, MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { billingService } from '../billingService';
import {
  type BillingSession, type BillingItem,
  type AdjustBillingItemDTO, type WriteOffItemDTO
} from '@/shared/contracts/billing.contract';
import { cn } from '@/lib/utils';

// ─── Source type config ────────────────────────────────────────────
const sourceConfig: Record<string, { icon: ReactNode; color: string; bg: string; label: string }> = {
  timesheet:  { icon: <Timer className="w-3 h-3" />,     color: 'text-blue-700', bg: 'bg-blue-100', label: 'Timesheet' },
  task:       { icon: <Briefcase className="w-3 h-3" />,  color: 'text-amber-700', bg: 'bg-amber-100', label: 'Task' },
  milestone:  { icon: <Target className="w-3 h-3" />,     color: 'text-purple-700', bg: 'bg-purple-100', label: 'Milestone' },
  expense:    { icon: <Receipt className="w-3 h-3" />,    color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Expense' },
  fixed:      { icon: <DollarSign className="w-3 h-3" />, color: 'text-indigo-700', bg: 'bg-indigo-100', label: 'Fixed' },
  retainer:   { icon: <DollarSign className="w-3 h-3" />, color: 'text-cyan-700', bg: 'bg-cyan-100', label: 'Retainer' },
  adjustment: { icon: <Edit2 className="w-3 h-3" />,      color: 'text-orange-700', bg: 'bg-orange-100', label: 'Adjustment' },
  writeoff:   { icon: <Trash2 className="w-3 h-3" />,     color: 'text-red-700', bg: 'bg-red-100', label: 'Write-off' },
};

type EditingItem = { id: string; quantity: number; unitPrice: number };

export default function BillingSessionDetail({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
  const [session, setSession] = useState<BillingSession | null>(null);
  const [items, setItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ── Load session ───────────────────────────────────────────────
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await billingService.getSession(sessionId);
      setSession(data);
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load session');
    } finally {
      if (!silent) setLoading(false);
    }
  };

    // ── Save item edit ─────────────────────────────────────────────
    const handleSaveEdit = async () => {
      if (!editing) return;
      setSavingId(editing.id);
      try {
        const updated = await billingService.adjustItem(editing.id, {
          quantity: editing.quantity,
          unitPrice: editing.unitPrice,
          adjustmentReason: 'Manual adjustment',
        }, 'MANAGER_ID');
        setItems(items.map(i => i.id === editing.id ? updated : i));
        setEditing(null);
        await loadSession(true);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Failed to update item');
      } finally {
        setSavingId(null);
      }
    };
 
    // ── Write-off item ─────────────────────────────────────────────
    const handleWriteOff = async (item: BillingItem) => {
      const reason = prompt('Reason for write-off? (Minimum 10 characters)');
      if (!reason || reason.length < 10) {
        if (reason) alert('Reason must be at least 10 characters long');
        return;
      }
      
      const partialHours = prompt(`Current quantity is ${item.quantity}. How many hours to write off?`, item.quantity.toString());
      if (partialHours === null) return;
      
      setSavingId(item.id);
      try {
        const updated = await billingService.writeOffItem(item.id, { 
          writeoffReason: reason, 
          partialHours: Number(partialHours) 
        }, 'MANAGER_ID');
       setItems(items.map(i => i.id === item.id ? updated : i));
       await loadSession(true);

      } catch (e) {
        alert(e instanceof Error ? e.message : 'Failed to write off item');
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete item ─────────────────────────────────────────────
  const handleDeleteItem = async (item: BillingItem) => {
    if (!confirm(`Are you sure you want to delete "${item.description}"?`)) return;
    setSavingId(item.id);
    try {
       await billingService.deleteItem(item.id, 'MANAGER_ID');
       setItems(items.filter(i => i.id !== item.id));
       await loadSession(true);

    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete item');
    } finally {
      setSavingId(null);
    }
  };


  // ── Approve session ─────────────────────────────────────────────

  const handleApprove = async () => {
    setSavingId('approve');
    try {
      await billingService.approveSession(sessionId, {
        reviewedBy: 'MANAGER_ID',
        reviewNotes: approvalNotes,
      });
      await loadSession();
      setShowApproveDialog(false);
      setApprovalNotes('');
      alert('Session approved! Invoice will be generated automatically.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to approve session');
    } finally {
      setSavingId(null);
    }
  };

  // ── Add manual item ─────────────────────────────────────────────
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    sourceType: 'adjustment' as 'adjustment' | 'fixed'
  });

  const handleAddItem = async () => {
    if (!newItem.description.trim()) return;
    setSavingId('add');
    try {
      const added = await billingService.addManualItem(
        sessionId,
        newItem.description,
        newItem.quantity,
        newItem.unitPrice,
        'MANAGER_ID',
        newItem.sourceType
      );
       setItems([...items, added]);
       setNewItem({ description: '', quantity: 1, unitPrice: 0, sourceType: 'adjustment' });
       setShowAddForm(false);
       // Reload to get updated totals
       await loadSession(true);

    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add item');
    } finally {
      setSavingId(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND' }).format(n);
  
  const totals = React.useMemo(() => {
    const safeItems = items || [];
    return {
      gross: safeItems.reduce((sum, i) => (i.isBillable && i.sourceType !== 'adjustment') ? sum + (Number(i.amount) || 0) : sum, 0),
      adjustments: safeItems.reduce((sum, i) => i.sourceType === 'adjustment' ? sum + (Number(i.amount) || 0) : sum, 0),
      writeOffs: safeItems.reduce((sum, i) => i.isWrittenOff ? sum + (Number(i.amount) || 0) : sum, 0),
    };
  }, [items]);
  
  const netBillable = totals.gross + totals.adjustments + totals.writeOffs;

  const statusColor: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-zinc-100 text-zinc-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Session not found'}</p>
        <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">← Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </button>
        <div className="flex gap-2">
          {session.status === 'open' && (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={savingId === 'add'}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
              <button
                onClick={() => setShowApproveDialog(true)}
                disabled={savingId === 'approve'}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <CheckCircle className="w-4 h-4" /> {savingId === 'approve' ? 'Approving...' : 'Approve & Invoice'}
              </button>
            </>
          )}
          {session.status === 'approved' && (
            <span className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Invoice will be generated shortly
            </span>
          )}
        </div>
      </div>

      {/* ── Session Summary Card ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Billing Session</h2>
            <p className="text-zinc-500">Review and adjust billable items before invoicing</p>
            {session.projectName && (
              <p className="text-sm text-zinc-600 mt-1.5">
                Project: <span className="font-semibold text-zinc-900">{session.projectName}</span>
                {session.salesOrderId && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    SO: {session.salesOrderId.slice(0, 8)}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400 uppercase font-medium">Status</div>
            <div className={cn('mt-0.5 px-2.5 py-1 rounded-full text-sm font-semibold inline-block', statusColor[session.status])}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </div>
          </div>
        </div>

         <div className="grid grid-cols-3 gap-4 pt-4 border-t">
           <div className="p-4 bg-zinc-50 rounded-lg">
             <div className="text-xs text-zinc-500 uppercase font-medium">Gross Amount</div>
             <div className="text-2xl font-bold text-zinc-900">{formatCurrency(totals.gross)}</div>
           </div>
           <div className="p-4 bg-zinc-50 rounded-lg">
             <div className="text-xs text-zinc-500 uppercase font-medium">Adjustments</div>
             <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.adjustments)}</div>
           </div>
           <div className="p-4 bg-indigo-50 rounded-lg">
             <div className="text-xs text-indigo-600 uppercase font-medium">Net Billable</div>
             <div className="text-2xl font-bold text-indigo-700">{formatCurrency(netBillable)}</div>
           </div>
         </div>


        {session.reviewNotes && (
          <div className="pt-2 border-t">
            <div className="text-xs text-zinc-500 mb-1">Review Notes</div>
            <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg">{session.reviewNotes}</p>
          </div>
        )}
      </div>

      {/* ── Add Item Modal ──────────────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Add Manual Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Additional development hours"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Unit Price (TND)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
               <div>
                 <label className="block text-sm font-medium text-zinc-700 mb-1">Source Type</label>
                 <select
                   value={newItem.sourceType}
                   onChange={e => setNewItem({ ...newItem, sourceType: e.target.value as 'adjustment' | 'fixed' })}
                   className="w-full px-3 py-2 border rounded-lg"
                 >
                   <option value="adjustment">Adjustment (discount/surcharge)</option>
                   <option value="fixed">Fixed Amount</option>
                 </select>
               </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg">Cancel</button>
                <button
                  onClick={handleAddItem}
                  disabled={savingId === 'add' || !newItem.description}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingId === 'add' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirmation Dialog ──────────────────────────── */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold">Approve Billing Session</h3>
            </div>
            <p className="text-zinc-600 mb-4">
              This will finalize the session and generate an invoice for <strong>{formatCurrency(session.netAmount)}</strong>.
              This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Review Notes (optional)</label>
              <textarea
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Add notes about this approval..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowApproveDialog(false)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg">Cancel</button>
              <button
                onClick={handleApprove}
                disabled={savingId === 'approve'}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {savingId === 'approve' && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Items Table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="font-semibold text-zinc-900">Billable Items</h3>
            <p className="text-sm text-zinc-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={session.status !== 'open'}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No billable items extracted.</p>
            <p className="text-sm">Complete timesheets, milestones, or expenses, then reopen the billing session.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-50 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Source</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
             <tbody className="divide-y divide-zinc-100">
               {items.filter(i => i.sourceType !== 'writeoff').map(item => (
                 <tr key={item.id} className={cn('hover:bg-zinc-50/50 transition-colors', item.isWrittenOff && 'opacity-50')}>
                   <td className="px-6 py-4">

                    <div className="flex items-start gap-2">
                       {sourceConfig[item.sourceType] && (
                         <span className={cn('mt-0.5 p-1 rounded', sourceConfig[item.sourceType].bg)}>
                           {sourceConfig[item.sourceType].icon}
                         </span>
                       )}
                      <div>
                        <div className={cn('text-sm', item.isWrittenOff ? 'line-through text-zinc-400' : 'text-zinc-900')}>
                          {item.description}
                        </div>
                        {item.adjustmentReason && (
                          <div className="text-xs text-zinc-500 mt-0.5">Note: {item.adjustmentReason}</div>
                        )}
                      </div>
                    </div>
                  </td>

                   <td className="px-6 py-4 text-right">
                     <span className={cn(
                       'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                       sourceConfig[item.sourceType]?.bg || 'bg-zinc-100',
                       sourceConfig[item.sourceType]?.color || 'text-zinc-700'
                     )}>
                       {sourceConfig[item.sourceType]?.label || item.sourceType}
                     </span>
                   </td>

                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {editing?.id === item.id ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editing.quantity}
                        onChange={e => setEditing({ ...editing, quantity: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border rounded text-right font-mono"
                        autoFocus
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {editing?.id === item.id ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editing.unitPrice}
                        onChange={e => setEditing({ ...editing, unitPrice: Number(e.target.value) })}
                        className="w-24 px-2 py-1 border rounded text-right font-mono"
                      />
                    ) : (
                      formatCurrency(item.unitPrice)
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                    {formatCurrency(item.amount)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      {session.status === 'open' && (
                        <>
                          {editing?.id === item.id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                disabled={savingId === item.id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                               <button
                                 onClick={() => setEditing({ id: item.id, quantity: item.quantity, unitPrice: item.unitPrice })}
                                 disabled={item.isBilled || savingId === item.id}
                                 className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30"
                                 title="Edit (Quantity/Price)"
                               >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <DropdownMenu>
                                 <DropdownMenuTrigger>
                                   <button
                                     disabled={item.isBilled || savingId === item.id}
                                     className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded disabled:opacity-30"
                                     title="Actions"
                                   >
                                     <MoreHorizontal className="w-4 h-4" />
                                   </button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent>
                                   <DropdownMenuItem 
                                     onClick={() => setEditing({ id: item.id, quantity: item.quantity, unitPrice: item.unitPrice })}
                                     className="flex items-center gap-2 cursor-pointer"
                                   >
                                     <Edit2 className="w-3 h-3" /> Adjust
                                   </DropdownMenuItem>
                                   <DropdownMenuItem 
                                     onClick={() => handleWriteOff(item)}
                                     className="flex items-center gap-2 cursor-pointer text-red-600"
                                   >
                                     <Trash2 className="w-3 h-3" /> Write off
                                   </DropdownMenuItem>
                                   <DropdownMenuItem 
                                     onClick={() => handleDeleteItem(item)}
                                     className="flex items-center gap-2 cursor-pointer text-red-600 font-semibold"
                                   >
                                     <X className="w-3 h-3" /> Delete
                                   </DropdownMenuItem>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                             </>
                           )}

                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer Summary ───────────────────────────────────────── */}
       {items.length > 0 && (
         <div className="bg-white rounded-xl border border-zinc-200 p-4 flex justify-end">
           <div className="flex gap-8 text-sm">
             <div>
               <span className="text-zinc-500">Gross:</span>
               <span className="ml-2 font-mono font-medium">{formatCurrency(totals.gross)}</span>
             </div>
             <div>
               <span className="text-zinc-500">Adjustments:</span>
               <span className="ml-2 font-mono font-medium text-red-600">{formatCurrency(totals.adjustments)}</span>
             </div>
             <div>
               <span className="text-zinc-500">Write-offs:</span>
               <span className="ml-2 font-mono font-medium text-red-600">
                 {formatCurrency(totals.writeOffs)}
               </span>
             </div>
             <div className="border-l pl-8">
               <span className="text-zinc-500">Net Billable:</span>
               <span className="ml-2 font-mono font-bold text-indigo-700 text-lg">{formatCurrency(netBillable)}</span>
             </div>
           </div>
         </div>
       )}

    </div>
  );
}
