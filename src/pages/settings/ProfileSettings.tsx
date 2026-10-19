import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, Lock, 
  Camera, ShieldCheck, CheckCircle2, 
  RefreshCcw, Save, Trash2, Globe,
  Moon, Sun, ChevronRight, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
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
        <h1 className="text-3xl font-extrabold text-zinc-900 italic font-serif">Profile Settings</h1>
        <p className="text-zinc-500 font-medium tracking-tight">Manage your digital identity across the Ayech AI platform.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* Left: Main Form */}
        <div className="xl:col-span-8 space-y-8">
           <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-105 duration-500">
                       <User className="w-12 h-12" />
                    </div>
                    <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg hover:scale-110 transition-transform">
                       <Camera className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-zinc-900 italic">Your Avatar</h3>
                    <p className="text-xs font-bold text-zinc-400 mb-4">Recommended: 400x400px. JPG, PNG or GIF.</p>
                    <div className="flex gap-3 justify-center md:justify-start">
                       <button type="button" className="px-5 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-md">Upload Photo</button>
                       <button type="button" className="px-5 py-2.5 bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-rose-500 transition-all">Remove</button>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <User className="w-3 h-3" /> Full Name
                    </label>
                    <input 
                      defaultValue="Mohamed Ayech"
                      className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input 
                      disabled
                      defaultValue="mohamed@ayech-ai.tn"
                      className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-100 text-zinc-400 font-bold text-sm cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input 
                      defaultValue="+216 22 123 456"
                      className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Timezone
                    </label>
                    <select className="w-full p-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-sm appearance-none">
                       <option>(GMT+01:00) Tunis, Tunisia</option>
                       <option>(GMT+00:00) London, UK</option>
                    </select>
                 </div>
              </div>

              <div className="flex justify-end pt-6">
                 <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                 >
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving Changes...' : 'Update Profile'}
                 </button>
              </div>
           </form>
        </div>

        {/* Right: Security & Preferences */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                 <Lock className="w-4 h-4 text-rose-500" /> Security
              </h3>
              
              <div className="space-y-4">
                 <button className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:bg-zinc-900 hover:text-white transition-all">
                    <span className="text-xs font-black uppercase tracking-widest">Change Password</span>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                 </button>

                 <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div>
                       <span className="text-xs font-black uppercase tracking-widest block">Two-Factor Auth</span>
                       <span className="text-[10px] font-bold text-zinc-400">Added security layer</span>
                    </div>
                    <div className="w-12 h-6 bg-zinc-200 rounded-full relative cursor-pointer p-1">
                       <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" /> Privacy Control
              </h3>
              <p className="text-xs font-bold text-indigo-100 leading-relaxed mb-6 opacity-90">
                 Your data is encrypted with enterprise-grade standards. We never sell your business insights to third parties.
              </p>
              <button className="w-full py-4 bg-white text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                 Manage Data Privacy
              </button>
           </div>

           <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                 <Info className="w-5 h-5" />
              </div>
              <p className="text-[10px] text-zinc-400 font-bold leading-relaxed italic">
                Need to delete your account? Contact <span className="text-zinc-900 border-b border-zinc-900">support@ayech-ai.tn</span>. All your data will be permanently wiped.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}
