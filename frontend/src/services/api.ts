import {
  KPIStats,
  DailyActivityPoint,
  ApprovalItem,
  GmailEmail,
  WhatsAppConversation,
  MemorySummary,
  ContactItem,
  AutomationSettingsData,
  ExecutionLog,
  IntegrationService
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Stats
  getStats: () => fetchJson<{
    kpis: KPIStats;
    dailyChart: DailyActivityPoint[];
    channelBreakdown: Array<{ name: string; value: number; color: string }>;
    recentApprovals: ApprovalItem[];
  }>('/stats'),

  // Gmail
  getGmailEmails: () => fetchJson<{
    account: { email: string; status: string; lastSyncedAt: string };
    emails: GmailEmail[];
  }>('/gmail/emails'),

  // WhatsApp
  getWhatsAppConversations: () => fetchJson<{
    connectedNumber: { phone: string; displayName: string; metaStatus: string; qualityRating: string };
    conversations: WhatsAppConversation[];
  }>('/whatsapp/conversations'),

  // Approvals
  getApprovals: (status?: string) => fetchJson<{ approvals: ApprovalItem[] }>(
    `/approvals${status ? `?status=${status}` : ''}`
  ),
  approveResponse: (id: string) => fetchJson<{ success: boolean; item: ApprovalItem }>(
    `/approvals/${id}/approve`,
    { method: 'POST' }
  ),
  rejectResponse: (id: string, reason?: string) => fetchJson<{ success: boolean; item: ApprovalItem }>(
    `/approvals/${id}/reject`,
    { method: 'POST', body: JSON.stringify({ reason }) }
  ),
  editAndApproveResponse: (id: string, editedReply: string) => fetchJson<{ success: boolean; item: ApprovalItem }>(
    `/approvals/${id}/edit`,
    { method: 'POST', body: JSON.stringify({ editedReply }) }
  ),
  regenerateResponse: (id: string, instructions?: string) => fetchJson<{ success: boolean; item: ApprovalItem }>(
    `/approvals/${id}/regenerate`,
    { method: 'POST', body: JSON.stringify({ instructions }) }
  ),

  // Memory
  getMemory: (query?: string) => fetchJson<{
    summaries: MemorySummary[];
    contacts: ContactItem[];
    totalMemories: number;
  }>(`/memory${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  deleteMemorySummary: (id: string) => fetchJson<{ success: boolean }>(
    `/memory/${id}`,
    { method: 'DELETE' }
  ),
  clearConversation: (conversationId: string) => fetchJson<{ success: boolean }>(
    '/memory/clear-conversation',
    { method: 'POST', body: JSON.stringify({ conversationId }) }
  ),

  // Settings
  getSettings: () => fetchJson<{
    settings: AutomationSettingsData;
    whitelistedContacts: ContactItem[];
    blacklistedContacts: ContactItem[];
  }>('/settings'),
  updateSettings: (updates: Partial<AutomationSettingsData>) => fetchJson<{
    success: boolean;
    settings: AutomationSettingsData;
  }>('/settings', {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  // Logs
  getLogs: (channel?: string, status?: string) => fetchJson<{ logs: ExecutionLog[] }>(
    `/logs?channel=${channel || 'all'}&status=${status || 'all'}`
  ),

  // Integrations
  getIntegrations: () => fetchJson<{ integrations: IntegrationService[] }>('/integrations'),
  testIntegration: (serviceName: string) => fetchJson<{ success: boolean; service: IntegrationService }>(
    `/integrations/test/${serviceName}`,
    { method: 'POST' }
  )
};
