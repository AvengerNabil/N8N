# NABIL AI ASSISTANT — n8n Workflows Specification

This directory houses the 14 modular n8n workflows powering **NABIL AI ASSISTANT**.

---

## Workflow Catalog

### Gmail Automation Suite
1. **`01_gmail_incoming_handler.json`**  
   Polls Gmail inbox, cleans quoted email bodies, strips email signatures, verifies sender credibility, and upserts incoming message rows into Supabase.
2. **`02_gmail_ai_classification.json`**  
   Multi-class AI intent classification (Academic, Professional, Personal, Job/Internship, Urgent, Spam, etc.). Routes non-spam items to reply generation.
3. **`03_gmail_reply_generator.json`**  
   Retrieves contact communication preferences, evaluates thread context, and crafts an email reply matching Nabil's chosen persona.
4. **`04_gmail_draft_and_approval.json`**  
   If in `manual_approval` mode, constructs a real Gmail draft within the active thread and inserts an entry into the Supabase approval queue.
5. **`05_gmail_reply_sender.json`**  
   Dispatches finalized replies via Gmail API, preserving in-reply-to headers, and updates delivery counters in Supabase.

### WhatsApp Automation Suite
6. **`06_whatsapp_webhook_receiver.json`**  
   Official Meta Cloud API webhook handler: verifies GET hub challenges and processes incoming message events.
7. **`07_whatsapp_message_processor.json`**  
   Enforces idempotency using Meta's `wamid`, maps contacts, and routes based on media type (text, audio, image, document).
8. **`08_whatsapp_ai_reply_generator.json`**  
   Invokes the central AI brain, checks automation approval gates, queues drafts or directly responds using Meta Graph API.
9. **`09_whatsapp_media_processor.json`**  
   Handles multi-modal input: OpenAI Whisper for voice notes, GPT-4o Vision for photo analysis, and document parsing.

### Intelligence & Shared Governance
10. **`10_shared_ai_brain.json`**  
    Central intelligence node with prompt injection protection, multi-personality support, Bangla/English/Banglish fluency, and structured JSON output.
11. **`11_conversation_memory_manager.json`**  
    Queries Supabase PostgreSQL for recent conversation history and summarized context.
12. **`12_approval_notification_handler.json`**  
    Logs and triggers alerts when human approval is required.
13. **`13_failed_execution_retry_handler.json`**  
    Monitors execution errors, records audit stacks, and prevents infinite retry loops.
14. **`14_daily_analytics_reporting.json`**  
    Scheduled daily cron that compiles productivity analytics and channel throughput.

---

## Import Instructions
1. Open n8n web interface at `http://localhost:5678`.
2. Go to **Workflows → Import from File**.
3. Import the workflows from their respective folders (`gmail/`, `whatsapp/`, `ai/`, `shared/`).
4. Re-bind credentials for **Gmail OAuth2** and **WhatsApp Cloud API** where flagged.
