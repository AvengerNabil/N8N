import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// List approvals
router.get('/', (req, res) => {
  const { status } = req.query;
  let items = localStore.approvals;
  if (status) {
    items = items.filter(a => a.status === status);
  }
  res.json({ approvals: items });
});

// Approve response
router.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  const item = localStore.approvals.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Approval item not found' });
  }

  item.status = 'approved';
  item.delivery_status = 'sent';
  item.action_taken_at = new Date().toISOString();

  // Add to execution logs
  localStore.executionLogs.unshift({
    id: 'l_' + Date.now(),
    workflow_name: item.channel === 'gmail' ? 'Gmail Reply Sender' : 'WhatsApp AI Reply Generator',
    channel: item.channel,
    stage: 'delivery',
    status: 'success',
    input_summary: `Manual approval granted by user for ${item.sender_identifier}`,
    output_summary: `Dispatched message via ${item.channel.toUpperCase()}`,
    duration_ms: 120,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, item });
});

// Reject response
router.post('/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const item = localStore.approvals.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Approval item not found' });
  }

  item.status = 'rejected';
  item.rejection_reason = reason || 'Rejected by user';
  item.action_taken_at = new Date().toISOString();

  localStore.executionLogs.unshift({
    id: 'l_' + Date.now(),
    workflow_name: 'Approval Notification Handler',
    channel: item.channel,
    stage: 'approval',
    status: 'warning',
    input_summary: `Proposed response rejected: ${item.rejection_reason}`,
    output_summary: 'Message was not sent.',
    duration_ms: 45,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, item });
});

// Edit & approve response
router.post('/:id/edit', (req, res) => {
  const { id } = req.params;
  const { editedReply } = req.body;
  const item = localStore.approvals.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Approval item not found' });
  }

  item.status = 'edited_and_approved';
  item.final_reply = editedReply;
  item.delivery_status = 'sent';
  item.action_taken_at = new Date().toISOString();

  res.json({ success: true, item });
});

// Regenerate AI reply
router.post('/:id/regenerate', (req, res) => {
  const { id } = req.params;
  const { instructions } = req.body;
  const item = localStore.approvals.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Approval item not found' });
  }

  // Generate an alternative response
  let alternative = '';
  if (item.channel === 'gmail') {
    alternative = `Dear Professor Tariq,\n\nFollowing up on Chapter 4: I have clarified the trade-offs between distributed latency and validation overhead in Section 4.2. I will send the revised file directly to your inbox before Thursday 3:00 PM.\n\nBest regards,\nNabil Rahaman`;
  } else {
    alternative = `Hae Tanvir! 4 tay meet kora jabe problem nai. Kisu changes anchi slide e, dekhe felbo ekshathe.`;
  }

  item.proposed_reply = alternative;
  item.status = 'pending';

  res.json({ success: true, item });
});

export default router;
