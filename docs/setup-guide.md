# Comprehensive Setup Guide for NABIL AI ASSISTANT
**Tagline:** One Assistant. All Conversations. Zero Manual Replies.

---

## 1. System Requirements
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Docker & Docker Compose:** Optional for containerized deployment, or run natively via Node
- **Supabase Account:** Free or Pro tier PostgreSQL database
- **OpenAI API Key:** For GPT-4o, Whisper transcription, and Vision
- **Google Cloud Platform:** For Gmail API OAuth 2.0
- **Meta Developer Account:** For WhatsApp Business Cloud API

---

## 2. Fast-Track Local Installation

### Step 1: Clone or Open Project
Ensure you are in the project root directory:
```bash
cd d:\N8N
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp config/.env.example .env
```
Populate your credentials:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_USER_EMAIL`

### Step 3: Run Database Migrations
1. Open your Supabase Dashboard SQL Editor.
2. Paste the contents of `database/migrations/001_initial_schema.sql` and run it.
3. Paste the contents of `database/seed/001_seed_data.sql` and run it to initialize default configuration and sample records.

### Step 4: Import n8n Workflows
1. Start n8n locally via Docker (`docker compose up -d n8n`) or native binary (`npx n8n`).
2. Visit `http://localhost:5678`.
3. In n8n, click **Workflows** → **Import from File**.
4. Import all 14 files located in `n8n/workflows/`.
5. Connect your Gmail OAuth2 and WhatsApp credentials.
6. Activate the workflows.

### Step 5: Start the Backend & Frontend Dashboard
In terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
```
*(Runs on `http://localhost:4000`)*

In terminal 2 (Frontend Dashboard):
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## 3. Production Deployment with Docker Compose
To run the full stack containerized in production:
```bash
docker compose up -d --build
```
This automatically spins up:
- `nabil_ai_n8n`: n8n automation engine at port `5678`
- `nabil_ai_backend`: Express API server at port `4000`
- `nabil_ai_frontend`: Optimized React Nginx dashboard at port `3000`
