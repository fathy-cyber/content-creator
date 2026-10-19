/**
 * SupabaseAdapter — Database adapter that translates 
 * ORM operations into Supabase client queries.
 * 
 * Maps Odoo-style domain filters to Supabase .filter() chains.
 */

import type { DatabaseAdapter, Domain, DomainOperator, SearchOptions } from './Model';

// Supabase client type (we use a generic interface to avoid tight coupling)
interface SupabaseClient {
  from(table: string): any;
}

export class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async create(table: string, values: Record<string, any>): Promise<Record<string, any>> {
    const { data, error } = await this.client
      .from(table)
      .insert(values)
      .select()
      .single();

    if (error) throw new Error(`[SupabaseAdapter] create failed: ${error.message}`);
    return data;
  }

  async read(
    table: string,
    ids: (string | number)[],
    fields?: string[]
  ): Promise<Record<string, any>[]> {
    const selectFields = fields?.join(', ') || '*';
    const { data, error } = await this.client
      .from(table)
      .select(selectFields)
      .in('id', ids);

    if (error) throw new Error(`[SupabaseAdapter] read failed: ${error.message}`);
    return data ?? [];
  }

  async search(
    table: string,
    domain: Domain,
    options?: SearchOptions
  ): Promise<Record<string, any>[]> {
    const selectFields = options?.fields?.join(', ') || '*';
    let query = this.client.from(table).select(selectFields, { count: 'exact' });

    // Apply domain filters
    query = this.applyDomain(query, domain);

    // Apply ordering
    if (options?.order) {
      const orderParts = options.order.split(',').map(s => s.trim());
      for (const part of orderParts) {
        const [field, direction] = part.split(/\s+/);
        query = query.order(field, { ascending: direction?.toLowerCase() !== 'desc' });
      }
    }

    // Apply pagination
    if (options?.limit !== undefined) {
      const offset = options?.offset ?? 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`[SupabaseAdapter] search failed: ${error.message}`);
    return data ?? [];
  }

  async searchCount(table: string, domain: Domain): Promise<number> {
    let query = this.client.from(table).select('id', { count: 'exact', head: true });
    query = this.applyDomain(query, domain);

    const { count, error } = await query;
    if (error) throw new Error(`[SupabaseAdapter] searchCount failed: ${error.message}`);
    return count ?? 0;
  }

  async write(
    table: string,
    ids: (string | number)[],
    values: Record<string, any>
  ): Promise<void> {
    const updated = { ...values, updated_at: new Date().toISOString() };
    const { error } = await this.client
      .from(table)
      .update(updated)
      .in('id', ids);

    if (error) throw new Error(`[SupabaseAdapter] write failed: ${error.message}`);
  }

  async unlink(table: string, ids: (string | number)[]): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .in('id', ids);

    if (error) throw new Error(`[SupabaseAdapter] unlink failed: ${error.message}`);
  }

  // ─── Domain Translation ──────────────────────────────────

  private applyDomain(query: any, domain: Domain): any {
    for (const [field, op, value] of domain) {
      query = this.applyFilter(query, field, op, value);
    }
    return query;
  }

  private applyFilter(
    query: any,
    field: string,
    op: DomainOperator,
    value: any
  ): any {
    switch (op) {
      case '=':
        return value === null ? query.is(field, null) : query.eq(field, value);
      case '!=':
        return value === null ? query.not(field, 'is', null) : query.neq(field, value);
      case '>':
        return query.gt(field, value);
      case '>=':
        return query.gte(field, value);
      case '<':
        return query.lt(field, value);
      case '<=':
        return query.lte(field, value);
      case 'like':
        return query.like(field, `%${value}%`);
      case 'ilike':
        return query.ilike(field, `%${value}%`);
      case 'in':
        return query.in(field, value);
      case 'not in':
        return query.not(field, 'in', `(${value.join(',')})`);
      case 'is':
        return query.is(field, value);
      case 'is not':
        return query.not(field, 'is', value);
      default:
        console.warn(`[SupabaseAdapter] Unknown operator: ${op}`);
        return query;
    }
  }
}
