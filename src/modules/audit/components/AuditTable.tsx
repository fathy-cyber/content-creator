// src/modules/audit/components/AuditTable.tsx

import React from 'react';
import { type AuditLog } from '../../../shared/audit/auditService';

const ACTION_CONFIG: Record<string, {
  label:  string;
  color:  string;
  icon:   string;
}> = {
  CREATE:   { label: 'Created',   color: 'bg-green-100 text-green-800',  icon: '✚' },
  UPDATE:   { label: 'Updated',   color: 'bg-blue-100 text-blue-800',    icon: '✎' },
  DELETE:   { label: 'Deleted',   color: 'bg-red-100 text-red-800',      icon: '✕' },
  RESTORE:  { label: 'Restored',  color: 'bg-purple-100 text-purple-800',icon: '↩' },
  APPROVE:  { label: 'Approved',  color: 'bg-green-100 text-green-800',  icon: '✓' },
  REJECT:   { label: 'Rejected',  color: 'bg-red-100 text-red-800',      icon: '✗' },
  SEND:     { label: 'Sent',      color: 'bg-blue-100 text-blue-800',    icon: '→' },
  PAY:      { label: 'Paid',      color: 'bg-green-100 text-green-800',  icon: '₮' },
  VOID:     { label: 'Voided',    color: 'bg-gray-100 text-gray-800',    icon: '⊘' },
  WRITEOFF: { label: 'Written off',color: 'bg-orange-100 text-orange-800',icon: '~' },
  CONFIRM:  { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-800',icon: '◉' },
  COMPLETE: { label: 'Completed', color: 'bg-teal-100 text-teal-800',    icon: '✔' },
  CANCEL:   { label: 'Cancelled', color: 'bg-red-100 text-red-800',      icon: '✕' },
  LOGIN:    { label: 'Login',     color: 'bg-gray-100 text-gray-700',    icon: '⇥' },
  EXPORT:   { label: 'Exported',  color: 'bg-yellow-100 text-yellow-800',icon: '↗' },
};

interface Props {
  logs:       AuditLog[];
  isLoading:  boolean;
  selectedId?: string;
  onSelect:   (log: AuditLog) => void;
}

export function AuditTable({ logs, isLoading, selectedId, onSelect }: Props) {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2
                        border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
        <tr>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-36">
            When
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-28">
            Action
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600">
            Record
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">
            Module
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-40">
            User
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-20">
            Changes
          </th>
          <th className="px-4 py-3 text-left font-medium text-gray-600 w-20">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {logs.map((log) => {
          const action  = ACTION_CONFIG[log.action] ?? {
            label: log.action,
            color: 'bg-gray-100 text-gray-700',
            icon:  '•',
          };
          const isSelected = log.id === selectedId;

          return (
            <tr
              key={log.id}
              onClick={() => onSelect(log)}
              className={`cursor-pointer transition-colors
                ${isSelected
                  ? 'bg-indigo-50 border-l-2 border-indigo-500'
                  : 'hover:bg-gray-50'
                }`}
            >
              {/* When */}
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                <div className="font-mono text-xs">
                  {formatDate(log.createdAt)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatRelative(log.createdAt)}
                </div>
              </td>

              {/* Action Badge */}
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1
                                  px-2 py-0.5 rounded-full text-xs font-medium
                                  ${action.color}`}>
                  <span>{action.icon}</span>
                  {action.label}
                </span>
              </td>

              {/* Record */}
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {log.entityLabel ?? log.entityId ?? '—'}
                </div>
                <div className="text-xs text-gray-400">
                  {log.entityType}
                </div>
              </td>

              {/* Module */}
              <td className="px-4 py-3">
                <ModuleBadge module={log.module} />
              </td>

              {/* User */}
              <td className="px-4 py-3">
                <UserCell log={log} />
              </td>

              {/* Changed Fields Count */}
              <td className="px-4 py-3">
                {log.changedFields && log.changedFields.length > 0 ? (
                  <span className="text-xs bg-gray-100 text-gray-600
                                   px-1.5 py-0.5 rounded font-mono">
                    {log.changedFields.length} field{log.changedFields.length > 1 ? 's' : ''}
                  </span>
                ) : '—'}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusDot status={log.status} />
              </td>
            </tr>
          );
        })}

        {logs.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
              No audit entries found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ── Sub-components ────────────────────────────────────────────

function ModuleBadge({ module }: { module: string }) {
  const colors: Record<string, string> = {
    invoice:   'bg-green-50  text-green-700  border-green-200',
    billing:   'bg-teal-50   text-teal-700   border-teal-200',
    sales:     'bg-blue-50   text-blue-700   border-blue-200',
    crm:       'bg-purple-50 text-purple-700 border-purple-200',
    project:   'bg-orange-50 text-orange-700 border-orange-200',
    support:   'bg-red-50    text-red-700    border-red-200',
    auth:      'bg-gray-50   text-gray-700   border-gray-200',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize
                      ${colors[module] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {module}
    </span>
  );
}

function UserCell({ log }: { log: AuditLog }) {
  if (log.actorType === 'system' || log.actorType === 'worker') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-lg">⚙️</span>
        <span className="text-xs text-gray-500 capitalize">{log.actorType}</span>
      </div>
    );
  }
  return (
    <div>
      <div className="text-gray-900 truncate max-w-[140px]">
      {log.userEmail ?? 'Unknown'}
      </div>
      {log.userRole && (
        <div className="text-xs text-gray-400 capitalize">{log.userRole}</div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const config = {
    success: { color: 'bg-green-400', label: 'OK'      },
    failure: { color: 'bg-red-400',   label: 'Failed'  },
    partial: { color: 'bg-yellow-400',label: 'Partial' },
  }[status] ?? { color: 'bg-gray-400', label: status };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs text-gray-500">{config.label}</span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60_000);
  const h    = Math.floor(diff / 3_600_000);
  const d    = Math.floor(diff / 86_400_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return      `${d}d ago`;
}

function exportAuditCsv(logs: AuditLog[]) {
  const headers = [
    'Date','Action','Module','Entity','Record',
    'User','Role','Changed Fields','Status'
  ].join(',');

  const rows = logs.map((l) => [
    l.createdAt,
    l.action,
    l.module,
    l.entityType,
    l.entityLabel ?? l.entityId ?? '',
    l.userEmail   ?? l.actorType,
    l.userRole    ?? '',
    (l.changedFields ?? []).join(';'),
    l.status,
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
