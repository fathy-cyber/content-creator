import { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, Save, X,
  Package, DollarSign, Calendar, User, FileText,
  CheckCircle, Truck, Ban
} from 'lucide-react';
import { salesService } from '../salesService';
import { type SalesOrder, type SalesOrderItem } from '@/shared/types/salesOrder';
import { cn } from '@/lib/utils';

interface SalesOrderDetailsProps {
  orderId: string;
  onBack: () => void;
  onConfirm?: (orderId: string) => void;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-zinc-100 text-zinc-600', icon: FileText },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-600', icon: CheckCircle },
  shipped: { label: 'Shipped', color: 'bg-amber-100 text-amber-600', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: Ban },
};

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

const toNumber = (value: string | number) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
};

const calculateLineTotal = (item: Pick<SalesOrderItem, 'quantity' | 'unitPrice' | 'discount'>) => {
  const subtotal = toNumber(item.quantity) * toNumber(item.unitPrice);
  const discountAmount = subtotal * (toNumber(item.discount) / 100);

  return roundMoney(Math.max(subtotal - discountAmount, 0));
};

export default function SalesOrderDetails({ orderId, onBack, onConfirm }: SalesOrderDetailsProps) {
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ord = await salesService.getOrder(orderId);
        if (ord) {
          setOrder(ord);
          setItems([...ord.items]);
          setNotes(ord.notes || '');
        }
      } catch (e) {
        console.error('[Sales] Failed to fetch order details:', e);
      }
    };
    fetchOrder();
  }, [orderId]);

  const isDraft = order?.status === 'draft';

  const handleConfirm = async () => {
    if (!order || isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm?.(order.id);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleAddItem = () => {
    const newItem: SalesOrderItem = {
      id: String(Date.now()),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
    setIsEditing(true);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    setIsEditing(true);
  };

  const handleItemChange = (itemId: string, field: keyof SalesOrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      
      const updated = {
        ...item,
        [field]: field === 'quantity' || field === 'unitPrice' || field === 'discount'
          ? toNumber(value)
          : value,
      };
      
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        updated.total = calculateLineTotal(updated);
      }
      
      return updated;
    }));
    setIsEditing(true);
  };

  const recalculate = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    const taxRate = order?.taxRate || 19;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return {
      subtotal: roundMoney(subtotal),
      taxAmount: roundMoney(taxAmount),
      total: roundMoney(total),
    };
  };

  const handleSave = async () => {
    if (!order) return;
    setIsSaving(true);
    
    const normalizedItems = items.map(item => ({
      ...item,
      total: calculateLineTotal(item),
    }));
    const updatedOrder = await salesService.updateOrder(order.id, { items: normalizedItems, notes, taxRate: order.taxRate });
    if (updatedOrder) {
      setOrder(updatedOrder);
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const handleCancel = async () => {
    const ord = await salesService.getOrder(orderId);
    if (ord) {
      setOrder(ord);
      setItems([...ord.items]);
      setNotes(ord.notes || '');
    }
    setIsEditing(false);
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading order...</div>
      </div>
    );
  }

  const totals = recalculate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{order.number}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', statusConfig[order.status].color)}>
                {statusConfig[order.status].label}
              </span>
              <span className="text-zinc-400 text-sm">{order.orderDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isDraft && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Edit Order
              </button>
              {onConfirm && (
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className={cn(
                  "px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2",
                  isConfirming && "opacity-50 cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                {isConfirming ? 'Confirming...' : 'Confirm'}
              </button>
              )}
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer & Info */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Customer</div>
              <div className="font-semibold text-zinc-900">{order.customerName}</div>
              <div className="text-sm text-zinc-500">{order.customerId}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Order Date</div>
              <div className="font-semibold text-zinc-900">{order.orderDate}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Tax Rate</div>
              <div className="font-semibold text-zinc-900">{order.taxRate}%</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Created</div>
              <div className="font-semibold text-zinc-900">{order.createdAt.split('T')[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-zinc-400" />
            Order Items
          </h3>
          {isDraft && isEditing && (
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          )}
        </div>
        
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide w-36">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Product</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-28">Unit Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">Discount %</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide w-28">Total</th>
              {isDraft && isEditing && <th className="w-12"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="px-6 py-3">
                  {isDraft && isEditing ? (
                    <input
                      type="text"
                      value={item.productId}
                      onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                      placeholder="PROD-001"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="font-mono text-sm text-zinc-700">{item.productId || 'No product ID'}</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {isDraft && isEditing ? (
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                      placeholder="Product name"
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="font-medium text-zinc-900">{item.productName}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  {isDraft && isEditing ? (
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-zinc-900">{item.quantity}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  {isDraft && isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-zinc-900">${item.unitPrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  {isDraft && isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-zinc-600">{item.discount}%</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right font-medium text-zinc-900">
                  ${calculateLineTotal(item).toFixed(2)}
                </td>
                {isDraft && isEditing && (
                  <td className="px-4">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={isDraft && isEditing ? 7 : 6} className="px-6 py-8 text-center text-zinc-400">
                  No items in this order
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 w-80">
          <div className="space-y-3">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tax ({order.taxRate}%)</span>
              <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex justify-between text-lg font-bold text-zinc-900">
              <span>Total</span>
              <span className="text-indigo-600">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-400" />
          Notes
        </h3>
        {isDraft && isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for this order..."
            rows={3}
            className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <p className="text-zinc-500">{order.notes || 'No notes'}</p>
        )}
      </div>
    </div>
  );
}
