import React, { useState } from 'react';
import { NavLink, useLocation, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, LogOut, Menu, X,
  ChevronRight, Sparkles, Bell, Search,
  User, Settings, HelpCircle, Zap, ChevronDown,
  // Dynamic icon imports
  MessageSquare, TrendingUp, Megaphone, PenTool, LifeBuoy,
  Target, Package, ShoppingCart, Calculator, UserCheck,
  Briefcase, Users, Lightbulb, DollarSign, BookOpen,
  Video, Mail, Type, Calendar, GitBranch, Layout, Plug,
  Activity, GraduationCap, PenSquare, MessageCircle,
  Shield, AlertTriangle, Globe, Filter, UserPlus, Eye,
  FileText, Box, FolderTree, Receipt, BarChart3, Clock,
  CalendarOff, CheckSquare, Timer, BookUser
} from 'lucide-react';
import { useSidebarItems, useKernel } from '../../core/react/KernelProvider';
import type { SidebarItem } from '../../core/types/ModuleManifest';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ClientSwitcher from '@/core/components/ClientSwitcher';
import ProjectSwitcher from '@/core/components/ProjectSwitcher';

// ─── Icon Map ──────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard, ShoppingBag, MessageSquare, TrendingUp, Megaphone,
  PenTool, LifeBuoy, Target, Package, ShoppingCart, Calculator,
  UserCheck, Briefcase, Users, Lightbulb, DollarSign, BookOpen,
  Video, Mail, Type, Calendar, GitBranch, Layout, Plug, Activity,
  GraduationCap, PenSquare, MessageCircle, Shield, AlertTriangle,
  Globe, Filter, UserPlus, Eye, FileText, Box, FolderTree, Receipt,
  BarChart3, Clock, CalendarOff, CheckSquare, Timer, Settings,
  HelpCircle, Zap, Search, Bell, BookUser,
};

function getIcon(iconName: string, size = 20) {
  const IconComp = iconMap[iconName];
  if (!IconComp) return <Zap size={size} />;
  return <IconComp size={size} />;
}

// ─── Module category grouping ──────────────────────────────
interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

function groupSidebarItems(items: SidebarItem[]): SidebarGroup[] {
  if (!items) return [];
  // Only show top-level items (no parentId) — they represent main modules
  const topLevel = items.filter(i => i && !i.parentId);


  // Group by category based on sequence ranges
  const system = topLevel.filter(i => (i.sequence ?? 0) < 10);
  const aiTools = topLevel.filter(i => (i.sequence ?? 0) >= 10 && (i.sequence ?? 0) < 100);
  const erp = topLevel.filter(i => (i.sequence ?? 0) >= 100 && (i.sequence ?? 0) < 200);
  const settings = topLevel.filter(i => (i.sequence ?? 0) >= 200);

  const groups: SidebarGroup[] = [];
  if (system.length > 0) groups.push({ label: '', items: system }); // No label for system
  if (aiTools.length > 0) groups.push({ label: 'Digital Library', items: aiTools });
  if (erp.length > 0) groups.push({ label: 'ERP Modules', items: erp });
  if (settings.length > 0) groups.push({ label: 'System', items: settings });

  return groups;
}

// ─── Component ─────────────────────────────────────────────
// Add static admin link
const ADMIN_ITEMS: SidebarItem[] = [
  {
    id: 'admin-audit-logs',
    label: 'Audit Trail',
    href: '/admin/audit-logs',
    icon: 'FileText',
    sequence: 999,
  },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const sidebarItems = useSidebarItems();
  const { isBooted } = useKernel();

  const groups = groupSidebarItems(sidebarItems);
  
  // Inject Admin group
  const finalGroups = [...groups, { label: 'Administration', items: ADMIN_ITEMS }];

  // Get child items for a parent
  const getChildren = (parentId: string) =>
    (sidebarItems || []).filter(i => i && i.parentId === parentId);

  // Breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[0] || 'Dashboard';

  const toggleGroup = (parentId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  // Auto-expand group for current route
  const currentItem = [...(sidebarItems || []), ...ADMIN_ITEMS].find(i => i && (location.pathname === i.href || location.pathname.startsWith(i.href + '/')));
  const currentParent = currentItem?.parentId;

  return (
    <div className="flex h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-zinc-200/60 transition-all duration-500 ease-in-out flex flex-col z-50 relative shadow-[10px_0_40px_rgba(0,0,0,0.02)]",
          isSidebarOpen ? "w-72" : "w-24"
        )}
      >
        {/* Header */}
        <div className="h-24 px-8 flex items-center justify-between shrink-0">
          <Link to="/" className={cn("flex items-center gap-3 overflow-hidden transition-all duration-500", !isSidebarOpen && "w-0 opacity-0")}>
            <div className="w-10 h-10 bg-zinc-900 rounded-[12px] flex items-center justify-center text-white shadow-xl shadow-zinc-900/10">
              <Zap className="w-5 h-5 text-indigo-400 fill-current" />
            </div>
            <span className="font-black text-xl italic tracking-tighter text-zinc-900 font-serif">
              Ayech<span className="text-indigo-600">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100/50 rounded-xl text-zinc-400 hover:text-zinc-900 transition-all active:scale-90"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto no-scrollbar">
            {!isBooted ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-11 bg-zinc-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              finalGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">

                {/* Group label */}
                {group.label && isSidebarOpen && (
                  <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-2">
                    {gIdx === 2 && <Package className="w-3 h-3" />}
                    {gIdx === 1 && <Sparkles className="w-3 h-3" />}
                    {group.label}
                  </div>
                )}

                {group.items.map(item => {
                  const children = getChildren(item.id);
                  const hasChildren = children.length > 0;
                  const isExpanded = expandedGroups.has(item.id) || currentParent === item.id;
                  const isCurrentPath = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

                  return (
                    <div key={item.id}>
                      <div className="relative flex items-center">
                        <NavLink
                          to={item.href}
                          className={({ isActive }) => cn(
                            "flex-1 flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative mb-0.5",
                            (isActive || isCurrentPath)
                              ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10"
                              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50",
                            !isSidebarOpen && "justify-center"
                          )}
                        >
                          <div className={cn("shrink-0 transition-transform duration-500 group-hover:scale-110", !isSidebarOpen && "mx-auto")}>
                            {getIcon(item.icon, 20)}
                          </div>
                          {isSidebarOpen && (
                            <span className="text-xs font-black italic tracking-tight font-serif uppercase flex-1 group/tooltip">
                              {item.label}
                              {item.tooltip && (
                                <span className="absolute left-0 top-full mt-1 px-2.5 py-1.5 bg-zinc-900 text-white text-[10px] font-normal not-italic normal-case tracking-normal rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[100] shadow-xl max-w-[260px]">
                                  {item.tooltip}
                                </span>
                              )}
                            </span>
                          )}

                          {/* Tooltip for collapsed */}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-[100] shadow-2xl font-serif">
                              {item.label}
                            </div>
                          )}
                        </NavLink>

                        {/* Expand/collapse button for items with children */}
                        {hasChildren && isSidebarOpen && (
                          <button
                            onClick={(e) => { e.preventDefault(); toggleGroup(item.id); }}
                            className="absolute right-2 p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                          >
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
                          </button>
                        )}
                      </div>

                      {/* Child items */}
                      {hasChildren && isSidebarOpen && (
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 pl-4 border-l border-zinc-100 space-y-0.5 overflow-hidden"
                            >
                              {children.map(child => (
                                <NavLink
                                  key={child.id}
                                  to={child.href}
                                  className={({ isActive }) => cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[11px] font-bold",
                                    isActive
                                      ? "text-indigo-600 bg-indigo-50/50 font-black"
                                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50"
                                  )}
                                >
                                  <div className="shrink-0">{getIcon(child.icon, 14)}</div>
                                  {child.label}
                                </NavLink>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100/60">
          <div className={cn("flex items-center justify-between gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all", !isSidebarOpen && "justify-center bg-transparent border-transparent p-0")}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-[12px] bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 shadow-sm">
                <User size={20} />
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-zinc-900 truncate italic">Mohamed Ayech</div>
                  <div className="text-[10px] font-bold text-zinc-400 truncate">Pro Empire Plan</div>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button className="text-zinc-300 hover:text-rose-500 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Header */}
        <header className="h-24 bg-white/50 backdrop-blur-xl border-b border-zinc-200/40 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-serif italic">
              {currentSection}
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-200" />
            <div className="text-sm font-black text-zinc-900 italic font-serif">
              {pathParts[pathParts.length - 1]?.split('-').join(' ') || 'Overview'}
            </div>
          </div>

           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <ClientSwitcher />
               <ProjectSwitcher />
             </div>
             <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl group focus-within:bg-white focus-within:border-indigo-500 transition-all">
               <Search size={16} className="text-zinc-400 group-focus-within:text-indigo-500" />
               <input
                 placeholder="Ask Ayech AI..."
                 className="bg-transparent text-xs font-bold outline-none border-none w-48 text-zinc-800 placeholder:text-zinc-300"
               />
             </div>


            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all relative">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-300 border border-zinc-200 ml-2">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none opacity-50" />
      </main>
    </div>
  );
}
