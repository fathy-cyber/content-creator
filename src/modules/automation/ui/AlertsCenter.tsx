'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  recipientId: string;
  channel: string;
  payload: any;
  status: string;
  createdAt: Date;
}

interface AlertsCenterProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function AlertsCenter({ alerts, onMarkRead, onMarkAllRead }: AlertsCenterProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-full max-h-[calc(100vh-200px)]">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <Bell className="w-4 h-4 text-indigo-600" />
          Alerts Center
        </div>
        <button 
          onClick={onMarkAllRead}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-all"
        >
          Mark all read
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length > 0 ? alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={cn(
              "p-3 rounded-lg border transition-all group",
              alert.status === 'UNSENT' 
                ? "bg-amber-50 border-amber-100" 
                : "bg-zinc-50 border-zinc-100 opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  alert.status === 'UNSENT' ? "bg-amber-200 text-amber-700" : "bg-zinc-200 text-zinc-500"
                )}>
                  {alert.status === 'UNSENT' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 leading-tight">
                    {alert.payload?.message || 'System Notification'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                    <span className="uppercase font-bold">{alert.channel}</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              {alert.status === 'UNSENT' && (
                <button 
                  onClick={() => onMarkRead(alert.id)}
                  className="p-1 text-zinc-400 hover:text-indigo-600 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No alerts available.
          </div>
        )}
      </div>
    </div>
  );
}
