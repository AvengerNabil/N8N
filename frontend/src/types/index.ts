export type ChannelType = 'gmail' | 'whatsapp';

export type AutomationMode = 'manual_approval' | 'semi_automatic' | 'full_automation';

export interface KPIStats {
  totalGmailMessages: number;
  totalWhatsAppMessages: number;
  aiRepliesGenerated: number;
  repliesSent: number;
  pendingApprovals: number;
  failedExecutions: number;
  automationStatus: {
    gmailEnabled: boolean;
    whatsappEnabled: boolean;
    mode: AutomationMode;
  };
}

export interface DailyActivityPoint {
  day: string;
  date: string;
  gmail: number;
  whatsapp: number;
  aiReplies: number;
}

export interface ApprovalItem {
  id: string;
  ai_response_id: string;
  message_id: string;
  conversation_id: string;
  channel: ChannelType;
  status: 'pending' | 'approved' | 'rejected' | 'edited_and_approved';
  sender_name: string;
  sender_identifier: string;
  subject?: string | null;
  incoming_snippet: string;
  proposed_reply: string;
  final_reply?: string;
  external_draft_id?: string | null;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export interface GmailEmail {
  id: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  category: string;
  priority: string;
  generatedReply?: string | null;
  draftStatus: string;
  externalDraftId?: string | null;
}

export interface WhatsAppConversation {
  id: string;
  contactId?: string;
  contactName: string;
  phoneNumber: string;
  unreadCount: number;
  lastMessageAt: string;
  relationship: string;
  messages: Array<{
    id: string;
    direction: 'incoming' | 'outgoing';
    messageType: string;
    body: string;
    receivedAt: string;
  }>;
  pendingApproval?: {
    id: string;
    proposedReply: string;
    status: string;
  } | null;
}

export interface MemorySummary {
  id: string;
  contact_id: string;
  contact_name: string;
  summary_text: string;
  key_facts: string[];
  message_count_condensed: number;
  updated_at: string;
}

export interface ContactItem {
  id: string;
  name: string;
  primary_email?: string;
  primary_phone?: string;
  organization?: string;
  role?: string;
  relationship_type: string;
  is_whitelisted: boolean;
  is_blacklisted: boolean;
  vip_status: boolean;
  notes?: string;
}

export interface AutomationSettingsData {
  id: string;
  gmail_automation_enabled: boolean;
  whatsapp_automation_enabled: boolean;
  automation_mode: AutomationMode;
  default_ai_provider: 'openai' | 'gemini';
  default_ai_model: string;
  default_personality: 'professional' | 'friendly' | 'academic' | 'casual' | 'short_direct';
  language_mode: 'adaptive' | 'force_english' | 'force_bangla';
  auto_reply_delay_seconds: number;
  max_response_tokens: number;
  working_hours_enabled: boolean;
  working_hours_start: string;
  working_hours_end: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  signature_block: string;
}

export interface ExecutionLog {
  id: string;
  workflow_name: string;
  channel: 'gmail' | 'whatsapp' | 'system';
  stage: string;
  status: 'success' | 'warning' | 'error' | 'retrying';
  input_summary: string;
  output_summary: string;
  duration_ms: number;
  created_at: string;
}

export interface IntegrationService {
  service_name: 'n8n' | 'gmail' | 'whatsapp_cloud_api' | 'openai' | 'gemini' | 'supabase';
  is_connected: boolean;
  status_message: string;
  endpoint_or_account: string;
  last_checked_at: string;
}
