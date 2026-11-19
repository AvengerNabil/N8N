import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { IntegrationService } from '../types';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationService[]>([]);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIntegrations = async () => {
    try {
      const data = await api.getIntegrations();
      setIntegrations(data.integrations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTestConnection = async (name: string) => {
    setTestingService(name);
    try {
      await api.testIntegration(name);
      loadIntegrations();
    } catch (err) {
      console.error(err);
    } finally {
      setTestingService(null);
    }
  };

  const serviceBrandMeta: Record<string, { label: string; iconBg: string; textColor: string; docsUrl: string }> = {
    n8n: { label: 'n8n Workflow Automation', iconBg: 'bg-orange-500/10', textColor: 'text-orange-400', docsUrl: 'https://docs.n8n.io' },
    gmail: { label: 'Gmail API (Google Cloud OAuth 2.0)', iconBg: 'bg-red-500/10', textColor: 'text-red-400', docsUrl: 'https://developers.google.com/gmail/api' },
    whatsapp_cloud_api: { label: 'Meta WhatsApp Business Cloud API', iconBg: 'bg-emerald-500/10', textColor: 'text-emerald-400', docsUrl: 'https://developers.facebook.com/docs/whatsapp' },
    openai: { label: 'OpenAI (GPT-4o, Whisper, Vision)', iconBg: 'bg-teal-500/10', textColor: 'text-teal-400', docsUrl: 'https://platform.openai.com/docs' },
    gemini: { label: 'Google Gemini API (2.0 Flash / 1.5 Pro)', iconBg: 'bg-blue-500/10', textColor: 'text-blue-400', docsUrl: 'https://ai.google.dev' },
    supabase: { label: 'Supabase PostgreSQL (RLS & Memory)', iconBg: 'bg-emerald-500/10', textColor: 'text-emerald-300', docsUrl: 'https://supabase.com/docs' }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Boxes className="w-6 h-6 text-accent-cyan" />
            <span>Connected Integrations & Security Gateways</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Health monitoring of external APIs. All API secrets are strictly encrypted in environment variables and never displayed in the UI.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-accent-teal" />
          <span>Zero Secret Exposure Policy</span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400">Loading service states...</div>
        ) : (
          integrations.map((service) => {
            const meta = serviceBrandMeta[service.service_name] || {
              label: service.service_name,
              iconBg: 'bg-navy-800',
              textColor: 'text-white',
              docsUrl: '#'
            };

            return (
              <div
                key={service.service_name}
                className="glass-panel p-6 rounded-2xl border-navy-800 space-y-4 hover:border-navy-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center ${meta.textColor} font-bold text-sm`}>
                        {service.service_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{meta.label}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Target: {service.endpoint_or_account}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </div>
                  </div>

                  <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-850">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-0.5">Health Diagnostic:</span>
                    <p className="text-xs text-slate-300 font-mono">{service.status_message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-navy-850 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Last Verified: {new Date(service.last_checked_at).toLocaleTimeString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <a
                      href={meta.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-800"
                      title="View Documentation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleTestConnection(service.service_name)}
                      disabled={testingService === service.service_name}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-200 text-xs font-semibold border border-navy-800 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingService === service.service_name ? 'animate-spin' : ''}`} />
                      <span>Ping Service</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
