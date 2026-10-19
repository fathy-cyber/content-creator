// src/modules/audit/components/AuditStats.tsx

import React, { useMemo } from 'react';
import { type AuditLog } from '../../../shared/audit/auditService';

export function AuditStats({ logs }: { logs: AuditLog[] }) {
  const stats = useMemo(() => {
    const byAction: Record<string, number> = {};
    let failures = 0;
    let financial = 0;

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] ?? 0) + 1;
      if (log.status === 'failure') failures++;
      if (['APPROVE','PAY','VOID','WRITEOFF'].includes(log.action)) financial++;
    }

    return { byAction, failures, financial, total: logs.length };
  }, [logs]);

  return (
    <div className="flex gap-4 px-6 py-3 bg-white border-b border-gray-200">
      <StatCard
        label="Total Events"
        value={stats.total}
        color="text-gray-900"
      />
      <StatCard
        label="Financial Actions"
        value={stats.financial}
        color="text-indigo-600"
      />
      <StatCard
        label="Creates"
        value={stats.byAction['CREATE'] ?? 0}
        color="text-green-600"
      />
      <StatCard
        label="Updates"
        value={stats.byAction['UPDATE'] ?? 0}
        color="text-blue-600"
      />
      <StatCard
        label="Deletes"
        value={stats.byAction['DELETE'] ?? 0}
        color="text-red-600"
      />
      <StatCard
        label="Failures"
        value={stats.failures}
        color={stats.failures > 0 ? 'text-red-600' : 'text-gray-400'}
      />
    </div>
  );
}

function StatCard({
  label, value, color
}: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col">
      <span className={`text-lg font-semibold ${color}`}>
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
