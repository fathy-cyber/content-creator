/**
 * ServiceContainer — Simple dependency injection container.
 * 
 * Modules register services, and other modules can retrieve them.
 * Supports lazy factories and singleton/transient patterns.
 */

import type { ServiceMap } from '../types/ModuleManifest';

type Factory<T = any> = () => T;

interface ServiceEntry {
  instance?: any;
  factory?: Factory;
  singleton: boolean;
}

export class ServiceContainer implements ServiceMap {
  private services = new Map<string, ServiceEntry>();
  private aliases = new Map<string, string>();

  /**
   * Register a service instance directly.
   */
  register<T>(name: string, instance: T): void {
    this.services.set(name, { instance, singleton: true });
  }

  /**
   * Register a service factory (lazy instantiation).
   * If singleton is true (default), the factory is called once and cached.
   */
  registerFactory<T>(name: string, factory: Factory<T>, singleton = true): void {
    this.services.set(name, { factory, singleton });
  }

  /**
   * Register an alias for a service name.
   */
  alias(aliasName: string, targetName: string): void {
    this.aliases.set(aliasName, targetName);
  }

  /**
   * Get a service by name.
   * @throws if service not found
   */
  get<T = any>(name: string): T {
    const resolvedName = this.aliases.get(name) ?? name;
    const entry = this.services.get(resolvedName);
    
    if (!entry) {
      throw new Error(`[ServiceContainer] Service "${name}" not found. Available: ${this.listServices().join(', ')}`);
    }

    // Already instantiated
    if (entry.instance !== undefined) {
      return entry.instance as T;
    }

    // Factory — create instance
    if (entry.factory) {
      const instance = entry.factory();
      if (entry.singleton) {
        entry.instance = instance;
      }
      return instance as T;
    }

    throw new Error(`[ServiceContainer] Service "${name}" has no instance or factory.`);
  }

  /**
   * Check if a service exists.
   */
  has(name: string): boolean {
    const resolvedName = this.aliases.get(name) ?? name;
    return this.services.has(resolvedName);
  }

  /**
   * Remove a service.
   */
  remove(name: string): void {
    this.services.delete(name);
    // Remove any aliases pointing to this service
    for (const [alias, target] of this.aliases.entries()) {
      if (target === name) {
        this.aliases.delete(alias);
      }
    }
  }

  /**
   * List all registered service names.
   */
  listServices(): string[] {
    return [...this.services.keys()];
  }

  /**
   * Clear all services.
   */
  clear(): void {
    this.services.clear();
    this.aliases.clear();
  }
}
