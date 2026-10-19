
import { Kernel } from './src/core/kernel/Kernel';
import { Controller, route } from './src/core/controllers/Controller';
import { kernel } from './src/core/kernel/Kernel';

@Controller('test-module')
class TestController {
  @route('/hello')
  sayHello(params: any) {
    return `Hello, ${params.name}!`;
  }

  @route('/add')
  add(params: { a: number, b: number }) {
    return params.a + params.b;
  }
}

async function runTest() {
  console.log('Starting test...');
  
  // In a real scenario, we would have a database adapter.
  // For this test, we'll mock it or just bypass it if Kernel allows.
  // Since Kernel.init requires an adapter, we need a dummy one.
  const dummyAdapter = {
    // Minimal implementation of DatabaseAdapter
    query: async () => ({ rows: [] }),
    execute: async () => ({}),
    // Add other necessary methods if needed
  } as any;

  await kernel.init(dummyAdapter);
  
  // Register the module containing the controller
  kernel.registerModule({
    id: 'test-module',
    name: 'Test Module',
    version: '1.0.0',
    description: 'Test module for RPC',
    icon: 'Settings',
    color: '#000',
    category: 'system',
    depends: [],
    requiredTier: 'free',
    isCore: false,
    routes: [],
    sidebarItems: [],
    models: [],
    views: [],
    dashboardWidgets: [],
    settingsPages: [],
    actions: [],
    controllers: [TestController]
  } as any);

  await kernel.boot();

  const port = 3001;
  await kernel.startGateway(port);

  console.log('Gateway started. Making requests...');

  // Test /hello
  const res1 = await fetch(`http://localhost:${port}/rpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: '/hello',
      params: { name: 'World' },
      id: 1
    })
  });
  const json1 = await res1.json();
  console.log('Request 1 (/hello):', JSON.stringify(json1));
  if (json1.result !== 'Hello, World!') {
    throw new Error(`Expected 'Hello, World!', got '${json1.result}'`);
  }

  // Test /add
  const res2 = await fetch(`http://localhost:${port}/rpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: '/add',
      params: { a: 5, b: 10 },
      id: 2
    })
  });
  const json2 = await res2.json();
  console.log('Request 2 (/add):', JSON.stringify(json2));
  if (json2.result !== 15) {
    throw new Error(`Expected 15, got '${json2.result}'`);
  }

  // Test non-existent method
  const res3 = await fetch(`http://localhost:${port}/rpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: '/nonexistent',
      id: 3
    })
  });
  const json3 = await res3.json();
  console.log('Request 3 (/nonexistent):', JSON.stringify(json3));
  if (json3.error?.code !== -32601) {
    throw new Error(`Expected error code -32601, got ${json3.error?.code}`);
  }

  console.log('All tests passed!');
  await kernel.stopGateway();
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
