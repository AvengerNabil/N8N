import React, { useEffect, useState } from 'react';
import {
  FileText,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ExecutionLog } from '../types';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getLogs(channelFilter, statusFilter);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [channelFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-accent-cyan" />
            <span>Activity & Execution Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline monitoring, webhook receptions, AI token usage, and dispatch audits.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="gmail">Gmail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="system">System</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-900 border border-navy-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <button
            onClick={loadLogs}
            className="p-1.5 rounded-lg bg-navy-900 border border-navy-800 text-slate-400 hover:text-white"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-navy-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/80 border-b border-navy-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Workflow / Stage</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Details & Payload Summary</th>
                <th className="py-3 px-4 text-right">Latency</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No execution events recorded for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-900/40 transition-colors">
                    <td className="py-3 px-4">
                      {log.status === 'success' && (
                        <span className="inline-flex items-center space-x-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="capitalize font-semibold text-[11px]">Success</span>
                        </span>
                      )}
                      {log.status === 'warning' && (
                        <span className="inline-flex items-center space-x-1 text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="capitalize font-semibold text-[11px]">Warning</span>
                        </span>
                      )}
                      {log.status === 'error' && (
                        <span className="inline-flex items-center space-x-1 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="capitalize font-semibold text-[11px]">Error</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.workflow_name}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        Stage: {log.stage}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.channel === 'gmail'
                          ? 'bg-red-500/10 text-red-400'
                          : log.channel === 'whatsapp'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-navy-800 text-slate-400'
                      }`}>
                        {log.channel}
                      </span>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="text-slate-200 line-clamp-1">{log.input_summary}</div>
                      <div className="text-[11px] text-slate-400 font-mono line-clamp-1">{log.output_summary}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {log.duration_ms}ms
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
