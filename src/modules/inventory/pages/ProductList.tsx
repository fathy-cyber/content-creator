import { useState, useEffect } from 'react';
import { 
  Search, Plus, Package, Edit, Trash2, AlertTriangle,
  ChevronRight, Filter, Grid, List
} from 'lucide-react';
import { inventoryService, type Product } from '../inventoryService';
import { eventBus, EVENT_NAMES, type InventoryStockUpdatedEvent } from '@/shared/events';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

const typeLabels = {
  physical: { label: 'Physical', color: 'bg-blue-100 text-blue-700' },
  service: { label: 'Service', color: 'bg-purple-100 text-purple-700' },
  digital: { label: 'Digital', color: 'bg-cyan-100 text-cyan-700' },
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await refreshProducts();
      const cats = await inventoryService.getCategories();
      setCategories(cats);
    };
    loadData();

    const unsubscribe = eventBus.on<InventoryStockUpdatedEvent>(EVENT_NAMES.INVENTORY_STOCK_UPDATED, async () => {
      await refreshProducts();
    });

    return () => unsubscribe();
  }, []);

  const refreshProducts = async () => {
    const products = await inventoryService.getProducts();
    setProducts(products);
  };

  const refreshCategories = async () => {
    const categories =
      await inventoryService.getCategories();

    setCategories(categories);

    return categories;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'in_stock') matchesStatus = product.qtyOnHand > product.reorderLevel;
    else if (statusFilter === 'low_stock') matchesStatus = product.qtyOnHand > 0 && product.qtyOnHand <= product.reorderLevel;
    else if (statusFilter === 'out_of_stock') matchesStatus = product.qtyOnHand === 0;
    
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleCreate = async () => {
    const newProduct = await inventoryService.createProduct({
      name: 'New Product',
      sku: `SKU-${Date.now()}`,
      salePrice: 0,
      costPrice: 0,
      qtyOnHand: 0,
      reorderLevel: 5,
    });
    setSelectedProduct(newProduct);
    setIsEditing(true);
    await refreshProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    await inventoryService.updateProduct(selectedProduct.id, selectedProduct);
    setSelectedProduct(null);
    setIsEditing(false);
    await refreshProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await inventoryService.deleteProduct(id);
      await refreshProducts();
    }
  };

  const handleStockChange = async (id: string, delta: number) => {
    await inventoryService.updateStock(id, delta);
    await refreshProducts();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const newCategory = await inventoryService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      // Update the selected product with the new category
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          categoryId: newCategory.id,
          categoryName: newCategory.name,
        });
      }
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowNewCategoryForm(false);
      
      // Refresh categories
      await refreshCategories();
      
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  if (isEditing && selectedProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedProduct(null); setIsEditing(false); }}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            ← Back to Products
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Product
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-white rounded-xl border border-zinc-200 p-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
            <input
              type="text"
              value={selectedProduct.name}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
            <input
              type="text"
              value={selectedProduct.sku}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
            <div className="flex gap-2">
              <select
                value={selectedProduct.categoryId}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, categoryId: e.target.value, categoryName: e.target.options[e.target.selectedIndex].text })}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                className="px-3 py-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
              >
                +
              </button>
            </div>
            
            {showNewCategoryForm && (
              <div className="mt-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <h4 className="text-sm font-medium text-zinc-900 mb-3">Add New Category</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Optional description"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Add Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryForm(false);
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                      }}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
            <select
              value={selectedProduct.type}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            >
              <option key="physical" value="physical">Physical</option>
              <option key="service" value="service">Service</option>
              <option key="digital" value="digital">Digital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Cost Price</label>
            <input
              type="number"
              value={selectedProduct.costPrice}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, costPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Sale Price</label>
            <input
              type="number"
              value={selectedProduct.salePrice}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, salePrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Quantity</label>
            <input
              type="number"
              value={selectedProduct.qtyOnHand}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, qtyOnHand: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Reorder Level</label>
            <input
              type="number"
              value={selectedProduct.reorderLevel}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, reorderLevel: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={selectedProduct.description}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Products</h2>
          <p className="text-zinc-500 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
          >
            {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium capitalize',
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200'
              )}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500">Type</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-zinc-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{product.sku}</td>
                  <td className="px-6 py-4 text-zinc-500">{product.categoryName}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(product.costPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(product.salePrice)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={cn(
                        'font-medium',
                        product.qtyOnHand === 0 ? 'text-red-600' :
                        product.qtyOnHand <= product.reorderLevel ? 'text-amber-600' : 'text-emerald-600'
                      )}>
                        {product.qtyOnHand}
                      </span>
                      {product.qtyOnHand <= product.reorderLevel && product.qtyOnHand > 0 && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', typeLabels[product.type].color)}>
                      {typeLabels[product.type].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-900 truncate">{product.name}</h3>
                  <p className="text-xs text-zinc-500">{product.sku}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Price</span>
                  <span className="font-medium">{formatCurrency(product.salePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Stock</span>
                  <span className={cn(
                    'font-medium',
                    product.qtyOnHand === 0 ? 'text-red-600' :
                    product.qtyOnHand <= product.reorderLevel ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {product.qtyOnHand} {product.unit}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 py-1.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <p>No products found</p>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Create First Product
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-zinc-900">{products.length}</div>
          <div className="text-sm text-zinc-500">Total Products</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(products.reduce((sum, p) => sum + (p.qtyOnHand * p.costPrice), 0))}
          </div>
          <div className="text-sm text-zinc-500">Stock Value</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {products.filter(p => p.qtyOnHand > 0 && p.qtyOnHand <= p.reorderLevel).length}
          </div>
          <div className="text-sm text-zinc-500">Low Stock</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-zinc-500">Categories</div>
        </div>
      </div>
    </div>
  );
}