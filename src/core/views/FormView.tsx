/**
 * FormView — Dynamic form renderer driven by field definitions.
 * 
 * Renders appropriate form inputs for each field type,
 * handles validation, dirty tracking, and provides
 * a chatter/activity section.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Save, X, ArrowLeft, Trash2, MoreHorizontal,
  Calendar, Clock, ChevronDown, Check, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import type { FormViewConfig, FieldDefinition, ViewAction } from '../types/ModuleManifest';

interface FormViewProps {
  config: FormViewConfig;
  fields: FieldDefinition[];
  record?: Record<string, any>;
  isNew?: boolean;
  loading?: boolean;
  saving?: boolean;
  onSave: (values: Record<string, any>) => void;
  onDelete?: () => void;
  onCancel: () => void;
  onAction?: (action: ViewAction) => void;
  relatedRecords?: Record<string, Record<string, any>[]>; // For many2one display
}

export default function FormView({
  config,
  fields,
  record,
  isNew = false,
  loading = false,
  saving = false,
  onSave,
  onDelete,
  onCancel,
  onAction,
  relatedRecords = {},
}: FormViewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  // Initialize form data from record or defaults
  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      const defaults: Record<string, any> = {};
      for (const field of fields) {
        if (field.default !== undefined) {
          defaults[field.name] = field.default;
        }
      }
      setFormData(defaults);
    }
    setDirtyFields(new Set());
    setErrors({});
  }, [record, fields]);

  const isDirty = dirtyFields.size > 0;

  const handleChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setDirtyFields(prev => new Set([...prev, fieldName]));
    // Clear error on change
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    for (const field of fields) {
      const value = formData[field.name];

      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
        newErrors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
      }

      if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
        newErrors[field.name] = `${field.label} must be at most ${field.maxLength} characters`;
      }

      if (field.min !== undefined && typeof value === 'number' && value < field.min) {
        newErrors[field.name] = `${field.label} must be at least ${field.min}`;
      }

      if (field.max !== undefined && typeof value === 'number' && value > field.max) {
        newErrors[field.name] = `${field.label} must be at most ${field.max}`;
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field.name] = 'Invalid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  }, [formData, validate, onSave]);

  // Get visible fields based on config
  const visibleFields = useMemo(() => {
    const configFieldNames = new Set(config.fields.map(f => f.name));
    return fields
      .filter(f => !f.invisible && configFieldNames.has(f.name))
      .sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));
  }, [fields, config.fields]);

  // Group fields by section if layout provided
  const sections = useMemo(() => {
    if (config.layout?.sections) {
      return config.layout.sections.map(section => ({
        ...section,
        fieldDefs: section.fields
          .map(fname => visibleFields.find(f => f.name === fname))
          .filter(Boolean) as FieldDefinition[],
      }));
    }
    return [{ title: undefined, columns: 2, fieldDefs: visibleFields, fields: visibleFields.map(f => f.name) }];
  }, [config.layout, visibleFields]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-100 rounded-xl w-1/3" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-zinc-100 rounded w-1/4" />
                <div className="h-10 bg-zinc-50 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-black italic text-zinc-900 font-serif">
            {isNew ? 'New Record' : (formData.name || formData.title || `Record #${formData.id}`)}
          </h2>
          {isDirty && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 rounded-md border border-amber-100">
              Unsaved
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {config.actions?.map(action => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction?.(action)}
              className="px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
            >
              {action.label}
            </button>
          ))}
          {onDelete && !isNew && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={saving || (!isNew && !isDirty)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black italic hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? 'border-t border-zinc-100' : ''}>
            {section.title && (
              <div className="px-8 pt-6 pb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-300 italic font-serif">
                  {section.title}
                </h3>
              </div>
            )}
            <div
              className="p-8 grid gap-6"
              style={{ gridTemplateColumns: `repeat(${section.columns ?? 2}, 1fr)` }}
            >
              {section.fieldDefs.map(field => (
                <FieldRenderer
                  // @ts-ignore - React 19 typing issue
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  error={errors[field.name]}
                  onChange={(v) => handleChange(field.name, v)}
                  relatedRecords={relatedRecords[field.relation ?? ''] ?? []}
                  readOnly={field.readonly}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}

// ─── Field Renderer ────────────────────────────────────────

interface FieldRendererProps {
  field: FieldDefinition;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  relatedRecords?: Record<string, any>[];
  readOnly?: boolean;
}

function FieldRenderer({ field, value, error, onChange, relatedRecords, readOnly }: FieldRendererProps) {
  const baseInputClass = `w-full px-4 py-3 bg-zinc-50 border rounded-xl text-sm font-bold text-zinc-800 placeholder:text-zinc-300 outline-none transition-all ${
    error
      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
      : 'border-zinc-100 focus:bg-white focus:border-indigo-400'
  } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'html':
        return (
          <textarea
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.help || `Enter ${field.label.toLowerCase()}...`}
            rows={4}
            readOnly={readOnly}
            className={`${baseInputClass} resize-y`}
          />
        );

      case 'integer':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder={field.help || '0'}
            step={1}
            min={field.min}
            max={field.max}
            readOnly={readOnly}
            className={baseInputClass}
          />
        );

      case 'float':
      case 'monetary':
        return (
          <div className="relative">
            <input
              type="number"
              value={value ?? ''}
              onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder={field.help || '0.00'}
              step={0.01}
              min={field.min}
              max={field.max}
              readOnly={readOnly}
              className={`${baseInputClass} ${field.type === 'monetary' ? 'pr-16' : ''}`}
            />
            {field.type === 'monetary' && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                TND
              </span>
            )}
          </div>
        );

      case 'boolean':
        return (
          <button
            type="button"
            onClick={() => !readOnly && onChange(!value)}
            className={`w-12 h-7 rounded-full relative transition-all ${
              value ? 'bg-indigo-600' : 'bg-zinc-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
              value ? 'left-6' : 'left-1'
            }`} />
          </button>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
              readOnly={readOnly}
              className={baseInputClass}
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          </div>
        );

      case 'datetime':
        return (
          <div className="relative">
            <input
              type="datetime-local"
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
              readOnly={readOnly}
              className={baseInputClass}
            />
            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          </div>
        );

      case 'selection':
        return (
          <div className="relative">
            <select
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
              disabled={readOnly}
              className={`${baseInputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select {field.label}...</option>
              {field.selection?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          </div>
        );

      case 'many2one':
        return (
          <div className="relative">
            <select
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
              disabled={readOnly}
              className={`${baseInputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select {field.label}...</option>
              {relatedRecords?.map(rec => (
                <option key={rec.id} value={rec.id}>
                  {rec.name || rec.title || rec.id}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          </div>
        );

      case 'email':
        return (
          <input
            type="email"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.help || 'email@example.com'}
            readOnly={readOnly}
            className={baseInputClass}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.help || '+216 XX XXX XXX'}
            readOnly={readOnly}
            className={baseInputClass}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.help || 'https://...'}
            readOnly={readOnly}
            className={baseInputClass}
          />
        );

      case 'char':
      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.help || `Enter ${field.label.toLowerCase()}...`}
            minLength={field.minLength}
            maxLength={field.maxLength}
            readOnly={readOnly}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={field.type === 'text' || field.type === 'html' ? 'col-span-full' : ''}>
      <label className="block text-xs font-black uppercase tracking-[0.1em] text-zinc-400 mb-2 italic">
        {field.label}
        {field.required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
      {field.help && !error && (
        <p className="mt-1 text-[11px] text-zinc-300">{field.help}</p>
      )}
    </div>
  );
}
