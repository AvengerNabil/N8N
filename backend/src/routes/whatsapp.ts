import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// Get WhatsApp conversations and messages
router.get('/conversations', (req, res) => {
  const conversations = localStore.conversations
    .filter(c => c.channel === 'whatsapp')
    .map(conv => {
      const contact = localStore.contacts.find(ct => ct.id === conv.contact_id);
      const messages = localStore.messages.filter(m => m.conversation_id === conv.id);
      const pendingApproval = localStore.approvals.find(a => a.conversation_id === conv.id && a.status === 'pending');

      return {
        id: conv.id,
        contactId: contact?.id,
        contactName: contact?.name || conv.external_thread_id,
        phoneNumber: conv.external_thread_id,
        unreadCount: conv.unread_count,
        lastMessageAt: conv.last_message_at,
        relationship: contact?.relationship_type || 'unknown',
        messages: messages.map(m => ({
          id: m.id,
          direction: m.direction,
          messageType: m.message_type,
          body: m.body_clean || m.body_raw,
          receivedAt: m.received_at
        })),
        pendingApproval: pendingApproval ? {
          id: pendingApproval.id,
          proposedReply: pendingApproval.proposed_reply,
          status: pendingApproval.status
        } : null
      };
    });

  res.json({
    connectedNumber: {
      phone: '+8801700112233',
      displayName: 'Nabil Assistant',
      metaStatus: 'Active / Cloud API v21.0',
      qualityRating: 'GREEN'
    },
    conversations
  });
});

export default router;
