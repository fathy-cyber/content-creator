import React, { useState, useEffect } from 'react';
import { ProjectListRow } from '@/types/project.types';
import { 
  updateProject 
} from '@/lib/projects/projects.mutations';
import { 
  fetchContacts as getContacts 
} from '@/lib/projects/projects.queries';
import { 
  User, 
  Phone, 
  Mail, 
  Globe, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';

type ClientPortalTabProps = {
  projectId: number;
  project?: ProjectListRow;
  isEditMode: boolean;
  onSave: (data: any) => Promise<void>;
};

export const ClientPortalTab = ({ projectId, project, isEditMode, onSave }: ClientPortalTabProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  if (!project && !isEditMode) return <div className="p-8 text-center text-slate-500">Project data not available</div>;

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading client data...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-blue-200">
              {project?.client_name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 space-y-4">
              {isEditMode ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Select Client *</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm max-w-md"
                    defaultValue={project?.customer_id}
                    onChange={async (e) => {
                      const contact = contacts.find(c => c.id === parseInt(e.target.value));
                      if (contact) {
                        await onSave({ 
                          customer_id: parseInt(e.target.value), 
                          customer_name: contact.name 
                        });
                      }
                    }}
                  >
                    <option value="">Select Contact</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{project?.client_name}</h3>
                    <p className="text-sm text-slate-500">{project?.client_company}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>client@example.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>+216 00 000 000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>www.client-site.com</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400 uppercase">Total Client Revenue</span>
                  <span className="text-lg font-bold text-slate-900">$0.00</span>
                </div>
                {project?.payment_status === 'overdue' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue Invoices Detected
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-white rounded border border-slate-200">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">Client Portal Preview</h4>
        </div>
        
         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-2xl mx-auto">
           <div className="flex justify-between items-start mb-6">
             <div>
               <h5 className="text-lg font-bold text-slate-900">{project?.name || 'New Project'}</h5>
               <div className="flex items-center gap-2 mt-1">
                 <StatusBadge status={project?.status || 'active'} type="project" />
                 <span className="text-xs text-slate-500">
                   {project?.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} → {project?.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                 </span>
               </div>
             </div>
             <div className="text-right">
               <span className="text-xs font-medium text-slate-400 block mb-1">Overall Progress</span>
               <div className="w-32">
                 <ProgressBar value={project?.task_completion_pct || 0} size="sm" colorAuto />
               </div>
             </div>
           </div>

          <div className="space-y-4">
            <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Milestones</h6>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {i}
                    </div>
                    <span className="text-sm text-slate-700">Milestone {i} Name</span>
                  </div>
                  <span className="text-xs text-slate-500">Target: 2025-06-15</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
