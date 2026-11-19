# NABIL AI ASSISTANT
> **One Assistant. All Conversations. Zero Manual Replies.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![n8n](https://img.shields.io/badge/n8n-v1.76.0-FF6D5A.svg)
![Meta Cloud API](https://img.shields.io/badge/WhatsApp-Cloud%20API%20v21.0-25D366.svg)
![Gmail](https://img.shields.io/badge/Gmail-OAuth%202.0-EA4335.svg)
![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-61DAFB.svg)

---

## 1. Executive Summary

**NABIL AI ASSISTANT** is a personal communication management platform engineered to automate incoming **Gmail** and **WhatsApp** conversations while maintaining human-in-the-loop control, persistent memory, and multi-modal understanding.

Built on **n8n**, **OpenAI (GPT-4o & Whisper)**, **Google Gemini**, **Supabase (PostgreSQL 15)**, and a **Midnight Navy React Dashboard**, this system functions as your 24/7 personal executive secretary.

---

## 2. Benchmark Repositories & Architectural Synthesis

Before designing the architecture, three benchmark open-source projects were analyzed:

1. **`nilsoncaputti/gmail-whatsapp-googlesheet-workflow`**
   * *Strengths extracted:* Meta GET challenge verification logic (`hub.mode === 'subscribe'`), Gmail thread conservation via `threadId`.
   * *Improvements implemented:* Replaced static keyword matching and Google Sheets with an LLM-based 10-class intent classifier and relational Supabase PostgreSQL schema.
2. **`mnk-nasir/whatsapp-ai-agent`**
   * *Strengths extracted:* Multi-modal routing (`messages[0].audio` → Whisper ASR, `messages[0].image` → Vision AI).
   * *Improvements implemented:* Replaced volatile in-memory window buffer (`memoryBufferWindow`) with persistent relational PostgreSQL conversation storage, summarization, and multi-language support (Bangla, English, Banglish).
3. **`VictorOmoboye/WhatsApp-Conversational-AI-Agent`**
   * *Findings & Synthesis:* Repository contained documentation and execution concepts without committed source code. We implemented the missing architecture: bidirectional Gmail/WhatsApp synchronization with dedicated web approval dashboards.

---

## 3. Core Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │           EXTERNAL INCOMING CHANNELS         │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
                        [New Email]              [WhatsApp Message]
                                 │                │
                                 ▼                ▼
                     ┌─────────────────┐  ┌──────────────────┐
                     │  Gmail Trigger  │  │ Meta Webhook Rec.│
                     │  (Workflow 01)  │  │  (Workflow 06)   │
                     └────────┬────────┘  └────────┬─────────┘
                              │                    │
                              ▼                    ▼
                     ┌─────────────────┐  ┌──────────────────┐
                     │ Message Extract │  │ Message Detect   │
                     │  & Deduplicate  │  │ (Text/Voice/Img) │
                     │  (Workflow 01)  │  │  (Workflow 07/09)│
                     └────────┬────────┘  └────────┬─────────┘
                              │                    │
                              ▼                    ▼
                     ┌───────────────────────────────────────┐
                     │        SHARED AI CLASSIFICATION       │
                     │  (Intent, Tone, Language, Priority)   │
                     │             (Workflow 02)             │
                     └──────────────────┬────────────────────┘
                                        │
                                        ▼
                     ┌───────────────────────────────────────┐
                     │       SHARED AI BRAIN & MEMORY        │
                     │  - Supabase Contact & Thread Context  │
                     │  - Tone Selection (Acad/Prof/Friend)  │
                     │  - Prompt-Injection Defense Layer     │
                     │         (Workflows 10 & 11)           │
                     └──────────────────┬────────────────────┘
                                        │
                                        ▼
                     ┌───────────────────────────────────────┐
                     │      SAFETY & APPROVAL CONTROLLER     │
                     │   Mode 1: Manual Approval (Queue)     │
                     │   Mode 2: Semi-Auto (Risk Scoring)    │
                     │   Mode 3: Full Auto (Strict Policy)   │
                     │         (Workflows 04 & 12)           │
                     └─────────┬───────────────────┬─────────┘
                               │                   │
                     [Requires Approval]     [Auto-Approved]
                               │                   │
                               ▼                   ▼
                     ┌──────────────────┐ ┌──────────────────┐
                     │ Dashboard Review │ │ Direct Delivery: │
                     │ (Approve / Edit) │ │ Gmail Send (W05) │
                     │                  │ │ WhatsApp (W08)   │
                     └──────────────────┘ └──────────────────┘
```

---

## 4. Key Capabilities & Technical Features

### 4.1 Gmail Intelligence
- **Signature & Quote Stripping:** Filters out historical email quotes, Disclaimers, and "Sent from my iPhone" signatures before LLM processing.
- **Multi-Class Classification:** Automatically tags emails into:
  * *Academic / University / Research* (supervisors, thesis, conferences)
  * *Professional / Job / Internship* (recruiters, corporate inquiries)
  * *Personal* (friends and family)
  * *Promotional / Spam / Suspicious* (automatically ignored without replies)
- **Thread Conservation:** Ensures replies maintain `In-Reply-To` and `References` headers with the exact `threadId`.
- **Draft Creation:** By default in `manual_approval` mode, generates a real Gmail draft in the thread without sending.

### 4.2 WhatsApp Business Cloud API (Official Meta)
- **Zero Risk of Account Ban:** Uses Meta Graph API v21.0 rather than unofficial scraping libraries.
- **Multi-Modal Ingestion:**
  * **Voice Messages:** Transcribed into text via OpenAI Whisper-1.
  * **Images:** Analyzed via GPT-4o Vision.
  * **Documents:** Extracted metadata and content analysis.
- **Multi-Language & Bengali Support:** Native comprehension of:
  * Formal Bengali Script (`বাংলা`)
  * Phonetic Romanized Bengali (`Banglish`)
  * Standard English
- **Idempotency:** Deduplicates incoming messages using Meta's unique `wamid`.

### 4.3 Shared AI Brain & Safety
- **Personalities:** Professional, Academic, Friendly, Casual, Short & Direct.
- **Prompt-Injection Defense:** External message content is treated strictly as untrusted user data. Commands attempting to override system behavior are neutralized.
- **Zero-Hallucination Directives:** Never fabricates attachments, confirms unverified meetings, or leaks data across contacts.

---

## 5. Repository Structure

```
d:\N8N\
├── backend/                  # Node.js / Express REST API Server
│   ├── src/
│   │   ├── routes/           # Endpoints for stats, gmail, whatsapp, approvals, settings
│   │   ├── db.ts             # Supabase & offline-resilient store
│   │   └── index.ts          # Main Express bootstrap
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                 # React 18 + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/       # Sidebar, Header, KPI Widgets
│   │   ├── pages/            # 8 Comprehensive Management Pages
│   │   ├── services/api.ts   # Typed API Gateway
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── Dockerfile
│
├── n8n/
│   ├── workflows/            # 14 Valid, Modular n8n Workflow JSON Files
│   │   ├── gmail/            # Workflows 01 to 05
│   │   ├── whatsapp/         # Workflows 06 to 09
│   │   ├── ai/               # Workflow 10 (Shared Brain)
│   │   └── shared/           # Workflows 11 to 14 (Memory, Approvals, Analytics)
│   └── README.md
│
├── database/
│   ├── migrations/           # 001_initial_schema.sql (12 Tables, RLS, Indexes)
│   └── seed/                 # 001_seed_data.sql (Initial configurations & mock data)
│
├── config/
│   ├── .env.example          # Environment variables template
│   └── settings.example.json # System parameters reference
│
├── docs/
│   ├── architecture.md       # Full architecture blueprint & repo review
│   ├── setup-guide.md        # Step-by-step setup walkthrough
│   ├── gmail-setup.md        # Google Cloud OAuth 2.0 instructions
│   ├── whatsapp-setup.md     # Meta Cloud API & Webhook guide
│   ├── n8n-workflows.md      # Node-by-node workflow catalog
│   └── troubleshooting.md    # Common errors & resolutions
│
├── docker-compose.yml        # Production multi-container orchestration
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. The 14 Modular n8n Workflows

| # | Workflow Name | Description |
|---|---------------|-------------|
| **01** | `01_gmail_incoming_handler.json` | Polls inbox, strips quotes/signatures, checks spam, upserts to Supabase |
| **02** | `02_gmail_ai_classification.json` | Classifies emails into 10 intent categories |
| **03** | `03_gmail_reply_generator.json` | Generates context-aware replies matching chosen tone |
| **04** | `04_gmail_draft_and_approval.json` | Creates Gmail drafts in-thread and records pending approval |
| **05** | `05_gmail_reply_sender.json` | Dispatches email via Gmail API and logs delivery |
| **06** | `06_whatsapp_webhook_receiver.json` | Answers Meta GET verification and parses incoming POST messages |
| **07** | `07_whatsapp_message_processor.json` | Enforces idempotency via `wamid` and routes by message type |
| **08** | `08_whatsapp_ai_reply_generator.json` | Dispatches WhatsApp replies via Meta Graph API or queues approval |
| **09** | `09_whatsapp_media_processor.json` | Transcribes audio (Whisper) and analyzes images (GPT Vision) |
| **10** | `10_shared_ai_brain.json` | Central AI decision node with prompt-injection defense |
| **11** | `11_conversation_memory_manager.json` | Queries Supabase for recent context turns and summaries |
| **12** | `12_approval_notification_handler.json` | Logs and notifies user when approval is required |
| **13** | `13_failed_execution_retry_handler.json` | Handles failures, records audit trail, and prevents infinite loops |
| **14** | `14_daily_analytics_reporting.json` | Scheduled midnight cron aggregating daily KPIs |

---

## 7. Database Architecture (Supabase / PostgreSQL)

The schema defines **12 relational tables** with Row Level Security (RLS), custom triggers, and indexes:

1. `profiles`: Assistant owner profile, timezone, contact details.
2. `contacts`: Unified contact registry (emails, phone numbers, VIP status, whitelist).
3. `conversations`: Channel-isolated conversation threads (`gmail` vs `whatsapp`).
4. `messages`: Inbound and outbound message records with media URLs and transcriptions.
5. `ai_responses`: AI generated outputs, token usage, latency, and reasoning.
6. `approvals`: Human-in-the-loop pending approval queue (Approve, Edit, Reject).
7. `automation_settings`: Global modes (`manual_approval`, `semi_automatic`, `full_automation`), working hours, jitter delay.
8. `contact_preferences`: Per-contact overrides for tone, language, and auto-reply quotas.
9. `execution_logs`: Full audit logs of all workflow stages and durations.
10. `daily_analytics`: Aggregated daily metrics for dashboard visualization.
11. `memory_summaries`: Condensed long-term facts extracted from conversations.
12. `integration_status`: Live connectivity indicators for external services.

---

## 8. Dashboard Pages

The modern Midnight Navy dashboard provides 8 comprehensive views:

1. **Overview Dashboard:** Live KPI cards, 7-day activity area chart, channel distribution donut chart, quick-action approvals.
2. **Approval Center:** Dedicated review queue with Approve, Reject, Edit & Send, and AI Regenerate controls.
3. **Gmail Management:** Connected account status, incoming thread viewer, classifications, and draft states.
4. **WhatsApp Management:** Meta Cloud number status, quality rating, live conversation viewer, and voice/image badges.
5. **AI Memory & Contacts:** Searchable contact summaries, extracted knowledge facts, and delete/clear controls.
6. **Automation Settings:** Mode toggles (Manual / Semi-Auto / Full Auto), model selection (GPT-4o, Gemini 2.0 Flash), personality dropdowns, jitter delays, and signature customization.
7. **Activity Logs:** Searchable audit trail with latency metrics, execution stages, and status filters.
8. **Integrations & APIs:** Zero-secret health monitoring of n8n, Gmail, WhatsApp, OpenAI, Gemini, and Supabase.

---

## 9. Quick Start Guide

### 1. Environment Setup
```bash
cp config/.env.example .env
# Edit .env with your real credentials (see docs/setup-guide.md)
```

### 2. Database Migration
Run `database/migrations/001_initial_schema.sql` and `database/seed/001_seed_data.sql` in your Supabase SQL editor.

### 3. Docker Launch
```bash
docker compose up -d --build
```
- Frontend Dashboard: `http://localhost:3000`
- Backend API Server: `http://localhost:4000`
- n8n Automation Engine: `http://localhost:5678`

---

## 10. Deliverables Status & Summary

| Module | Status | Notes |
|---|---|---|
| **Repository Research** | Completed | All 3 repos inspected; findings incorporated in `docs/architecture.md`. |
| **n8n Workflows** | Completed | 14 valid, importable workflow JSON files in `n8n/workflows/`. |
| **Supabase Migrations** | Completed | 12 tables with RLS, triggers, indexes, and seed data. |
| **Backend REST API** | Completed | Express + TypeScript API server with offline fallback cache. |
| **Web Dashboard** | Completed | 8 responsive pages in Midnight Navy theme with Recharts data visualization. |
| **Docker Compose** | Completed | Multi-container setup with n8n, backend, and frontend. |
| **Documentation** | Completed | Complete guides for Gmail, WhatsApp, n8n, and troubleshooting. |
| **External Credentials** | Awaiting User | Real API keys (Google OAuth, Meta Access Token, OpenAI Key) to be supplied in `.env`. |

---

## 11. License
This project is open-source under the MIT License.
