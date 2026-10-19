import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  MoreVertical, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu';
import { Switch } from '../../../components/ui/switch';

const MOCK_WORKFLOWS = [
  { 
    id: 'wf_1', 
    name: 'Abandoned Cart SMS Recovery', 
    description: 'Sends a reminder SMS to customers who left items in their cart for 2 hours.', 
    status: 'active', 
    trigger: 'Cart Abandoned', 
    lastRun: '2 mins ago', 
    successRate: '98.2%', 
    runs: 1240 
  },
  { 
    id: 'wf_2', 
    name: 'Lead Sync to HubSpot', 
    description: 'Automatically syncs new Facebook Lead Ads to HubSpot CRM.', 
    status: 'active', 
    trigger: 'New FB Lead', 
    lastRun: '15 mins ago', 
    successRate: '100%', 
    runs: 850 
  },
  { 
    id: 'wf_3', 
    name: 'Post-Purchase Review Request', 
    description: 'Requests a Google review 7 days after order delivery.', 
    status: 'inactive', 
    trigger: 'Order Delivered', 
    lastRun: '2 days ago', 
    successRate: '85.4%', 
    runs: 420 
  },
  { 
    id: 'wf_4', 
    name: 'Welcome Email Sequence', 
    description: 'Onboards new subscribers with a 5-day email drip campaign.', 
    status: 'active', 
    trigger: 'New Subscriber', 
    lastRun: '1 hour ago', 
    successRate: '99.1%', 
    runs: 3100 
  },
  { 
    id: 'wf_5', 
    name: 'Customer Support Ticket Alert', 
    description: 'Notifies the team via Slack when a high-priority ticket is created.', 
    status: 'inactive', 
    trigger: 'Ticket Created', 
    lastRun: '5 hours ago', 
    successRate: '92.0%', 
    runs: 150 
  },
];

export default function WorkflowDashboard() {
  const [search, setSearch] = useState('');
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);

  const toggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === id ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' } : wf
    ));
  };

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(search.toLowerCase()) || 
    wf.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Workflows</h1>
          <p className="text-zinc-500">Manage and monitor your automated business processes.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-fit">
          <Plus className="w-4 h-4" /> Create Workflow
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search workflows..." 
            className="pl-10 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredWorkflows.map((wf) => (
          <div 
            key={wf.id} 
            className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-zinc-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {wf.name}
                  </h3>
                  <Badge variant={wf.status === 'active' ? 'default' : 'secondary'} className={wf.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {wf.status}
                  </Badge>
                </div>
                <p className="text-zinc-500 text-sm max-w-2xl">
                  {wf.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Trigger: <span className="text-zinc-700">{wf.trigger}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last run: <span className="text-zinc-700">{wf.lastRun}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Success: <span className="text-zinc-700">{wf.successRate}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</span>
                  <Switch 
                    checked={wf.status === 'active'} 
                    onCheckedChange={() => toggleStatus(wf.id)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-indigo-600">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="cursor-pointer">Edit Workflow</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">View Logs</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-rose-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredWorkflows.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-3xl">
            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No workflows found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
