// src/modules/audit/components/AuditFilters.tsx

import React from 'react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { type AuditModule, type AuditFilters } from '../../../shared/audit/auditService';

interface Props {
  filters: AuditFilters;
  onChange: (f: AuditFilters) => void;
}

export function AuditFilters({ filters, onChange }: Props) {
  const update = (key: keyof AuditFilters, val: any) => {
    onChange({ ...filters, [key]: val });
  };

  return (
    <div className="flex gap-4 px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex-1 relative">
        <Input 
          placeholder="Search across all logs..." 
          value={filters.search ?? ''} 
          onChange={(e) => update('search', e.target.value)}
        />
      </div>
      <div className="w-48">
        <Select value={filters.module} onValueChange={(v) => update('module', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Modules" />
          </SelectTrigger>
          <SelectContent>
            {['crm', 'sales', 'project', 'invoice', 'billing', 'support', 'hr', 'marketing', 'analytics', 'system'].map(m => (
              <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Select value={filters.status} onValueChange={(v) => update('status', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {['success', 'failure', 'partial'].map(s => (
              <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
