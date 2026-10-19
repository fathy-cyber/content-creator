import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GitBranch, 
  Plug, 
  Layout, 
  History, 
  Settings, 
  ChevronRight,
  Zap,
  Clock,
  Users,
  ListTodo,
  Banknote,
  Activity,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarItems } from '../../../core/react/KernelProvider';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Zap: Zap,
  GitBranch: GitBranch,
  Users: Users,
  ListTodo: ListTodo,
  Banknote: Banknote,
  Plug: Plug,
  Activity: Activity,
  Layout: Layout,
  GraduationCap: GraduationCap,
  Clock: Clock,
  History: History,
  LayoutDashboard: LayoutDashboard,
};

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const allSidebarItems = useSidebarItems();
  // const navItems = allSidebarItems.filter(item => item.id.startsWith('auto-'));

  // Hardcoded for now
  const navItems = [
    { id: 'auto-dash', label: 'Dashboard', href: '/automation/dashboard', icon: 'Activity' },
    { id: 'auto-build', label: 'Workflow Builder', href: '/automation/builder', icon: 'GitBranch' },
    { id: 'auto-tmpl', label: 'Templates', href: '/automation/templates', icon: 'Layout' },
    { id: 'auto-intg', label: 'Integrations', href: '/automation/integrations', icon: 'Plug' },
    { id: 'auto-tasks', label: 'Tasks', href: '/automation/tasks', icon: 'ListTodo' },
    { id: 'auto-logs', label: 'Logs', href: '/automation/logs', icon: 'History' },
    { id: 'auto-learn', label: 'Learning Center', href: '/automation/learn', icon: 'GraduationCap' },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-zinc-900 tracking-tight text-lg">Automation Hub</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = ICON_MAP[item.icon] || Zap;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-semibold" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"
                )} />
                {!isCollapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-all"
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Automation Hub</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-900 font-medium capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all">
              Documentation
            </button>
            <button className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
              Create New Workflow
            </button>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
