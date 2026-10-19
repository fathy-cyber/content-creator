/**
 * ContactList — CRM contacts list page using the generic ListView.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../core/views/ListView';
import type { ListViewConfig, ViewAction } from '../../../core/types/ModuleManifest';
import { crmService } from '../crmService';
import type { Contact } from '../crmService';


const listConfig: ListViewConfig = {
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
  searchFields: ['name', 'email', 'company'],
  defaultOrder: 'name asc',
  pagination: { pageSize: 20 },
};

export default function ContactList() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load contacts from service
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await crmService.getContacts();
        if (mounted) setContacts(data);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load contacts');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Filter and sort client-side for now
  const filtered = contacts
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (c.name && c.name.toLowerCase().includes(q)) ||
             (c.email && c.email.toLowerCase().includes(q)) ||
             (c.company && c.company.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const aVal = String((a as any)[sortField] || '');
      const bVal = String((b as any)[sortField] || '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-black italic text-zinc-900 font-serif tracking-tight">
          Contacts
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-bold">
          Manage all your business contacts and companies
        </p>
      </div>

      {loading && (
        <div className="text-sm text-zinc-500">Loading contacts...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {!loading && (
        <ListView
          config={listConfig}
          records={filtered}
          total={filtered.length}
          page={page}
          pageSize={20}
          sortField={sortField}
          sortDirection={sortDir}
          searchQuery={search}
          selectedIds={selected}
          onPageChange={setPage}
          onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
          onSearch={setSearch}
          onSelect={setSelected}
          onRowClick={(record) => navigate(`/crm/contacts/${record.id}`)}
          onCreate={() => navigate('/crm/contacts/new')}
          onDelete={async (ids) => {
            try {
              for (const id of ids) {
                await crmService.deleteContact(id);
              }
              // Refresh list after deletions
              const data = await crmService.getContacts();
              setContacts(data);
              setSelected([]);
            } catch (e: any) {
              setError(e.message || 'Failed to delete contacts');
            }
          }}
          onExport={() => console.log('Export contacts')}
        />
      )}
    </div>
  );
}
