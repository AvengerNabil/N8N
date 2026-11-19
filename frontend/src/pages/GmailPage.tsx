import React, { useEffect, useState } from 'react';
import {
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { GmailEmail } from '../types';

export const GmailPage: React.FC = () => {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [account, setAccount] = useState<{ email: string; status: string; lastSyncedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGmailEmails();
        setEmails(data.emails);
        setAccount(data.account);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEmails = emails.filter(e => {
    const matchesSearch = e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.senderName.toLowerCase().includes(search.toLowerCase()) ||
      e.snippet.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Status & Account Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Gmail Integration</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                {account?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{account?.email || 'nabil.assistant.hq@gmail.com'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-semibold">OAuth Status</span>
            <span className="font-semibold text-slate-200">Google OAuth 2.0 Valid</span>
          </div>
          <div className="border-l border-navy-800 pl-4">
            <span className="block text-slate-500 text-[10px] uppercase font-semibold">Last Checked</span>
            <span className="font-semibold text-slate-200">1 minute ago</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email subject, sender, or snippet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
            <option value="job_internship">Job / Internship</option>
            <option value="promotional">Promotional</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Emails List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading inbox threads...</div>
      ) : filteredEmails.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
          No emails match the current criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className="glass-panel p-6 rounded-2xl border-navy-800 space-y-3 hover:border-navy-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{email.senderName}</span>
                  <span className="text-xs text-slate-400">&lt;{email.senderEmail}&gt;</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-blue/20 text-accent-cyan capitalize">
                    {email.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Thread: {email.threadId}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">{email.subject}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {email.snippet}
                </p>
              </div>

              {email.generatedReply && (
                <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-850 mt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-accent-cyan mb-1">
                    <span>AI Prepared Draft:</span>
                    <span className="text-amber-400">Draft Status: {email.draftStatus}</span>
                  </div>
                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {email.generatedReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
