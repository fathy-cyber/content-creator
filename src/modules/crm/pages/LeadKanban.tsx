/**
 * LeadKanban — CRM leads pipeline using the generic KanbanView.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanView from '../../../core/views/KanbanView';
import type { KanbanViewConfig, SelectionOption } from '../../../core/types/ModuleManifest';

// Pipeline stages
const stages: SelectionOption[] = [
  { value: 'new', label: 'New', color: 'from-blue-500 to-blue-600' },
  { value: 'qualified', label: 'Qualified', color: 'from-indigo-500 to-indigo-600' },
  { value: 'proposition', label: 'Proposition', color: 'from-violet-500 to-violet-600' },
  { value: 'negotiation', label: 'Negotiation', color: 'from-amber-500 to-amber-600' },
  { value: 'won', label: 'Won', color: 'from-emerald-500 to-emerald-600' },
  { value: 'lost', label: 'Lost', color: 'from-rose-500 to-rose-600' },
];

// Demo leads
const initialLeads = [
  { id: 1, name: 'Website Redesign Project', company: 'TechStart Tunisia', expected_revenue: 15000, probability: 60, source: 'website', stage: 'new', priority: 'high' },
  { id: 2, name: 'Social Media Management', company: 'Café Délice', expected_revenue: 3000, probability: 80, source: 'referral', stage: 'new', priority: 'medium' },
  { id: 3, name: 'E-commerce Platform', company: 'Fashion House TN', expected_revenue: 25000, probability: 40, source: 'facebook', stage: 'qualified', priority: 'high' },
  { id: 4, name: 'Branding Package', company: 'Olive Gold', expected_revenue: 8000, probability: 70, source: 'instagram', stage: 'qualified', priority: 'medium' },
  { id: 5, name: 'Mobile App Development', company: 'EduTech TN', expected_revenue: 35000, probability: 30, source: 'cold-call', stage: 'proposition', priority: 'urgent' },
  { id: 6, name: 'Marketing Campaign', company: 'Sweet Delights', expected_revenue: 5000, probability: 90, source: 'whatsapp', stage: 'proposition', priority: 'low' },
  { id: 7, name: 'POS System Integration', company: 'Auto Parts Plus', expected_revenue: 12000, probability: 50, source: 'event', stage: 'negotiation', priority: 'high' },
  { id: 8, name: 'Annual Support Contract', company: 'Artisan Ceramics', expected_revenue: 4500, probability: 85, source: 'referral', stage: 'negotiation', priority: 'medium' },
  { id: 9, name: 'SEO Optimization', company: 'Wellness Center', expected_revenue: 6000, probability: 95, source: 'website', stage: 'won', priority: 'medium' },
  { id: 10, name: 'Logo Design', company: 'Digital Sousse', expected_revenue: 2000, probability: 100, source: 'referral', stage: 'won', priority: 'low' },
  { id: 11, name: 'Cloud Migration', company: 'MedTech Solutions', expected_revenue: 20000, probability: 0, source: 'cold-call', stage: 'lost', priority: 'high' },
];

const kanbanConfig: KanbanViewConfig = {
  type: 'kanban',
  model: 'crm.lead',
  groupField: 'stage',
  titleField: 'name',
  descriptionField: 'company',
  quickCreate: true,
  fields: [
    { name: 'name' },
    { name: 'company' },
    { name: 'expected_revenue', widget: 'monetary' },
    { name: 'source', widget: 'badge' },
    { name: 'stage' },
    { name: 'priority' },
  ],
};

export default function LeadKanban() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(initialLeads);

  const handleStageChange = useCallback((recordId: string | number, newStage: string) => {
    setLeads(prev =>
      prev.map(lead =>
        lead.id === recordId ? { ...lead, stage: newStage } : lead
      )
    );
  }, []);

  const handleQuickCreate = useCallback((stage: string, name: string) => {
    const newLead = {
      id: Date.now(),
      name,
      company: '',
      expected_revenue: 0,
      probability: 10,
      source: 'other',
      stage,
      priority: 'medium',
    };
    setLeads(prev => [...prev, newLead]);
  }, []);

  // Calculate pipeline totals
  const totalValue = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => sum + l.expected_revenue, 0);
  const wonValue = leads
    .filter(l => l.stage === 'won')
    .reduce((sum, l) => sum + l.expected_revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic text-zinc-900 font-serif tracking-tight">
            Leads Pipeline
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-bold">
            Drag cards between stages to update lead status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 px-5 py-3 bg-white rounded-2xl border border-zinc-200/60 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Pipeline</p>
              <p className="text-sm font-black text-zinc-900 italic">{totalValue.toLocaleString()} TND</p>
            </div>
            <div className="w-px h-8 bg-zinc-100" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500">Won</p>
              <p className="text-sm font-black text-emerald-600 italic">{wonValue.toLocaleString()} TND</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanView
        config={kanbanConfig}
        records={leads}
        stages={stages}
        onStageChange={handleStageChange}
        onRecordClick={(record) => console.log('Click lead:', record)}
        onQuickCreate={handleQuickCreate}
      />
    </div>
  );
}
