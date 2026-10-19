import type { Environment } from '../orm/environment';

export type AccessRight = 'read' | 'write' | 'create' | 'unlink';

export interface AccessRule {
  model: string;
  group: string;
  rights: AccessRight[];
}

export interface RecordRule {
  model: string;
  group: string;
  domain: any[]; // Domain that restricts the records
}

export interface SecurityService {
  /**
   * Check if the user has model-level access.
   */
  checkAccess(env: Environment, modelName: string, right: AccessRight): Promise<boolean>;

  /**
   * Apply record rules to a domain for a specific model and user.
   */
  applyRecordRules(env: Environment, modelName: string, domain: any[]): Promise<any[]>;
}

export class SecurityServiceImpl implements SecurityService {
  async checkAccess(env: Environment, modelName: string, right: AccessRight): Promise<boolean> {
    const userGroups = await this.getUserGroups(env, env.user);

    if (userGroups.includes('admin')) {
      return true;
    }

    const rules = await env.adapter.search('ir_model_access', [
      ['model', 'in', ['*', modelName]],
      ['group', 'in', userGroups]
    ] as any);

    return rules.some((rule: any) => rule.rights.includes(right));
  }

  async applyRecordRules(env: Environment, modelName: string, domain: any[]): Promise<any[]> {
    const userGroups = await this.getUserGroups(env, env.user);

    if (userGroups.includes('admin')) {
      return domain;
    }

    const rules = await env.adapter.search('ir_rule', [
      ['model', '=', modelName],
      ['group', 'in', userGroups]
    ] as any);

    let finalDomain = [...domain];
    for (const rule of rules) {
      if (rule.domain) {
        finalDomain = [...finalDomain, ...rule.domain];
      }
    }

    return finalDomain;
  }

  private async getUserGroups(env: Environment, userId: string | number): Promise<string[]> {
    const groups = await env.adapter.search('res_users_groups', [
      ['user_id', '=', userId]
    ] as any);

    return groups.map((g: any) => g.group);
  }
}
