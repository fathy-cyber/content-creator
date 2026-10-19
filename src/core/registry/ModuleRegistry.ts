import { serviceRegistry } from './ServiceRegistry';

export interface ModuleManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    dependencies: string[];
    services: string[];
}

/**
 * ModuleRegistry handles the registration, dependency resolution, 
 * and loading order of application modules.
 */
export class ModuleRegistry {
    private modules = new Map<string, ModuleManifest>();

    /**
     * Registers a module manifest.
     * Validates that all dependencies are already registered.
     * @throws Error if a dependency is missing.
     */
    registerModule(manifest: ModuleManifest): void {
        for (const dep of manifest.dependencies) {
            if (!this.isModuleInstalled(dep)) {
                throw new Error(
                    `ModuleDependencyError: Module '${manifest.id}' depends on '${dep}', which is not yet registered.`
                );
            }
        }

        this.modules.set(manifest.id, manifest);

        // Emit event via eventBus if available
        try {
            const eventBus = serviceRegistry.getService<any>('eventBus');
            eventBus.emit('module.registered', { moduleId: manifest.id, manifest }, 'core');
        } catch (e) {
            // EventBus might not be registered yet during early boot
        }
    }

    /**
     * Retrieves a module manifest.
     */
    getModule(id: string): ModuleManifest {
        const module = this.modules.get(id);
        if (!module) {
            throw new Error(`ModuleNotFoundError: Module '${id}' not found.`);
        }
        return module;
    }

    /**
     * Checks if a module is registered.
     */
    isModuleInstalled(id: string): boolean {
        return this.modules.has(id);
    }

    /**
     * Returns a list of all registered modules.
     */
    listModules(): ModuleManifest[] {
        return Array.from(this.modules.values());
    }

    /**
     * Returns modules in dependency-resolved order using Kahn's algorithm.
     */
    getModuleLoadOrder(): string[] {
        const adj = new Map<string, string[]>();
        const inDegree = new Map<string, number>();
        const allModules = Array.from(this.modules.keys());

        for (const id of allModules) {
            inDegree.set(id, 0);
            adj.set(id, []);
        }

        for (const [id, manifest] of this.modules) {
            for (const dep of manifest.dependencies) {
                if (adj.has(dep)) {
                    adj.get(dep)!.push(id);
                    inDegree.set(id, (inDegree.get(id) || 0) + 1);
                }
            }
        }

        const queue: string[] = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0) queue.push(id);
        }

        const order: string[] = [];
        while (queue.length > 0) {
            const u = queue.shift()!;
            order.push(u);

            for (const v of adj.get(u) || []) {
                inDegree.set(v, inDegree.get(v)! - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            }
        }

        if (order.length !== allModules.length) {
            throw new Error('ModuleDependencyError: Circular dependency detected in module graph.');
        }

        return order;
    }
}

export const moduleRegistry = new ModuleRegistry();
