import React from 'react';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Brain,
  Sliders,
  CheckCircle2,
  FileText,
  Boxes,
  Zap,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  pendingApprovalsCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Approval Center', icon: CheckCircle2, badge: pendingApprovalsCount },
    { id: 'gmail', label: 'Gmail Management', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Management', icon: MessageSquare },
    { id: 'memory', label: 'AI Memory & Contacts', icon: Brain },
    { id: 'settings', label: 'Automation Settings', icon: Sliders },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
    { id: 'integrations', label: 'Integrations & APIs', icon: Boxes },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800/80 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue via-accent-cyan to-accent-teal p-0.5 shadow-lg shadow-accent-blue/20">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-white text-base">NABIL AI</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-accent-blue/20 text-accent-cyan rounded border border-accent-blue/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Assistant OS</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent-blue/20 text-accent-cyan border border-accent-blue/40 shadow-sm shadow-accent-blue/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent-rose text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live System Status Widget */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-900/40 m-3 rounded-xl border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
            <span className="text-xs font-semibold text-slate-200">AI Engine Live</span>
          </div>
          <span className="text-[10px] text-accent-cyan font-mono font-medium">GPT-4o</span>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2">
          One Assistant. All Conversations. Zero Manual Replies.
        </p>
      </div>
    </aside>
  );
};
