# n8n Workflow Architecture & Connection Specifications
**Project:** NABIL AI ASSISTANT  
**Total Workflows:** 14  

---

## 1. Modular Architecture Overview

Rather than consolidating all logic into an unmanageable monolithic canvas, NABIL AI ASSISTANT deploys 14 modular, single-responsibility workflows interconnected via `Execute Workflow` triggers and secure internal webhooks.

```
Incoming Email ──► [W01: Inbound Handler] ──► [W02: Classifier] ──► [W03: Generator]
                                                                          │
                                                                          ▼
                                                                [W04: Draft & Approve]
                                                                    │              │
                                                       (If Approved)▼              ▼(Pending)
                                                    [W05: Reply Sender]     [W12: Notification]

Incoming WA ──► [W06: Webhook Recv] ──► [W07: Processor] ──► [W08: AI Reply Gen]
                                              │                       │
                                   (If Media) ▼                       ▼
                                       [W09: Multi-Modal]    [W10: Shared AI Brain]
                                                                      │
                                                                      ▼
                                                            [W11: Memory Manager]
```

---

## 2. Detailed Workflow Index

### Workflow 01: Gmail Incoming Message Handler
* **File:** `n8n/workflows/gmail/01_gmail_incoming_handler.json`
* **Trigger:** Gmail Polling Trigger (`label:INBOX -from:me`, 1 min interval)
* **Responsibilities:** Strips signatures, standardizes email headers, extracts Clean Body, checks spam heuristics, upserts message into Supabase `messages` table, and delegates to Workflow 02.

### Workflow 02: Gmail AI Classification
* **File:** `n8n/workflows/gmail/02_gmail_ai_classification.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Multi-class intent extraction. Returns strict JSON containing `intent`, `category`, `detected_language`, `priority`, and `should_reply`. Ignores automated promotional / spam emails.

### Workflow 03: Gmail Reply Generator
* **File:** `n8n/workflows/gmail/03_gmail_reply_generator.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Retrieves contact preferences from Supabase, formats contextual prompt, invokes LLM with persona guidelines (Academic / Professional / Friendly), and passes generated draft to Workflow 04.

### Workflow 04: Gmail Draft and Approval
* **File:** `n8n/workflows/gmail/04_gmail_draft_and_approval.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Checks automation mode. If `manual_approval`, creates a Gmail Draft within the original thread and registers a pending approval in Supabase. If `full_automation`, directly calls Workflow 05.

### Workflow 05: Gmail Reply Sender
* **File:** `n8n/workflows/gmail/05_gmail_reply_sender.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Dispatches email via Gmail API with `threadId` preservation, logs outgoing record in Supabase, and increments daily KPI metrics.

### Workflow 06: WhatsApp Webhook Receiver
* **File:** `n8n/workflows/whatsapp/06_whatsapp_webhook_receiver.json`
* **Trigger:** Webhook Node (`GET, POST /webhook/whatsapp-webhook`)
* **Responsibilities:** Answers Meta challenge verification GET requests (`hub.mode === 'subscribe'`), acknowledges POST events with HTTP 200, extracts contacts & message arrays, and routes to Workflow 07.

### Workflow 07: WhatsApp Message Processor
* **File:** `n8n/workflows/whatsapp/07_whatsapp_message_processor.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Idempotency verification against Supabase `messages.external_message_id`, routes based on media type (text, audio, image, document).

### Workflow 08: WhatsApp AI Reply Generator
* **File:** `n8n/workflows/whatsapp/08_whatsapp_ai_reply_generator.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Invokes Shared AI Brain (Workflow 10). If full automation, dispatches reply via Meta Graph API (`POST https://graph.facebook.com/v21.0/{phone_number_id}/messages`). Otherwise queues for human approval.

### Workflow 09: WhatsApp Media Processor
* **File:** `n8n/workflows/whatsapp/09_whatsapp_media_processor.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Downloads audio/image media from Meta Cloud. Transcribes voice notes using OpenAI Whisper-1, analyzes images with GPT-4o Vision, and passes extracted plain text into Workflow 08.

### Workflow 10: Shared AI Brain
* **File:** `n8n/workflows/ai/10_shared_ai_brain.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Central intelligence layer with prompt-injection defenses. Generates structured JSON responses respecting Bengali, English, and Banglish dialects.

### Workflow 11: Conversation Memory Manager
* **File:** `n8n/workflows/shared/11_conversation_memory_manager.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Fetches recent conversation history from Supabase, formats concise turn-taking buffers, and prevents context-window bloat.

### Workflow 12: Approval Notification Handler
* **File:** `n8n/workflows/shared/12_approval_notification_handler.json`
* **Trigger:** Execute Workflow Trigger
* **Responsibilities:** Dispatches dashboard notification alerts whenever a response requires manual sign-off.

### Workflow 13: Failed Execution and Retry Handler
* **File:** `n8n/workflows/shared/13_failed_execution_retry_handler.json`
* **Trigger:** Error Trigger Node
* **Responsibilities:** Captures execution stack traces, logs errors into Supabase `execution_logs`, and prevents broken loops.

### Workflow 14: Daily Analytics and Reporting
* **File:** `n8n/workflows/shared/14_daily_analytics_reporting.json`
* **Trigger:** Schedule Cron Trigger (`0 0 * * *`)
* **Responsibilities:** Computes daily aggregates (messages received, replies sent, approval ratios) and updates `daily_analytics`.
