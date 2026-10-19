import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Activity, Zap, CheckCircle2, 
  XCircle, Clock, LineChart, AlertTriangle
} from 'lucide-react';

const STATS = [
  { label: 'Total Runs (30d)', value: '28,401', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
  { label: 'Success Rate', value: '99.8%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { label: 'Errors Allowed', value: '42', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-100' },
  { label: 'Active Workflows', value: '15', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-100' },
];

const RECENT_LOGS = [
  { id: 'log_901', workflow: 'Abandoned Cart SMS', status: 'success', time: '2 mins ago', duration: '120ms' },
  { id: 'log_902', workflow: 'Abandoned Cart SMS', status: 'success', time: '5 mins ago', duration: '115ms' },
  { id: 'log_903', workflow: 'Lead Sync to HubSpot', status: 'success', time: '14 mins ago', duration: '340ms' },
  { id: 'log_904', workflow: 'Post-Purchase Review', status: 'error', time: '22 mins ago', duration: '1500ms', error: 'API Timeout (Mailchimp)' },
  { id: 'log_905', workflow: 'Lead Sync to HubSpot', status: 'success', time: '45 mins ago', duration: '320ms' },
  { id: 'log_906', workflow: 'Welcome Sequence Email', status: 'success', time: '1 hour ago', duration: '145ms' },
];

export default function AutomationDashboard() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 mb-2">
          <BarChart className="w-8 h-8 text-indigo-500" />
          Execution Dashboard
        </h1>
        <p className="text-zinc-500 text-lg">
          Real-time monitoring of your active automation workflows and operational health.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</h3>
                <div className="text-3xl font-black text-zinc-900 tracking-tight">{stat.value}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* Run Chart Mock */}
        <div className="xl:w-2/3 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-500" /> Workflow Executions
                </h2>
                <p className="text-sm text-zinc-500">Volume over the last 7 days</p>
              </div>
              <select className="bg-zinc-50 border border-zinc-200 text-sm font-semibold text-zinc-700 py-1.5 px-3 rounded-lg outline-none">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           
           {/* Abstract Bar Chart */}
           <div className="flex-1 min-h-[250px] relative flex items-end justify-between gap-2 pt-6 pb-8 border-b border-zinc-100">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-mono text-zinc-400 font-bold">
                 <span>2K</span>
                 <span>1.5K</span>
                 <span>1K</span>
                 <span>500</span>
                 <span>0</span>
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 bottom-8 left-6 flex flex-col justify-between pointer-events-none">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-full border-t border-zinc-100 border-dashed"></div>)}
              </div>

              {/* Bars */}
              {[40, 65, 45, 80, 55, 90, 75].map((height, idx) => (
                <div key={idx} className="relative w-full max-w-[40px] z-10 mx-auto flex flex-col justify-end group cursor-pointer h-full ml-6">
                   <div 
                     className="w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-400 transition-all opacity-90" 
                     style={{ height: `${height}%` }}
                   ></div>
                   {/* Tooltip */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                     {height * 20} Runs
                   </div>
                   {/* X Axis Label */}
                   <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-500 uppercase">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Execution Logs */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
           <div className="p-6 border-b border-zinc-100 shrink-0">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-500" /> Recent Logs
              </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="sticky top-0 bg-zinc-50/90 backdrop-blur border-b border-zinc-100 z-10">
                    <tr>
                       <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                       <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Workflow</th>
                       <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100 text-sm">
                    {RECENT_LOGS.map((log) => (
                       <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4">
                             {log.status === 'success' ? (
                               <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 w-fit px-2 py-1 rounded">
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Success
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs bg-rose-50 w-fit px-2 py-1 rounded group relative cursor-help">
                                 <XCircle className="w-3.5 h-3.5" /> Error
                                 
                                 <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                   {log.error}
                                 </div>
                               </div>
                             )}
                          </td>
                          <td className="px-6 py-4 font-medium text-zinc-900">
                             {log.workflow}
                             <div className="text-[10px] text-zinc-400 font-mono mt-0.5">ID: {log.id} • {log.duration}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-500 font-medium">
                             {log.time}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-4 border-t border-zinc-100 bg-zinc-50 text-center shrink-0">
             <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Full Export</button>
           </div>
        </div>

      </div>
    </div>
  );
}
