/**
 * KanbanView — Drag-and-drop kanban board driven by selection field stages.
 * 
 * Groups records by a selection field and allows dragging cards
 * between columns to change their stage.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { KanbanViewConfig, SelectionOption } from '../types/ModuleManifest';

interface KanbanViewProps {
  config: KanbanViewConfig;
  records: Record<string, any>[];
  stages: SelectionOption[];
  loading?: boolean;
  onStageChange: (recordId: string | number, newStage: string) => void;
  onRecordClick: (record: Record<string, any>) => void;
  onQuickCreate?: (stage: string, name: string) => void;
}

export default function KanbanView({
  config,
  records,
  stages,
  loading = false,
  onStageChange,
  onRecordClick,
  onQuickCreate,
}: KanbanViewProps) {
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [quickCreateStage, setQuickCreateStage] = useState<string | null>(null);
  const [quickCreateName, setQuickCreateName] = useState('');
  const quickCreateRef = useRef<HTMLInputElement>(null);

  // Group records by stage
  const grouped = stages.map(stage => ({
    stage,
    records: records.filter(r => r[config.groupField] === stage.value),
  }));

  const handleDragStart = useCallback((e: React.DragEvent, recordId: string | number) => {
    setDraggedId(recordId);
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent drag image
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageValue: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageValue);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stageValue: string) => {
    e.preventDefault();
    if (draggedId !== null) {
      onStageChange(draggedId, stageValue);
    }
    setDraggedId(null);
    setDragOverStage(null);
  }, [draggedId, onStageChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverStage(null);
  }, []);

  const handleQuickCreate = useCallback((stage: string) => {
    if (quickCreateName.trim() && onQuickCreate) {
      onQuickCreate(stage, quickCreateName.trim());
      setQuickCreateName('');
      setQuickCreateStage(null);
    }
  }, [quickCreateName, onQuickCreate]);

  // Stage colors
  const stageColors: Record<string, string> = {
    new: 'from-blue-500 to-blue-600',
    qualified: 'from-indigo-500 to-indigo-600',
    proposition: 'from-violet-500 to-violet-600',
    negotiation: 'from-amber-500 to-amber-600',
    won: 'from-emerald-500 to-emerald-600',
    lost: 'from-rose-500 to-rose-600',
    todo: 'from-zinc-400 to-zinc-500',
    'in-progress': 'from-blue-500 to-blue-600',
    done: 'from-emerald-500 to-emerald-600',
    cancelled: 'from-rose-500 to-rose-600',
  };

  if (loading) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage.value} className="min-w-[300px] bg-zinc-50 rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="h-6 bg-zinc-200 rounded-lg w-1/2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-4 min-h-[500px]">
      {grouped.map(({ stage, records: stageRecords }) => (
        <div
          key={stage.value}
          className={`min-w-[300px] max-w-[340px] flex-shrink-0 flex flex-col rounded-2xl transition-all duration-200 ${
            dragOverStage === stage.value
              ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset'
              : 'bg-zinc-50/70'
          }`}
          onDragOver={e => handleDragOver(e, stage.value)}
          onDrop={e => handleDrop(e, stage.value)}
          onDragLeave={() => setDragOverStage(null)}
        >
          {/* Column Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${
                stage.color || stageColors[stage.value] || 'from-zinc-400 to-zinc-500'
              }`} />
              <h3 className="text-xs font-black uppercase tracking-[0.1em] text-zinc-600 italic">
                {stage.label}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black text-zinc-400 bg-white rounded-md border border-zinc-100">
                {stageRecords.length}
              </span>
            </div>
            {config.quickCreate && onQuickCreate && (
              <button
                onClick={() => {
                  setQuickCreateStage(stage.value);
                  setTimeout(() => quickCreateRef.current?.focus(), 100);
                }}
                className="p-1.5 text-zinc-300 hover:text-zinc-600 hover:bg-white rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Create Input */}
          <AnimatePresence>
            {quickCreateStage === stage.value && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2"
              >
                <div className="bg-white rounded-xl border border-indigo-200 p-3 shadow-sm">
                  <input
                    ref={quickCreateRef}
                    type="text"
                    value={quickCreateName}
                    onChange={e => setQuickCreateName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleQuickCreate(stage.value);
                      if (e.key === 'Escape') setQuickCreateStage(null);
                    }}
                    placeholder="Record name..."
                    className="w-full text-sm font-bold text-zinc-800 placeholder:text-zinc-300 outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleQuickCreate(stage.value)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setQuickCreateStage(null)}
                      className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards */}
          <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]">
            <AnimatePresence>
              {stageRecords.map((record, idx) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: draggedId === record.id ? 0.5 : 1,
                    scale: draggedId === record.id ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={e => handleDragStart(e as any, record.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onRecordClick(record)}
                  className="bg-white rounded-xl border border-zinc-100 p-4 cursor-pointer hover:shadow-md hover:border-zinc-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">
                        {record[config.titleField]}
                      </h4>
                      {config.descriptionField && record[config.descriptionField] && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {record[config.descriptionField]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab" />
                    </div>
                  </div>

                  {/* Card Footer - show additional fields */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {config.fields
                      .filter(f => !f.invisible && f.name !== config.titleField && f.name !== config.descriptionField && f.name !== config.groupField)
                      .slice(0, 3)
                      .map(field => {
                        const val = record[field.name];
                        if (!val) return null;
                        return (
                          <span
                            key={field.name}
                            className="px-2 py-0.5 text-[10px] font-bold text-zinc-500 bg-zinc-50 rounded-md border border-zinc-100 truncate max-w-[120px]"
                            title={`${field.label}: ${val}`}
                          >
                            {String(val)}
                          </span>
                        );
                      })}
                    
                    {/* Avatar placeholder */}
                    {config.imageField && record[config.imageField] ? (
                      <img
                        src={record[config.imageField]}
                        alt=""
                        className="w-6 h-6 rounded-full ml-auto"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[8px] font-black ml-auto shrink-0">
                        {String(record[config.titleField] || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {stageRecords.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-300 font-bold">No records</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
