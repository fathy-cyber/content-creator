import React, { useState, useEffect } from 'react';
import {
  BrainCircuit, Plus, Trash2, ToggleLeft, ToggleRight, Zap, CheckCircle2,
  Loader2, Target, AlertTriangle, ArrowRight, Save, X, Eye, ListOrdered
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { scoringService } from '../../services/scoringService';
import type { ScoringRule, ScoredBreakdown } from '../../services/scoringService';
import { leadService } from '../../services/leadService';

type FieldOption = { value: string; label: string; operators: { value: string; label: string }[] };

const MOCK_RULES: ScoringRule[] = [
  { id: 'mock-rule-1', org_id: '', name: 'Referral Source — High Intent', field: 'source', operator: 'equals', value: 'referral', points: 25, is_active: true, priority: 1, created_at: '', updated_at: '' },
  { id: 'mock-rule-2', org_id: '', name: 'Organic Source — Warm Traffic', field: 'source', operator: 'equals', value: 'organic', points: 15, is_active: true, priority: 2, created_at: '', updated_at: '' },
  { id: 'mock-rule-3', org_id: '', name: 'Has Email — Reachable', field: 'email', operator: 'exists', value: '', points: 10, is_active: true, priority: 3, created_at: '', updated_at: '' },
  { id: 'mock-rule-4', org_id: '', name: 'Has Phone — High Responsiveness', field: 'phone', operator: 'exists', value: '', points: 15, is_active: true, priority: 4, created_at: '', updated_at: '' },
  { id: 'mock-rule-5', org_id: '', name: 'Has Company Name — B2B Qualified', field: 'metadata.company', operator: 'exists', value: '', points: 20, is_active: true, priority: 5, created_at: '', updated_at: '' },
  { id: 'mock-rule-6', org_id: '', name: 'Engaged — Multiple Touchpoints', field: 'touchpoint_count', operator: 'greater_than', value: '3', points: 20, is_active: true, priority: 6, created_at: '', updated_at: '' },
  { id: 'mock-rule-7', org_id: '', name: 'Agency Industry — Target Market', field: 'metadata.industry', operator: 'contains', value: 'agency', points: 10, is_active: false, priority: 7, created_at: '', updated_at: '' },
  { id: 'mock-rule-8', org_id: '', name: 'No Email — Unreachable (Penalty)', field: 'email', operator: 'not_exists', value: '', points: -20, is_active: true, priority: 8, created_at: '', updated_at: '' },
];

const MOCK_LEADS = [
  { id: 'mock-lead-1', email: 'ahmed.benali@example.com', name: 'Ahmed Ben Ali', phone: '+216 50 123 456', source: 'referral', score: 50, status: 'contacted', metadata: { company: 'BenAli Digital', industry: 'Digital Agency' } },
  { id: 'mock-lead-2', email: 'sarah.kthiri@example.com', name: 'Sarah Kthiri', phone: null, source: 'organic', score: 25, status: 'new', metadata: { company: 'Kthiri Tech', industry: 'SaaS' } },
  { id: 'mock-lead-3', email: 'mehdi.trabelsi@example.com', name: 'Mehdi Trabelsi', phone: '+216 52 987 654', source: 'organic', score: 65, status: 'qualified', metadata: { company: 'Trabelsi Consulting', industry: 'Management Consulting' } },
  { id: 'mock-lead-4', email: 'guest@website.com', name: null, phone: null, source: 'direct', score: 5, status: 'new', metadata: {} },
  { id: 'mock-lead-5', email: 'omar.jelliti@example.com', name: 'Omar Jelliti', phone: '+216 58 456 789', source: 'facebook', score: 30, status: 'contacted', metadata: { company: 'Jelliti Store', industry: 'E-Commerce' } },
  { id: 'mock-lead-6', email: 'rania.bouaziz@example.com', name: 'Rania Bouaziz', phone: '+216 20 111 222', source: 'referral', score: 90, status: 'converted', metadata: { company: 'Bouaziz Agency', industry: 'Digital Agency' } },
];

const FIELD_OPTIONS: FieldOption[] = [
  {
    value: 'source', label: 'Lead Source',
    operators: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'exists', label: 'Exists' },
      { value: 'not_exists', label: 'Not exists' },
    ],
  },
  {
    value: 'email', label: 'Email',
    operators: [
      { value: 'exists', label: 'Exists' },
      { value: 'not_exists', label: 'Not exists' },
      { value: 'contains', label: 'Contains' },
      { value: 'regex', label: 'Regex' },
    ],
  },
  {
    value: 'phone', label: 'Phone',
    operators: [
      { value: 'exists', label: 'Exists' },
      { value: 'not_exists', label: 'Not exists' },
    ],
  },
  {
    value: 'name', label: 'Name',
    operators: [
      { value: 'exists', label: 'Exists' },
      { value: 'not_exists', label: 'Not exists' },
      { value: 'contains', label: 'Contains' },
    ],
  },
  {
    value: 'metadata.company', label: 'Company (Metadata)',
    operators: [
      { value: 'exists', label: 'Exists' },
      { value: 'not_exists', label: 'Not exists' },
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
    ],
  },
  {
    value: 'metadata.industry', label: 'Industry (Metadata)',
    operators: [
      { value: 'exists', label: 'Exists' },
      { value: 'equals', label: 'Equals' },
      { value: 'contains', label: 'Contains' },
    ],
  },
  {
    value: 'touchpoint_count', label: 'Touchpoint Count',
    operators: [
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'equals', label: 'Equals' },
    ],
  },
  {
    value: 'status', label: 'Lead Status',
    operators: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' },
    ],
  },
  {
    value: 'score', label: 'Current Score',
    operators: [
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'equals', label: 'Equals' },
    ],
  },
];

import ToolPageLayout from '../shared/ToolPageLayout';

export default function LeadScoringWorkbench() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    field: 'source',
    operator: 'equals',
    value: '',
    points: 10,
    priority: 0,
  });
  const [saving, setSaving] = useState(false);

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [breakdown, setBreakdown] = useState<ScoredBreakdown | null>(null);
  const [scoringHistory, setScoringHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadRules = async () => {
    try {
      const data = await scoringService.listRules();
      if (data.length > 0) {
        setRules(data);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.warn('[LeadScoringWorkbench] DB unavailable, using mock rules:', error);
    }
    setRules(MOCK_RULES);
    setLoading(false);
  };

  const loadLeads = async () => {
    try {
      const result = await leadService.listLeads({ limit: 100, offset: 0 });
      if (result.leads.length > 0) {
        setLeads(result.leads);
        return;
      }
    } catch (error) {
      console.warn('[LeadScoringWorkbench] DB unavailable, using mock leads:', error);
    }
    setLeads(MOCK_LEADS);
  };

  useEffect(() => {
    loadRules();
    loadLeads();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', field: 'source', operator: 'equals', value: '', points: 10, priority: 0 });
    setEditingRule(null);
    setShowForm(false);
  };

  const openEdit = (rule: ScoringRule) => {
    setFormData({
      name: rule.name,
      field: rule.field,
      operator: rule.operator,
      value: rule.value,
      points: rule.points,
      priority: rule.priority,
    });
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Rule name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingRule) {
        await scoringService.updateRule(editingRule.id, formData);
        toast.success('Rule updated');
      } else {
        await scoringService.createRule(formData);
        toast.success('Rule created');
      }
      resetForm();
      await loadRules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await scoringService.deleteRule(id);
      toast.success('Rule deleted');
      await loadRules();
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggle = async (rule: ScoringRule) => {
    try {
      await scoringService.toggleRule(rule.id, !rule.is_active);
      toast.success(rule.is_active ? 'Rule deactivated' : 'Rule activated');
      await loadRules();
    } catch {
      toast.error('Failed to toggle rule');
    }
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  const handleEvaluate = async () => {
    if (!selectedLeadId || !selectedLead) {
      toast.error('Select a lead to evaluate');
      return;
    }
    setEvaluating(true);
    setBreakdown(null);
    setScoringHistory([]);
    try {
      const result = await scoringService.evaluateLead(selectedLeadId, selectedLead, rules);
      setBreakdown(result);
      const history = await scoringService.getScoringHistory(selectedLeadId);
      setScoringHistory(history);
    } catch (error: any) {
      toast.error('Failed to evaluate lead');
    } finally {
      setEvaluating(false);
    }
  };

  const handleScoreAndSave = async () => {
    if (!selectedLeadId || !selectedLead) {
      toast.error('Select a lead first');
      return;
    }
    setEvaluating(true);
    try {
      const result = await scoringService.scoreLead(selectedLeadId, selectedLead);
      toast.success(`Lead scored: ${result.score} pts — Status: ${result.status}`);
      await handleEvaluate();
    } catch (error: any) {
      toast.error('Failed to score lead');
    } finally {
      setEvaluating(false);
    }
  };

  const getFieldLabel = (field: string) => FIELD_OPTIONS.find(f => f.value === field)?.label || field;
  const getOperatorLabel = (field: string, op: string) =>
    FIELD_OPTIONS.find(f => f.value === field)?.operators.find(o => o.value === op)?.label || op;

  const availableOperators = FIELD_OPTIONS.find(f => f.value === formData.field)?.operators || [];

  const activeRules = rules.filter(r => r.is_active);
  const inactiveRules = rules.filter(r => !r.is_active);

  return (
    <ToolPageLayout>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <BrainCircuit className="w-8 h-8 text-purple-600" />
          Lead Scoring Workbench
        </h1>
        <p className="text-zinc-500 text-lg">
          Define scoring rules to automatically qualify leads based on behavior and attributes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Rules */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-purple-500" /> Scoring Rules
              </h2>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No rules defined yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRules.map((rule, idx) => (
                  <div key={rule.id || idx}>
                    <RuleCard
                      rule={rule}
                      onEdit={() => openEdit(rule)}
                      onDelete={() => handleDelete(rule.id)}
                      onToggle={() => handleToggle(rule)}
                      getFieldLabel={getFieldLabel}
                      getOperatorLabel={getOperatorLabel}
                    />
                  </div>
                ))}
                {inactiveRules.length > 0 && (
                  <>
                    <div className="pt-3 pb-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">Inactive</div>
                    {inactiveRules.map((rule, idx) => (
                      <div key={rule.id || idx}>
                        <RuleCard
                          rule={rule}
                          onEdit={() => openEdit(rule)}
                          onDelete={() => handleDelete(rule.id)}
                          onToggle={() => handleToggle(rule)}
                          getFieldLabel={getFieldLabel}
                          getOperatorLabel={getOperatorLabel}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rule Form */}
          {showForm && (
            <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-md animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-zinc-900">{editingRule ? 'Edit Rule' : 'New Rule'}</h3>
                <button onClick={resetForm} className="p-1 text-zinc-400 hover:text-zinc-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Rule Name</label>
                  <input
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. High-value referral"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Field</label>
                    <select
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all bg-white"
                      value={formData.field}
                      onChange={e => {
                        const field = e.target.value;
                        const ops = FIELD_OPTIONS.find(f => f.value === field)?.operators || [];
                        setFormData({ ...formData, field, operator: ops[0]?.value || 'equals' });
                      }}
                    >
                      {FIELD_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Operator</label>
                    <select
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all bg-white"
                      value={formData.operator}
                      onChange={e => setFormData({ ...formData, operator: e.target.value })}
                    >
                      {availableOperators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {!['exists', 'not_exists'].includes(formData.operator) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Value</label>
                    <input
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                      placeholder="Value to compare"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Points</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={formData.points}
                      onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Priority</label>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Test Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-5">
              <Zap className="w-5 h-5 text-amber-500" /> Test & Evaluate
            </h2>

            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-zinc-500 uppercase">Select a Lead</label>
                <select
                  className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-500 transition-all bg-white"
                  value={selectedLeadId}
                  onChange={e => { setSelectedLeadId(e.target.value); setBreakdown(null); setScoringHistory([]); }}
                >
                  <option value="">Choose a lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name || lead.email} — {lead.source} — Score: {lead.score}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !selectedLeadId}
                className="px-5 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Preview Score
              </button>
              <button
                onClick={handleScoreAndSave}
                disabled={evaluating || !selectedLeadId}
                className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-md shadow-emerald-100"
              >
                {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Score & Save
              </button>
            </div>

            {/* Breakdown Results */}
            {breakdown && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="text-sm font-bold text-zinc-500">Total Score</div>
                      <div className="text-3xl font-black text-purple-700">{breakdown.total}</div>
                    </div>
                  </div>
                  <div className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold',
                    breakdown.total >= 70 ? 'bg-emerald-100 text-emerald-700' :
                    breakdown.total >= 40 ? 'bg-amber-100 text-amber-700' :
                    'bg-zinc-100 text-zinc-600'
                  )}>
                    {breakdown.total >= 70 ? 'Qualified' : breakdown.total >= 40 ? 'Warm' : 'Cold'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-400 uppercase">Rule Breakdown</div>
                  {breakdown.rules.length === 0 ? (
                    <p className="text-sm text-zinc-400 italic">No active rules to evaluate against.</p>
                  ) : (
                    breakdown.rules.map((r, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl border transition-all',
                          r.matched ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200 opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                            r.matched ? 'bg-emerald-500' : 'bg-zinc-300'
                          )}>
                            {r.matched ? <CheckCircle2 className="w-4 h-4 text-white" /> : <X className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-zinc-900 truncate">{r.rule.name}</div>
                            <div className="text-xs text-zinc-500 truncate">
                              {getFieldLabel(r.rule.field)} {getOperatorLabel(r.rule.field, r.rule.operator)} {r.rule.value}
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          'text-sm font-bold shrink-0 ml-3',
                          r.matched ? 'text-emerald-600' : 'text-zinc-400'
                        )}>
                          {r.matched ? `+${r.rule.points}` : '0'}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Scoring History */}
                {scoringHistory.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <ArrowRight className={cn('w-4 h-4 transition-transform', showHistory && 'rotate-90')} />
                      Scoring History ({scoringHistory.length} entries)
                    </button>
                    {showHistory && (
                      <div className="mt-3 space-y-2">
                        {scoringHistory.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                            <div>
                              <div className="text-sm font-medium text-zinc-900">{entry.rule_name || 'Unknown rule'}</div>
                              <div className="text-xs text-zinc-500">{entry.reason}</div>
                            </div>
                            <div className="text-sm font-bold text-emerald-600">+{entry.points}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}

function RuleCard({
  rule, onEdit, onDelete, onToggle, getFieldLabel, getOperatorLabel,
}: {
  rule: ScoringRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  getFieldLabel: (f: string) => string;
  getOperatorLabel: (f: string, o: string) => string;
}) {
  return (
    <div className={cn(
      'p-4 rounded-2xl border transition-all group cursor-pointer hover:border-purple-200',
      rule.is_active ? 'bg-white border-zinc-200' : 'bg-zinc-50 border-zinc-200 opacity-70'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-zinc-900 truncate flex items-center gap-2">
            {rule.name}
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold',
              rule.points >= 20 ? 'bg-emerald-100 text-emerald-700' :
              rule.points >= 10 ? 'bg-amber-100 text-amber-700' :
              'bg-zinc-100 text-zinc-600'
            )}>
              +{rule.points} pts
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {getFieldLabel(rule.field)} {getOperatorLabel(rule.field, rule.operator)}
            {!['exists', 'not_exists'].includes(rule.operator) && ` "${rule.value}"`}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
            <Target className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
            {rule.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="text-[10px] text-zinc-400 font-medium">
        Priority {rule.priority} · {rule.is_active ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}
