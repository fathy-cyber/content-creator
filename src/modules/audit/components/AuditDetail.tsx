// src/modules/audit/components/AuditDetail.tsx

import React, { useState } from 'react';
import { type AuditLog }   from '../../../shared/audit/auditService';

interface Props {
  log:     AuditLog;
  onClose: () => void;
}

export function AuditDetail({ log, onClose }: Props) {
  const [tab, setTab] = useState<'overview' | 'diff' | 'raw'>('overview');

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Audit Detail</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {(['overview', 'diff', 'raw'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors
              ${tab === t
                ? 'border-indigo-500 text-indigo-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">

        {tab === 'overview' && (
          <div className="space-y-4">

            {/* Action + Status */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800
                               rounded text-sm font-medium">
                {log.action}
              </span>
              <span className={`px-2 py-1 rounded text-sm
                ${log.status === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'}`}>
                {log.status}
              </span>
            </div>

            {/* Fields */}
            <DetailSection title="Record">
              <DetailRow label="Type"   value={log.entityType} />
              <DetailRow label="ID"     value={log.entityId}   mono />
              <DetailRow label="Label"  value={log.entityLabel} />
              <DetailRow label="Module" value={log.module} />
            </DetailSection>

            <DetailSection title="Actor">
              <DetailRow label="User"   value={log.userEmail}  />
              <DetailRow label="Role"   value={log.userRole}   />
              <DetailRow label="Type"   value={log.actorType}  />
              <DetailRow label="Source" value={log.source}     />
              <DetailRow label="IP"     value={log.ipAddress}  mono />
            </DetailSection>

            <DetailSection title="Timing">
              <DetailRow
                label="When"
                value={new Date(log.createdAt).toLocaleString()}
              />
              <DetailRow
                label="Correlation"
                value={log.correlationId}
                mono
              />
            </DetailSection>

            {log.changedFields && log.changedFields.length > 0 && (
              <DetailSection title="Changed Fields">
                <div className="flex flex-wrap gap-1 mt-1">
                  {log.changedFields.map((f) => (
                    <span key={f}
                          className="px-2 py-0.5 bg-amber-50 text-amber-700
                                     border border-amber-200 rounded text-xs font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}

            {log.notes && (
              <DetailSection title="Notes">
                <p className="text-sm text-gray-600">{log.notes}</p>
              </DetailSection>
            )}

            {log.errorMessage && (
              <DetailSection title="Error">
                <p className="text-sm text-red-600 font-mono bg-red-50
                              p-2 rounded">{log.errorMessage}</p>
              </DetailSection>
            )}
          </div>
        )}

        {tab === 'diff' && (
          <DiffViewer diff={log.diff} action={log.action} />
        )}

        {tab === 'raw' && (
          <pre className="text-xs font-mono bg-gray-50 p-3 rounded
                          overflow-auto border border-gray-200">
            {JSON.stringify(log, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── DiffViewer ────────────────────────────────────────────────
function DiffViewer({
  diff,
  action,
}: {
  diff?: Record<string, { from: unknown; to: unknown }>;
  action:  string;
}) {
  if (!diff || Object.keys(diff).length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        {action === 'CREATE'
          ? 'Record created — no previous values'
          : action === 'DELETE'
          ? 'Record deleted'
          : 'No field changes recorded'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">
        {Object.keys(diff).length} field(s) changed
      </p>
      {Object.entries(diff).map(([field, { from, to }]) => (
        <div key={field}
             className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
            <span className="font-mono text-xs font-semibold text-gray-700">
              {field}
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-2 bg-red-50">
              <div className="text-xs text-red-500 mb-1 font-medium">Before</div>
              <div className="font-mono text-xs text-red-800 break-all">
                {formatValue(from)}
              </div>
            </div>
            <div className="p-2 bg-green-50">
              <div className="text-xs text-green-500 mb-1 font-medium">After</div>
              <div className="font-mono text-xs text-green-800 break-all">
                {formatValue(to)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

// ── Helper components ─────────────────────────────────────────
function DetailSection({
  title, children
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase
                     tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label, value, mono = false
}: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-20 shrink-0">{label}</span>
      <span className={`text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
