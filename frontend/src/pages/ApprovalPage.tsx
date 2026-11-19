import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCw,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  Filter,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ApprovalItem } from '../types';

interface ApprovalPageProps {
  onRefreshStats: () => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({ onRefreshStats }) => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [channelFilter, setChannelFilter] = useState<'all' | 'gmail' | 'whatsapp'>('all');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovals(statusFilter === 'all' ? undefined : statusFilter);
      setApprovals(data.approvals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await api.approveResponse(id);
      loadApprovals();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter a rejection reason (optional):') || 'Rejected by user';
    try {
      await api.rejectResponse(id, reason);
      loadApprovals();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (app: ApprovalItem) => {
    setEditingId(app.id);
    setEditText(app.proposed_reply);
  };

  const handleSaveEditAndApprove = async (id: string) => {
    try {
      await api.editAndApproveResponse(id, editText);
      setEditingId(null);
      loadApprovals();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async (id: string) => {
    setIsRegenerating(id);
    try {
      await api.regenerateResponse(id);
      loadApprovals();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const filteredApprovals = approvals.filter(app => {
    if (channelFilter !== 'all' && app.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <CheckCircle2 className="w-6 h-6 text-accent-cyan" />
            <span>Approval Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize, refine, or reject AI responses before they are sent to Gmail or WhatsApp recipients
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex rounded-lg bg-navy-900 p-1 border border-navy-800 text-xs">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-accent-blue/30 text-accent-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Channel Filter */}
          <div className="flex rounded-lg bg-navy-900 p-1 border border-navy-800 text-xs">
            {(['all', 'gmail', 'whatsapp'] as const).map(channel => (
              <button
                key={channel}
                onClick={() => setChannelFilter(channel)}
                className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors ${
                  channelFilter === channel
                    ? 'bg-accent-blue/30 text-accent-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading approval items...</div>
      ) : filteredApprovals.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center space-y-3">
          <Shield className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
          <h3 className="text-base font-semibold text-slate-200">No responses match this filter</h3>
          <p className="text-xs text-slate-400">All incoming messages have been processed or approved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="glass-panel p-6 rounded-2xl border-navy-800 space-y-4 shadow-lg hover:border-navy-700 transition-all"
            >
              {/* Card Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-800/80">
                <div className="flex items-center space-x-3">
                  <span className={`p-2 rounded-lg ${
                    app.channel === 'gmail' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {app.channel === 'gmail' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{app.sender_name}</span>
                      <span className="text-xs text-slate-400 font-mono">({app.sender_identifier})</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{new Date(app.created_at).toLocaleString()}</span>
                      <span className="text-slate-600">•</span>
                      <span className="px-2 py-0.2 text-[10px] rounded bg-navy-800 font-semibold text-slate-300">
                        Category: {app.category}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        app.priority === 'urgent' || app.priority === 'high' ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        Priority: {app.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                    app.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : app.status === 'approved' || app.status === 'edited_and_approved'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {app.external_draft_id && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Draft: {app.external_draft_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Incoming Context */}
              <div className="p-3.5 bg-navy-950/60 rounded-xl border border-navy-850 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original Incoming Message
                </div>
                {app.subject && (
                  <p className="text-xs font-semibold text-slate-200">
                    Subject: {app.subject}
                  </p>
                )}
                <p className="text-xs text-slate-300 italic whitespace-pre-wrap">
                  "{app.incoming_snippet}"
                </p>
              </div>

              {/* Proposed Response or Edit Form */}
              <div className="p-4 bg-navy-900/80 rounded-xl border border-accent-blue/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-accent-cyan uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI Generated Proposed Response</span>
                  </div>
                  {editingId !== app.id && app.status === 'pending' && (
                    <button
                      onClick={() => handleStartEdit(app)}
                      className="text-xs text-slate-400 hover:text-accent-cyan flex items-center space-x-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Response</span>
                    </button>
                  )}
                </div>

                {editingId === app.id ? (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-navy-950 border border-accent-blue/40 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                    />
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 text-xs font-semibold hover:bg-navy-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEditAndApprove(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow"
                      >
                        Save & Approve Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-100 whitespace-pre-wrap font-sans leading-relaxed">
                    {app.final_reply || app.proposed_reply}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              {app.status === 'pending' && editingId !== app.id && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400">
                    Will be sent via {app.channel === 'gmail' ? 'Gmail Thread' : 'Official WhatsApp Cloud API'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRegenerate(app.id)}
                      disabled={isRegenerating === app.id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold border border-navy-700 transition-colors disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRegenerating === app.id ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-rose-300 border border-navy-700 text-xs font-semibold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
