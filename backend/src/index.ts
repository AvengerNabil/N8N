import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import statsRoutes from './routes/stats';
import gmailRoutes from './routes/gmail';
import whatsappRoutes from './routes/whatsapp';
import approvalsRoutes from './routes/approvals';
import memoryRoutes from './routes/memory';
import settingsRoutes from './routes/settings';
import logsRoutes from './routes/logs';
import integrationsRoutes from './routes/integrations';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/stats', statsRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/integrations', integrationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NABIL AI ASSISTANT Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`[NABIL AI ASSISTANT Backend] Server running on port ${port}`);
});
