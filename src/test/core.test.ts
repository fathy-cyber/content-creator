import { describe, it, expect, beforeEach } from 'vitest';
import { kernel } from '../src/core/kernel/Kernel';
import { controllerRegistry } from '../src/core/controllers/ControllerRegistry';
import { componentRegistry } from '../src/core/react/ComponentRegistry';
import { eventBus } from '../src/core/events/EventBus';
import { route, Controller } from '../src/core/controllers/Controller';

@Controller('test-module')
class TestController {
  @route('/hello', 'GET')
  sayHello(params: any, req: any, res: any) {
    return { message: `Hello, ${params.name}!` };
  }

  @route('/add', 'POST')
  add(params: { a: number; b: number }, req: any, res: any) {
    return params.a + params.b;
  }
}

describe('Kernel Core', () => {
  beforeEach(() => {
    (kernel as any)._isBooted = false;
    (kernel as any)._adapter = undefined;
    (kernel as any).modules.clear();
  });

  describe('Kernel', () => {
    it('should create kernel instance', () => {
      expect(kernel).toBeDefined();
      expect(kernel.isBooted).toBe(false);
    });

    it('should register and boot a module', async () => {
      const dummyAdapter = {
        query: async () => ({ rows: [] }),
        execute: async () => ({}),
      } as any;

      await kernel.init(dummyAdapter);

      kernel.registerModule({
        id: 'test-module',
        name: 'Test Module',
        version: '1.0.0',
        description: 'Test',
        icon: 'Test',
        color: '#000',
        category: 'test',
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
      });

      await kernel.boot(['test-module']);

      expect(kernel.isBooted).toBe(true);
      const mod = kernel.getModule('test-module');
      expect(mod?.status).toBe('active');
    });

    it('should resolve dependency order', async () => {
      const dummyAdapter = {
        query: async () => ({ rows: [] }),
        execute: async () => ({}),
      } as any;

      await kernel.init(dummyAdapter);

      kernel.registerModule({
        id: 'module-a',
        name: 'Module A',
        version: '1.0.0',
        description: 'A',
        icon: 'A',
        color: '#000',
        category: 'test',
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
      });

      kernel.registerModule({
        id: 'module-b',
        name: 'Module B',
        version: '1.0.0',
        description: 'B',
        icon: 'B',
        color: '#000',
        category: 'test',
        depends: ['module-a'],
        requiredTier: 'free',
        isCore: false,
        routes: [],
        sidebarItems: [],
        models: [],
        views: [],
        dashboardWidgets: [],
        settingsPages: [],
        actions: [],
      });

      await kernel.boot(['module-a', 'module-b']);

      expect(kernel.isBooted).toBe(true);
    });
  });

  describe('ControllerRegistry', () => {
    it('should register controller', () => {
      const controller = new TestController();
      controllerRegistry.register(controller);

      const endpoint = controllerRegistry.getEndpoint('GET', '/hello');
      expect(endpoint).toBeDefined();
      expect(endpoint?.methodName).toBe('sayHello');
    });

    it('should handle RPC call', async () => {
      const controller = new TestController();
      controllerRegistry.register(controller);

      const endpoint = controllerRegistry.getEndpoint('POST', '/add');
      expect(endpoint).toBeDefined();

      const result = await endpoint?.instance[endpoint.methodName]({ a: 5, b: 10 }, {}, {});
      expect(result).toBe(15);
    });

    it('should unregister module', () => {
      const controller = new TestController();
      controllerRegistry.register(controller);
      controllerRegistry.unregisterModule('test-module');

      const endpoint = controllerRegistry.getEndpoint('GET', '/hello');
      expect(endpoint).toBeUndefined();
    });
  });

  describe('ComponentRegistry', () => {
    it('should register components', () => {
      const TestComponent = () => 'test';

      componentRegistry.register({
        name: 'TestComp',
        component: TestComponent,
        moduleId: 'test',
      });

      const reg = componentRegistry.get('TestComp');
      expect(reg).toBeDefined();
      expect(reg?.name).toBe('TestComp');
    });

    it('should unregister module components', () => {
      componentRegistry.unregisterModule('test');
      const reg = componentRegistry.get('TestComp');
      expect(reg).toBeUndefined();
    });
  });

  describe('EventBus', () => {
    it('should emit and receive events', async () => {
      let received = false;
      eventBus.on('test:event', () => {
        received = true;
      });

      await eventBus.emit('test:event', { data: 'test' });
      expect(received).toBe(true);
      eventBus.removeAllListeners();
    });

    it('should support wildcard patterns', async () => {
      let count = 0;
      eventBus.on('test:*', () => count++);
      eventBus.on('test:foo', () => {});
      eventBus.on('test:bar', () => {});

      await eventBus.emit('test:foo', {});
      await eventBus.emit('test:bar', {});

      expect(count).toBe(2);
      eventBus.removeAllListeners();
    });

    it('should support channel pub/sub', () => {
      let received = false;
      eventBus.subscribe('crm', () => {
        received = true;
      });

      eventBus.publish('crm', { id: 1 });

      expect(received).toBe(true);
      eventBus.removeAllListeners();
    });

    it('should get channel history', () => {
      eventBus.publish('crm', { id: 1 });
      eventBus.publish('crm', { id: 2 });
      eventBus.publish('other', { id: 3 });

      const history = eventBus.getChannelHistory('crm');
      expect(history.length).toBe(2);

      const all = eventBus.getChannelHistory();
      expect(all.length).toBe(3);

      eventBus.removeAllListeners();
    });
  });
});