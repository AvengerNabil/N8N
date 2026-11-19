-- ====================================================================
-- NABIL AI ASSISTANT: MASTER DATABASE SCHEMA
-- Target Database: Supabase / PostgreSQL 15+
-- Tables: 12 Core Entities with RLS, Indexes, Triggers, and Constraints
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 1. PROFILES (Assistant Owner / Users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    full_name TEXT NOT NULL DEFAULT 'Nabil',
    display_name TEXT NOT NULL DEFAULT 'Nabil Assistant',
    email TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 2. CONTACTS (Unified Contact Registry)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_email TEXT UNIQUE,
    primary_phone TEXT UNIQUE,
    organization TEXT,
    role TEXT,
    relationship_type TEXT NOT NULL DEFAULT 'unknown' 
        CHECK (relationship_type IN ('personal', 'academic', 'colleague', 'client', 'recruiter', 'vendor', 'unknown')),
    is_whitelisted BOOLEAN NOT NULL DEFAULT false,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    vip_status BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(primary_email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(primary_phone);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship ON public.contacts(relationship_type);

CREATE TRIGGER update_contacts_modtime
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 3. CONVERSATIONS (Distinct Threads per Channel)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('gmail', 'whatsapp')),
    external_thread_id TEXT NOT NULL, -- Gmail Thread ID or WhatsApp sender phone number
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'paused', 'muted')),
    unread_count INT NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT uq_channel_thread UNIQUE(channel, external_thread_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_contact ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel_thread ON public.conversations(channel, external_thread_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);

CREATE TRIGGER update_conversations_modtime
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 4. MESSAGES (Raw & Processed Message Ingestion)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('gmail', 'whatsapp')),
    external_message_id TEXT NOT NULL UNIQUE, -- Gmail Message ID or WhatsApp WAMID
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    sender_identifier TEXT NOT NULL, -- Email address or Phone number
    recipient_identifier TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image', 'document', 'mixed', 'template')),
    subject TEXT, -- For emails
    body_raw TEXT NOT NULL,
    body_clean TEXT, -- Stripped of email quotes / signatures
    media_url TEXT,
    media_mime_type TEXT,
    transcription TEXT, -- For audio voice notes
    image_analysis TEXT, -- Vision model description
    received_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON public.messages(external_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON public.messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON public.messages(direction);

-- --------------------------------------------------------------------
-- 5. AI_RESPONSES (Intelligence Output & Reasonings)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    model_provider TEXT NOT NULL DEFAULT 'openai' CHECK (model_provider IN ('openai', 'gemini')),
    model_name TEXT NOT NULL DEFAULT 'gpt-4o',
    intent TEXT NOT NULL, -- question, scheduling, inquiry, greeting, request, feedback, etc.
    category TEXT NOT NULL CHECK (category IN (
        'personal', 'academic', 'university', 'research', 'professional', 
        'job_internship', 'business', 'promotional', 'spam_suspicious', 'urgent'
    )),
    detected_language TEXT NOT NULL DEFAULT 'English' CHECK (detected_language IN ('English', 'Bangla', 'Banglish', 'Other')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    should_reply BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    generated_reply TEXT,
    reasoning TEXT,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    raw_ai_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_ai_responses_message ON public.ai_responses(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_category ON public.ai_responses(category);
CREATE INDEX IF NOT EXISTS idx_ai_responses_priority ON public.ai_responses(priority);

-- --------------------------------------------------------------------
-- 6. APPROVALS (Human-In-The-Loop Approval Queue)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_response_id UUID NOT NULL REFERENCES public.ai_responses(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('gmail', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'edited_and_approved', 'expired')),
    proposed_reply TEXT NOT NULL,
    final_reply TEXT,
    external_draft_id TEXT, -- Gmail Draft ID if created
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_taken_at TIMESTAMPTZ,
    rejection_reason TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (delivery_status IN ('not_sent', 'queued', 'sent', 'failed')),
    delivery_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON public.approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_channel ON public.approvals(channel);

CREATE TRIGGER update_approvals_modtime
BEFORE UPDATE ON public.approvals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 7. AUTOMATION_SETTINGS (Global Configuration)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gmail_automation_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_automation_enabled BOOLEAN NOT NULL DEFAULT true,
    automation_mode TEXT NOT NULL DEFAULT 'manual_approval' 
        CHECK (automation_mode IN ('manual_approval', 'semi_automatic', 'full_automation')),
    default_ai_provider TEXT NOT NULL DEFAULT 'openai' CHECK (default_ai_provider IN ('openai', 'gemini')),
    default_ai_model TEXT NOT NULL DEFAULT 'gpt-4o',
    default_personality TEXT NOT NULL DEFAULT 'professional' 
        CHECK (default_personality IN ('professional', 'friendly', 'academic', 'casual', 'short_direct')),
    language_mode TEXT NOT NULL DEFAULT 'adaptive' CHECK (language_mode IN ('adaptive', 'force_english', 'force_bangla')),
    auto_reply_delay_seconds INT NOT NULL DEFAULT 30, -- Anti-bot jitter
    max_response_tokens INT NOT NULL DEFAULT 600,
    working_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '19:00:00',
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TIME DEFAULT '23:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    signature_block TEXT DEFAULT 'Kind regards,\nNabil\nPersonal AI Assistant',
    safety_rules JSONB DEFAULT '{"block_financial_commitments": true, "block_password_requests": true, "require_approval_urgent": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER update_automation_settings_modtime
BEFORE UPDATE ON public.automation_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 8. CONTACT_PREFERENCES (Per-Contact Override Rules)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    preferred_tone TEXT CHECK (preferred_tone IN ('professional', 'friendly', 'academic', 'casual', 'short_direct')),
    preferred_language TEXT CHECK (preferred_language IN ('English', 'Bangla', 'Banglish')),
    allow_auto_reply BOOLEAN NOT NULL DEFAULT false,
    always_require_approval BOOLEAN NOT NULL DEFAULT true,
    custom_system_instructions TEXT,
    auto_reply_quota_daily INT DEFAULT 5,
    replies_sent_today INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT uq_contact_preference UNIQUE(contact_id)
);

CREATE TRIGGER update_contact_preferences_modtime
BEFORE UPDATE ON public.contact_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 9. EXECUTION_LOGS (Observability & Audit Trail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    execution_id TEXT,
    channel TEXT CHECK (channel IN ('gmail', 'whatsapp', 'system')),
    stage TEXT NOT NULL, -- webhook, extraction, classification, generation, approval, delivery
    status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'error', 'retrying')),
    input_summary TEXT,
    output_summary TEXT,
    error_message TEXT,
    error_stack TEXT,
    duration_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_execution_logs_status ON public.execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created_at ON public.execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_channel ON public.execution_logs(channel);

-- --------------------------------------------------------------------
-- 10. DAILY_ANALYTICS (Aggregated Productivity KPIs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    gmail_received INT NOT NULL DEFAULT 0,
    gmail_replies_sent INT NOT NULL DEFAULT 0,
    gmail_drafts_created INT NOT NULL DEFAULT 0,
    whatsapp_received INT NOT NULL DEFAULT 0,
    whatsapp_replies_sent INT NOT NULL DEFAULT 0,
    ai_replies_generated INT NOT NULL DEFAULT 0,
    manual_approvals_approved INT NOT NULL DEFAULT 0,
    manual_approvals_rejected INT NOT NULL DEFAULT 0,
    failed_deliveries INT NOT NULL DEFAULT 0,
    avg_ai_latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER update_daily_analytics_modtime
BEFORE UPDATE ON public.daily_analytics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 11. MEMORY_SUMMARIES (Long-term Context Condensation)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memory_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    key_facts JSONB DEFAULT '[]'::jsonb, -- Array of extracted facts: ["Prefers morning meetings", "Works at XYZ"]
    last_summarized_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    message_count_condensed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_memory_contact ON public.memory_summaries(contact_id);

CREATE TRIGGER update_memory_summaries_modtime
BEFORE UPDATE ON public.memory_summaries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 12. INTEGRATION_STATUS (Health & Connectivity Monitoring)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE CHECK (service_name IN (
        'n8n', 'gmail', 'whatsapp_cloud_api', 'openai', 'gemini', 'supabase'
    )),
    is_connected BOOLEAN NOT NULL DEFAULT false,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    status_message TEXT DEFAULT 'Healthy',
    endpoint_or_account TEXT, -- E.g. 'nabil@example.com' or '+8801700000000' (non-secret identifier)
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER update_integration_status_modtime
BEFORE UPDATE ON public.integration_status
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_status ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for n8n and backend services)
-- Authenticated users (Nabil) have full access to view and manage their data
CREATE POLICY "Full access for authenticated user on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on ai_responses" ON public.ai_responses FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on approvals" ON public.approvals FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on automation_settings" ON public.automation_settings FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on contact_preferences" ON public.contact_preferences FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on execution_logs" ON public.execution_logs FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on daily_analytics" ON public.daily_analytics FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on memory_summaries" ON public.memory_summaries FOR ALL USING (true);
CREATE POLICY "Full access for authenticated user on integration_status" ON public.integration_status FOR ALL USING (true);
