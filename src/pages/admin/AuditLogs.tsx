import React, { useState, useEffect, useCallback } from 'react';
import { auditService, type AuditLog, type AuditModule } from '../../shared/audit/auditService';
import { AuditTable }     from '../../modules/audit/components/AuditTable';
import { AuditFilters }   from '../../modules/audit/components/AuditFilters';
import { AuditStats }     from '../../modules/audit/components/AuditStats';
import { AuditDetail }    from '../../modules/audit/components/AuditDetail';

export interface AuditFilters {
  module?:     AuditModule;
  action?:     string;
  userId?:     string;
  entityType?: string;
  dateFrom?:   string;
  dateTo?:     string;
  search?:     string;
  status?:     'success' | 'failure' | 'partial';
}

export function AuditLogPage() {
  const [logs,        setLogs]        = useState<AuditLog[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [filters,     setFilters]     = useState<AuditFilters>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [total,       setTotal]       = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await auditService.getModuleActivity(
        filters.module,
        filters.dateFrom,
        filters.dateTo,
        200
      );
      setLogs(data);
      setTotal(data.length);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Audit Log
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete history of all system actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {total.toLocaleString()} entries
            </span>
            <button
              onClick={() => {
                const headers = ['Date','Action','Module','Entity','Record','User','Role','Changed Fields','Status'].join(',');
                const rows = logs.map((l) => [
                  l.createdAt, l.action, l.module, l.entityType, l.entityLabel ?? l.entityId ?? '',
                  l.userEmail ?? l.actorType, l.userRole ?? '', (l.changedFields ?? []).join(';'), l.status
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
                const csv = [headers, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="px-3 py-1.5 text-sm border border-gray-300
                         rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              ↓ Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <AuditStats logs={logs} />

      {/* ── Filters ────────────────────────────────────────── */}
      <AuditFilters
        filters={filters}
        onChange={setFilters}
      />

      {/* ── Main Content ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Table */}
        <div className={`flex-1 overflow-auto ${selectedLog ? 'w-1/2' : 'w-full'}`}>
          <AuditTable
            logs={logs}
            isLoading={isLoading}
            selectedId={selectedLog?.id}
            onSelect={setSelectedLog}
          />
        </div>

        {/* Detail Panel */}
        {selectedLog && (
          <div className="w-96 border-l border-gray-200 bg-white overflow-auto">
            <AuditDetail
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
