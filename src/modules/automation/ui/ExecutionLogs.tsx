import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';

const MOCK_LOGS = [
  { id: 'log_901', workflow: 'Abandoned Cart SMS', status: 'success', time: '2 mins ago', duration: '120ms', trigger: 'Cart Abandoned', result: 'SMS Sent' },
  { id: 'log_902', workflow: 'Abandoned Cart SMS', status: 'success', time: '5 mins ago', duration: '115ms', trigger: 'Cart Abandoned', result: 'SMS Sent' },
  { id: 'log_903', workflow: 'Lead Sync to HubSpot', status: 'success', time: '14 mins ago', duration: '340ms', trigger: 'New FB Lead', result: 'Contact Created' },
  { id: 'log_904', workflow: 'Post-Purchase Review', status: 'error', time: '22 mins ago', duration: '1500ms', trigger: 'Order Delivered', result: 'Failed', error: 'API Timeout (Mailchimp)' },
  { id: 'log_905', workflow: 'Lead Sync to HubSpot', status: 'success', time: '45 mins ago', duration: '320ms', trigger: 'New FB Lead', result: 'Contact Created' },
  { id: 'log_906', workflow: 'Welcome Sequence Email', status: 'success', time: '1 hour ago', duration: '145ms', trigger: 'New Subscriber', result: 'Email Sent' },
  { id: 'log_907', workflow: 'Abandoned Cart SMS', status: 'success', time: '2 hours ago', duration: '110ms', trigger: 'Cart Abandoned', result: 'SMS Sent' },
  { id: 'log_908', workflow: 'Lead Sync to HubSpot', status: 'error', time: '3 hours ago', duration: '2100ms', trigger: 'New FB Lead', result: 'Failed', error: 'Invalid API Key' },
  { id: 'log_909', workflow: 'Post-Purchase Review', status: 'success', time: '5 hours ago', duration: '130ms', trigger: 'Order Delivered', result: 'Email Sent' },
  { id: 'log_910', workflow: 'Welcome Sequence Email', status: 'success', time: '8 hours ago', duration: '160ms', trigger: 'New Subscriber', result: 'Email Sent' },
];

export default function ExecutionLogs() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.workflow.toLowerCase().includes(search.toLowerCase()) || 
                          log.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'success' && log.status === 'success') || 
                          (filter === 'error' && log.status === 'error');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Execution Logs</h1>
          <p className="text-zinc-500">Detailed history of every workflow execution and its outcome.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by workflow or log ID..." 
            className="pl-10 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            className={filter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'success' ? 'default' : 'outline'} 
            className={filter === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white'}
            onClick={() => setFilter('success')}
          >
            Success
          </Button>
          <Button 
            variant={filter === 'error' ? 'default' : 'outline'} 
            className={filter === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-white'}
            onClick={() => setFilter('error')}
          >
            Errors
          </Button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-zinc-50 transition-colors group">
                <TableCell>
                  {log.status === 'success' ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 w-fit px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Success
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs bg-rose-50 w-fit px-2 py-1 rounded">
                      <XCircle className="w-3.5 h-3.5" /> Error
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-zinc-900">{log.workflow}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">ID: {log.id}</div>
                </TableCell>
                <TableCell className="text-sm text-zinc-600">{log.trigger}</TableCell>
                <TableCell>
                  {log.status === 'success' ? (
                    <span className="text-sm text-zinc-600">{log.result}</span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-600 text-sm font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {log.error}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-500 font-mono">{log.duration}</TableCell>
                <TableCell className="text-sm text-zinc-500">{log.time}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-indigo-600">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500">No logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
