
import { salesService } from './src/modules/sales/salesService';
import { inventoryService } from './src/modules/inventory/inventoryService';
import { eventBus } from './src/shared/events';

async function testStockDeduction() {
  console.log('--- Testing Stock Deduction Flow ---');

  // 1. Find a physical product and check initial stock
  const products = await inventoryService.getProducts();
  const physicalProduct = products.find(p => p.type === 'physical');
  if (!physicalProduct) {
    console.error('No physical product found for testing');
    return;
  }
  const initialStock = physicalProduct.qtyOnHand;
  console.log(`Product: ${physicalProduct.name}, Initial Stock: ${initialStock}`);

  // 2. Create a sales order with this product
  const order = await salesService.createOrder({
    customerId: 'CUST-TEST',
    customerName: 'Test Customer',
    items: [
      {
        id: 'ITEM-TEST',
        productId: physicalProduct.id,
        productName: physicalProduct.name,
        quantity: 2,
        unitPrice: physicalProduct.salePrice,
        discount: 0,
        total: physicalProduct.salePrice * 2,
      },
    ],
  });
  console.log(`Order created: ${order.number}`);

  // 3. Confirm the order
  console.log('Confirming order...');
  await salesService.confirmOrder(order.id);

  // 4. Check stock after confirmation
  // Since the event is emitted asynchronously (void eventBus.emit), 
  // we need to wait a bit for the listener to finish.
  await new Promise(resolve => setTimeout(resolve, 100));

  const updatedProduct = await inventoryService.getProduct(physicalProduct.id);
  const finalStock = updatedProduct?.qtyOnHand;
  console.log(`Final Stock: ${finalStock}`);

  if (finalStock === initialStock - 2) {
    console.log('✅ SUCCESS: Stock deducted correctly');
  } else {
    console.error(`❌ FAILURE: Stock not deducted. Expected ${initialStock - 2}, got ${finalStock}`);
  }
}

testStockDeduction().catch(console.error);
