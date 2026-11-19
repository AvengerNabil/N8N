import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// List contacts and memory summaries
router.get('/', (req, res) => {
  const { query } = req.query;
  let summaries = localStore.memorySummaries;
  let contacts = localStore.contacts;

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    summaries = summaries.filter(s => 
      s.contact_name.toLowerCase().includes(q) || 
      s.summary_text.toLowerCase().includes(q) ||
      s.key_facts.some((k: string) => k.toLowerCase().includes(q))
    );
  }

  res.json({
    summaries,
    contacts,
    totalMemories: summaries.length
  });
});

// Delete memory summary
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = localStore.memorySummaries.findIndex(s => s.id === id);
  if (index !== -1) {
    localStore.memorySummaries.splice(index, 1);
    return res.json({ success: true, message: 'Memory item deleted' });
  }
  res.status(404).json({ error: 'Memory item not found' });
});

// Clear conversation history
router.post('/clear-conversation', (req, res) => {
  const { conversationId } = req.body;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }

  localStore.messages = localStore.messages.filter(m => m.conversation_id !== conversationId);
  res.json({ success: true, message: 'Conversation messages cleared successfully' });
});

export default router;
