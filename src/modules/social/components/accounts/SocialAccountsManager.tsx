import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Facebook, Linkedin, Instagram, Youtube, 
  CheckCircle2, AlertCircle, RefreshCcw, 
  Trash2, ExternalLink, Info, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  listAccounts, 
  connectAccount, 
  connectWithToken,
  disconnectAccount, 
  refreshToken, 
  getAccountStatus 
} from '../../index';
import { PLATFORMS } from '../../constants/platforms';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';

// --- TYPES ---
interface AccountCardProps {
  account: any;
  onDisconnect: (id: string) => Promise<void>;
  onRefresh: (id: string) => Promise<void>;
}

function AccountCard({ account, onDisconnect, onRefresh }: AccountCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [statusReport, setStatusReport] = useState<any>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(account.id);
      toast.success(`${account.account_name} token refreshed`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewStatus = async () => {
    setShowStatus(true);
    try {
      const { data } = await getAccountStatus(account.id);
      setStatusReport(data);
    } catch (e: any) {
      toast.error("Failed to fetch status");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      expired: "bg-amber-50 text-amber-700 border-amber-200",
      revoked: "bg-zinc-100 text-zinc-600 border-zinc-200",
      error: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase", styles[status as keyof typeof styles])}>
        {status}
      </span>
    );
  };

  return (
    <motion.div 
      layout
      className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            {getPlatformIcon(account.platform)}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">{account.account_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(account.status)}
              <span className="text-[10px] text-zinc-400">ID: {account.account_id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onRefresh(account.id)} 
            disabled={isRefreshing}
            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
            title="Refresh Token"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => onDisconnect(account.id)} 
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Disconnect"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-zinc-50 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Expiry</p>
          <p className="text-xs text-zinc-900 font-medium">
            {account.token_expires_at ? new Date(account.token_expires_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="p-2 bg-zinc-50 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Last Used</p>
          <p className="text-xs text-zinc-900 font-medium">
            {account.last_used_at ? new Date(account.last_used_at).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      <button 
        onClick={handleViewStatus}
        className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-3 h-3" />
        View Full Status
      </button>

      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Token Health:</span>
                <span className="font-medium text-emerald-600">Healthy</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
                  <span>Daily Quota</span>
                  <span>{statusReport?.rateLimitStatus?.postsSent || 0} / {statusReport?.rateLimitStatus?.postsLimit || 'N/A'}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all" 
                    style={{ width: `${(statusReport?.rateLimitStatus?.postsSent / statusReport?.rateLimitStatus?.postsLimit) * 100 || 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SocialAccountsManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  
  // Token-based connection state
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenPlatform, setTokenPlatform] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState({
    token: '',
    accountName: '',
    accountId: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const { data, error } = await listAccounts();
      if (error) throw error;
      setAccounts(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect(platform: string) {
    const config = PLATFORMS[platform];
    
    if (!config.authUrl) {
      setTokenPlatform(platform);
      setIsTokenModalOpen(true);
      return;
    }

    setIsConnecting(platform);
    try {
      const { data, error } = await connectAccount({ platform });
      if (error) throw error;
      window.location.href = data?.authUrl || '';
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsConnecting(null);
    }
  }

  async function handleTokenConnect() {
    if (!tokenPlatform) return;
    if (!tokenInput.token || !tokenInput.accountName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await connectWithToken({
        platform: tokenPlatform,
        token: tokenInput.token,
        accountName: tokenInput.accountName,
        accountId: tokenInput.accountId,
      });
      if (error) throw error;
      toast.success(`${tokenPlatform} connected successfully`);
      setIsTokenModalOpen(false);
      setTokenInput({ token: '', accountName: '', accountId: '' });
      loadAccounts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm("Are you sure you want to disconnect this account? All scheduled posts for this account will be halted.")) return;
    try {
      const { error } = await disconnectAccount(id);
      if (error) throw error;
      toast.success("Account disconnected successfully");
      loadAccounts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleRefresh(id: string) {
    try {
      const { error } = await refreshToken(id);
      if (error) throw error;
      loadAccounts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Social Accounts</h2>
          <p className="text-zinc-500 text-sm">Manage your connected social media profiles and API tokens.</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(PLATFORMS).map(([id, config]) => (
            <button
              key={id}
              onClick={() => handleConnect(id)}
              disabled={isConnecting === id || !(config as any).freeApiAvailable}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border",
                (config as any).freeApiAvailable 
                  ? "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-500 hover:text-emerald-600" 
                  : "bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-60"
              )}
            >
              {isConnecting === id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Connect {id.charAt(0).toUpperCase() + id.slice(1)}
              {!(config as any).freeApiAvailable && <AlertCircle className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">No accounts connected</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              Connect your social profiles to start scheduling and publishing AI-generated content.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {accounts.map((account: any) => (
              <AccountCard 
                account={account} 
                onDisconnect={handleDisconnect} 
                onRefresh={handleRefresh} 
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {tokenPlatform?.charAt(0).toUpperCase() + tokenPlatform?.slice(1)} Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                {tokenPlatform === 'telegram' ? 'Bot Token' : 'Application Password'}
              </label>
              <input 
                type="password" 
                placeholder="Enter token..."
                className="w-full p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={tokenInput.token}
                onChange={(e) => setTokenInput(prev => ({ ...prev, token: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Account Name</label>
              <input 
                type="text" 
                placeholder="My Business Account"
                className="w-full p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={tokenInput.accountName}
                onChange={(e) => setTokenInput(prev => ({ ...prev, accountName: e.target.value }))}
              />
            </div>
            {tokenPlatform === 'wordpress' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Site URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com"
                  className="w-full p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={tokenInput.accountId}
                  onChange={(e) => setTokenInput(prev => ({ ...prev, accountId: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsTokenModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleTokenConnect}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
            >
              Connect Account
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
