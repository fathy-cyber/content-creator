import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitMerge, Play, Save, ChevronDown, Plus, 
  Mail, MessageSquare, Database, Trash2, Clock, Zap, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  type: 'trigger' | 'action' | 'delay' | 'condition';
  title: string;
  app: string;
  icon: any;
  color: string;
}

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', title: 'New Subscriber Added', app: 'Mailchimp', icon: Mail, color: 'text-amber-500' }
  ]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('My New Workflow');
  const [isSaving, setIsSaving] = useState(false);

  // Available Tools to add
  const AVAILABLE_ACTIONS = [
    { type: 'action', title: 'Send Email Campaign', app: 'Mailchimp', icon: Mail, color: 'text-amber-500' },
    { type: 'action', title: 'Send WhatsApp Message', app: 'Twilio', icon: MessageSquare, color: 'text-green-500' },
    { type: 'action', title: 'Create CRM Contact', app: 'HubSpot', icon: Database, color: 'text-orange-500' },
    { type: 'delay', title: 'Delay execution', app: 'Timer', icon: Clock, color: 'text-zinc-500' },
    { type: 'condition', title: 'If / Else Branching', app: 'Logic', icon: GitMerge, color: 'text-indigo-500' }
  ];

  const addNode = (action: any) => {
    const newNode: Node = {
      ...action,
      id: Math.random().toString(36).substr(2, 9)
    };
    setNodes([...nodes, newNode]);
    setIsDrawerOpen(false);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden relative">
      
      {/* Top Header */}
      <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <GitMerge className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="font-bold text-lg text-zinc-900 bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 transition-colors w-64 px-1"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden sm:block">Status: <span className="text-amber-500 ml-1">Draft</span></span>
          <div className="h-4 w-px bg-zinc-200 mx-2 hidden sm:block"></div>
          <button className="px-4 py-2 border border-zinc-200 bg-white text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50 transition-colors text-sm flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-500" /> Test
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"></span> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving' : 'Save & Enable'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#f8fafc]/90">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="min-w-full min-h-full flex flex-col items-center py-16 px-4 relative z-10">
          
          <AnimatePresence>
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div key={node.id} className="flex flex-col items-center w-full">
                  
                  {/* The Node Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full max-w-[320px] bg-white border border-zinc-200 rounded-2xl shadow-lg relative group transition-all hover:shadow-xl hover:border-indigo-300"
                  >
                    {/* Number Badge */}
                    <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-zinc-900 border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-sm z-10">
                      {index + 1}
                    </div>

                    {/* Delete button (hidden on first trigger node) */}
                    {index > 0 && (
                      <button 
                        onClick={() => removeNode(node.id)}
                        className="absolute -right-3 -top-3 w-7 h-7 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Settings Button */}
                    <button className="absolute right-3 top-3 p-1.5 text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <Settings className="w-4 h-4" />
                    </button>

                    <div className="p-5 flex flex-col pb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", 
                          node.type === 'trigger' ? "bg-amber-100 text-amber-700" : 
                          node.type === 'delay' ? "bg-zinc-100 text-zinc-600" : 
                          node.type === 'condition' ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {node.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", node.type === 'trigger' ? "bg-zinc-50 border-zinc-200" : "bg-white border-zinc-100 shadow-sm")}>
                           <Icon className={cn("w-6 h-6", node.color)} />
                        </div>
                        <div className="flex-1 pr-6">
                          <h3 className="font-bold text-zinc-900 leading-tight mb-1">{node.title}</h3>
                          <p className="text-xs text-zinc-500">{node.app}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Node Config Summary Footer */}
                    <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl text-[11px] font-medium text-zinc-500 flex items-center justify-between">
                      {node.type === 'trigger' ? 'Runs when: "List = Customers"' : node.type === 'delay' ? 'Waits 24 Hours' : 'Configured'}
                      {node.type !== 'delay' && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Configured properly"></span>}
                    </div>
                  </motion.div>

                  {/* Connecting Line */}
                  <div className="w-px h-12 bg-zinc-300 relative group">
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-transparent cursor-pointer hover:w-6 transition-all z-10"></div>
                  </div>
                </div>
              );
            })}
          </AnimatePresence>

          {/* Add Node Button */}
          <motion.div layout className="relative z-20 w-full max-w-[320px] flex justify-center">
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border-4 border-zinc-50 ring-4 ring-transparent hover:ring-indigo-100"
            >
              <Plus className={cn("w-6 h-6 transition-transform", isDrawerOpen && "rotate-45")} />
            </button>
            
            {/* Drawer positioning below button */}
            <AnimatePresence>
              {isDrawerOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 16, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-12 left-1/2 -translate-x-1/2 w-80 bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50 shrink-0">
                    <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                       <Zap className="w-4 h-4 text-emerald-500" /> Choose next step
                    </h4>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto hide-scrollbar space-y-1">
                    {AVAILABLE_ACTIONS.map((action, i) => (
                      <button 
                        key={i}
                        onClick={() => addNode(action)}
                        className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                          <action.icon className={cn("w-5 h-5", action.color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 text-sm">{action.title}</p>
                          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">{action.app}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="h-32 pointer-events-none"></div> {/* Buffer space */}
        </div>
      </div>
      
    </div>
  );
}
