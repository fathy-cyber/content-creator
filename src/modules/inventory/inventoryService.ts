import { eventBus, EVENT_NAMES, type InventoryStockUpdatedEvent } from '../../shared/events';
import type { SalesOrderConfirmedEvent, SalesOrderCancelledEvent } from '../../shared/events';
import { supabase } from '../../lib/supabase';
import { auditLog } from '../../infrastructure/audit';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  type: 'physical' | 'service' | 'digital';
  description: string;
  costPrice: number;
  salePrice: number;
  qtyOnHand: number;
  reorderLevel: number;
  unit: string;
  weight: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productCount?: number;
  status?: 'active' | 'inactive';
}

function mapDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id ?? '',
    name: dbProduct.name ?? '',
    sku: dbProduct.sku ?? '',
    barcode: dbProduct.barcode ?? '',
    categoryId: dbProduct.category_id ?? '',
    categoryName: dbProduct.category_name ?? '',
    type: dbProduct.type ?? 'physical',
    description: dbProduct.description ?? '',
    costPrice: Number(dbProduct.cost ?? 0),
    salePrice: Number(dbProduct.price ?? 0),
    qtyOnHand: Number(dbProduct.qty_on_hand ?? 0),
    reorderLevel: Number(dbProduct.reorder_level ?? 0),
    unit: dbProduct.unit ?? 'pcs',
    weight: Number(dbProduct.weight ?? 0),
    imageUrl: dbProduct.image_url ?? '',
    isActive: dbProduct.active ?? dbProduct.is_active ?? true,
    createdAt: dbProduct.created_at ?? new Date().toISOString(),
    updatedAt: dbProduct.updated_at ?? new Date().toISOString(),
  };
}

function mapProductToDb(product: Partial<Product>): any {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    category_id: product.categoryId,
    category_name: product.categoryName,
    type: product.type,
    description: product.description,
    cost_price: product.costPrice,
    sale_price: product.salePrice,
    qty_on_hand: product.qtyOnHand,
    reorder_level: product.reorderLevel,
    unit: product.unit,
    weight: product.weight,
    image_url: product.imageUrl,
    active: product.isActive,
  };
}

function mapDbCategoryToCategory(dbCategory: any): Category {
  return {
    id: String(dbCategory.id ?? ''),
    name: String(dbCategory.name ?? ''),
    description: String(dbCategory.description ?? ''),
    parentId: dbCategory.parent_id != null ? String(dbCategory.parent_id) : null,
    isActive: dbCategory.active === false || dbCategory.is_active === false ? false : true,
    createdAt: dbCategory.created_at ?? new Date().toISOString(),
    updatedAt: dbCategory.updated_at ?? new Date().toISOString(),
    productCount: Number(dbCategory.product_count ?? 0),
    status: dbCategory.active === false ? 'inactive' : 'active',
  };
}

async function getProductsFromDb(): Promise<Product[]> {
  const { data, error } = await supabase.rpc('get_inventory_products');
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return (data || []).map(mapDbProductToProduct);
}

async function getProductFromDb(id: string): Promise<Product | undefined> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const { data, error } = await supabase.rpc('get_inventory_product_by_id', { p_id: id });
    if (!error && data) return mapDbProductToProduct(data);
  }
  const { data: skuData, error: skuError } = await supabase.from('inventory_products').select('*').eq('sku', id).single();
  if (!skuError && skuData) return mapDbProductToProduct(skuData);
  return undefined;
}

async function createProductInDb(data: Partial<Product>): Promise<Product> {
  const id = crypto.randomUUID();
  const { data: dbProduct, error } = await supabase.rpc('create_inventory_product', {
    p_id: id,
    p_name: data.name || 'New Product',
    p_sku: data.sku || `SKU-${Date.now()}`,
    p_barcode: data.barcode || '',
    p_category_id: data.categoryId || null,
    p_type: data.type || 'physical',
    p_description: data.description || '',
    p_cost: Number(data.costPrice || 0),
    p_price: Number(data.salePrice || 0),
    p_qty_on_hand: Math.floor(Number(data.qtyOnHand || 0)),
    p_reorder_point: Math.floor(Number(data.reorderLevel || 5)),
    p_unit: data.unit || 'pcs',
    p_status: 'active',
    p_supplier_id: null,
    p_tax_percent: 0,
  });
  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return mapDbProductToProduct(dbProduct);
}

async function updateProductInDb(id: string, updates: Partial<Product>): Promise<Product | null> {
  const existing = await getProductFromDb(id);
  if (!existing) return null;
  
  if (updates.sku) {
    const { data: existingSku } = await supabase.from('inventory_products').select('id').eq('sku', updates.sku).neq('id', id).maybeSingle();
    if (existingSku) throw new Error(`SKU "${updates.sku}" already exists`);
  }
  
  const { data: dbProduct, error } = await supabase.rpc('update_inventory_product', {
    p_id: id,
    p_name: updates.name ?? existing.name,
    p_sku: updates.sku ?? existing.sku,
    p_barcode: updates.barcode ?? existing.barcode,
    p_category_id: updates.categoryId || existing.categoryId || null,
    p_type: updates.type ?? existing.type,
    p_description: updates.description ?? existing.description,
    p_cost: updates.costPrice ?? existing.costPrice,
    p_price: updates.salePrice ?? existing.salePrice,
    p_qty_on_hand: updates.qtyOnHand ?? existing.qtyOnHand,
    p_reorder_point: updates.reorderLevel ?? existing.reorderLevel,
    p_unit: updates.unit ?? existing.unit,
    p_status: 'active',
    p_supplier_id: null,
    p_tax_percent: 0,
    p_active: updates.isActive !== undefined ? updates.isActive : existing.isActive,
  });
  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return mapDbProductToProduct(dbProduct);
}

async function deleteProductInDb(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('delete_inventory_product', { p_id: id });
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
  return true;
}

async function getCategoriesFromDb(): Promise<Category[]> {
  const { data, error } = await supabase.rpc('get_inventory_categories');
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data || []).map(mapDbCategoryToCategory);
}

async function getCategoryFromDb(id: string): Promise<Category | undefined> {
  const { data, error } = await supabase.rpc('get_inventory_category_by_id', { p_id: id });
  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return data ? mapDbCategoryToCategory(data) : undefined;
}

async function createCategoryInDb(data: Partial<Category>): Promise<Category> {
  const id = crypto.randomUUID();
  const { data: dbCategory, error } = await supabase.rpc('create_inventory_category', {
    p_id: id,
    p_name: data.name || 'New Category',
    p_description: data.description || '',
    p_parent_id: data.parentId || null,
  });
  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return mapDbCategoryToCategory(dbCategory);
}

async function updateCategoryInDb(id: string, updates: Partial<Category>): Promise<Category | null> {
  const existing = await getCategoryFromDb(id);
  if (!existing) return null;
  const { data: dbCategory, error } = await supabase.rpc('update_inventory_category', {
    p_id: id,
    p_name: updates.name ?? existing.name,
    p_description: updates.description ?? existing.description,
    p_parent_id: updates.parentId ?? existing.parentId,
    p_active: updates.isActive !== undefined ? updates.isActive : existing.isActive,
  });
  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return mapDbCategoryToCategory(dbCategory);
}

async function deleteCategoryInDb(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('update_inventory_category', { p_id: id, p_active: false });
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
  return true;
}

async function updateStockInDb(productId: string, quantityChange: number, orderId?: string): Promise<Product | null> {
  let product = await getProductFromDb(productId);
  if (!product) return null;
  const quantityBefore = product.qtyOnHand;
  const quantityAfter = quantityBefore + quantityChange;
  const { data: updatedProduct, error } = await supabase.rpc('update_inventory_product', {
    p_id: product.id,
    p_name: product.name,
    p_sku: product.sku,
    p_barcode: product.barcode,
    p_category_id: product.categoryId || null,
    p_type: product.type,
    p_description: product.description,
    p_cost: product.costPrice,
    p_price: product.salePrice,
    p_qty_on_hand: quantityAfter,
    p_reorder_point: product.reorderLevel,
    p_unit: product.unit,
    p_status: 'active',
    p_supplier_id: null,
    p_tax_percent: 0,
    p_active: product.isActive,
  });
  if (error) throw new Error(`Failed to update stock: ${error.message}`);
  const { error: movementError } = await supabase.rpc('record_stock_movement', {
    p_product_id: product.id,
    p_reference_id: orderId || null,
    p_quantity_before: quantityBefore,
    p_quantity_change: quantityChange,
    p_quantity_after: quantityAfter,
    p_reason: quantityChange < 0 ? `Sales order ${orderId ? 'linked to ' + orderId : 'manual adjustment'}` : 'Stock receipt',
    p_movement_type: quantityChange < 0 ? 'out' : 'in',
    p_order_id: orderId || null,
  });
  if (movementError) console.warn('[Inventory] Failed to record stock movement:', movementError);
  if (updatedProduct) {
    void eventBus.emit<InventoryStockUpdatedEvent>(EVENT_NAMES.INVENTORY_STOCK_UPDATED, {
      productId: product.id,
      qtyOnHand: quantityAfter,
      orderId,
      reason: quantityChange < 0 ? 'sales order deduction' : 'stock adjustment',
    });
  }
  return updatedProduct ? mapDbProductToProduct(updatedProduct) : null;
}

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    return getProductsFromDb();
  },
  async getProduct(id: string): Promise<Product | undefined> {
    return getProductFromDb(id);
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    return createProductInDb(data);
  },
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const currentProduct = await this.getProduct(id);
    const result = await updateProductInDb(id, updates);
    if (result) {
      await auditLog({ module: 'inventory', entityType: 'Product', entityId: id, action: 'UPDATE', oldValues: currentProduct as any, newValues: result as any });
    }
    return result;
  },
  async updateStock(id: string, quantityChange: number, orderId?: string): Promise<Product | null> {
    return updateStockInDb(id, quantityChange, orderId);
  },
  async deductStockForSalesOrder(order: SalesOrderConfirmedEvent['order']): Promise<Product[]> {
    const updatedProducts: Product[] = [];
    if (!order.items || order.items.length === 0) return updatedProducts;
    for (const item of order.items) {
      const product = await this.getProduct(item.productId);
      if (!product || product.type !== 'physical') continue;
      const qtyToDeduct = -Math.max(Number(item.quantity) || 0, 0);
      const updatedProduct = await this.updateStock(item.productId, qtyToDeduct, order.id);
      if (updatedProduct) updatedProducts.push(updatedProduct);
    }
    return updatedProducts;
  },
  async deleteProduct(id: string): Promise<boolean> {
    return deleteProductInDb(id);
  },
  async getLowStockProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.qtyOnHand <= p.reorderLevel);
  },
  async getCategories(): Promise<Category[]> {
    return getCategoriesFromDb();
  },
  async getCategory(id: string): Promise<Category | undefined> {
    return getCategoryFromDb(id);
  },
  async createCategory(data: Partial<Category>): Promise<Category> {
    return createCategoryInDb(data);
  },
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const existing = await this.getCategory(id);
    if (!existing) return null;
    const result = await updateCategoryInDb(id, updates);
    if (result) {
      await auditLog({ module: 'inventory', entityType: 'Category', entityId: id, action: 'UPDATE', oldValues: existing as any, newValues: result as any });
    }
    return result;
  },
  async deleteCategory(id: string): Promise<boolean> {
    return deleteCategoryInDb(id);
  },
  async getTotalProducts(): Promise<number> {
    const products = await this.getProducts();
    return products.length;
  },
  async getTotalStockValue(): Promise<number> {
    const products = await this.getProducts();
    return products.reduce((sum, p) => sum + (p.qtyOnHand * p.costPrice), 0);
  },
  async returnStockForCancelledOrder(event: SalesOrderCancelledEvent): Promise<Product[]> {
    const updatedProducts: Product[] = [];
    for (const item of event.items) {
      const product = await this.getProduct(item.productId);
      if (!product || product.type !== 'physical') continue;
      const updatedProduct = await this.updateStock(item.productId, Math.max(Number(item.quantity) || 0, 0), event.orderId);
      if (updatedProduct) updatedProducts.push(updatedProduct);
    }
    return updatedProducts;
  },
};

export default inventoryService;
