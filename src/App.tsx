import React, { useState } from 'react';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { DigitalDrugPassportModal } from './components/DigitalDrugPassportModal';
import { PharmaAIChatModal } from './components/PharmaAIChatModal';

// Views
import { DashboardView } from './views/DashboardView';
import { DrugBatchesView } from './views/DrugBatchesView';
import { TrackDrugView } from './views/TrackDrugView';
import { RegisterBatchView } from './views/RegisterBatchView';
import { SupplyChainEventsView } from './views/SupplyChainEventsView';
import { VerifyMedicineView } from './views/VerifyMedicineView';
import { ColdChainView } from './views/ColdChainView';
import { RecallCenterView } from './views/RecallCenterView';
import { BlockchainExplorerView } from './views/BlockchainExplorerView';
import { SecurityLabView } from './views/SecurityLabView';
import { AnalyticsView } from './views/AnalyticsView';

import {
  LayoutDashboard,
  Layers,
  Truck,
  PlusCircle,
  FileCheck2,
  ShieldCheck,
  Thermometer,
  AlertTriangle,
  Cpu,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';

function DrugChainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeBatchIdParam, setActiveBatchIdParam] = useState<string | undefined>(undefined);

  const { passportBatch, setPassportBatch, events, isLoading } = useBlockchain();

  const handleNavigate = (tab: string, batchId?: string) => {
    setActiveTab(tab);
    if (batchId) {
      setActiveBatchIdParam(batchId);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Drug Batches', icon: Layers },
    { id: 'track', label: 'Track Drug', icon: Truck },
    { id: 'register', label: 'Register Batch', icon: PlusCircle },
    { id: 'events', label: 'Supply Chain', icon: FileCheck2 },
    { id: 'verify', label: 'Verify Medicine', icon: ShieldCheck },
    { id: 'coldchain', label: 'Cold Chain', icon: Thermometer },
    { id: 'recalls', label: 'Recall Center', icon: AlertTriangle },
    { id: 'explorer', label: 'Blockchain Explorer', icon: Cpu },
    { id: 'security', label: 'Security Lab', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-mono">
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl animate-pulse">
          <ShieldCheck className="w-12 h-12 text-teal-400 animate-spin" />
        </div>
        <h2 className="text-lg font-bold mt-4 tracking-wide">
          Synchronizing DrugChain Ledger...
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Validating SHA-256 block hash links and pharmaceutical records
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Main Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />

      {/* Navigation Subheader Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
        {activeTab === 'batches' && <DrugBatchesView onNavigate={handleNavigate} />}
        {activeTab === 'track' && (
          <TrackDrugView initialBatchId={activeBatchIdParam} onNavigate={handleNavigate} />
        )}
        {activeTab === 'register' && <RegisterBatchView onNavigate={handleNavigate} />}
        {activeTab === 'events' && (
          <SupplyChainEventsView initialBatchId={activeBatchIdParam} onNavigate={handleNavigate} />
        )}
        {activeTab === 'verify' && (
          <VerifyMedicineView initialQuery={activeBatchIdParam} onNavigate={handleNavigate} />
        )}
        {activeTab === 'coldchain' && <ColdChainView onNavigate={handleNavigate} />}
        {activeTab === 'recalls' && <RecallCenterView onNavigate={handleNavigate} />}
        {activeTab === 'explorer' && <BlockchainExplorerView onNavigate={handleNavigate} />}
        {activeTab === 'security' && <SecurityLabView onNavigate={handleNavigate} />}
        {activeTab === 'analytics' && <AnalyticsView onNavigate={handleNavigate} />}
      </main>

      {/* Digital Drug Passport Modal */}
      <DigitalDrugPassportModal
        batch={passportBatch}
        events={events}
        onClose={() => setPassportBatch(null)}
      />

      {/* Gemini Pharma AI Assistant */}
      <PharmaAIChatModal />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">DRUGCHAIN</span>
            <span>•</span>
            <span>Pharmaceutical Supply Chain Monitoring &amp; Cryptographic Verification</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>SHA-256 Web Crypto Engine</span>
            <span>•</span>
            <span className="text-teal-400">FDA DSCSA &amp; EMA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <DrugChainApp />
    </BlockchainProvider>
  );
}
