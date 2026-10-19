import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCcw, AlertTriangle, CheckCircle2, 
  Clock, ExternalLink, Search, Filter 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { listPublishJobs, retryJob } from '../../index';

export default function PublishJobMonitor() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const interval = setInterval(fetchJobs, 10000); // Poll every 10s
    fetchJobs();
    return () => clearInterval(interval);
  }, []);

  async function fetchJobs() {
    try {
      const { data, error } = await listPublishJobs({ 
        status: filterStatus === 'all' ? undefined : filterStatus 
      });
      if (error) throw error;
      setJobs(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRetry(id: string) {
    try {
      const { error } = await retryJob(id);
      if (error) throw error;
      toast.success("Job requeued successfully");
      fetchJobs();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'failed': return "bg-red-100 text-red-700 border-red-200";
      case 'dead': return "bg-zinc-900 text-white border-zinc-800";
      case 'in_progress': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'pending': return "bg-zinc-100 text-zinc-600 border-zinc-200";
      default: return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Publishing Monitor</h2>
          <p className="text-zinc-500 text-sm">Real-time status of your social media publish jobs.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 rounded-lg border border-zinc-200 bg-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="dead">Dead</option>
          </select>
          <button 
            onClick={fetchJobs}
            className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all"
          >
            <RefreshCcw className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">No jobs found</h3>
            <p className="text-zinc-500 text-sm">Schedule some posts to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {jobs.map(job => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-500">
                    {/* Platform Icon placeholder */}
                    <span className="text-[10px] font-bold uppercase">{job.platform[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">Post {job.ai_post_id.slice(0, 8)}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getStatusStyle(job.status))}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleString()}
                      </span>
                      {job.retry_count > 0 && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Retry {job.retry_count}/{job.max_retries}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {job.status === 'failed' && job.retry_count < job.max_retries && (
                    <button 
                      onClick={() => handleRetry(job.id)}
                      className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-all flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" /> Retry
                    </button>
                  )}
                  {job.status === 'published' && (
                    <button className="p-2 text-zinc-400 hover:text-emerald-600 rounded-lg transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  {job.status === 'dead' && (
                    <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                      <AlertTriangle className="w-3 h-3" /> Fatal
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
