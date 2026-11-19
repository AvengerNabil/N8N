import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('xyzcompany') && 
  !supabaseKey.includes('your_supabase')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Realistic, persistent in-memory store matching the Supabase schema
export interface InMemoryStore {
  settings: any;
  contacts: any[];
  conversations: any[];
  messages: any[];
  aiResponses: any[];
  approvals: any[];
  executionLogs: any[];
  dailyAnalytics: any[];
  memorySummaries: any[];
  integrationStatus: any[];
}

export const localStore: InMemoryStore = {
  settings: {
    id: 'b0000000-0000-0000-0000-000000000001',
    gmail_automation_enabled: true,
    whatsapp_automation_enabled: true,
    automation_mode: 'manual_approval',
    default_ai_provider: 'openai',
    default_ai_model: 'gpt-4o',
    default_personality: 'professional',
    language_mode: 'adaptive',
    auto_reply_delay_seconds: 30,
    max_response_tokens: 600,
    working_hours_enabled: false,
    working_hours_start: '09:00',
    working_hours_end: '19:00',
    quiet_hours_enabled: false,
    quiet_hours_start: '23:00',
    quiet_hours_end: '07:00',
    signature_block: 'Kind regards,\nNabil Rahaman\nPersonal AI Assistant'
  },
  contacts: [
    {
      id: 'c0000001-0000-0000-0000-000000000001',
      name: 'Prof. Dr. Tariq Hasan',
      primary_email: 'tariq.hasan@university.edu',
      primary_phone: '+8801811223344',
      organization: 'State University',
      role: 'Thesis Supervisor',
      relationship_type: 'academic',
      is_whitelisted: true,
      is_blacklisted: false,
      vip_status: true,
      notes: 'Supervising dissertation on Distributed AI Orchestration.'
    },
    {
      id: 'c0000002-0000-0000-0000-000000000002',
      name: 'Sarah Jenkins',
      primary_email: 'sarah.j@techventures.io',
      primary_phone: '+14155552671',
      organization: 'TechVentures Capital',
      role: 'Senior Recruiter',
      relationship_type: 'recruiter',
      is_whitelisted: true,
      is_blacklisted: false,
      vip_status: false,
      notes: 'Reached out regarding Lead AI Automation Architect position.'
    },
    {
      id: 'c0000003-0000-0000-0000-000000000003',
      name: 'Tanvir Ahmed',
      primary_email: 'tanvir.ahmed@gmail.com',
      primary_phone: '+8801912345678',
      organization: 'Dhaka AI Labs',
      role: 'Research Colleague',
      relationship_type: 'personal',
      is_whitelisted: true,
      is_blacklisted: false,
      vip_status: true,
      notes: 'Close colleague, communicates predominantly via WhatsApp in Banglish.'
    }
  ],
  conversations: [
    {
      id: 'd0000001-0000-0000-0000-000000000001',
      contact_id: 'c0000001-0000-0000-0000-000000000001',
      channel: 'gmail',
      external_thread_id: 'thread_18dc98a76b12f45',
      title: 'Review of Draft Chapter 4 on Distributed AI',
      status: 'active',
      unread_count: 1,
      last_message_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'd0000002-0000-0000-0000-000000000002',
      contact_id: 'c0000002-0000-0000-0000-000000000002',
      channel: 'gmail',
      external_thread_id: 'thread_18dc98f99e33a12',
      title: 'Interview Invitation: Senior Automation Architect',
      status: 'active',
      unread_count: 0,
      last_message_at: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
      id: 'd0000003-0000-0000-0000-000000000003',
      contact_id: 'c0000003-0000-0000-0000-000000000003',
      channel: 'whatsapp',
      external_thread_id: '+8801912345678',
      title: 'Tanvir Ahmed (WhatsApp)',
      status: 'active',
      unread_count: 1,
      last_message_at: new Date(Date.now() - 5 * 60000).toISOString()
    }
  ],
  messages: [
    {
      id: 'e0000001-0000-0000-0000-000000000001',
      conversation_id: 'd0000001-0000-0000-0000-000000000001',
      channel: 'gmail',
      external_message_id: 'msg_gmail_001_sup',
      direction: 'incoming',
      sender_identifier: 'tariq.hasan@university.edu',
      recipient_identifier: 'nabil.assistant.hq@gmail.com',
      message_type: 'text',
      subject: 'Review of Draft Chapter 4 on Distributed AI',
      body_raw: 'Dear Nabil,\nI have completed reading Chapter 4. The empirical benchmarks look solid, but the evaluation section needs clarity on the latency trade-offs. Can you send the updated draft by Thursday 3 PM?\nBest regards,\nProf. Tariq',
      body_clean: 'Dear Nabil, I have completed reading Chapter 4. The empirical benchmarks look solid, but the evaluation section needs clarity on the latency trade-offs. Can you send the updated draft by Thursday 3 PM? Best regards, Prof. Tariq',
      received_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'e0000002-0000-0000-0000-000000000002',
      conversation_id: 'd0000003-0000-0000-0000-000000000003',
      channel: 'whatsapp',
      external_message_id: 'wamid.HBgLMDAxMTIyMzM0NA==',
      direction: 'incoming',
      sender_identifier: '+8801912345678',
      recipient_identifier: '+8801700112233',
      message_type: 'text',
      subject: null,
      body_raw: 'Kire Nabil, kaler meeting ta ki 4 tay hobe naki pore shift korbi? Updates gula finalize korsi.',
      body_clean: 'Kire Nabil, kaler meeting ta ki 4 tay hobe naki pore shift korbi? Updates gula finalize korsi.',
      received_at: new Date(Date.now() - 5 * 60000).toISOString()
    }
  ],
  aiResponses: [
    {
      id: 'f0000001-0000-0000-0000-000000000001',
      message_id: 'e0000001-0000-0000-0000-000000000001',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      intent: 'request_deadline',
      category: 'academic',
      detected_language: 'English',
      priority: 'high',
      should_reply: true,
      requires_approval: true,
      generated_reply: 'Dear Professor Tariq,\n\nThank you for the detailed feedback on Chapter 4. I am refining the evaluation section to clearly articulate the latency trade-offs between distributed consensus and inference speed. I will have the updated revision submitted to you before Thursday at 3:00 PM.\n\nRespectfully,\nNabil Rahaman',
      reasoning: 'Academic supervisor requesting deadline confirmation on Chapter 4. Tone: Academic. High priority.'
    },
    {
      id: 'f0000002-0000-0000-0000-000000000002',
      message_id: 'e0000002-0000-0000-0000-000000000002',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      intent: 'meeting_time_inquiry',
      category: 'personal',
      detected_language: 'Banglish',
      priority: 'normal',
      should_reply: true,
      requires_approval: true,
      generated_reply: 'Hae Tanvir, kal 4 tay e shuru kori. Slides gula ready thakle dekha shuru korte pari.',
      reasoning: 'Friend inquiring about meeting schedule in Banglish. Tone: Friendly. Language: Banglish.'
    }
  ],
  approvals: [
    {
      id: '10000001-0000-0000-0000-000000000001',
      ai_response_id: 'f0000001-0000-0000-0000-000000000001',
      message_id: 'e0000001-0000-0000-0000-000000000001',
      conversation_id: 'd0000001-0000-0000-0000-000000000001',
      channel: 'gmail',
      status: 'pending',
      sender_name: 'Prof. Dr. Tariq Hasan',
      sender_identifier: 'tariq.hasan@university.edu',
      subject: 'Review of Draft Chapter 4 on Distributed AI',
      incoming_snippet: 'Dear Nabil, I have completed reading Chapter 4... Can you send the updated draft by Thursday 3 PM?',
      proposed_reply: 'Dear Professor Tariq,\n\nThank you for the detailed feedback on Chapter 4. I am refining the evaluation section to clearly articulate the latency trade-offs between distributed consensus and inference speed. I will have the updated revision submitted to you before Thursday at 3:00 PM.\n\nRespectfully,\nNabil Rahaman',
      external_draft_id: 'r-89218291823912',
      category: 'academic',
      priority: 'high',
      created_at: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      id: '10000002-0000-0000-0000-000000000002',
      ai_response_id: 'f0000002-0000-0000-0000-000000000002',
      message_id: 'e0000002-0000-0000-0000-000000000002',
      conversation_id: 'd0000003-0000-0000-0000-000000000003',
      channel: 'whatsapp',
      status: 'pending',
      sender_name: 'Tanvir Ahmed',
      sender_identifier: '+8801912345678',
      subject: null,
      incoming_snippet: 'Kire Nabil, kaler meeting ta ki 4 tay hobe naki pore shift korbi? Updates gula finalize korsi.',
      proposed_reply: 'Hae Tanvir, kal 4 tay e shuru kori. Slides gula ready thakle dekha shuru korte pari.',
      external_draft_id: null,
      category: 'personal',
      priority: 'normal',
      created_at: new Date(Date.now() - 4 * 60000).toISOString()
    }
  ],
  executionLogs: [
    {
      id: 'l001',
      workflow_name: 'Gmail Incoming Message Handler',
      channel: 'gmail',
      stage: 'extraction',
      status: 'success',
      input_summary: 'From: tariq.hasan@university.edu',
      output_summary: 'Cleaned text & extracted threadId: thread_18dc98a76b12f45',
      duration_ms: 185,
      created_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'l002',
      workflow_name: 'Gmail AI Classification',
      channel: 'gmail',
      stage: 'classification',
      status: 'success',
      input_summary: 'Classified: Academic, Priority: High',
      output_summary: 'Intent: request_deadline, should_reply: true',
      duration_ms: 640,
      created_at: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      id: 'l003',
      workflow_name: 'WhatsApp Webhook Receiver',
      channel: 'whatsapp',
      stage: 'webhook',
      status: 'success',
      input_summary: 'Incoming payload from +8801912345678',
      output_summary: 'Valid Meta webhook event parsed, HTTP 200 acknowledged',
      duration_ms: 75,
      created_at: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'l004',
      workflow_name: 'Shared AI Brain',
      channel: 'whatsapp',
      stage: 'generation',
      status: 'success',
      input_summary: 'Language detected: Banglish, Tone: Friendly',
      output_summary: 'Generated natural response in Banglish',
      duration_ms: 610,
      created_at: new Date(Date.now() - 4 * 60000).toISOString()
    }
  ],
  dailyAnalytics: [
    {
      date: new Date().toISOString().split('T')[0],
      gmail_received: 14,
      gmail_replies_sent: 8,
      gmail_drafts_created: 4,
      whatsapp_received: 28,
      whatsapp_replies_sent: 22,
      ai_replies_generated: 38,
      manual_approvals_approved: 11,
      manual_approvals_rejected: 1,
      failed_deliveries: 0,
      avg_ai_latency_ms: 725
    }
  ],
  memorySummaries: [
    {
      id: 'm001',
      contact_id: 'c0000001-0000-0000-0000-000000000001',
      contact_name: 'Prof. Dr. Tariq Hasan',
      summary_text: 'Discussion focused on dissertation Chapter 4: Distributed AI consensus mechanisms and latency trade-offs.',
      key_facts: ['Dissertation topic: Distributed AI', 'Review deadline: Thursday 3 PM', 'Prefers formal academic salutations'],
      message_count_condensed: 8,
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'm002',
      contact_id: 'c0000003-0000-0000-0000-000000000003',
      contact_name: 'Tanvir Ahmed',
      summary_text: 'Ongoing coordination regarding AI laboratory presentation slides and meeting times.',
      key_facts: ['Colleague at Dhaka AI Labs', 'Frequently communicates in Banglish', 'Prefers meetings around 4 PM'],
      message_count_condensed: 15,
      updated_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  integrationStatus: [
    {
      service_name: 'n8n',
      is_connected: true,
      status_message: 'Workflows active and listening',
      endpoint_or_account: 'http://localhost:5678 (v1.76.0)',
      last_checked_at: new Date().toISOString()
    },
    {
      service_name: 'gmail',
      is_connected: true,
      status_message: 'OAuth 2.0 active & token valid',
      endpoint_or_account: 'nabil.assistant.hq@gmail.com',
      last_checked_at: new Date().toISOString()
    },
    {
      service_name: 'whatsapp_cloud_api',
      is_connected: true,
      status_message: 'Meta Cloud API v21.0 Webhook verified',
      endpoint_or_account: '+8801700112233',
      last_checked_at: new Date().toISOString()
    },
    {
      service_name: 'openai',
      is_connected: true,
      status_message: 'API Key active (GPT-4o, Whisper-1)',
      endpoint_or_account: 'api.openai.com',
      last_checked_at: new Date().toISOString()
    },
    {
      service_name: 'gemini',
      is_connected: true,
      status_message: 'Gemini 2.0 Flash fallback ready',
      endpoint_or_account: 'generativelanguage.googleapis.com',
      last_checked_at: new Date().toISOString()
    },
    {
      service_name: 'supabase',
      is_connected: true,
      status_message: 'PostgreSQL Database synchronized with RLS',
      endpoint_or_account: 'db.supabase.co',
      last_checked_at: new Date().toISOString()
    }
  ]
};
