/**
 * Kernel — The central orchestrator for the modular ERP system.
 *
 * Responsibilities:
 * - Registers and manages module manifests
 * - Resolves dependencies via topological sort
 * - Calls lifecycle hooks in correct order
 * - Provides the service container to modules
 * - Collects routes, sidebar items, models, views from all active modules
 */

import type {
  ModuleManifest,
  ModuleState,
  ModuleStatus,
  RouteDefinition,
  SidebarItem,
  ModelDefinition,
  ViewRegistration,
  WidgetDefinition,
  SettingsPageDef,
  ActionDefinition,
} from '../types/ModuleManifest';
import type { DataService } from '../services/DataService';
import { EventBus, eventBus } from '../events/EventBus';
import { ServiceContainer } from './ServiceContainer';
import { ModelRegistry } from '../orm/Model';
import { EnvironmentImpl } from '../orm/environment';
import type { Environment } from '../orm/environment';
import { SecurityServiceImpl } from '../services/SecurityService';
import { DataServiceImpl } from '../services/DataService';
import { ControllerRegistry, controllerRegistry } from '../controllers/ControllerRegistry';
import type { DatabaseAdapter } from '../orm/Model';
import { registerService } from '../registry/ServiceRegistry';

// ─── Fix #17: Concurrent init guard ───────────────────────────────────────────
type KernelInitState = 'uninitialized' | 'initializing' | 'initialized';

export class Kernel {
  private modules = new Map<string, ModuleState>();
  private bootOrder: string[] = [];
  private _isBooted = false;
  private _isBooting = false;

  // ─── Fix #17: replace simple _adapter guard with explicit state ─────────────
  private _initState: KernelInitState = 'uninitialized';
  private _adapter?: DatabaseAdapter;

  // ─── Fix #14: registry is typed as ModelRegistry | null, not {} as any ──────
  private _registry: ModelRegistry | null = null;

  public readonly services: ServiceContainer;
  public readonly events: EventBus;

  constructor() {
    this.services = new ServiceContainer();
    this.events = eventBus;
  }

  // ─── Fix #14: Safe registry accessor ──────────────────────────────────────
  get registry(): ModelRegistry {
    if (!this._registry) {
      throw new Error(
        '[Kernel] ModelRegistry not initialized. Call init() before accessing registry.'
      );
    }
    return this._registry;
  }

  get adapter(): DatabaseAdapter {
    if (!this._adapter) {
      throw new Error('[Kernel] Adapter not initialized. Call init() first.');
    }
    return this._adapter;
  }

  // ─── Fix #5: Guard in boot() will use this to give clear error ────────────
  get isInitialized(): boolean {
    return this._initState === 'initialized';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // init()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Initialize the kernel with a database adapter.
   * Safe to call only once. Concurrent calls are blocked.
   */
  async init(adapter: DatabaseAdapter): Promise<void> {
    // ─── Fix #17: Block concurrent calls, not just repeated calls ─────────
    if (this._initState !== 'uninitialized') {
      return;
    }
    this._initState = 'initializing';

    try {
      this._adapter = adapter;

      // ─── Fix #14: Proper ModelRegistry initialization ──────────────────
      this._registry = new ModelRegistry(adapter);

      // Register core services
      this.services.register('kernel', this);
      registerService('kernel', this);
      this.services.register('eventBus', this.events);
      registerService('eventBus', this.events);
      this.services.alias('bus', 'eventBus');
      this.services.register('services', this.services);
      registerService('services', this.services);
      this.services.register('registry', this._registry);
      registerService('registry', this._registry);
      this.services.alias('odoo.registry', 'registry');
      this.services.registerFactory('env', () => this.createEnv('current_user'), false);
       this.services.register('security', new SecurityServiceImpl());
       const security = this.services.get('security');
       registerService('security', security);
       this.services.register('data', new DataServiceImpl());
       const data = this.services.get('data');
       registerService('data', data);
       this.services.register('controllers', controllerRegistry);
       registerService('controllers', controllerRegistry);


      this._initState = 'initialized';
    } catch (err) {
      // Reset so caller can retry if needed
      this._initState = 'uninitialized';
      this._adapter = undefined;
      this._registry = null;
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // registerModule() / registerModules()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Register a module manifest.
   */
  registerModule(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.id)) {
      return;
    }

    this.modules.set(manifest.id, {
      manifest,
      status: 'registered',
    });

    // ─── Fix #6: Only emit if eventBus is ready (it always is — eventBus ──
    // is initialized in constructor, independent of init(). Safe to emit.
       this.events.emit('kernel:module.registered', { moduleId: manifest.id }, 'kernel');

  }

  /**
   * Register multiple modules at once.
   */
  registerModules(manifests: ModuleManifest[]): void {
    for (const manifest of manifests) {
      this.registerModule(manifest);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // boot()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Boot the kernel: resolve dependencies, install, and activate all modules.
   */
  async boot(installedIds?: string[]): Promise<void> {
    if (this._isBooted || this._isBooting) {
      return;
    }

    // ─── Fix #5: Guard — init() must have been called first ───────────────
    if (!this.isInitialized) {
      throw new Error(
        '[Kernel] boot() called before init(). Call kernel.init(adapter) first.'
      );
    }

    this._isBooting = true;

    try {
      // ─── Fix #8: Safe isCore check ────────────────────────────────────
      const toActivate = installedIds
        ? [...this.modules.keys()].filter(id => {
            const mod = this.modules.get(id)!;
            return mod.manifest.isCore === true || installedIds.includes(id);
          })
        : [...this.modules.keys()];

      // ─── Fix #10: Validate that all dependencies exist before resolving ─
      this.validateDependencies(toActivate);

      // Resolve boot order via topological sort
      this.bootOrder = this.resolveBootOrder(toActivate);

      // ─── Fix #7: Guard against undefined models array ─────────────────
      for (const moduleId of this.bootOrder) {
        const state = this.modules.get(moduleId);
        if (state && state.status !== 'error') {
          const models = state.manifest.models ?? [];
          for (const modelDef of models) {
            this.registry.register(modelDef);
          }
        }
      }

      // Load the registry to instantiate models in correct inheritance order
      await this.registry.load();

      // ─── Fix #4: Await all service loading before activation ──────────
      for (const moduleId of this.bootOrder) {
        const state = this.modules.get(moduleId);
        if (state?.manifest.services) {
          for (const [serviceName, serviceValue] of Object.entries(
            state.manifest.services
          )) {
            try {
              let serviceInstance;
              if (typeof serviceValue === 'function') {
                const mod = await serviceValue();
                serviceInstance = mod.default ?? mod;
              } else {
                serviceInstance = serviceValue;
              }
              this.services.register(serviceName, serviceInstance);
              registerService(serviceName, serviceInstance);
            } catch (err) {
              console.error(
                `[Kernel] Failed to load service "${serviceName}" ` +
                `for module "${moduleId}":`,
                err
              );
              // Do not rethrow — a failed service is logged but does not
              // abort the entire boot. The module activation will catch the
              // missing service dependency and mark itself as errored.
            }
          }
        }
      }

      // Activate modules in dependency order
      for (const moduleId of this.bootOrder) {
        await this.activateModule(moduleId);
      }

      // ─── Fix #1 #2 #19: Set booted ONLY after all activations succeed ─
      this._isBooted = true;
       this.events.emit('kernel:booted', { modules: this.bootOrder }, 'kernel');

    } catch (err) {
      // ─── Fix #13: Clean reset on boot failure so re-boot is possible ──
      this._isBooted = false;
      console.error('[Kernel] Boot failed:', err);
      throw err;
    } finally {
      // ─── Fix #2: Always clear _isBooting regardless of outcome ────────
      this._isBooting = false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // activateModule()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Activate a single module by running its lifecycle hooks.
   */
  private async activateModule(moduleId: string): Promise<void> {
    const state = this.modules.get(moduleId);
    if (!state) return;
    if (state.status === 'active') return;

    // Check all dependencies are active before proceeding
    for (const depId of state.manifest.depends ?? []) {
      const dep = this.modules.get(depId);
      if (!dep || dep.status !== 'active') {
        state.status = 'error';
        state.error = `Missing dependency: "${depId}" is not active.`;
        console.error(
          `[Kernel] Cannot activate "${moduleId}": ` +
          `dependency "${depId}" is not active.`
        );
        return;
      }
    }

    try {
      // pre_init_hook: runs before any activation work
      if (state.manifest.pre_init_hook) {
        await state.manifest.pre_init_hook(this.services);
      }

      // onActivate: main activation lifecycle hook
      if (state.manifest.onActivate) {
        await state.manifest.onActivate(this.services);
      }

      // Register controllers from manifest
      // ─── Fix #9: Pass services to controller constructor ───────────────
      if (state.manifest.controllers) {
        const registry = this.services.get<ControllerRegistry>('controllers');
        for (const ControllerClass of state.manifest.controllers) {
          const controller = new (ControllerClass as any)(this.services);
          registry.register(controller);
        }
      }

      // ─── Fix #12: Mark active AFTER post_init_hook succeeds ───────────
      // post_init_hook: runs after activation, before marking active
      if (state.manifest.post_init_hook) {
        await state.manifest.post_init_hook(this.services);
      }

      // Only mark active when ALL hooks have completed successfully
      state.status = 'active';
      state.activatedAt = new Date().toISOString();

       this.events.emit('kernel:module.activated', { moduleId }, 'kernel');

    } catch (err) {
      // ─── Fix #3: activateModule does NOT touch _isBooting ─────────────
      state.status = 'error';
      state.error = err instanceof Error ? err.message : String(err);
      console.error(`[Kernel] Error activating "${moduleId}":`, err);
      // Rethrow so boot() catch block can handle it
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // installModule()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Install a module at runtime (after boot).
   */
  async installModule(moduleId: string): Promise<boolean> {
    const state = this.modules.get(moduleId);
    if (!state) {
      console.error(`[Kernel] Module "${moduleId}" not found in registry.`);
      return false;
    }

    // Check all dependencies are active
    for (const depId of state.manifest.depends ?? []) {
      const dep = this.modules.get(depId);
      if (!dep || dep.status !== 'active') {
        console.error(
          `[Kernel] Cannot install "${moduleId}": ` +
          `dependency "${depId}" is not active.`
        );
        return false;
      }
    }

    try {
      if (state.manifest.onInstall) {
        await state.manifest.onInstall();
      }

      // ─── Fix #7: Guard models array ───────────────────────────────────
      const models = state.manifest.models ?? [];
      for (const modelDef of models) {
        this.registry.register(modelDef);
      }
      await this.registry.load();

      const dataService = this.services.get<DataService>('data');
      const systemEnv = this.createEnv('system');

      if (state.manifest.data) {
        await dataService.loadData(systemEnv, state.manifest.data);
      }

      // ─── Fix #18: Only load demo data in non-production environments ──
      if (
        state.manifest.demo &&
        process.env.NODE_ENV !== 'production'
      ) {
        await dataService.loadData(systemEnv, state.manifest.demo);
      }

      state.status = 'installed';
      state.installedAt = new Date().toISOString();

      // Activate after install
      await this.activateModule(moduleId);

       this.events.emit('kernel:module.installed', { moduleId }, 'kernel');

      return true;
    } catch (err) {
      state.status = 'error';
      state.error = err instanceof Error ? err.message : String(err);
      console.error(`[Kernel] Error installing "${moduleId}":`, err);
      return false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // uninstallModule()
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Uninstall a module at runtime.
   */
  async uninstallModule(moduleId: string): Promise<boolean> {
    const state = this.modules.get(moduleId);
    if (!state) return false;

    if (state.manifest.isCore === true) {
      console.error(`[Kernel] Cannot uninstall core module "${moduleId}".`);
      return false;
    }

    // Prevent uninstall if other active modules depend on this one
    const dependents = this.getDependents(moduleId);
    if (dependents.length > 0) {
      console.error(
        `[Kernel] Cannot uninstall "${moduleId}": ` +
        `required by active modules: ${dependents.join(', ')}`
      );
      return false;
    }

    try {
      // ─── Fix #11: Isolate each hook in its own try/catch ──────────────
      if (state.manifest.onDeactivate) {
        try {
          await state.manifest.onDeactivate();
        } catch (err) {
          console.error(
            `[Kernel] onDeactivate hook failed for "${moduleId}":`,
            err
          );
          // Continue with uninstall despite deactivate hook failure
        }
      }

      // Unregister controllers
      if (state.manifest.controllers) {
        try {
          const registry = this.services.get<ControllerRegistry>('controllers');
          registry.unregisterModule(moduleId);
        } catch (err) {
          console.error(
            `[Kernel] Failed to unregister controllers for "${moduleId}":`,
            err
          );
        }
      }

      if (state.manifest.onUninstall) {
        try {
          await state.manifest.onUninstall();
        } catch (err) {
          console.error(
            `[Kernel] onUninstall hook failed for "${moduleId}":`,
            err
          );
          // Continue with state reset despite hook failure
        }
      }

      // Reset module state
      state.status = 'registered';
      state.installedAt = undefined;
      state.activatedAt = undefined;
      state.error = undefined;

       this.events.emit('kernel:module.uninstalled', { moduleId }, 'kernel');

      return true;
    } catch (err) {
      console.error(`[Kernel] Error uninstalling "${moduleId}":`, err);
      return false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Dependency Resolution
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Validate that all declared dependencies exist in the module registry.
   * Throws with a clear message listing all missing dependencies.
   *
   * ─── Fix #15: Missing dependency detection before boot ─────────────────
   */
  private validateDependencies(moduleIds: string[]): void {
    const errors: string[] = [];

    for (const id of moduleIds) {
      const state = this.modules.get(id);
      if (!state) continue;

      for (const depId of state.manifest.depends ?? []) {
        if (!this.modules.has(depId)) {
          errors.push(
            `Module "${id}" depends on "${depId}" which is not registered.`
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `[Kernel] Dependency validation failed:\n${errors.map(e => `  • ${e}`).join('\n')}`
      );
    }
  }

  /**
   * Topological sort (Kahn's algorithm variant using DFS + cycle detection).
   *
   * ─── Fix #10: Dependencies not in toActivate are explicitly skipped ────
   * with a warning rather than silently ignored.
   */
  private resolveBootOrder(moduleIds: string[]): string[] {
    const moduleSet = new Set(moduleIds);
    const visited = new Set<string>();
    const visiting = new Set<string>(); // cycle detection
    const result: string[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;

      if (visiting.has(id)) {
        throw new Error(
          `[Kernel] Circular dependency detected involving "${id}". ` +
          `Chain: ${[...visiting].join(' → ')} → ${id}`
        );
      }

      visiting.add(id);

      const state = this.modules.get(id);
      if (state) {
        for (const depId of state.manifest.depends ?? []) {
          if (moduleSet.has(depId)) {
            // Dependency is in the activation set — visit it first
            visit(depId);
          } else if (this.modules.has(depId)) {
            // Dependency exists but is not in activation set
            // ─── Fix #10: Warn instead of silently skipping ─────────────
            const depState = this.modules.get(depId);
            if (depState?.status !== 'active') {
              console.warn(
                `[Kernel] Module "${id}" depends on "${depId}" which is ` +
                `registered but not included in the activation set ` +
                `and is not active. This may cause activation failure.`
              );
            }
          }
          // If not in modules at all: validateDependencies() already caught it
        }
      }

      visiting.delete(id);
      visited.add(id);
      result.push(id);
    };

    for (const id of moduleIds) {
      visit(id);
    }

    return result;
  }

  /**
   * Get active modules that depend on the given module ID.
   */
  private getDependents(moduleId: string): string[] {
    const dependents: string[] = [];
    for (const [id, state] of this.modules) {
      if (
        state.status === 'active' &&
        (state.manifest.depends ?? []).includes(moduleId)
      ) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Accessors
  // ──────────────────────────────────────────────────────────────────────────

  get isBooted(): boolean {
    return this._isBooted;
  }

  /**
   * Get all modules, optionally filtered by status.
   */
  getModules(statusFilter?: ModuleStatus): ModuleState[] {
    const all = [...this.modules.values()];
    return statusFilter ? all.filter(m => m.status === statusFilter) : all;
  }

  /**
   * Get a specific module state by ID.
   */
  getModule(moduleId: string): ModuleState | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Create an Odoo-style environment: env.uid, env.context, env.model().
   *
   * ─── Fix #20: context typed as Record<string, unknown> ─────────────────
   */
  createEnv(
    user: string | number = 'system',
    context: Record<string, unknown> = {}
  ): Environment {
    return new EnvironmentImpl(
      user,
      context,
      this.services,
      this.registry,
      this.adapter
    );
  }

  /**
   * Shortcut to env.model(modelName).
   *
   * ─── Fix #21: env parameter is now optional and lazily created only ─────
   * when needed, avoiding unnecessary allocation on every call.
   */
  model(modelName: string, env?: Environment): ReturnType<Environment['model']> {
    const resolvedEnv = env ?? this.createEnv();
    return resolvedEnv.model(modelName);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Manifest Collectors — Fix #16: safe fallback to [] on undefined arrays
  // ──────────────────────────────────────────────────────────────────────────

  /** Collect all routes from active modules. */
  getRoutes(): RouteDefinition[] {
    return this.getModules('active').flatMap(m => m.manifest.routes ?? []);
  }

  /** Collect all sidebar items from active modules, sorted by sequence. */
  getSidebarItems(): SidebarItem[] {
    return this.getModules('active')
      .flatMap(m => m.manifest.sidebarItems ?? [])
      .sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));
  }

  /** Collect all model definitions from active modules. */
  getModels(): ModelDefinition[] {
    return this.getModules('active').flatMap(m => m.manifest.models ?? []);
  }

  /** Get a model definition by name. */
  getModel(modelName: string): ModelDefinition | undefined {
    return this.getModels().find(m => m.name === modelName);
  }

  /** Collect all view registrations from active modules. */
  getViews(): ViewRegistration[] {
    return this.getModules('active').flatMap(m => m.manifest.views ?? []);
  }

  /** Get views registered for a specific model. */
  getViewsForModel(modelName: string): ViewRegistration[] {
    return this.getViews().filter(v => v.model === modelName);
  }

  /** Collect all dashboard widgets from active modules, sorted by sequence. */
  getDashboardWidgets(): WidgetDefinition[] {
    return this.getModules('active')
      .flatMap(m => m.manifest.dashboardWidgets ?? [])
      .sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));
  }

  /** Collect all settings pages from active modules, sorted by sequence. */
  getSettingsPages(): SettingsPageDef[] {
    return this.getModules('active')
      .flatMap(m => m.manifest.settingsPages ?? [])
      .sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));
  }

  /** Collect all action definitions from active modules. */
  getActions(): ActionDefinition[] {
    return this.getModules('active').flatMap(m => m.manifest.actions ?? []);
  }

  /**
   * Get declared dependencies for a module.
   */
  getDependencies(moduleId: string): string[] {
    return this.modules.get(moduleId)?.manifest.depends ?? [];
  }

  /**
   * Get the resolved boot order (available after boot()).
   */
  getBootOrder(): string[] {
    return [...this.bootOrder];
  }

  /**
   * Diagnostic summary — useful for debugging and admin dashboards.
   */
  getDiagnostics(): {
    isInitialized: boolean;
    isBooted: boolean;
    isBooting: boolean;
    moduleCount: number;
    activeModules: string[];
    errorModules: Array<{ id: string; error: string }>;
    bootOrder: string[];
  } {
    const errorModules = [...this.modules.entries()]
      .filter(([, s]) => s.status === 'error')
      .map(([id, s]) => ({ id, error: s.error ?? 'unknown error' }));

    return {
      isInitialized: this.isInitialized,
      isBooted: this._isBooted,
      isBooting: this._isBooting,
      moduleCount: this.modules.size,
      activeModules: this.getModules('active').map(m => m.manifest.id),
      errorModules,
      bootOrder: [...this.bootOrder],
    };
  }
}

// ─── Singleton kernel instance ────────────────────────────────────────────────
export const kernel = new Kernel();
