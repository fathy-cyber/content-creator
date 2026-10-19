import type { Model, DatabaseAdapter, Domain, SearchOptions } from './Model';
import type { Environment } from './environment';

export class Recordset {
  constructor(
    public readonly model: Model,
    public readonly ids: (string | number)[],
    public readonly env: Environment
  ) {}

  /**
   * Returns the number of records in the recordset.
   */
  get length(): number {
    return this.ids.length;
  }

  /**
   * Returns true if the recordset is empty.
   */
  get isEmpty(): boolean {
    return this.ids.length === 0;
  }

  /**
   * Read records by fields.
   */
  async read(fields?: string[]): Promise<Record<string, any>[]> {
    return this.model.read(this.ids, fields, this.env);
  }

  /**
   * Update records.
   */
  async write(values: Record<string, any>): Promise<void> {
    return this.model.write(this.ids, values, this.env);
  }

  /**
   * Delete records.
   */
  async unlink(): Promise<void> {
    return this.model.unlink(this.ids, this.env);
  }

  /**
   * Search for records matching a domain.
   * Returns a new Recordset.
   */
  async search(domain: Domain = [], options?: SearchOptions): Promise<Recordset> {
    const records = await this.model.search(domain, options, this.env);
    const ids = records.map(r => r.id);
    return new Recordset(this.model, ids, this.env);
  }

  /**
   * Search and return a Recordset with paginated results.
   */
  async searchRead(domain: Domain = [], options?: SearchOptions): Promise<{ records: any[], total: number }> {
    const result = await this.model.searchRead(domain, options, this.env);
    return result;
  }

  /**
   * Count records matching a domain.
   */
  async searchCount(domain: Domain = []): Promise<number> {
    return this.model.searchCount(domain, this.env);
  }

  /**
   * Create a new record.
   * Returns a Recordset containing the new record.
   */
  async create(values: Record<string, any>): Promise<Recordset> {
    const record = await this.model.create(values, this.env);
    return new Recordset(this.model, [record.id], this.env);
  }

  /**
   * Get a single record from the recordset.
   * Throws if the recordset does not contain exactly one record.
   */
  async __get_one() {
    if (this.ids.length !== 1) {
      throw new Error(`[Recordset] Expected exactly one record, found ${this.ids.length}`);
    }
    const records = await this.read();
    return records[0];
  }
}
