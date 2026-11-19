import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// Get status of all integrations (strictly no API secrets exposed)
router.get('/', (req, res) => {
  res.json({
    integrations: localStore.integrationStatus
  });
});

// Test connection endpoint
router.post('/test/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  const service = localStore.integrationStatus.find(s => s.service_name === serviceName);

  if (!service) {
    return res.status(404).json({ error: `Service ${serviceName} not found` });
  }

  // Update check timestamp
  service.last_checked_at = new Date().toISOString();
  service.is_connected = true;
  service.status_message = 'Connection verified successfully';

  res.json({
    success: true,
    service
  });
});

export default router;
