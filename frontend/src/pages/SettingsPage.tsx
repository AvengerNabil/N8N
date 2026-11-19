import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Check,
  Save,
  Shield,
  Clock,
  Sparkles,
  Cpu,
  Globe,
  Radio
} from 'lucide-react';
import { api } from '../services/api';
import { AutomationSettingsData, AutomationMode } from '../types';

interface SettingsPageProps {
  onRefreshGlobalSettings: (mode: AutomationMode, isPaused: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshGlobalSettings }) => {
  const [settings, setSettings] = useState<AutomationSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      onRefreshGlobalSettings(res.settings.automation_mode, !res.settings.gmail_automation_enabled && !res.settings.whatsapp_automation_enabled);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-slate-400">Loading automation settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Sliders className="w-6 h-6 text-accent-cyan" />
            <span>Automation & Model Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure how Nabil AI Assistant behaves, processes incoming messages, and enforces human-in-the-loop security.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-bold shadow-lg shadow-accent-blue/20 transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-accent-teal" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Section 1: Automation Modes */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Radio className="w-4 h-4 text-accent-cyan" />
            <span>Operational Mode</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1 */}
            <div
              onClick={() => setSettings({ ...settings, automation_mode: 'manual_approval' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                settings.automation_mode === 'manual_approval'
                  ? 'bg-accent-blue/20 border-accent-cyan shadow-md'
                  : 'bg-navy-900 border-navy-800 hover:border-navy-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Mode 1: Manual</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-semibold">
                  Default
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every AI response is saved as a Gmail Draft or pending WhatsApp response. Zero unapproved sends.
              </p>
            </div>

            {/* Mode 2 */}
            <div
              onClick={() => setSettings({ ...settings, automation_mode: 'semi_automatic' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                settings.automation_mode === 'semi_automatic'
                  ? 'bg-accent-blue/20 border-accent-cyan shadow-md'
                  : 'bg-navy-900 border-navy-800 hover:border-navy-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Mode 2: Semi-Auto</span>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded font-semibold">
                  Balanced
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auto-replies only to trusted whitelisted contacts; sensitive or urgent messages require authorization.
              </p>
            </div>

            {/* Mode 3 */}
            <div
              onClick={() => setSettings({ ...settings, automation_mode: 'full_automation' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                settings.automation_mode === 'full_automation'
                  ? 'bg-accent-blue/20 border-accent-cyan shadow-md'
                  : 'bg-navy-900 border-navy-800 hover:border-navy-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Mode 3: Full Auto</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                  24/7 Agent
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Immediately dispatches responses to eligible conversations while strictly obeying safety limits.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Channel Master Toggles */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Channel Switches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-navy-900 rounded-xl border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-white block">Gmail Automation</span>
                <span className="text-xs text-slate-400">Poll inbox & create drafts</span>
              </div>
              <input
                type="checkbox"
                checked={settings.gmail_automation_enabled}
                onChange={(e) => setSettings({ ...settings, gmail_automation_enabled: e.target.checked })}
                className="w-5 h-5 accent-accent-cyan rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-navy-900 rounded-xl border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-white block">WhatsApp Automation</span>
                <span className="text-xs text-slate-400">Meta Cloud webhook listener</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsapp_automation_enabled}
                onChange={(e) => setSettings({ ...settings, whatsapp_automation_enabled: e.target.checked })}
                className="w-5 h-5 accent-accent-cyan rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI Model & Personality Selection */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <span>AI Brain Engine & Personality</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Model Provider & Architecture
              </label>
              <select
                value={settings.default_ai_model}
                onChange={(e) => setSettings({ ...settings, default_ai_model: e.target.value })}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              >
                <option value="gpt-4o">OpenAI GPT-4o (State of the art, multimodal)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast & economical)</option>
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Low latency fallback)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep contextual reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Persona / Tone
              </label>
              <select
                value={settings.default_personality}
                onChange={(e) => setSettings({ ...settings, default_personality: e.target.value as any })}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan capitalize"
              >
                <option value="professional">Professional (Structured, courteous, business-grade)</option>
                <option value="academic">Academic (Formal, rigorous, scholarly)</option>
                <option value="friendly">Friendly (Natural, empathetic, conversational)</option>
                <option value="casual">Casual (Relaxed, peer-to-peer)</option>
                <option value="short_direct">Short & Direct (One-sentence factual)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Language Matching Mode
              </label>
              <select
                value={settings.language_mode}
                onChange={(e) => setSettings({ ...settings, language_mode: e.target.value as any })}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="adaptive">Adaptive (Mirrors sender: Bangla, English, Banglish)</option>
                <option value="force_english">Force Standard English</option>
                <option value="force_bangla">Force Bengali Script (বাংলা)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anti-Bot Response Delay (Jitter)
              </label>
              <input
                type="number"
                value={settings.auto_reply_delay_seconds}
                onChange={(e) => setSettings({ ...settings, auto_reply_delay_seconds: parseInt(e.target.value, 10) })}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Seconds to wait before dispatching to replicate natural typing
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Signature Block */}
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Email & Long-form Signature Block
          </label>
          <textarea
            rows={3}
            value={settings.signature_block}
            onChange={(e) => setSettings({ ...settings, signature_block: e.target.value })}
            className="w-full bg-navy-900 border border-navy-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>
      </div>
    </div>
  );
};
