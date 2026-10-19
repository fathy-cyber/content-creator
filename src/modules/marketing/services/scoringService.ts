import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { emitters } from '../events/emitters';

export interface ScoringRule {
  id: string;
  org_id: string;
  name: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists' | 'regex';
  value: string;
  points: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ScoringHistoryEntry {
  id: string;
  lead_id: string;
  rule_id: string | null;
  rule_name: string | null;
  points: number;
  reason: string;
  created_at: string;
}

export interface ScoredBreakdown {
  total: number;
  rules: { rule: ScoringRule; matched: boolean; points: number }[];
}

const CreateRuleSchema = z.object({
  name: z.string().min(1),
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists', 'regex']),
  value: z.string().default(''),
  points: z.number().int().min(0),
  is_active: z.boolean().default(true),
  priority: z.number().int().default(0),
});

const UpdateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  field: z.string().min(1).optional(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists', 'regex']).optional(),
  value: z.string().optional(),
  points: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  priority: z.number().int().optional(),
});

function supabaseError(msg: string, error?: any): never {
  let errMsg = 'Unknown error';
  if (error) {
    errMsg = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error';
  }
  throw new Error(`${msg}: ${errMsg}`);
}

function getFieldValue(lead: Record<string, any>, field: string): any {
  if (field.includes('.')) {
    const parts = field.split('.');
    let val: any = lead;
    for (const p of parts) {
      if (val == null) return undefined;
      val = val[p];
    }
    return val;
  }
  if (field === 'touchpoint_count') {
    // handled separately
    return undefined;
  }
  return lead[field];
}

function evaluateRule(rule: ScoringRule, lead: Record<string, any>, touchpointCount: number): boolean {
  let actualValue: any;

  if (rule.field === 'touchpoint_count') {
    actualValue = touchpointCount;
  } else {
    actualValue = getFieldValue(lead, rule.field);
  }

  const expected = rule.value;

  switch (rule.operator) {
    case 'equals':
      return String(actualValue).toLowerCase() === expected.toLowerCase();
    case 'not_equals':
      return String(actualValue).toLowerCase() !== expected.toLowerCase();
    case 'contains':
      return String(actualValue).toLowerCase().includes(expected.toLowerCase());
    case 'greater_than':
      return Number(actualValue) > Number(expected);
    case 'less_than':
      return Number(actualValue) < Number(expected);
    case 'exists':
      return actualValue != null && actualValue !== '' && actualValue !== undefined;
    case 'not_exists':
      return actualValue == null || actualValue === '' || actualValue === undefined;
    case 'regex':
      try {
        return new RegExp(expected, 'i').test(String(actualValue));
      } catch {
        return false;
      }
    default:
      return false;
  }
}

async function getOrgId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!userData?.org_id) throw new Error('Organization ID not found for user');
  return userData.org_id;
}

export const scoringService = {
  async listRules(): Promise<ScoringRule[]> {
    const orgId = await getOrgId();
    const { data, error } = await supabase
      .from('scoring_rules')
      .select('*')
      .eq('org_id', orgId)
      .order('priority', { ascending: true });

    if (error) supabaseError('Failed to list scoring rules', error);
    return (data || []) as ScoringRule[];
  },

  async createRule(data: z.infer<typeof CreateRuleSchema>): Promise<ScoringRule> {
    const orgId = await getOrgId();
    const validated = CreateRuleSchema.parse(data);
    const { data: rule, error } = await supabase
      .from('scoring_rules')
      .insert({ ...validated, org_id: orgId })
      .select()
      .single();

    if (error) supabaseError('Failed to create scoring rule', error);
    const created = rule as ScoringRule;
    emitters.ruleCreated(created);
    return created;
  },

  async updateRule(id: string, data: z.infer<typeof UpdateRuleSchema>): Promise<ScoringRule> {
    const validated = UpdateRuleSchema.parse(data);
    const { data: rule, error } = await supabase
      .from('scoring_rules')
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) supabaseError('Failed to update scoring rule', error);
    const updated = rule as ScoringRule;
    emitters.ruleUpdated(updated);
    return updated;
  },

  async deleteRule(id: string): Promise<void> {
    const { data: existing } = await supabase
      .from('scoring_rules')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('scoring_rules')
      .delete()
      .eq('id', id);

    if (error) supabaseError('Failed to delete scoring rule', error);
    emitters.ruleDeleted(id, existing?.name || 'Unknown');
  },

  async toggleRule(id: string, isActive: boolean): Promise<ScoringRule> {
    return this.updateRule(id, { is_active: isActive });
  },

  async evaluateLead(leadId: string, leadData?: Record<string, any>, rules?: ScoringRule[]): Promise<ScoredBreakdown> {
    if (!rules || rules.length === 0) {
      try {
        const orgId = await getOrgId();
        const { data: dbRules, error: rulesError } = await supabase
          .from('scoring_rules')
          .select('*')
          .eq('org_id', orgId)
          .eq('is_active', true)
          .order('priority', { ascending: true });

        if (rulesError) supabaseError('Failed to fetch scoring rules', rulesError);
        rules = (dbRules || []) as ScoringRule[];
      } catch {
        rules = [];
      }
    }
    const activeRules = rules.filter(r => r.is_active);
    if (activeRules.length === 0) return { total: 0, rules: [] };

    let lead = leadData;
    let touchpointCount = 0;

    if (!lead) {
      const { data: dbLead, error: leadError } = await supabase
        .from('marketing_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) supabaseError('Failed to fetch lead', leadError);
      lead = dbLead;

      const { count } = await supabase
        .from('touchpoints')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', leadId);
      touchpointCount = count || 0;
    }

    const results = activeRules.map(rule => {
      const matched = lead ? evaluateRule(rule, lead, touchpointCount) : false;
      return { rule, matched, points: matched ? rule.points : 0 };
    });

    return {
      total: results.reduce((sum, r) => sum + r.points, 0),
      rules: results,
    };
  },

  async scoreLead(leadId: string, leadData?: Record<string, any>): Promise<{ score: number; status: string }> {
    const breakdown = await this.evaluateLead(leadId, leadData);
    const newStatus = breakdown.total >= 70 ? 'qualified' : 'new';

    let previousStatus = 'new';

    if (leadData) {
      previousStatus = leadData.status || 'new';
    } else {
      const { data: lead, error } = await supabase
        .from('marketing_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) supabaseError('Failed to fetch lead', error);
      previousStatus = lead.status;

      const { data: updatedLead, error: updateError } = await supabase
        .from('marketing_leads')
        .update({ score: breakdown.total, status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (updateError) supabaseError('Failed to update lead score', updateError);

      for (const result of breakdown.rules) {
        if (result.matched) {
          await supabase.from('scoring_history').insert({
            lead_id: leadId,
            rule_id: result.rule.id,
            rule_name: result.rule.name,
            points: result.rule.points,
            reason: `Matched rule "${result.rule.name}": ${result.rule.field} ${result.rule.operator} ${result.rule.value}`,
          });
        }
      }

      const reason = `Scored ${breakdown.total} pts (${breakdown.rules.filter(r => r.matched).length} rules matched)`;
      if (newStatus !== previousStatus) {
        emitters.leadScored(updatedLead as any, breakdown.total, `${reason} — Status changed: ${previousStatus} → ${newStatus}`);
      }
    }

    return { score: breakdown.total, status: newStatus };
  },

  async getScoringHistory(leadId: string): Promise<ScoringHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('scoring_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []) as ScoringHistoryEntry[];
    } catch {
      return [];
    }
  },
};
