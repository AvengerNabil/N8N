import React, { useEffect, useState } from 'react';
import {
  Brain,
  Search,
  Trash2,
  User,
  Tag,
  Clock,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { MemorySummary, ContactItem } from '../types';

export const MemoryPage: React.FC = () => {
  const [summaries, setSummaries] = useState<MemorySummary[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMemory = async (q?: string) => {
    try {
      const data = await api.getMemory(q);
      setSummaries(data.summaries);
      setContacts(data.contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemory(search);
  }, [search]);

  const handleDeleteSummary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory item?')) return;
    try {
      await api.deleteMemorySummary(id);
      loadMemory(search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Brain className="w-6 h-6 text-accent-cyan" />
            <span>AI Memory & Contact Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent context layer powered by Supabase. Stores key facts, preferences, and condensed conversation history.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search facts or contacts in memory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>
      </div>

      {/* Grid of Memory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">Loading memory context...</div>
        ) : summaries.length === 0 ? (
          <div className="col-span-2 glass-panel p-12 text-center text-slate-400 rounded-2xl">
            No memories match your search query.
          </div>
        ) : (
          summaries.map((mem) => (
            <div
              key={mem.id}
              className="glass-panel p-6 rounded-2xl border-navy-800 space-y-4 hover:border-navy-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-cyan flex items-center justify-center font-bold text-xs">
                      {mem.contact_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{mem.contact_name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {mem.message_count_condensed} messages condensed
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSummary(mem.id)}
                    className="p-1.5 rounded-lg bg-navy-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-navy-800 transition-colors"
                    title="Delete Memory Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Conversation Synthesis:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mem.summary_text}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider block mb-1.5">
                    Extracted Knowledge Facts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mem.key_facts.map((fact, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-navy-900 border border-navy-700/80 text-slate-200 text-[11px] font-medium"
                      >
                        ✓ {fact}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-navy-850 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Updated: {new Date(mem.updated_at).toLocaleDateString()}</span>
                <span className="text-accent-teal">Synchronized with Supabase</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
