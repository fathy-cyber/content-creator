import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, Zap, Sparkles, Target, 
  MessageSquare, Layout, Globe, ArrowRight,
  ShieldCheck, CheckCircle2, Star, Users,
  ChevronRight, Play, Heart, Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    title: 'Precision Automation',
    desc: 'Automate lead capture and nurturing with local WhatsApp and SMS triggers.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  {
    title: 'Content Studio',
    desc: 'Generate viral Tunisian captions and video scripts in seconds, not hours.',
    icon: Layout,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50'
  },
  {
    title: 'Native Support',
    desc: 'Empathetic AI replies in Tunisian Arabic that build genuine customer trust.',
    icon: MessageSquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
  {
    title: 'Growth Strategy',
    desc: 'Deep-dive website audits and competitor intel for the local market.',
    icon: Target,
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-24 z-50 bg-white/70 backdrop-blur-2xl border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
           <Link to="/" className="text-2xl font-black text-zinc-900 italic tracking-tighter group">
              Ayech<span className="text-indigo-600 group-hover:text-indigo-500 transition-colors">AI</span>
           </Link>
           <div className="hidden md:flex items-center gap-10">
              <Link to="/pricing" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</Link>
              <a href="#features" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
              <Link to="/login" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">Log In</Link>
              <Link to="/register" className="px-8 py-3.5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all hover:-translate-y-0.5 active:translate-y-0">Get Started Free</Link>
           </div>
           <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
              <div className="w-6 h-0.5 bg-zinc-900" />
              <div className="w-6 h-0.5 bg-zinc-900" />
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-12">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-sm"
           >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-serif italic">First AI Native Platform for Tunisia</span>
           </motion.div>

           <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 leading-[1.05] tracking-tighter italic font-serif"
           >
              Automate your <br/>
              <span className="text-indigo-600">Digital Empire.</span>
           </motion.h1>

           <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-500 font-medium max-w-3xl mx-auto leading-relaxed"
           >
              "Ayech AI empowers Tunisian business owners to dominate the digital market with local automation, native content, and strategic intelligence."
           </motion.p>

           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-6"
           >
              <Link to="/register" className="px-10 py-5 bg-zinc-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 group flex items-center gap-3">
                 Start Building My Empire <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white border-2 border-zinc-100 text-zinc-700 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-3">
                 <Play className="w-5 h-5 text-indigo-500" /> Watch Demo
              </button>
           </motion.div>

           {/* Metrics Grid */}
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto"
           >
              {[
                { label: 'Active Users', value: '500+' },
                { label: 'Content Generated', value: '1.2M+' },
                { label: 'Average Growth', value: '5X' },
                { label: 'Support Accuracy', value: '98%' },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                   <div className="text-3xl font-black text-zinc-900 italic">{m.value}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-serif">{m.label}</div>
                </div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white border-y border-zinc-100">
         <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-24">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">The Ayech Ecosystem</h2>
               <h3 className="text-4xl md:text-5xl font-black text-zinc-900 italic font-serif tracking-tight">Everything you need to <span className="text-indigo-600">Scale</span>.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
               {FEATURES.map((feat, i) => (
                 <div key={i} className="p-10 rounded-[2.5rem] bg-zinc-50 border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-2xl transition-all duration-700 group cursor-default">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:rotate-12 duration-500 group-shadow-sm", feat.bg, feat.color, "border border-white")}>
                       <feat.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-zinc-900 mb-4 italic leading-tight">{feat.title}</h4>
                    <p className="text-sm font-bold text-zinc-500 leading-relaxed mb-8">{feat.desc}</p>
                    <div className="w-8 h-1 bg-zinc-100 group-hover:w-full group-hover:bg-indigo-500 transition-all duration-1000" />
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-32 px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="md:w-1/2 space-y-8">
                  <div className="w-20 h-2 bg-indigo-500 rounded-full" />
                  <h2 className="text-4xl md:text-5xl font-black text-zinc-900 italic font-serif leading-tight">Native Intelligence for a <span className="text-indigo-600">Tunisian</span> Audience.</h2>
                  <p className="text-lg text-zinc-500 font-medium leading-relaxed italic">
                     "We don't just translate English scripts. We build AI that understands the nuances of Tunisian Darja, the rhythm of local commerce, and the specific pain points of our market."
                  </p>
                  <div className="flex items-center gap-4 py-4">
                     <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-white">
                        <Users className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="text-sm font-black text-zinc-900">100% Native Arabic Support</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Context-aware generation</div>
                     </div>
                  </div>
               </div>
               <div className="md:w-1/2 relative">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
                  <div className="relative bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-2xl space-y-8 max-w-sm ml-auto">
                     <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-sm font-bold text-zinc-700 italic leading-relaxed">
                        "Finally, a tool that speaks my language. I went from 20 orders a day to 100+ just by using the AI content generator and automation hub."
                     </p>
                     <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900" />
                        <div>
                           <div className="text-xs font-black text-zinc-800 italic">Amine J.</div>
                           <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Founder, Local Brands TN</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto bg-zinc-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[140px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500 rounded-full blur-[120px] opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 space-y-10">
               <h2 className="text-4xl md:text-7xl font-black italic tracking-tight font-serif">Ready to launch your empire?</h2>
               <p className="text-xl text-zinc-400 font-medium max-w-xl mx-auto italic">
                  Join 500+ Tunisian entrepreneurs who are scaling faster with AI.
               </p>
               <div className="flex flex-wrap justify-center gap-6">
                  <Link to="/register" className="px-12 py-6 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 group flex items-center gap-3 font-serif italic">
                     Claim my Spot Now <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">No credit card required. Cancel anytime.</p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-100 bg-white">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
               <Link to="/" className="text-2xl font-black text-zinc-900 italic tracking-tighter">
                  Ayech<span className="text-indigo-600">AI</span>
               </Link>
               <p className="text-xs font-bold text-zinc-400 leading-relaxed italic max-w-xs">
                  Your Digital Empire, Automated. The first AI native platform designed specifically for the Tunisian market.
               </p>
            </div>
            <div>
               <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-6">Product</h5>
               <ul className="space-y-4">
                  <li><Link to="/pricing" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</Link></li>
                  <li><a href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">API Hub</a></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-6">Company</h5>
               <ul className="space-y-4">
                  <li><a href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">About Us</a></li>
                  <li><a href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Career</a></li>
                  <li><a href="#" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</a></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-6">Support</h5>
               <ul className="space-y-4 text-xs font-bold text-zinc-500">
                  <li>Email: contact@ayech-ai.tn</li>
                  <li>Phone: +216 22 123 456</li>
                  <li>Tunis, Tunisia</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">© 2026 Ayech AI. All rights reserved.</p>
            <div className="flex gap-6 text-zinc-300">
               <Heart className="w-4 h-4 hover:text-rose-500 transition-colors cursor-pointer" />
               <Smartphone className="w-4 h-4 hover:text-zinc-900 transition-colors cursor-pointer" />
            </div>
         </div>
      </footer>

    </div>
  );
}
