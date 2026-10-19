import type React from 'react';

export interface ComponentRegistration {
  name: string;
  component: React.ComponentType<any>;
  moduleId: string;
}

export class ComponentRegistry {
  private components = new Map<string, ComponentRegistration>();

  register(registration: ComponentRegistration): void {
    if (this.components.has(registration.name)) {
      console.warn(`[ComponentRegistry] Component "${registration.name}" already registered. Replacing.`);
    }
    this.components.set(registration.name, registration);
  }

  registerMultiple(registrations: ComponentRegistration[]): void {
    for (const reg of registrations) {
      this.register(reg);
    }
  }

  get(name: string): ComponentRegistration | undefined {
    return this.components.get(name);
  }

  getComponent(name: string): React.ComponentType<any> | undefined {
    return this.components.get(name)?.component;
  }

  unregister(name: string): void {
    this.components.delete(name);
  }

  unregisterModule(moduleId: string): void {
    for (const [name, reg] of this.components) {
      if (reg.moduleId === moduleId) {
        this.components.delete(name);
      }
    }
  }

  getAll(): ComponentRegistration[] {
    return [...this.components.values()];
  }

  getByModule(moduleId: string): ComponentRegistration[] {
    return [...this.components.values()].filter(r => r.moduleId === moduleId);
  }
}

export const componentRegistry = new ComponentRegistry();