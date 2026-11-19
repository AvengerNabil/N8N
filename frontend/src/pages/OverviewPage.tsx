import React, { useEffect, useState } from 'react';
import {
  Mail,
  MessageSquare,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { KPIStats, DailyActivityPoint, ApprovalItem } from '../types';

interface OverviewPageProps {
  onGoToApprovals: () => void;
  onRefreshApprovals: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onGoToApprovals,
  onRefreshApprovals
}) => {
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [chartData, setChartData] = useState<DailyActivityPoint[]>([]);
  const [channelData, setChannelData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [recentApprovals, setRecentApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getStats();
      setKpis(data.kpis);
      setChartData(data.dailyChart);
      setChannelData(data.channelBreakdown);
      setRecentApprovals(data.recentApprovals);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (id: string) => {
    try {
      await api.approveResponse(id);
      loadData();
      onRefreshApprovals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReject = async (id: string) => {
    try {
      await api.rejectResponse(id);
      loadData();
      onRefreshApprovals();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Assistant Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-800 p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-accent-cyan text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Autonomous Communication Platform</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Nabil AI Assistant
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            One Assistant. All Conversations. Zero Manual Replies. Monitoring incoming Gmail inquiries and WhatsApp messages with context-aware responses and strict safety verification.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Gmail */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gmail Total</span>
            <Mail className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpis?.totalGmailMessages || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Inbox inquiries tracked</p>
        </div>

        {/* Total WhatsApp */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Total</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpis?.totalWhatsAppMessages || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-modal messages</p>
        </div>

        {/* AI Replies Generated */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Generated</span>
            <Sparkles className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-bold text-accent-cyan font-mono">{kpis?.aiRepliesGenerated || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Contextual drafts</p>
        </div>

        {/* Replies Sent */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Replies Sent</span>
            <Send className="w-4 h-4 text-accent-teal" />
          </div>
          <div className="text-2xl font-bold text-accent-teal font-mono">{kpis?.repliesSent || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Dispatched to senders</p>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{kpis?.pendingApprovals || 0}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">Requires your approval</p>
        </div>

        {/* Failed Executions */}
        <div className="glass-panel glass-panel-hover p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed Runs</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">0</div>
          <p className="text-[11px] text-slate-400 mt-1">100% Pipeline Health</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-accent-cyan" />
                <span>Daily Message & AI Reply Activity</span>
              </h2>
              <p className="text-xs text-slate-400">7-Day activity trend across Gmail and WhatsApp</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
                <span className="text-slate-300">AI Replies</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">WhatsApp</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-slate-300">Gmail</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiRepliesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#48CAE4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#48CAE4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="whatsappGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                <XAxis dataKey="day" stroke="#718096" fontSize={12} tickLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#3A506B',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="aiReplies" stroke="#48CAE4" strokeWidth={2} fillOpacity={1} fill="url(#aiRepliesGrad)" />
                <Area type="monotone" dataKey="whatsapp" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#whatsappGrad)" />
                <Area type="monotone" dataKey="gmail" stroke="#F43F5E" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Proportion Donut */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Channel Distribution</h2>
            <p className="text-xs text-slate-400 mb-4">Volume breakdown by communication channel</p>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#3A506B',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-navy-800">
            <div className="p-3 bg-navy-900 rounded-lg text-center">
              <span className="text-[11px] text-slate-400 block">WhatsApp</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {channelData.find(c => c.name === 'WhatsApp')?.value || 0}
              </span>
            </div>
            <div className="p-3 bg-navy-900 rounded-lg text-center">
              <span className="text-[11px] text-slate-400 block">Gmail</span>
              <span className="text-base font-bold text-red-400 font-mono">
                {channelData.find(c => c.name === 'Gmail')?.value || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Quick Review Banner */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Human Approvals ({recentApprovals.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Review and authorize AI-generated responses before dispatch
            </p>
          </div>
          <button
            onClick={onGoToApprovals}
            className="flex items-center space-x-1.5 text-xs font-semibold text-accent-cyan hover:text-white transition-colors"
          >
            <span>View All in Approval Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentApprovals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <span>All caught up! No responses currently waiting for approval.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApprovals.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-navy-900/90 rounded-xl border border-navy-800 hover:border-navy-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      app.channel === 'gmail' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {app.channel}
                    </span>
                    <span className="text-sm font-bold text-white truncate">{app.sender_name}</span>
                    <span className="text-xs text-slate-400 truncate">({app.sender_identifier})</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-navy-800 text-accent-cyan rounded font-mono">
                      {app.category}
                    </span>
                  </div>
                  {app.subject && (
                    <p className="text-xs font-medium text-slate-200 truncate">Subject: {app.subject}</p>
                  )}
                  <p className="text-xs text-slate-300 line-clamp-2 bg-navy-950/60 p-2.5 rounded-lg border border-navy-850">
                    <span className="text-accent-cyan font-semibold">Proposed Reply: </span>
                    {app.proposed_reply}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleQuickApprove(app.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Send</span>
                  </button>
                  <button
                    onClick={() => handleQuickReject(app.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-navy-700 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
