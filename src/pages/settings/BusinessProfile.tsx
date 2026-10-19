import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Globe, Target, Users, 
  Briefcase, Rocket, Sparkles, Save, 
  RefreshCcw, Info, CheckCircle2,
  TrendingUp, BarChart3, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INDUSTRIES = [
  'E-commerce & Retail',
  'Professional Services',
  'Software & Tech',
  'Food & Beverage',
  'Real Estate',
  'Education',
  'Healthcare',
  'Manufacturing',
  'Other'
];

const GOALS = [
  { id: 'sales', title: 'Increase Sales', desc: 'Boost revenue via digital channels.', icon: TrendingUp },
  { id: 'leads', title: 'Generate Leads', desc: 'Find more potential customers.', icon: Users },
  { id: 'brand', title: 'Brand Awareness', desc: 'Get more visibility in Tunisia.', icon: Target },
  { id: 'auto', title: 'Automate Ops', desc: 'Reduce manual support & sales.', icon: Rocket },
];

export default function BusinessProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['sales']);
  
  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Business Profile</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Tell Ayech AI about your business to get tailored growth strategies.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Main Form */}
        <div className="xl:col-span-8 space-y-8">
           <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Building2 className="w-3 h-3" /> Company Name
                    </label>
                    <input 
                      required
                      defaultValue="Ayech Digital Solutions"
                      className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Website
                    </label>
                    <input 
                      type="url"
                      placeholder="https://yourbusiness.tn"
                      className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Briefcase className="w-3 h-3" /> Industry
                    </label>
                    <select className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm appearance-none">
                       {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <MapPin className="w-3 h-3" /> Local Market
                    </label>
                    <select className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm appearance-none">
                       <option>Grand Tunis</option>
                       <option>Sousse / Sahel</option>
                       <option>Sfax</option>
                       <option>All Tunisia</option>
                       <option>International</option>
                    </select>
                 </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Goals Section */}
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 italic">Growth Goals</h3>
                    <p className="text-xs font-bold text-zinc-400">Select up to 3 objectives you want to focus on this quarter.</p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {GOALS.map(goal => {
                      const Icon = goal.icon;
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left group",
                            isSelected ? "bg-zinc-900 border-zinc-900 text-white shadow-xl" : "bg-white border-zinc-100 hover:border-zinc-300"
                          )}
                        >
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110", isSelected ? "bg-white/10 border-white/20 text-white" : "bg-zinc-50 border-white text-zinc-400")}>
                              <Icon className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className={cn("text-xs font-black uppercase tracking-tight", isSelected ? "text-white" : "text-zinc-900")}>{goal.title}</h4>
                              <p className={cn("text-[10px] font-medium leading-tight", isSelected ? "text-zinc-400" : "text-zinc-400")}>{goal.desc}</p>
                           </div>
                        </button>
                      )
                    })}
                 </div>
              </div>

              <div className="flex justify-end pt-6">
                 <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-indigo-400" />}
                    {isSaving ? 'Updating Strategy...' : 'Save Business DNA'}
                 </button>
              </div>
           </form>
        </div>

        {/* Right: Insights & Stats */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 italic">
                 <Sparkles className="w-6 h-6 text-amber-300" /> AI Personalization
              </h3>
              <p className="text-sm font-bold text-indigo-50 leading-relaxed mb-6 opacity-90">
                 By setting your industry to <strong>E-commerce</strong>, Ayech AI will prioritize automation templates for inventory and order management.
              </p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                 <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Strategy Match: 85%</p>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-zinc-400" /> Quick Snapshot
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Active Goals", val: selectedGoals.length },
                   { label: "Business Age", val: "2 Years" },
                   { label: "Last Audit", val: "Yesterday" }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                      <span className="text-sm font-black text-zinc-900 italic font-serif">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Need to change your tax ID or legal name for invoices? Please go to the <span className="text-zinc-900 border-b border-zinc-900">Billing & Invoices</span> section.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
