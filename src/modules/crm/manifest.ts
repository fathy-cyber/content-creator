/**
 * CRM Module — Contacts, Leads, Opportunities, and Pipeline management.
 * 
 * First ERP module built on the new modular architecture.
 */

import { lazy } from 'react';
import type { ModuleManifest, ModelDefinition } from '../../core/types/ModuleManifest';
import {
  CharField, TextField, EmailField, PhoneField, SelectionField,
  Many2oneField, One2manyField, MonetaryField, DateField, DateTimeField,
  BooleanField, FloatField, IdField, NameField, ActiveField, CreatedAtField, UpdatedAtField
} from '../../core/orm/fields';
import { crmService } from './crmService';

// Lazy-load CRM page components
const ContactList = lazy(() => import('./pages/ContactList'));
const ContactForm = lazy(() => import('./pages/ContactForm'));
const LeadKanban = lazy(() => import('./pages/LeadKanban'));
const CRMDashboard = lazy(() => import('./pages/CRMDashboard'));

// ─── Models ────────────────────────────────────────────────

export const ContactModel: ModelDefinition = {
  name: 'crm.contact',
  label: 'Contact',
  labelPlural: 'Contacts',
  description: 'Manage business contacts and companies.',
  table: 'crm_contacts',
  icon: 'Users',
  recName: 'name',
  order: 'name asc',
  fields: [
    IdField,
    NameField,
    CharField('company', 'Company'),
    CharField('job_title', 'Job Title'),
    EmailField('email', 'Email'),
    PhoneField('phone', 'Phone'),
    PhoneField('mobile', 'Mobile'),
    CharField('website', 'Website'),
    TextField('address', 'Address'),
    CharField('city', 'City'),
    CharField('state', 'State/Governorate'),
    CharField('country', 'Country', { default: 'Tunisia' }),
    SelectionField('type', 'Contact Type', [
      { value: 'individual', label: 'Individual' },
      { value: 'company', label: 'Company' },
    ], { default: 'individual' }),
    SelectionField('category', 'Category', [
      { value: 'customer', label: 'Customer' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'prospect', label: 'Prospect' },
      { value: 'partner', label: 'Partner' },
      { value: 'other', label: 'Other' },
    ], { default: 'prospect' }),
    TextField('notes', 'Internal Notes'),
    Many2oneField('assigned_to', 'Assigned To', 'users'),
    ActiveField,
    CreatedAtField,
    UpdatedAtField,
  ],
};

export const LeadModel: ModelDefinition = {
  name: 'crm.lead',
  label: 'Lead',
  labelPlural: 'Leads',
  description: 'Manage sales leads and pipeline.',
  table: 'crm_leads',
  icon: 'UserPlus',
  recName: 'name',
  order: 'created_at desc',
  fields: [
    IdField,
    NameField,
    Many2oneField('contact_id', 'Contact', 'crm.contact'),
    CharField('company', 'Company'),
    EmailField('email', 'Email'),
    PhoneField('phone', 'Phone'),
    SelectionField('stage', 'Stage', [
      { value: 'new', label: 'New', color: 'from-blue-500 to-blue-600' },
      { value: 'qualified', label: 'Qualified', color: 'from-indigo-500 to-indigo-600' },
      { value: 'proposition', label: 'Proposition', color: 'from-violet-500 to-violet-600' },
      { value: 'negotiation', label: 'Negotiation', color: 'from-amber-500 to-amber-600' },
      { value: 'won', label: 'Won', color: 'from-emerald-500 to-emerald-600' },
      { value: 'lost', label: 'Lost', color: 'from-rose-500 to-rose-600' },
    ], { default: 'new' }),
    SelectionField('priority', 'Priority', [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ], { default: 'medium' }),
    MonetaryField('expected_revenue', 'Expected Revenue'),
    FloatField('probability', 'Probability (%)', { min: 0, max: 100, default: 10 }),
    SelectionField('source', 'Source', [
      { value: 'website', label: 'Website' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'referral', label: 'Referral' },
      { value: 'cold-call', label: 'Cold Call' },
      { value: 'event', label: 'Event' },
      { value: 'other', label: 'Other' },
    ]),
    DateField('expected_close_date', 'Expected Close Date'),
    TextField('description', 'Description'),
    TextField('notes', 'Internal Notes'),
    Many2oneField('assigned_to', 'Assigned To', 'users'),
    CharField('lost_reason', 'Lost Reason'),
    ActiveField,
    CreatedAtField,
    UpdatedAtField,
  ],
};

export const ActivityModel: ModelDefinition = {
  name: 'crm.activity',
  label: 'Activity',
  labelPlural: 'Activities',
  description: 'Track activities and interactions.',
  table: 'crm_activities',
  icon: 'Activity',
  order: 'date desc',
  fields: [
    IdField,
    CharField('summary', 'Summary', { required: true }),
    SelectionField('type', 'Type', [
      { value: 'call', label: 'Phone Call' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'email', label: 'Email' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'note', label: 'Note' },
      { value: 'task', label: 'Task' },
    ], { required: true }),
    DateTimeField('date', 'Date', { required: true }),
    TextField('description', 'Description'),
    Many2oneField('contact_id', 'Contact', 'crm.contact'),
    Many2oneField('lead_id', 'Lead', 'crm.lead'),
    Many2oneField('assigned_to', 'Assigned To', 'users'),
    BooleanField('done', 'Done', { default: false }),
    CreatedAtField,
  ],
};

// ─── Module Manifest ───────────────────────────────────────

export const CRMManifest: ModuleManifest = {
  id: 'crm',
  name: 'CRM',
  summary: 'Contacts, leads, activities, and customer pipeline.',
  version: '1.0.0',
  description: 'Customer Relationship Management — manage contacts, leads, and sales pipeline.',
  icon: 'Users',
  color: '#6366f1',
  category: 'erp',
  depends: [],
  application: true,
  sequence: 100,
  license: 'LGPL-3',
  requiredTier: 'free',
  isCore: false,
  onActivate: async (services) => {
    services.get('services').register('crm.contact', crmService);
  },

  routes: [
    { path: '/crm', component: CRMDashboard, label: 'CRM Dashboard' },
    { path: '/crm/contacts', component: ContactList, label: 'Contacts' },
    { path: '/crm/contacts/new', component: ContactForm, label: 'New Contact' },
    { path: '/crm/contacts/:id', component: ContactForm, label: 'Edit Contact' },
    { path: '/crm/leads', component: LeadKanban, label: 'Leads Pipeline' },
  ],

  sidebarItems: [
    { id: 'crm-dash', label: 'CRM', href: '/crm', icon: 'Users', sequence: 100 },
    { id: 'crm-contacts', label: 'Contacts', href: '/crm/contacts', icon: 'BookUser', parentId: 'crm-dash', sequence: 101 },
    { id: 'crm-leads', label: 'Leads Pipeline', href: '/crm/leads', icon: 'UserPlus', parentId: 'crm-dash', sequence: 102 },
  ],

  models: [ContactModel, LeadModel, ActivityModel],

  views: [
    {
      type: 'list',
      model: 'crm.contact',
      fields: [
        { name: 'name', label: 'Name', widget: 'avatar', sortable: true },
        { name: 'company', label: 'Company', sortable: true },
        { name: 'email', label: 'Email', sortable: true },
        { name: 'phone', label: 'Phone' },
        { name: 'category', label: 'Category', widget: 'badge', sortable: true },
        { name: 'city', label: 'City', sortable: true },
      ],
      searchFields: ['name', 'email', 'company', 'phone'],
      defaultOrder: 'name asc',
      pagination: { pageSize: 20 },
    },
    {
      type: 'form',
      model: 'crm.contact',
      fields: [
        { name: 'name' }, { name: 'company' }, { name: 'job_title' },
        { name: 'type' }, { name: 'category' },
        { name: 'email' }, { name: 'phone' }, { name: 'mobile' },
        { name: 'website' }, { name: 'address' }, { name: 'city' },
        { name: 'state' }, { name: 'country' },
        { name: 'assigned_to' }, { name: 'notes' },
      ],
      layout: {
        sections: [
          { title: 'Contact Info', columns: 2, fields: ['name', 'company', 'job_title', 'type', 'category'] },
          { title: 'Communication', columns: 2, fields: ['email', 'phone', 'mobile', 'website'] },
          { title: 'Address', columns: 2, fields: ['address', 'city', 'state', 'country'] },
          { title: 'Internal', columns: 1, fields: ['assigned_to', 'notes'] },
        ],
      },
      chatter: true,
    },
    {
      type: 'kanban',
      model: 'crm.lead',
      groupField: 'stage',
      titleField: 'name',
      descriptionField: 'company',
      quickCreate: true,
      fields: [
        { name: 'name' },
        { name: 'company' },
        { name: 'expected_revenue', widget: 'monetary' },
        { name: 'probability' },
        { name: 'source', widget: 'badge' },
        { name: 'stage' },
        { name: 'priority' },
      ],
    },
  ],

  dashboardWidgets: [],
  settingsPages: [],
  actions: [],
  busEvents: [
    {
      name: 'crm.contact.created',
      description: 'Published when a contact is created so downstream modules can create onboarding projects, activities, or sales flows.',
      channel: 'crm',
      payload: {
        contact: 'New CRM contact payload',
      },
    },
  ],
};

export default CRMManifest;
