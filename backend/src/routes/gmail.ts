import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// Get recent Gmail emails and threads
router.get('/emails', (req, res) => {
  const emails = localStore.messages
    .filter(m => m.channel === 'gmail')
    .map(msg => {
      const conv = localStore.conversations.find(c => c.id === msg.conversation_id);
      const ai = localStore.aiResponses.find(r => r.message_id === msg.id);
      const approval = localStore.approvals.find(a => a.message_id === msg.id);

      return {
        id: msg.id,
        threadId: conv?.external_thread_id || 'thread_default',
        senderName: msg.sender_identifier.split('@')[0],
        senderEmail: msg.sender_identifier,
        subject: msg.subject || 'No Subject',
        snippet: msg.body_clean || msg.body_raw,
        receivedAt: msg.received_at,
        category: ai?.category || 'professional',
        priority: ai?.priority || 'normal',
        generatedReply: ai?.generated_reply || null,
        draftStatus: approval ? approval.status : 'none',
        externalDraftId: approval?.external_draft_id || null
      };
    });

  res.json({
    account: {
      email: 'nabil.assistant.hq@gmail.com',
      status: 'Connected',
      lastSyncedAt: new Date().toISOString()
    },
    emails
  });
});

export default router;
