'use client';

import React from 'react';
import { X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    workflowId: string;
    cron: string;
    payload: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    workflowId: string;
    cron: string;
    payload: string;
  }>>;
  workflows: { id: string; name: string }[];
  cronPreview: string;
  cronError: string;
}

export default function JobCreationModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  workflows,
  cronPreview,
  cronError,
}: JobCreationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Schedule New Job</h3>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Workflow</label>
            <select 
              className="w-full p-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              value={formData.workflowId}
              onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
              required
            >
              <option value="">Select a workflow...</option>
              {workflows.map(wf => (
                <option key={wf.id} value={wf.id}>{wf.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              Cron Expression
              <span className="text-[10px] font-normal text-zinc-400">(Standard Cron Format)</span>
            </label>
            <input 
              type="text" 
              className={cn(
                "w-full p-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all",
                cronError ? "border-red-500 focus:border-red-500" : "border-zinc-200 focus:border-indigo-500"
              )}
              value={formData.cron}
              onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
              placeholder="* * * * *"
              required
            />
            {cronError ? (
              <p className="text-xs text-red-500 font-medium">{cronError}</p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                <Calendar className="w-3 h-3" />
                <span>Next run: <strong className="text-zinc-700">{cronPreview}</strong></span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Payload (JSON)</label>
            <textarea 
              className="w-full p-2.5 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24"
              value={formData.payload}
              onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!!cronError || !formData.workflowId}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Schedule Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
