import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// Get execution logs
router.get('/', (req, res) => {
  const { channel, status, limit } = req.query;
  let logs = localStore.executionLogs;

  if (channel && typeof channel === 'string' && channel !== 'all') {
    logs = logs.filter(l => l.channel === channel);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    logs = logs.filter(l => l.status === status);
  }

  const max = limit ? parseInt(limit as string, 10) : 50;
  res.json({ logs: logs.slice(0, max) });
});

export default router;
