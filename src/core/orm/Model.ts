import type { FieldDefinition, ModelDefinition } from '../types/ModuleManifest';
import type { Environment } from './environment';
import { context } from './context';

// ─── Types ─────────────────────────────────────────────────

export type DomainOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'like' | 'ilike' | 'in' | 'not in' | 'is' | 'is not';
export type DomainTuple = [string, DomainOperator, any];
export type Domain = DomainTuple[];

export interface SearchOptions {
  limit?: number;
  offset?: number;
  order?: string;        // e.g., 'name asc, id desc'
  fields?: string[];     // Only fetch these fields
}

export interface PaginatedResult<T = Record<string, any>> {
  records: T[];
  total: number;
  offset: number;
  limit: number;
}

// ─── Database Adapter Interface ────────────────────────────

export interface DatabaseAdapter {
  create(table: string, values: Record<string, any>): Promise<Record<string, any>>;
  read(table: string, ids: (string | number)[], fields?: string[]): Promise<Record<string, any>[]>;
  search(table: string, domain: Domain, options?: SearchOptions): Promise<Record<string, any>[]>;
  searchCount(table: string, domain: Domain): Promise<number>;
  write(table: string, ids: (string | number)[], values: Record<string, any>): Promise<void>;
  unlink(table: string, ids: (string | number)[]): Promise<void>;
}

// ─── Model Class ───────────────────────────────────────────

export class Model {
  protected definition: ModelDefinition;
  protected adapter: DatabaseAdapter;
  public parentModels: Model[] = [];

  constructor(definition: ModelDefinition, adapter: DatabaseAdapter, parentModels: Model[] = []) {
    this.definition = definition;
    this.adapter = adapter;
    this.parentModels = parentModels;
  }

  get name(): string {
    return this.definition.name;
  }

  get table(): string {
    return this.definition.table;
  }

  get fields(): FieldDefinition[] {
    return this.definition.fields;
  }

  get modelDef(): ModelDefinition {
    return this.definition;
  }

  // ─── Lifecycle Hooks (to be overridden) ───────────────────

  async before_create(values: Record<string, any>, env?: Environment): Promise<void> {}
  async after_create(record: Record<string, any>, env?: Environment): Promise<void> {}
  async before_write(ids: (string | number)[], values: Record<string, any>, env?: Environment): Promise<void> {}
  async after_write(ids: (string | number)[], values: Record<string, any>, env?: Environment): Promise<void> {}
  async before_unlink(ids: (string | number)[], env?: Environment): Promise<void> {}
  async after_unlink(ids: (string | number)[], env?: Environment): Promise<void> {}

  /**
   * Create a new record.
   */
  async create(values: Record<string, any>, env?: Environment): Promise<Record<string, any>> {
    const activeEnv = env ?? context.getEnv();
    const security = activeEnv?.services.get('security');
    
    if (security && !(await security.checkAccess(activeEnv, this.name, 'create'))) {
      throw new Error(`[Security] User does not have create access to model "${this.name}"`);
    }

    const adapter = activeEnv?.adapter ?? this.adapter;
    const cleaned = this.prepareValues(values, 'create');

    await this.before_create(cleaned, activeEnv);
    await this.validate(cleaned, activeEnv);
    const record = await adapter.create(this.table, cleaned);
    await this.after_create(record, activeEnv);

    // Handle stored computed fields on create
    await this.recomputeStoredFields([record.id], [], activeEnv);

    return record;
  }

  /**
   * Read records by IDs.
   */
  async read(ids: (string | number)[], fields?: string[], env?: Environment): Promise<Record<string, any>[]> {
    const activeEnv = env ?? context.getEnv();
    const security = activeEnv?.services.get('security');

    if (security && !(await security.checkAccess(activeEnv, this.name, 'read'))) {
      throw new Error(`[Security] User does not have read access to model "${this.name}"`);
    }

    const adapter = activeEnv?.adapter ?? this.adapter;
    
    // Determine which fields to fetch
    const fieldsToFetch = fields || this.fields.map(f => f.name);
    
    // Separate stored fields and computed fields
    const storedFields: string[] = [];
    const computedFields: FieldDefinition[] = [];
    
    for (const fieldName of fieldsToFetch) {
      const field = this.fields.find(f => f.name === fieldName);
      if (field) {
        if (field.compute && !field.store) {
          computedFields.push(field);
        } else {
          storedFields.push(fieldName);
        }
      } else {
        storedFields.push(fieldName); // Assume stored if not found in definition
      }
    }
    
    // Fetch stored values
    const records = await adapter.read(this.table, ids, storedFields);
    
    // Handle computed fields
    if (computedFields.length > 0) {
      for (const field of computedFields) {
        const computeFn = (this as any)[field.compute];
        if (typeof computeFn === 'function') {
          const computedValues = await computeFn.call(this, ids, activeEnv);
          // computedValues should be an array of values matching ids order
          if (Array.isArray(computedValues)) {
            records.forEach((rec, idx) => {
              rec[field.name] = computedValues[idx];
            });
          }
        }
      }
    }
    
    return records;
  }

  /**
   * Search for records matching a domain.
   */
  async search(domain: Domain = [], options?: SearchOptions, env?: Environment): Promise<Record<string, any>[]> {
    const activeEnv = env ?? context.getEnv();
    const security = activeEnv?.services.get('security');

    if (security && !(await security.checkAccess(activeEnv, this.name, 'read'))) {
      throw new Error(`[Security] User does not have read access to model "${this.name}"`);
    }

    // Apply record rules
    let finalDomain = domain;
    if (security) {
      finalDomain = await security.applyRecordRules(activeEnv, this.name, domain);
    }

    const opts: SearchOptions = {
      order: this.definition.order,
      ...options,
    };
    const adapter = activeEnv?.adapter ?? this.adapter;
    return adapter.search(this.table, finalDomain, opts);
  }

  /**
   * Search and return paginated results with total count.
   */
  async searchRead(
    domain: Domain = [],
    options?: SearchOptions,
    env?: Environment
  ): Promise<PaginatedResult> {
    const activeEnv = env ?? context.getEnv();
    const adapter = activeEnv?.adapter ?? this.adapter;
    const [records, total] = await Promise.all([
      adapter.search(this.table, domain, {
        ...options,
        order: this.definition.order,
      }),
      adapter.searchCount(this.table, domain),
    ]);
    return {
      records,
      total,
      offset: options?.offset ?? 0,
      limit: options?.limit ?? records.length,
    };
  }

  /**
   * Count records matching a domain.
   */
  async searchCount(domain: Domain = [], env?: Environment): Promise<number> {
    const activeEnv = env ?? context.getEnv();
    const adapter = activeEnv?.adapter ?? this.adapter;
    return adapter.searchCount(this.table, domain);
  }

  /**
   * Update records.
   */
  async write(ids: (string | number)[], values: Record<string, any>, env?: Environment): Promise<void> {
    const activeEnv = env ?? context.getEnv();
    const security = activeEnv?.services.get('security');

    if (security && !(await security.checkAccess(activeEnv, this.name, 'write'))) {
      throw new Error(`[Security] User does not have write access to model "${this.name}"`);
    }

    const adapter = activeEnv?.adapter ?? this.adapter;
    const cleaned = this.prepareValues(values, 'write');

    await this.before_write(ids, cleaned, activeEnv);
    await this.validate(cleaned, activeEnv);
    await adapter.write(this.table, ids, cleaned);
    await this.after_write(ids, cleaned, activeEnv);

    // Handle inverse for computed fields
    for (const field of this.fields) {
      if (field.compute && field.inverse) {
        if (cleaned[field.name] !== undefined) {
          const inverseFn = (this as any)[field.inverse];
          if (typeof inverseFn === 'function') {
            await inverseFn.call(this, ids, cleaned[field.name], activeEnv);
          }
        }
      }
    }

    // Handle stored computed fields on write
    await this.recomputeStoredFields(ids, Object.keys(cleaned), activeEnv);
  }

  /**
   * Recalculates stored computed fields that depend on the changed fields.
   */
  protected async recomputeStoredFields(ids: (string | number)[], changedFields: string[], env?: Environment): Promise<void> {
    const activeEnv = env ?? context.getEnv();
    
    // Find computed fields that are stored and depend on changed fields
    const fieldsToRecompute = this.fields.filter(field => 
      field.compute && 
      field.store && 
      (changedFields.length === 0 || field.depends?.some(dep => changedFields.includes(dep)))
    );

    if (fieldsToRecompute.length === 0) return;

    for (const field of fieldsToRecompute) {
      const computeFn = (this as any)[field.compute];
      if (typeof computeFn === 'function') {
        const computedValues = await computeFn.call(this, ids, activeEnv);
        
        if (Array.isArray(computedValues)) {
          const updateValues: Record<string, any> = {
            [field.name]: computedValues // This is tricky, we need to update each record separately if values differ
          };
          
          // Since adapter.write takes ids and one value set, we might need to loop
          for (let i = 0; i < ids.length; i++) {
            await this.adapter.write(this.table, [ids[i]], {
              [field.name]: computedValues[i]
            });
          }
        }
      }
    }
  }

  /**
   * Delete records.
   */
  async unlink(ids: (string | number)[], env?: Environment): Promise<void> {
    const activeEnv = env ?? context.getEnv();
    const security = activeEnv?.services.get('security');

    if (security && !(await security.checkAccess(activeEnv, this.name, 'unlink'))) {
      throw new Error(`[Security] User does not have unlink access to model "${this.name}"`);
    }

    const adapter = activeEnv?.adapter ?? this.adapter;

    await this.before_unlink(ids, activeEnv);
    await adapter.unlink(this.table, ids);
    await this.after_unlink(ids, activeEnv);
  }

  /**
   * Calls the implementation of a method from a parent model.
   * Used to implement method overriding (equivalent to super.method() in Odoo).
   */
  async callSuper(methodName: string, ...args: any[]): Promise<any> {
    if (this.parentModels.length === 0) {
      throw new Error(`[Model] No parent models available for callSuper on "${this.name}"`);
    }

    for (const parent of this.parentModels) {
      if (typeof (parent as any)[methodName] === 'function') {
        return (parent as any)[methodName].apply(parent, args);
      }
    }

    throw new Error(`[Model] Method "${methodName}" not found in any parent models of "${this.name}"`);
  }

  /**
   * Get default values for a new record.
   */
  getDefaults(): Record<string, any> {
    const defaults: Record<string, any> = {};
    for (const field of this.fields) {
      if (field.default !== undefined) {
        defaults[field.name] = field.default;
      }
    }
    return defaults;
  }

  /**
   * Get the display name field.
   */
  get recNameField(): string {
    return this.definition.recName ?? 'name';
  }

  // ─── Private Helpers ───────────────────────────────────────

  protected prepareValues(
    values: Record<string, any>,
    operation: 'create' | 'write'
  ): Record<string, any> {
    const cleaned: Record<string, any> = {};
    const fieldNames = new Set(this.fields.map(f => f.name));

    for (const [key, value] of Object.entries(values)) {
      // Only accept known fields
      if (fieldNames.has(key)) {
        const field = this.fields.find(f => f.name === key)!;
        
        // Skip readonly fields
        if (field.readonly && operation === 'write') continue;
        
        cleaned[key] = value;
      }
    }

    // Check required fields on create
    if (operation === 'create') {
      for (const field of this.fields) {
        if (field.required && cleaned[field.name] === undefined && field.default === undefined) {
          throw new Error(`Field "${field.label}" (${field.name}) is required.`);
        }
      }
    }

    return cleaned;
  }

  protected async validate(values: Record<string, any>, env?: Environment): Promise<void> {
    const activeEnv = env ?? context.getEnv();
    for (const field of this.fields) {
      if (field.constrains) {
        for (const constraintName of field.constrains) {
          const constraintFn = (this as any)[constraintName];
          if (typeof constraintFn === 'function') {
            await constraintFn.call(this, values, activeEnv);
          }
        }
      }
    }
  }
}

// ─── Model Registry ────────────────────────────────────────

export class ModelRegistry {
  private definitions = new Map<string, ModelDefinition>();
  private models = new Map<string, Model>();
  private adapter: DatabaseAdapter;

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  /**
   * Update the database adapter used by the registry.
   */
  setAdapter(adapter: DatabaseAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Register a model definition. 
   * Does not instantiate the model yet.
   */
  register(definition: ModelDefinition): void {
    this.definitions.set(definition.name, definition);
  }

  /**
   * Load all registered models in the correct order based on inheritance.
   * Mimics Odoo's registry.load().
   */
  async load(): Promise<void> {
    const loaded = new Set<string>();
    const visiting = new Set<string>();

    const loadModel = (name: string) => {
      if (loaded.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`[ModelRegistry] Circular dependency detected in models involving "${name}"`);
      }

      visiting.add(name);
      const def = this.definitions.get(name);
      if (!def) {
        throw new Error(`[ModelRegistry] Model definition for "${name}" not found.`);
      }

      // Resolve parents first
      const parents: string[] = [];
      if (def._inherit) {
        const p = Array.isArray(def._inherit) ? def._inherit : [def._inherit];
        parents.push(...p);
      }
      if (def._inherits) {
        parents.push(def._inherits);
      }

      for (const parentName of parents) {
        loadModel(parentName);
      }

      visiting.delete(name);
      
      // Instantiate the model
      this.instantiateModel(def);
      loaded.add(name);
    };

    for (const name of this.definitions.keys()) {
      loadModel(name);
    }
  }

  /**
   * Internal method to create and register the Model instance.
   */
  private instantiateModel(definition: ModelDefinition): Model {
    const parentModels: Model[] = [];
    let mergedFields: FieldDefinition[] = [...definition.fields];

    // Handle _inherit (Class Inheritance)
    if (definition._inherit) {
      const parents = Array.isArray(definition._inherit) 
        ? definition._inherit 
        : [definition._inherit];

      for (const parentName of parents) {
        const parentModel = this.get(parentName);
        if (!parentModel) {
          throw new Error(`[ModelRegistry] Cannot instantiate "${definition.name}": parent "${parentName}" not loaded.`);
        }
        parentModels.push(parentModel);

        const existingFieldNames = new Set(mergedFields.map(f => f.name));
        for (const parentField of parentModel.fields) {
          if (!existingFieldNames.has(parentField.name)) {
            mergedFields.push(parentField);
          }
        }
      }
    }

    // Handle _inherits (Delegation Inheritance)
    if (definition._inherits) {
      const parentName = definition._inherits;
      const parentModel = this.get(parentName);
      if (!parentModel) {
        throw new Error(`[ModelRegistry] Cannot instantiate "${definition.name}": delegate "${parentName}" not loaded.`);
      }
      parentModels.push(parentModel);

      const existingFieldNames = new Set(mergedFields.map(f => f.name));
      for (const parentField of parentModel.fields) {
        if (!existingFieldNames.has(parentField.name)) {
          mergedFields.push(parentField);
        }
      }
    }

    const model = new Model(
      { ...definition, fields: mergedFields }, 
      this.adapter,
      parentModels
    );
    
    this.models.set(definition.name, model);
    return model;
  }

  /**
   * Get a model by name.
   */
  get(name: string): Model | undefined {
    return this.models.get(name);
  }

  /**
   * Get all registered models.
   */
  getAll(): Model[] {
    return [...this.models.values()];
  }

  /**
   * Check if a model exists.
   */
  has(name: string): boolean {
    return this.models.has(name);
  }
}
