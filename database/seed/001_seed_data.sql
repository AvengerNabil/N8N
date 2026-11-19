-- ====================================================================
-- NABIL AI ASSISTANT: SEED DATA FOR LOCAL DEVELOPMENT & TESTING
-- ====================================================================

-- 1. Default Profile
INSERT INTO public.profiles (id, full_name, display_name, email, whatsapp_number, timezone)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Nabil Rahaman',
    'Nabil AI Assistant',
    'nabil.assistant.hq@gmail.com',
    '+8801700112233',
    'Asia/Dhaka'
) ON CONFLICT (email) DO NOTHING;

-- 2. Default Automation Settings
INSERT INTO public.automation_settings (
    id,
    profile_id,
    gmail_automation_enabled,
    whatsapp_automation_enabled,
    automation_mode,
    default_ai_provider,
    default_ai_model,
    default_personality,
    language_mode,
    auto_reply_delay_seconds,
    max_response_tokens,
    signature_block
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    true,
    true,
    'manual_approval', -- Safe initial default as requested
    'openai',
    'gpt-4o',
    'professional',
    'adaptive',
    30,
    600,
    E'Warm regards,\nNabil Rahaman\nPersonal AI Assistant'
) ON CONFLICT DO NOTHING;

-- 3. Integration Status Initialization
INSERT INTO public.integration_status (service_name, is_connected, status_message, endpoint_or_account)
VALUES
    ('n8n', true, 'Connected to n8n instance at http://localhost:5678', 'v1.76.0'),
    ('gmail', true, 'OAuth 2.0 active (nabil.assistant.hq@gmail.com)', 'nabil.assistant.hq@gmail.com'),
    ('whatsapp_cloud_api', true, 'Meta Graph API v21.0 Webhook verified', '+8801700112233'),
    ('openai', true, 'OpenAI API key validated (GPT-4o, Whisper-1)', 'api.openai.com'),
    ('gemini', true, 'Gemini 2.0 Flash fallback configured', 'generativelanguage.googleapis.com'),
    ('supabase', true, 'PostgreSQL database connected with RLS', 'db.supabase.co')
ON CONFLICT (service_name) DO UPDATE SET
    is_connected = EXCLUDED.is_connected,
    status_message = EXCLUDED.status_message,
    endpoint_or_account = EXCLUDED.endpoint_or_account;

-- 4. Sample Contacts
INSERT INTO public.contacts (id, name, primary_email, primary_phone, organization, role, relationship_type, is_whitelisted)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Prof. Dr. Tariq Hasan', 'tariq.hasan@university.edu', '+8801811223344', 'State University', 'Thesis Supervisor', 'academic', true),
    ('c0000002-0000-0000-0000-000000000002', 'Sarah Jenkins', 'sarah.j@techventures.io', '+14155552671', 'TechVentures Capital', 'Senior Recruiter', 'recruiter', true),
    ('c0000003-0000-0000-0000-000000000003', 'Tanvir Ahmed', 'tanvir.ahmed@gmail.com', '+8801912345678', 'Dhaka AI Labs', 'Research Colleague', 'personal', true),
    ('c0000004-0000-0000-0000-000000000004', 'CloudServices Deals', 'newsletter@cloudpromos.net', NULL, 'Promo Blast', 'Marketing', 'vendor', false)
ON CONFLICT DO NOTHING;

-- 5. Contact Preferences
INSERT INTO public.contact_preferences (contact_id, preferred_tone, preferred_language, allow_auto_reply, always_require_approval)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'academic', 'English', false, true),
    ('c0000002-0000-0000-0000-000000000002', 'professional', 'English', false, true),
    ('c0000003-0000-0000-0000-000000000003', 'friendly', 'Banglish', true, false)
ON CONFLICT DO NOTHING;

-- 6. Sample Conversations
INSERT INTO public.conversations (id, contact_id, channel, external_thread_id, title, unread_count, last_message_at)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'gmail', 'thread_18dc98a76b12f45', 'Review of Draft Chapter 4 on Distributed AI', 1, NOW() - INTERVAL '15 minutes'),
    ('d0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'gmail', 'thread_18dc98f99e33a12', 'Interview Invitation: Senior Automation Architect at TechVentures', 1, NOW() - INTERVAL '1 hour'),
    ('d0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'whatsapp', '+8801912345678', 'Tanvir Ahmed (WhatsApp)', 1, NOW() - INTERVAL '5 minutes')
ON CONFLICT DO NOTHING;

-- 7. Sample Messages
INSERT INTO public.messages (
    id, conversation_id, contact_id, channel, external_message_id, direction, 
    sender_identifier, recipient_identifier, message_type, subject, body_raw, body_clean, received_at
) VALUES
    (
        'e0000001-0000-0000-0000-000000000001',
        'd0000001-0000-0000-0000-000000000001',
        'c0000001-0000-0000-0000-000000000001',
        'gmail',
        'msg_gmail_001_sup',
        'incoming',
        'tariq.hasan@university.edu',
        'nabil.assistant.hq@gmail.com',
        'text',
        'Review of Draft Chapter 4 on Distributed AI',
        'Dear Nabil,\nI have completed reading Chapter 4. The empirical benchmarks look solid, but the evaluation section needs clarity on the latency trade-offs. Can you send the updated draft by Thursday 3 PM?\nBest regards,\nProf. Tariq',
        'Dear Nabil, I have completed reading Chapter 4. The empirical benchmarks look solid, but the evaluation section needs clarity on the latency trade-offs. Can you send the updated draft by Thursday 3 PM? Best regards, Prof. Tariq',
        NOW() - INTERVAL '15 minutes'
    ),
    (
        'e0000002-0000-0000-0000-000000000002',
        'd0000003-0000-0000-0000-000000000003',
        'c0000003-0000-0000-0000-000000000003',
        'whatsapp',
        'wamid.HBgLMDAxMTIyMzM0NA==',
        'incoming',
        '+8801912345678',
        '+8801700112233',
        'text',
        NULL,
        'Kire Nabil, kaler meeting ta ki 4 tay hobe naki pore shift korbi? Updates gula finalize korsi.',
        'Kire Nabil, kaler meeting ta ki 4 tay hobe naki pore shift korbi? Updates gula finalize korsi.',
        NOW() - INTERVAL '5 minutes'
    )
ON CONFLICT DO NOTHING;

-- 8. Sample AI Responses
INSERT INTO public.ai_responses (
    id, message_id, conversation_id, model_provider, model_name,
    intent, category, detected_language, priority, should_reply, requires_approval,
    generated_reply, reasoning, prompt_tokens, completion_tokens, latency_ms
) VALUES
    (
        'f0000001-0000-0000-0000-000000000001',
        'e0000001-0000-0000-0000-000000000001',
        'd0000001-0000-0000-0000-000000000001',
        'openai',
        'gpt-4o',
        'request_deadline',
        'academic',
        'English',
        'high',
        true,
        true,
        'Dear Professor Tariq,\n\nThank you for the detailed feedback on Chapter 4. I am refining the evaluation section to clearly articulate the latency trade-offs between distributed consensus and inference speed. I will have the updated revision submitted to you before Thursday at 3:00 PM.\n\nRespectfully,\nNabil Rahaman',
        'Academic supervisor requesting deadline confirmation on Chapter 4. Tone selected: Academic. High priority.',
        420,
        78,
        840
    ),
    (
        'f0000002-0000-0000-0000-000000000002',
        'e0000002-0000-0000-0000-000000000002',
        'd0000003-0000-0000-0000-000000000003',
        'openai',
        'gpt-4o',
        'meeting_time_inquiry',
        'personal',
        'Banglish',
        'normal',
        true,
        true,
        'Hae Tanvir, kal 4 tay e shuru kori. Slides gula ready thakle dekha shuru korte pari.',
        'Friend asking about meeting schedule in Banglish. Tone: Friendly. Language: Banglish.',
        210,
        34,
        610
    )
ON CONFLICT DO NOTHING;

-- 9. Sample Pending Approvals
INSERT INTO public.approvals (
    id, ai_response_id, message_id, conversation_id, channel, status, proposed_reply, external_draft_id
) VALUES
    (
        '10000001-0000-0000-0000-000000000001',
        'f0000001-0000-0000-0000-000000000001',
        'e0000001-0000-0000-0000-000000000001',
        'd0000001-0000-0000-0000-000000000001',
        'gmail',
        'pending',
        'Dear Professor Tariq,\n\nThank you for the detailed feedback on Chapter 4. I am refining the evaluation section to clearly articulate the latency trade-offs between distributed consensus and inference speed. I will have the updated revision submitted to you before Thursday at 3:00 PM.\n\nRespectfully,\nNabil Rahaman',
        'r-89218291823912'
    ),
    (
        '10000002-0000-0000-0000-000000000002',
        'f0000002-0000-0000-0000-000000000002',
        'e0000002-0000-0000-0000-000000000002',
        'd0000003-0000-0000-0000-000000000003',
        'whatsapp',
        'pending',
        'Hae Tanvir, kal 4 tay e shuru kori. Slides gula ready thakle dekha shuru korte pari.',
        NULL
    )
ON CONFLICT DO NOTHING;

-- 10. Sample Analytics & Logs
INSERT INTO public.daily_analytics (
    date, gmail_received, gmail_replies_sent, gmail_drafts_created, 
    whatsapp_received, whatsapp_replies_sent, ai_replies_generated, 
    manual_approvals_approved, manual_approvals_rejected, avg_ai_latency_ms
) VALUES (
    CURRENT_DATE,
    14, 8, 4,
    28, 22, 38,
    11, 1, 725
) ON CONFLICT (date) DO UPDATE SET
    gmail_received = EXCLUDED.gmail_received,
    whatsapp_received = EXCLUDED.whatsapp_received;

INSERT INTO public.execution_logs (
    workflow_id, workflow_name, execution_id, channel, stage, status, input_summary, output_summary, duration_ms
) VALUES
    ('wf_01_gmail_inbound', 'Gmail Incoming Message Handler', 'exec_91823', 'gmail', 'extraction', 'success', 'Sender: tariq.hasan@university.edu', 'Thread ID extracted: thread_18dc98a76b12f45', 185),
    ('wf_02_ai_classify', 'Gmail AI Classification', 'exec_91824', 'gmail', 'classification', 'success', 'Classified as Academic (Priority: High)', 'intent: request_deadline', 650),
    ('wf_06_wa_webhook', 'WhatsApp Webhook Receiver', 'exec_91825', 'whatsapp', 'webhook', 'success', 'From: +8801912345678', 'WAMID parsed: wamid.HBgLMDAxMTIyMzM0NA==', 72),
    ('wf_10_ai_brain', 'Shared AI Brain', 'exec_91826', 'whatsapp', 'generation', 'success', 'Prompt tokens: 210, Language: Banglish', 'Reply generated: Hae Tanvir, kal 4 tay...', 610)
ON CONFLICT DO NOTHING;
