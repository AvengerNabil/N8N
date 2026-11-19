# NABIL AI ASSISTANT — Architectural Design & Reference Analysis
**Tagline:** One Assistant. All Conversations. Zero Manual Replies.  
**Version:** 1.0.0 (Production Blueprint)

---

## 1. Executive Summary & Repository Analysis

To build **NABIL AI ASSISTANT**, we conducted source code inspections of the three benchmark repositories specified in the specification:

### 1.1 Repository 1: `nilsoncaputti/gmail-whatsapp-googlesheet-workflow`
* **Inspection Findings:**
  * Clean, functional Docker Compose configuration and `.env.example`.
  * **Gmail Workflow:** Implements `gmailTrigger` polling every minute, custom regex parsing for keywords and SKU identification, Google Sheets lookup, direct OpenAI chat completion (`/v1/chat/completions`) with strict system prompts, and `gmail.createDraft` preserving `threadId`.
  * **WhatsApp Workflow:** Handles Meta Cloud API webhook verification via GET request (`hub.mode === 'subscribe'` returning `hub.challenge`), and POST message payloads (`messages[0].text.body`). Sends replies using the official Meta Graph API (`https://graph.facebook.com/v21.0/{phone_number_id}/messages`).
* **Strengths Reused:**
  * Official Meta GET challenge verification pattern.
  * Human-in-the-loop draft generation in Gmail instead of risky blind replies.
  * Thread conservation using `threadId`.
* **Weaknesses & Improvements:**
  * Relied entirely on Google Sheets rather than a persistent relational database.
  * Rule-based keyword matching was rigid; replaced with an LLM-powered multi-class intent classifier.
  * Lacked audio, vision, multi-language (Bangla/Banglish), and approval state management.

### 1.2 Repository 2: `mnk-nasir/whatsapp-ai-agent`
* **Inspection Findings:**
  * Uses LangChain agent nodes (`@n8n/n8n-nodes-langchain.agent`) and `memoryBufferWindow`.
  * Multi-modal routing: branches dynamically on `messages[0].audio` (Whisper), `messages[0].image` (Vision), and `messages[0].text`.
  * Integrated external tools (Pinecone vector search, SerpAPI web search, Calculator).
* **Strengths Reused:**
  * Multi-modal ingestion logic (voice transcription and vision analysis pipeline).
  * Sender phone number as unique session key.
* **Weaknesses & Improvements:**
  * `memoryBufferWindow` stores state in ephemeral memory; restarting the container wipes context. We replace this with a PostgreSQL/Supabase relational memory system and summarization layer.
  * Single-personality hardcoding ("Sam"); we introduce dynamic multi-personality switching (Professional, Friendly, Academic, Casual, Short/Direct).
  * Zero email or human-approval support.

### 1.3 Repository 3: `VictorOmoboye/WhatsApp-Conversational-AI-Agent`
* **Inspection Findings:**
  * The GitHub repository contains exclusively documentation, execution screenshots, and architectural concepts; **no workflow JSON files or source code were committed to the repository**.
  * Documents the use of WhatsApp as an orchestrator for reading, summarizing, and drafting Gmail messages, and managing Google Calendar events.
* **Architectural Lessons Synthesized:**
  * Conceptual value of unified communication: using a shared AI brain so contact preferences and interaction history inform both email and instant messaging.
  * We implement the missing implementation: full bidirectional Gmail and WhatsApp integration with Supabase persistence and web dashboard controls.

---

## 2. High-Level System Architecture

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
                     │ Dashboard / Push │ │ Direct Delivery: │
                     │ Pending Review   │ │ Gmail Send (W05) │
                     │ (Approve / Edit) │ │ WhatsApp (W08)   │
                     └──────────────────┘ └──────────────────┘
```

---

## 3. Communication Strategy & Multi-Language Support
1. **Bangla & Banglish Recognition:**
   * The AI Brain includes native system prompt guidance to recognize Bengali script (`বাংলা`), phonetic Romanized Bengali (`Banglish`), and standard English.
   * Responses match the language and transliteration scheme of the sender unless instructed otherwise.
2. **Context-Aware Personalities:**
   * **Professional:** Courteous, structured, crisp, signature included.
   * **Academic / Research:** Rigorous, polite, referencing papers/deadlines, formal salutations.
   * **Friendly / Casual:** Natural, conversational, warm, no stiff jargon.
   * **Short and Direct:** Concise, single-sentence where possible, zero fluff.
3. **Safety & Zero-Hallucination Directives:**
   * Refusal to commit to meetings or promises without verification.
   * Never claims attachments exist unless confirmed.
   * Never leaks information between contacts or channels.
   * Untrusted input containment: External message content cannot override system instructions.
