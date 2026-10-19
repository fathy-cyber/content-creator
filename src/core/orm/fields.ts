/**
 * Field type utilities and helpers for the ORM.
 * Provides factory functions for defining model fields.
 */

import type { FieldDefinition, SelectionOption } from '../types/ModuleManifest';

// ─── Field Factory Functions ───────────────────────────────

export function CharField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'char', label, ...options };
}

export function TextField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'text', label, ...options };
}

export function IntegerField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'integer', label, ...options };
}

export function FloatField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'float', label, ...options };
}

export function BooleanField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'boolean', label, default: false, ...options };
}

export function DateField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'date', label, ...options };
}

export function DateTimeField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'datetime', label, ...options };
}

export function SelectionField(
  name: string,
  label: string,
  selection: SelectionOption[],
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'selection', label, selection, ...options };
}

export function Many2oneField(
  name: string,
  label: string,
  relation: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'many2one', label, relation, ...options };
}

export function One2manyField(
  name: string,
  label: string,
  relation: string,
  relationField: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'one2many', label, relation, relationField, ...options };
}

export function Many2manyField(
  name: string,
  label: string,
  relation: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'many2many', label, relation, ...options };
}

export function MonetaryField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'monetary', label, ...options };
}

export function EmailField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'email', label, ...options };
}

export function PhoneField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'phone', label, ...options };
}

export function BinaryField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'binary', label, ...options };
}

export function HtmlField(
  name: string,
  label: string,
  options: Partial<FieldDefinition> = {}
): FieldDefinition {
  return { name, type: 'html', label, ...options };
}

// ─── Common Field Presets ──────────────────────────────────

/** Standard ID field (auto-generated) */
export const IdField: FieldDefinition = {
  name: 'id',
  type: 'integer',
  label: 'ID',
  readonly: true,
};

/** Standard name field */
export const NameField: FieldDefinition = {
  name: 'name',
  type: 'char',
  label: 'Name',
  required: true,
};

/** Standard active field for soft delete */
export const ActiveField: FieldDefinition = {
  name: 'active',
  type: 'boolean',
  label: 'Active',
  default: true,
};

/** Standard created_at timestamp */
export const CreatedAtField: FieldDefinition = {
  name: 'created_at',
  type: 'datetime',
  label: 'Created',
  readonly: true,
};

/** Standard updated_at timestamp */
export const UpdatedAtField: FieldDefinition = {
  name: 'updated_at',
  type: 'datetime',
  label: 'Last Updated',
  readonly: true,
};

/** Standard notes/description field */
export const NotesField: FieldDefinition = {
  name: 'notes',
  type: 'text',
  label: 'Internal Notes',
};
