import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, MessageSquare, Loader2, ArrowLeft, Clock, User 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { assetManager } from '@/core/assets/AssetManager';

export default function ClientReviewPortal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadAsset() {
      if (!token) {
        toast.error('No review token provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await assetManager.validateReviewToken(token);
        if (error || !data) {
          toast.error(error?.message || 'Invalid or expired review token');
          setAsset(null);
        } else {
          setAsset(data);
        }
      } catch (e: any) {
        toast.error('An error occurred while fetching the asset');
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [token]);

  const handleSubmit = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !comment) {
      toast.error('Please provide a reason for the changes');
      return;
    }

    setActionLoading(true);
    try {
      // In a real app, we'd have a client userId from the token metadata
      const mockClientUserId = 'client_user_123'; 
      const { error } = await assetManager.transitionStatus(
        asset.id, 
        status, 
        mockClientUserId, 
        comment
      );

      if (error) throw error;

      setSubmitted(true);
      toast.success(status === 'approved' ? 'Asset approved!' : 'Changes requested');
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-zinc-500 font-medium">Loading your review asset...</p>
        </div>
      </div>
    );
  }

  if (!asset || submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            {submitted ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {submitted ? 'Review Submitted' : 'Asset Not Found'}
            </h2>
            <p className="text-zinc-500 mt-2">
              {submitted 
                ? 'Thank you for your feedback. Your team has been notified.' 
                : 'This review link is invalid, expired, or has already been used.'}
            </p>
          </div>
          {submitted && (
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Asset Review</h1>
            <p className="text-zinc-500">Please review the following content and provide your feedback.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-600 shadow-sm">
            <Clock className="w-3 h-3" />
            Expires in 7 days
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                    {asset.title[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900">{asset.title}</h2>
                    <p className="text-xs text-zinc-500">Version {asset.version_number || '1'} • {asset.platform || 'WEB'}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-zinc max-w-none">
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 whitespace-pre-wrap text-zinc-800 leading-relaxed">
                  {asset.currentContent}
                </div>
              </div>
            </div>
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" /> Your Feedback
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Comments / Change Requests</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 transition-all min-h-[150px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell your team what needs to be changed..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleSubmit('approved')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-100"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Approve Asset
                  </button>
                  
                  <button 
                    onClick={() => handleSubmit('rejected')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
                    Request Changes
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-500 font-medium">Reviewing as Client Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
