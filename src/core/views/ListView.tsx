/**
 * ListView — Generic data table component driven by model definitions.
 * 
 * Features: sorting, filtering, pagination, row selection, 
 * batch actions, search, and export.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MoreHorizontal, Plus, Download, Trash2, Filter, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ListViewConfig, ViewField, ViewAction } from '../types/ModuleManifest';

interface ListViewProps {
  config: ListViewConfig;
  records: Record<string, any>[];
  total: number;
  loading?: boolean;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  selectedIds?: (string | number)[];
  onPageChange: (page: number) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onSearch: (query: string) => void;
  onSelect?: (ids: (string | number)[]) => void;
  onRowClick?: (record: Record<string, any>) => void;
  onCreate?: () => void;
  onAction?: (action: ViewAction, selectedIds: (string | number)[]) => void;
  onDelete?: (ids: (string | number)[]) => void;
  onExport?: () => void;
}

export default function ListView({
  config,
  records,
  total,
  loading = false,
  page,
  pageSize,
  sortField,
  sortDirection = 'asc',
  searchQuery = '',
  selectedIds = [],
  onPageChange,
  onSort,
  onSearch,
  onSelect,
  onRowClick,
  onCreate,
  onAction,
  onDelete,
  onExport,
}: ListViewProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const totalPages = Math.ceil(total / pageSize);
  const allSelected = records.length > 0 && records.every(r => selectedIds.includes(r.id));

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  }, [localSearch, onSearch]);

  const handleSort = useCallback((fieldName: string) => {
    if (sortField === fieldName) {
      onSort(fieldName, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(fieldName, 'asc');
    }
  }, [sortField, sortDirection, onSort]);

  const toggleSelect = useCallback((id: string | number) => {
    if (!onSelect) return;
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(i => i !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  }, [selectedIds, onSelect]);

  const toggleSelectAll = useCallback(() => {
    if (!onSelect) return;
    if (allSelected) {
      onSelect([]);
    } else {
      onSelect(records.map(r => r.id));
    }
  }, [allSelected, records, onSelect]);

  const formatCellValue = useCallback((record: Record<string, any>, field: ViewField) => {
    const value = record[field.name];
    if (value === null || value === undefined) return '—';

    switch (field.widget) {
      case 'badge':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            {String(value)}
          </span>
        );
      case 'boolean':
        return value ? (
          <div className="w-5 h-5 bg-emerald-100 rounded-md flex items-center justify-center">
            <Check className="w-3 h-3 text-emerald-600" />
          </div>
        ) : (
          <div className="w-5 h-5 bg-zinc-100 rounded-md" />
        );
      case 'monetary':
        return (
          <span className="font-mono font-bold text-zinc-900">
            {Number(value).toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
          </span>
        );
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
      case 'datetime':
        return new Date(value).toLocaleString('fr-FR');
      case 'avatar':
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              {String(record[config.fields[0]?.name] || value || '?').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-zinc-900">{String(value)}</span>
          </div>
        );
      default:
        return String(value);
    }
  }, [config.fields]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
      {/* Header / Toolbar */}
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold text-zinc-800 placeholder:text-zinc-300 outline-none focus:bg-white focus:border-indigo-400 transition-all w-64"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(''); onSearch(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Selection actions */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                  {selectedIds.length} selected
                </span>
                {onDelete && (
                  <button
                    onClick={() => onDelete(selectedIds)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {config.actions?.map(action => (
                  <button
                    key={action.id}
                    onClick={() => onAction?.(action, selectedIds)}
                    className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black italic hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 active:scale-95"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50/50">
              {onSelect && (
                <th className="w-12 p-4">
                  <button
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      allSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {allSelected && <Check className="w-3 h-3" />}
                  </button>
                </th>
              )}
              {config.fields.filter(f => !f.invisible).map(field => (
                <th
                  key={field.name}
                  className="text-left p-4 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors select-none"
                  style={{ width: field.width }}
                  onClick={() => field.sortable !== false && handleSort(field.name)}
                >
                  <div className="flex items-center gap-1.5">
                    {field.label || field.name}
                    {sortField === field.name && (
                      sortDirection === 'asc'
                        ? <ChevronUp className="w-3 h-3 text-indigo-500" />
                        : <ChevronDown className="w-3 h-3 text-indigo-500" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-12 p-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-50">
                  {onSelect && <td className="p-4"><div className="w-5 h-5 bg-zinc-100 rounded-md animate-pulse" /></td>}
                  {config.fields.filter(f => !f.invisible).map(field => (
                    <td key={field.name} className="p-4">
                      <div className="h-4 bg-zinc-100 rounded-lg animate-pulse w-3/4" />
                    </td>
                  ))}
                  <td className="p-4" />
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={config.fields.filter(f => !f.invisible).length + (onSelect ? 2 : 1)}
                  className="text-center py-16"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl">
                      📭
                    </div>
                    <p className="text-sm font-bold text-zinc-400">No records found</p>
                    {onCreate && (
                      <button
                        onClick={onCreate}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Create first record
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record, idx) => (
                <motion.tr
                  key={record.id ?? idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-t border-zinc-50 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                  onClick={() => onRowClick?.(record)}
                >
                  {onSelect && (
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(record.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedIds.includes(record.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-zinc-200 group-hover:border-zinc-300'
                        }`}
                      >
                        {selectedIds.includes(record.id) && <Check className="w-3 h-3" />}
                      </button>
                    </td>
                  )}
                  {config.fields.filter(f => !f.invisible).map(field => (
                    <td key={field.name} className="p-4 text-sm text-zinc-600">
                      {formatCellValue(record, field)}
                    </td>
                  ))}
                  <td className="p-4">
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-100 rounded-lg transition-all">
                      <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {total > 0 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                    page === pageNum
                      ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10'
                      : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="text-zinc-300 text-xs px-1">...</span>
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
