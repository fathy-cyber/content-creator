/**
 * ViewRegistry — Central registry for model views.
 * 
 * Modules register their view configurations (list, form, kanban, etc.)
 * and the registry provides them on demand to the view engine.
 */

import type { ViewRegistration, ViewType } from '../types/ModuleManifest';

export class ViewRegistry {
  private views = new Map<string, ViewRegistration[]>();

  /**
   * Register a view configuration.
   * Key format: "model.name:viewType"
   */
  register(view: ViewRegistration): void {
    const key = `${view.model}:${view.type}`;
    const existing = this.views.get(key) ?? [];
    existing.push(view);
    this.views.set(key, existing);
  }

  /**
   * Register multiple views at once.
   */
  registerAll(views: ViewRegistration[]): void {
    for (const view of views) {
      this.register(view);
    }
  }

  /**
   * Get the first view matching model and type.
   */
  get(model: string, type: ViewType): ViewRegistration | undefined {
    const key = `${model}:${type}`;
    const views = this.views.get(key);
    return views?.[0];
  }

  /**
   * Get all views for a model.
   */
  getForModel(model: string): ViewRegistration[] {
    const result: ViewRegistration[] = [];
    for (const [key, views] of this.views) {
      if (key.startsWith(`${model}:`)) {
        result.push(...views);
      }
    }
    return result;
  }

  /**
   * Get available view types for a model.
   */
  getAvailableTypes(model: string): ViewType[] {
    const types: ViewType[] = [];
    for (const key of this.views.keys()) {
      if (key.startsWith(`${model}:`)) {
        const type = key.split(':')[1] as ViewType;
        if (!types.includes(type)) {
          types.push(type);
        }
      }
    }
    return types;
  }

  /**
   * Clear all registered views.
   */
  clear(): void {
    this.views.clear();
  }
}

export const viewRegistry = new ViewRegistry();
