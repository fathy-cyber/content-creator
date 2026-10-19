/**
 * ContactForm — CRM contact create/edit page using the generic FormView.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormView from '../../../core/views/FormView';
import type { FormViewConfig } from '../../../core/types/ModuleManifest';
import { ContactModel } from '../manifest';
import { crmService } from '../crmService';
import type { Contact } from '../crmService';
import '../../project/projectService';

const formConfig: FormViewConfig = {
  type: 'form',
  model: 'crm.contact',
  fields: [
    { name: 'name' }, { name: 'company' }, { name: 'job_title' },
    { name: 'type' }, { name: 'category' },
    { name: 'email' }, { name: 'phone' }, { name: 'mobile' },
    { name: 'website' }, { name: 'address' }, { name: 'city' },
    { name: 'state' }, { name: 'country' },
    { name: 'notes' },
  ],
  layout: {
    sections: [
      { title: 'Contact Information', columns: 2, fields: ['name', 'company', 'job_title', 'type', 'category'] },
      { title: 'Communication', columns: 2, fields: ['email', 'phone', 'mobile', 'website'] },
      { title: 'Address', columns: 2, fields: ['address', 'city', 'state', 'country'] },
      { title: 'Internal', columns: 1, fields: ['notes'] },
    ],
  },
  chatter: true,
};

export default function ContactForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [record, setRecord] = useState<Contact | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew); // loading true if editing

  // Load existing contact for edit mode
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      crmService.getContact(id)
        .then(data => {
          setRecord(data);
          if (!data) setError('Contact not found');
        })
        .catch((e: any) => {
          setError(e.message || 'Failed to load contact');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSave = useCallback(async (values: Record<string, any>) => {
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await crmService.createContact(values);
      } else if (id) {
        await crmService.updateContact(id, values);
      }
      navigate('/crm/contacts');
    } catch (e: any) {
      setError(e.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  }, [id, isNew, navigate]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this contact?')) {
      setDeleting(true);
      crmService.deleteContact(id)
        .then(() => navigate('/crm/contacts'))
        .catch((e: any) => {
          setError(e.message || 'Failed to delete contact');
          setDeleting(false);
        });
    }
  }, [id, navigate]);

  // Show error if any
  const showError = error && (saving || deleting || (!isNew && !record));

  return (
    <div className="max-w-5xl">
      {error && !loading && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <FormView
        config={formConfig}
        fields={ContactModel.fields}
        record={record}
        isNew={isNew}
        saving={saving}
        loading={loading && !record}
        onSave={handleSave}
        onDelete={isNew ? undefined : handleDelete}
        onCancel={() => navigate('/crm/contacts')}
      />
    </div>
  );
}
