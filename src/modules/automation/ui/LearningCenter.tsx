import React from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, PlayCircle, BookOpen, Star, 
  ArrowRight, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VIDEOS = [
  { id: 1, title: 'Getting Started with Workflows 101', duration: '5:42', level: 'Beginner', views: '12k', thumbnail: 'bg-indigo-500' },
  { id: 2, title: 'Advanced Branching & Conditions', duration: '14:20', level: 'Advanced', views: '4.5k', thumbnail: 'bg-emerald-500' },
  { id: 3, title: 'Integrating Shopify with HubSpot', duration: '8:15', level: 'Intermediate', views: '8.2k', thumbnail: 'bg-blue-500' },
];

const ARTICLES = [
  { id: 1, title: '5 Post-Purchase Automations You Need', category: 'Strategy', readTime: '4 min read' },
  { id: 2, title: 'How to handle API Rate Limits smoothly', category: 'Technical', readTime: '6 min read' },
  { id: 3, title: 'Best Practices for Support Ticket Routing', category: 'Use Case', readTime: '5 min read' },
  { id: 4, title: 'Understanding JSON Webhooks', category: 'Technical', readTime: '10 min read' },
];

export default function LearningCenter() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12 h-fit">
      
      {/* Hero Section */}
      <div className="bg-zinc-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-40 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 md:w-1/2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <GraduationCap className="w-4 h-4" /> Ayech Academy
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Master the art of <br/>business automation.
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-sm">
            Learn from industry experts how to scale your operations using workflows and triggers without writing code.
          </p>
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search tutorials, topics..." 
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Featured Video Mock */}
        <div className="relative z-10 w-full md:w-1/2 aspect-video bg-black rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden group cursor-pointer">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop')] bg-cover bg-center opacity-50 transition-opacity group-hover:opacity-40" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8 ml-1" />
             </div>
           </div>
           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                 <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded mb-2 inline-block">Popular</span>
                 <h3 className="font-bold text-white shadow-sm">Advanced E-commerce Automations (Masterclass)</h3>
              </div>
              <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">
                45:00
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Video Library */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-indigo-500" /> Video Tutorials
            </h2>
            <Link to="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Courses</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIDEOS.map((video, idx) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className={`w-full aspect-video ${video.thumbnail} rounded-xl mb-3 relative overflow-hidden shadow-sm shadow-zinc-200 border border-zinc-200/50 group-hover:shadow-md transition-all`}>
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                     <PlayCircle className="w-10 h-10 text-white/80 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
                   </div>
                   <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                     {video.duration}
                   </div>
                </div>
                <h3 className="font-bold text-zinc-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span className={video.level === 'Beginner' ? 'text-emerald-500' : video.level === 'Intermediate' ? 'text-amber-500' : 'text-rose-500'}>{video.level}</span>
                  <span>{video.views} Views</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Articles & Guides */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" /> Guides & Articles
            </h2>
          </div>

          <div className="space-y-4">
            {ARTICLES.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                      {article.id === 1 && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-3" />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
