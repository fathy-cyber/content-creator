import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, 
  Filter, Search, MoreVertical, ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { listPosts, approvePost, rejectPost, schedulePost, listAccounts } from '../../index';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface ApprovalQueueProps {}

export default function ApprovalQueue() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scheduling state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedulingPost, setSchedulingPost] = useState<{ id: string, date: string } | null>(null);

  useEffect(() => {
    loadPosts();
    loadAccounts();
  }, [activeTab]);

  async function loadAccounts() {
    try {
      const { data, error } = await listAccounts();
      if (error) throw error;
      setAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccountId(data[0].id);
      }
    } catch (e: any) {
      console.error('Failed to load accounts:', e);
    }
  }

  async function loadPosts() {
    setIsLoading(true);
    try {
      const statusFilter = activeTab === 'all' ? undefined : activeTab === 'pending' ? 'in_review' : activeTab;
      const { data, error } = await listPosts({ status: statusFilter });
      if (error) throw error;
      setPosts(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(postId: string) {
    try {
      if (!user) throw new Error("You must be logged in to approve posts");

      // Mock role check: In a real app, this would check the user's role from auth context
      const userRole = 'admin'; 
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error("You do not have permission to approve posts");
      }

      const { error } = await approvePost(postId, user.id);
      if (error) throw error;
      toast.success("Post approved successfully");
      loadPosts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleReject(postId: string) {
    try {
      if (!user) throw new Error("You must be logged in to reject posts");

      const userRole = 'admin'; 
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error("You do not have permission to reject posts");
      }

      const reason = prompt("Reason for rejection:");
      if (!reason) return;
      const { error } = await rejectPost(postId, user.id, reason);
      if (error) throw error;
      toast.success("Post rejected");
      loadPosts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleSchedule(postId: string) {
    if (!schedulingPost || !schedulingPost.date) {
      toast.error("Please select a date and time");
      return;
    }
    if (!selectedAccountId) {
      toast.error("Please select a social account");
      return;
    }

    try {
      const { error } = await schedulePost(
        postId, 
        new Date(schedulingPost.date), 
        selectedAccountId
      );
      if (error) throw error;
      toast.success("Post scheduled successfully");
      setIsModalOpen(false);
      setSchedulingPost(null);
      loadPosts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const openScheduleModal = (post: any) => {
    setSchedulingPost({ id: post.id, date: '' });
    setIsModalOpen(true);
  };

  const filteredPosts = posts.filter(p => 
    p.generated_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
          {['pending', 'approved', 'rejected', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize",
                activeTab === tab 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab === 'pending' ? 'Pending Review' : tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">No posts found</h3>
            <p className="text-zinc-500 text-sm">No posts match your current filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredPosts.map(post => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-emerald-200 transition-all flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase">
                      {post.platform}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Submitted {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 line-clamp-2 leading-relaxed">
                    {post.generated_content}
                  </p>
                  {post.status === 'in_review' && (
                    <div className="flex items-center gap-2 text-amber-600 text-[10px] font-medium">
                      <Clock className="w-3 h-3" />
                      Awaiting review for {Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60))} hours
                    </div>
                  )}
                </div>
                
                <div className="flex md:flex-col justify-end gap-2 min-w-[140px]">
                  {post.status === 'in_review' && (
                    <>
                      <button 
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(post.id)}
                        className="flex-1 px-3 py-2 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {post.status === 'approved' && (
                    <button 
                      onClick={() => openScheduleModal(post)}
                      className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3 h-3" /> Schedule
                    </button>
                  )}
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Social Account</label>
              <select 
                className="w-full p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.platform} - {acc.username || acc.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={schedulingPost?.date || ''}
                onChange={(e) => setSchedulingPost(prev => prev ? { ...prev, date: e.target.value } : null)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => schedulingPost && handleSchedule(schedulingPost.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              Confirm Schedule
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
