/**
 * ServiceRegistry provides a centralized location for registering and retrieving
 * singleton services across the application.
 */
export class ServiceRegistry {
    private services = new Map<string, unknown>();

    registerService<T>(name: string, instance: T): void {
        this.services.set(name, instance);
    }

    getService<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            const registered = this.listServices().join(', ');
            throw new Error(`ServiceNotFoundError: Service '${name}' not found. Registered: [${registered}]`);
        }
        return service as T;
    }

    hasService(name: string): boolean {
        return this.services.has(name);
    }

    unregisterService(name: string): void {
        this.services.delete(name);
    }

    listServices(): string[] {
        return Array.from(this.services.keys());
    }
}

export const serviceRegistry = new ServiceRegistry();

export const getService = <T>(name: string) => serviceRegistry.getService<T>(name);
export const registerService = <T>(name: string, instance: T) => serviceRegistry.registerService(name, instance);
