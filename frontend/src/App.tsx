import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { GmailPage } from './pages/GmailPage';
import { WhatsAppPage } from './pages/WhatsAppPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LogsPage } from './pages/LogsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { AutomationMode } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(2);
  const [automationMode, setAutomationMode] = useState<AutomationMode>('manual_approval');
  const [isPaused, setIsPaused] = useState(false);

  const fetchGlobalState = async () => {
    try {
      const stats = await api.getStats();
      setPendingApprovalsCount(stats.kpis.pendingApprovals);
      setAutomationMode(stats.kpis.automationStatus.mode);
      setIsPaused(!stats.kpis.automationStatus.gmailEnabled && !stats.kpis.automationStatus.whatsappEnabled);
    } catch (e) {
      console.warn('Backend offline or initializing:', e);
    }
  };

  useEffect(() => {
    fetchGlobalState();
    const interval = setInterval(fetchGlobalState, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePause = async () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    try {
      await api.updateSettings({
        gmail_automation_enabled: !nextState,
        whatsapp_automation_enabled: !nextState
      });
      fetchGlobalState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-100 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          automationMode={automationMode}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          pendingCount={pendingApprovalsCount}
          onGoToApprovals={() => setCurrentPage('approvals')}
        />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && (
            <OverviewPage
              onGoToApprovals={() => setCurrentPage('approvals')}
              onRefreshApprovals={fetchGlobalState}
            />
          )}
          {currentPage === 'approvals' && (
            <ApprovalPage onRefreshStats={fetchGlobalState} />
          )}
          {currentPage === 'gmail' && <GmailPage />}
          {currentPage === 'whatsapp' && <WhatsAppPage />}
          {currentPage === 'memory' && <MemoryPage />}
          {currentPage === 'settings' && (
            <SettingsPage
              onRefreshGlobalSettings={(mode, paused) => {
                setAutomationMode(mode);
                setIsPaused(paused);
              }}
            />
          )}
          {currentPage === 'logs' && <LogsPage />}
          {currentPage === 'integrations' && <IntegrationsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
