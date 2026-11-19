import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mic,
  Image,
  File,
  CheckCheck,
  Clock,
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { WhatsAppConversation } from '../types';

export const WhatsAppPage: React.FC = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [connectedNumber, setConnectedNumber] = useState<{
    phone: string;
    displayName: string;
    metaStatus: string;
    qualityRating: string;
  } | null>(null);
  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getWhatsAppConversations();
        setConversations(data.conversations);
        setConnectedNumber(data.connectedNumber);
        if (data.conversations.length > 0) {
          setSelectedConv(data.conversations[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">WhatsApp Cloud API</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                {connectedNumber?.metaStatus || 'Active v21.0'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {connectedNumber?.displayName} ({connectedNumber?.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-semibold">Quality Rating</span>
            <span className="font-semibold text-emerald-400">
              {connectedNumber?.qualityRating || 'GREEN (High Quality)'}
            </span>
          </div>
          <div className="border-l border-navy-800 pl-6">
            <span className="block text-slate-500 text-[10px] uppercase font-semibold">Multi-Language</span>
            <span className="font-semibold text-slate-200">Bangla, English, Banglish</span>
          </div>
        </div>
      </div>

      {/* Split View: Conversation Threads & Active Chat Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="glass-panel rounded-2xl p-4 space-y-2 overflow-hidden flex flex-col h-[600px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Active WhatsApp Threads ({conversations.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {conversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-accent-blue/20 border-accent-blue/40 shadow-sm'
                      : 'bg-navy-900/60 border-navy-800/80 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white truncate">{conv.contactName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mb-1">
                    {conv.phoneNumber}
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    {lastMsg?.body || 'No messages'}
                  </p>
                  {conv.pendingApproval && (
                    <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      <span>Pending Approval</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Conversation Message Stream */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-[600px]">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-navy-800 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {selectedConv.contactName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedConv.contactName}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedConv.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-xs bg-navy-900 border border-navy-700 rounded-lg text-slate-300 capitalize">
                    {selectedConv.relationship}
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
                {selectedConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.direction === 'outgoing' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.direction === 'outgoing'
                          ? 'bg-accent-blue text-white rounded-br-xs shadow-md shadow-accent-blue/20'
                          : 'bg-navy-900 text-slate-200 border border-navy-800 rounded-bl-xs'
                      }`}
                    >
                      {m.messageType === 'audio' && (
                        <div className="flex items-center space-x-2 mb-1 text-accent-cyan font-semibold">
                          <Mic className="w-3.5 h-3.5" />
                          <span>Voice Note (Transcribed by Whisper)</span>
                        </div>
                      )}
                      {m.messageType === 'image' && (
                        <div className="flex items-center space-x-2 mb-1 text-accent-teal font-semibold">
                          <Image className="w-3.5 h-3.5" />
                          <span>Image (Vision Analyzed)</span>
                        </div>
                      )}
                      <p>{m.body}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date(m.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {/* If Pending Approval, show draft preview */}
                {selectedConv.pendingApproval && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-4">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Proposed Reply Waiting For Approval</span>
                    </div>
                    <p className="text-xs text-slate-200 italic whitespace-pre-wrap">
                      "{selectedConv.pendingApproval.proposedReply}"
                    </p>
                    <p className="text-[10px] text-amber-400">
                      Go to the Approval Center to edit, authorize, or reject this response.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="m-auto text-slate-400 text-sm">Select a conversation thread to view messages</div>
          )}
        </div>
      </div>
    </div>
  );
};
