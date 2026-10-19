import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Package, ChevronRight } from 'lucide-react';
import { salesService } from '../salesService';
import { type SalesOrder } from '@/shared/types/salesOrder';
import { inventoryService } from '../../inventory/inventoryService'; // Ensure event listener is registered
import SalesOrderDetails from './SalesOrderDetails';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  shipped: { label: 'Shipped', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200' },
};

type StatusFilter = 'all' | 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export default function SalesOrderList() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    refreshOrders();
  }, []);

  const refreshOrders = async () => {
    const orders = await salesService.getOrders();
    setOrders(orders);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBack = async () => {
    setSelectedOrderId(null);
    await refreshOrders();
  };

  const handleConfirm = async (orderId: string) => {
    try {
      await salesService.confirmOrder(orderId);
      await refreshOrders();
      // Return to list view after successful confirmation
      setSelectedOrderId(null);
    } catch (error) {
      console.error('[Sales] Failed to confirm order:', error);
      alert(`Failed to confirm order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const newOrder = await salesService.createOrder({
        customerName: 'New Customer',
        customerId: 'CUST-NEW',
        items: [
          { id: '1', productId: 'PROD-001', productName: 'Sample Product', quantity: 1, unitPrice: 100, discount: 0, total: 100 },
        ],
      });
      if (!newOrder || !newOrder.id) {
        throw new Error('Order creation failed: No order ID returned');
      }
      setSelectedOrderId(newOrder.id);
      await refreshOrders();
    } catch (error) {
      console.error('[Sales] Failed to create order:', error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatOrderItems = (order: SalesOrder) => {
    if (order.items.length === 0) return 'No items';

    return order.items
      .map((item) => `${item.productId || 'No product ID'} x ${item.quantity}`)
      .join(', ');
  };

  // If an order is selected, show details
  if (selectedOrderId) {
    return (
      <SalesOrderDetails
        orderId={selectedOrderId}
        onBack={handleBack}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Sales Orders</h2>
          <p className="text-zinc-500 mt-1">Manage your sales orders and quotations</p>
        </div>
        <button
          onClick={handleCreateOrder}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {(['all', 'draft', 'confirmed', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              )}
            >
              {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Product IDs / Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredOrders.map((order) => (
              <tr 
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="hover:bg-indigo-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-zinc-900">{order.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-900">{order.customerName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-500">{order.orderDate}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-zinc-600 max-w-xs">
                    <Package className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                    <div>
                      <div className="text-sm font-medium text-zinc-800 truncate" title={formatOrderItems(order)}>
                        {formatOrderItems(order)}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {order.items.length} {order.items.length === 1 ? 'line' : 'lines'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-zinc-900">{formatCurrency(order.total)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border',
                    statusConfig[order.status].color
                  )}>
                    {statusConfig[order.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8" />
                    <p>No orders found</p>
                    <button
                      onClick={handleCreateOrder}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Create First Order
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-zinc-900">{orders.length}</div>
          <div className="text-sm text-zinc-500">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'confirmed').length}
          </div>
          <div className="text-sm text-zinc-500">Confirmed</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {orders.filter(o => o.status === 'shipped' || o.status === 'draft').length}
          </div>
          <div className="text-sm text-zinc-500">Pending</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
          </div>
          <div className="text-sm text-zinc-500">Total Value</div>
        </div>
      </div>
    </div>
  );
}
