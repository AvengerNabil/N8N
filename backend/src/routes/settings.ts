import { Router } from 'express';
import { localStore } from '../db';

const router = Router();

// Get current automation settings
router.get('/', (req, res) => {
  res.json({
    settings: localStore.settings,
    whitelistedContacts: localStore.contacts.filter(c => c.is_whitelisted),
    blacklistedContacts: localStore.contacts.filter(c => c.is_blacklisted)
  });
});

// Update automation settings
router.put('/', (req, res) => {
  const updates = req.body;
  localStore.settings = {
    ...localStore.settings,
    ...updates
  };

  res.json({
    success: true,
    settings: localStore.settings
  });
});

export default router;
