# Gmail Integration & OAuth 2.0 Setup Guide
**Project:** NABIL AI ASSISTANT  
**Component:** Gmail API v1 / OAuth 2.0 Client

---

## 1. Overview
The Gmail automation module polls your inbox for incoming emails, applies multi-class intent classification, drafts or generates replies in the original thread, and records all activities in Supabase.

---

## 2. Google Cloud Platform Configuration

### Step 1: Create a Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** → **New Project**.
3. Name your project (e.g., `nabil-ai-assistant`) and click **Create**.

### Step 2: Enable the Gmail API
1. In the navigation menu, go to **APIs & Services** → **Library**.
2. Search for **Gmail API**.
3. Select it and click **Enable**.

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**.
2. Choose **External** user type and click **Create**.
3. Fill in:
   * **App name:** `Nabil AI Assistant`
   * **User support email:** Your email address
   * **Developer contact email:** Your email address
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and add:
   * `https://mail.google.com/` (Full access to read, compose, send, and draft emails)
   * `https://www.googleapis.com/auth/gmail.modify`
   * `https://www.googleapis.com/auth/gmail.compose`
6. Under **Test Users**, add your personal Gmail address (`nabil.assistant.hq@gmail.com`).
7. Click **Save and Continue**.

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. Select **Application type:** `Web application`.
4. Name: `n8n Gmail OAuth Client`.
5. Under **Authorized redirect URIs**, add:
   * `http://localhost:5678/rest/oauth2-credential/callback`
   * *(If using a tunnel or domain, also add `https://your-domain.ngrok-free.app/rest/oauth2-credential/callback`)*
6. Click **Create**.
7. Securely save the **Client ID** and **Client Secret**.

---

## 3. Configuring Credentials in n8n

1. Open your n8n interface at `http://localhost:5678`.
2. Go to **Credentials** → **New Credential** → search for **Gmail OAuth2 API**.
3. Enter your:
   * **Client ID**
   * **Client Secret**
4. Click **Connect my account** and complete Google sign-in.
5. In workflows `01`, `04`, and `05`, select this credential for all Gmail nodes.
