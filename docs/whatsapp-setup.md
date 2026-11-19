# Meta WhatsApp Business Cloud API Setup Guide
**Project:** NABIL AI ASSISTANT  
**Component:** WhatsApp Business Cloud API v21.0 & Webhooks

---

## 1. Overview
The WhatsApp module interfaces exclusively with the **official Meta WhatsApp Business Cloud API**. This guarantees your account is safe from bans associated with unofficial reverse-engineered web client scrapers.

---

## 2. Meta for Developers Setup

### Step 1: Create a Meta Developer App
1. Go to [developers.facebook.com](https://developers.facebook.com/).
2. Log in with your Facebook account.
3. Click **My Apps** → **Create App**.
4. Select **Other** as the use case → Next.
5. Select **Business** as the app type → Next.
6. Provide an App name (e.g. `Nabil AI Assistant`) and link your Meta Business Account.

### Step 2: Add WhatsApp Product
1. On the App Dashboard, find **WhatsApp** and click **Set up**.
2. Go to **WhatsApp** → **API Setup** in the left sidebar.
3. You will see:
   * **Phone number ID:** (e.g., `109283746501928`)
   * **WhatsApp Business Account ID:** (e.g., `987654321098765`)
   * **Temporary access token:** (Used for initial testing)
4. Add your personal phone number as a **Recipient phone number** for test mode.

### Step 3: Create a Permanent System User Token
*Temporary tokens expire in 24 hours. For production 24/7 automation, generate a permanent System User token:*
1. Go to [business.facebook.com/settings](https://business.facebook.com/settings).
2. Go to **Users** → **System Users** → Click **Add**.
3. Name: `nabil-ai-system-user`, Role: `Admin`.
4. Click **Generate New Token**.
5. Select your App and enable permissions:
   * `whatsapp_business_messaging`
   * `whatsapp_business_management`
6. Click **Generate Token** and store it securely in your `.env` as `WHATSAPP_ACCESS_TOKEN`.

---

## 3. Webhook Configuration

### Step 1: Expose Webhook via HTTPS
Meta requires an HTTPS endpoint with a valid SSL certificate.
* If testing locally, launch ngrok or Cloudflare tunnel:
  ```bash
  ngrok http 5678
  ```
* Your webhook URL will be:
  ```
  https://your-ngrok-url.ngrok-free.app/webhook/whatsapp-webhook
  ```

### Step 2: Subscribe in Meta Console
1. In Meta Developer Console, go to **WhatsApp** → **Configuration** → **Webhook**.
2. Click **Edit**.
3. **Callback URL:** `https://your-ngrok-url.ngrok-free.app/webhook/whatsapp-webhook`
4. **Verify token:** Enter the string set in `.env` under `WHATSAPP_VERIFY_TOKEN` (e.g., `nabil_assistant_secure_meta_verify_token_2026`).
5. Click **Verify and save**. n8n will return the challenge token and Meta will verify the connection with a green badge.
6. Under **Webhook fields**, click **Manage** and subscribe to **messages**.
