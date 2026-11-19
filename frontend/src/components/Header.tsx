import React from 'react';
import {
  Bell,
  Play,
  Pause,
  ShieldCheck,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { AutomationMode } from '../types';

interface HeaderProps {
  automationMode: AutomationMode;
  isPaused: boolean;
  onTogglePause: () => void;
  pendingCount: number;
  onGoToApprovals: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  automationMode,
  isPaused,
  onTogglePause,
  pendingCount,
  onGoToApprovals
}) => {
  const modeLabels: Record<AutomationMode, { label: string; color: string }> = {
    manual_approval: { label: 'Manual Approval', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    semi_automatic: { label: 'Semi-Automatic', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    full_automation: { label: 'Full Automation', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
  };

  return (
    <header className="h-16 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/80 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mode Badge & Quick Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-accent-cyan animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Orchestrator:</span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${modeLabels[automationMode].color}`}>
            {modeLabels[automationMode].label}
          </span>
        </div>

        {/* Pause/Resume Toggle */}
        <button
          onClick={onTogglePause}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isPaused
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-navy-900 text-slate-300 border-navy-700 hover:text-white hover:border-slate-500'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Resume Automation</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause Automation</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Actions, Notifications, User */}
      <div className="flex items-center space-x-4">
        {/* Approvals Notification Bell */}
        <button
          onClick={onGoToApprovals}
          className="relative p-2 rounded-lg bg-navy-900 border border-navy-800 hover:border-navy-700 text-slate-300 hover:text-white transition-colors"
          title="Review Pending Approvals"
        >
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-rose text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        {/* User Identity */}
        <div className="flex items-center space-x-3 pl-2 border-l border-navy-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white font-bold text-xs ring-2 ring-navy-800">
            N
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">Nabil Rahaman</div>
            <div className="text-[10px] text-slate-400 font-mono">Owner / Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
