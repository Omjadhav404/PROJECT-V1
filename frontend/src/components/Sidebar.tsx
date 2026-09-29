import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  PlusCircle, 
  Bot, 
  FileText, 
  Settings, 
  Wifi, 
  Activity,
  Layers
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incident Log', icon: AlertTriangle, badge: 'Live' },
    { to: '/incidents/new', label: 'Log Incident', icon: PlusCircle, highlight: true },
    { to: '/advisor', label: 'AI Network Doctor', icon: Bot, badge: 'GenAI' },
    { to: '/reports', label: 'SLA Outage Reports', icon: FileText },
    { to: '/settings', label: 'Routers & Settings', icon: Settings },
  ];

  return (
    <aside className={`w-64 border-r border-slate-800 bg-[#0a0f1d] flex flex-col justify-between py-6 px-4 ${className}`}>
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Core Monitoring
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                      : item.highlight
                        ? 'text-cyan-400 hover:bg-slate-800/80 hover:text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Connection Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Diagnostics</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>SLA Target:</span>
              <span className="font-mono text-cyan-400 font-bold">99.90%</span>
            </div>
            <div className="flex justify-between">
              <span>Model Engine:</span>
              <span className="font-mono text-emerald-400">Gemini 2.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>NetPulse v1.0.0</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Telemetry OK
        </span>
      </div>
    </aside>
  );
};
