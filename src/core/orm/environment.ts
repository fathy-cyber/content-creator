import type { ServiceContainer } from '../kernel/ServiceContainer';
import type { ModelRegistry, Model } from './Model';
import type { DatabaseAdapter } from './Model';
import { Recordset } from './Recordset';

export interface Environment {
  cr?: unknown;
  uid: string | number;
  user: string | number;
  context: Record<string, any>;
  services: ServiceContainer;
  registry: ModelRegistry;
  adapter: DatabaseAdapter;
  /**
   * Shortcut to access models via the registry.
   * Returns a Recordset with empty IDs.
   * Usage: env.models['res.partner'].search([])
   */
  readonly models: Record<string, Recordset>;
  model(modelName: string): Recordset;
  withContext(newContext: Record<string, any>): Environment;
  withUser(newUser: string | number): Environment;
}

export class EnvironmentImpl implements Environment {
  public readonly models: Record<string, Recordset>;

  constructor(
    public user: string | number,
    public context: Record<string, any>,
    public services: ServiceContainer,
    public registry: ModelRegistry,
    public adapter: DatabaseAdapter
  ) {
    // Initialize the models proxy/shortcut
    this.models = this.createModelsProxy();
  }

  get uid(): string | number {
    return this.user;
  }

  model(modelName: string): Recordset {
    const model = this.registry.get(modelName);
    if (!model) {
      throw new Error(`[Environment] Model "${modelName}" not found in registry.`);
    }
    return new Recordset(model, [], this);
  }

  /**
   * Creates a proxy object for the models shortcut to ensure
   * it always returns a Recordset for the given model.
   */
  private createModelsProxy(): Record<string, Recordset> {
    return new Proxy({} as Record<string, Recordset>, {
      get: (_, modelName: string) => {
        return this.model(modelName);
      },
    });
  }

  /**
   * Creates a new environment instance with updated context or user.
   * Equivalent to Odoo's env.with_context() or env.with_user()
   */
  withContext(newContext: Record<string, any>): Environment {
    return new EnvironmentImpl(
      this.user,
      { ...this.context, ...newContext },
      this.services,
      this.registry,
      this.adapter
    );
  }

  withUser(newUser: string | number): Environment {
    return new EnvironmentImpl(
      newUser,
      this.context,
      this.services,
      this.registry,
      this.adapter
    );
  }
}
