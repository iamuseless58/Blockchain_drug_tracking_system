import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Layers,
  Cpu,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Activity,
  PlusCircle,
  Search,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface DashboardViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    batches,
    chain,
    events,
    telemetry,
    activeRole,
    chainIntegrity,
    verifyChain,
    setPassportBatch,
  } = useBlockchain();

  const isChainValid = chainIntegrity ? chainIntegrity.isValid : true;

  // Compute metrics
  const totalBatches = batches.length;
  const totalBlocks = chain.length;
  const activeShipments = batches.filter((b) => b.status === 'IN_TRANSIT').length;
  const deliveredBatches = batches.filter((b) => b.status === 'DELIVERED' || b.status === 'DISPENSED').length;
  const verifiedMedicines = batches.filter((b) => b.qualityPassed && !b.isRecalled).length;
  const suspiciousBatches = isChainValid ? (batches.some(b => b.isRecalled) ? 1 : 0) : batches.length;
  const expiredBatches = batches.filter((b) => new Date(b.expiryDate).getTime() < Date.now()).length;
  const recallAlerts = batches.filter((b) => b.isRecalled).length;

  const roleActions: Record<string, { title: string; subtitle: string; actions: { label: string; tab: string }[] }> = {
    MANUFACTURER: {
      title: 'Pharmaceutical Formulation & Manufacturing Console',
      subtitle: 'Formulate new drug batches, issue batch certificates, and commit origin blocks.',
      actions: [
        { label: '+ Register New Batch', tab: 'register' },
        { label: 'Quality Control Releases', tab: 'batches' },
        { label: 'Dispatch Shipment', tab: 'events' },
      ],
    },
    DISTRIBUTOR: {
      title: 'Pharma Logistics & Cold-Chain Custody',
      subtitle: 'Monitor continuous refrigerated transit and verify transfer manifest.',
      actions: [
        { label: 'Cold-Chain IoT Telemetry', tab: 'coldchain' },
        { label: 'Accept Inbound Shipment', tab: 'events' },
        { label: 'Live Cargo Tracking', tab: 'track' },
      ],
    },
    WHOLESALER: {
      title: 'Wholesale Depot & Inventory Custody',
      subtitle: 'Receive bulk pallets, verify tamper seals on-chain, and distribute to hospitals.',
      actions: [
        { label: 'Verify Inbound Shipment', tab: 'verify' },
        { label: 'Transfer to Pharmacy', tab: 'events' },
        { label: 'Inventory Auditing', tab: 'batches' },
      ],
    },
    PHARMACY: {
      title: 'Hospital & Retail Pharmacy Dispensary',
      subtitle: 'Perform bedside & counter verification before dispensing medication to patients.',
      actions: [
        { label: 'Verify Medicine Authenticity', tab: 'verify' },
        { label: 'Dispense to Patient', tab: 'events' },
        { label: 'Check Safety Recalls', tab: 'recalls' },
      ],
    },
    REGULATOR: {
      title: 'FDA / EMA Regulatory Supervision Directorate',
      subtitle: 'Audit blockchain integrity, simulate tampering, and enforce emergency recalls.',
      actions: [
        { label: 'Security & Tamper Lab', tab: 'security' },
        { label: 'Issue Regulatory Recall', tab: 'recalls' },
        { label: 'Inspect Ledger Blocks', tab: 'explorer' },
      ],
    },
    PATIENT: {
      title: 'Patient Medication Safety & Origin Portal',
      subtitle: 'Scan your medicine package to view manufacturer authenticity and batch history.',
      actions: [
        { label: 'Verify My Medicine', tab: 'verify' },
        { label: 'Track Medicine Journey', tab: 'track' },
      ],
    },
  };

  const currentRoleInfo = roleActions[activeRole] || roleActions.MANUFACTURER;

  // Status breakdown
  const statusCounts = {
    ACTIVE: batches.filter((b) => b.status === 'ACTIVE').length,
    IN_TRANSIT: batches.filter((b) => b.status === 'IN_TRANSIT').length,
    STORED: batches.filter((b) => b.status === 'STORED').length,
    DELIVERED: batches.filter((b) => b.status === 'DELIVERED' || b.status === 'DISPENSED').length,
    RECALLED: batches.filter((b) => b.status === 'RECALLED').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Role Greeting & Quick Switcher */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-teal-500/20 rounded-2xl p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                ACTIVE ROLE: {activeRole}
              </span>
              {!isChainValid && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> SECURITY LAB ALERT: TAMPERING DETECTED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentRoleInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentRoleInfo.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {currentRoleInfo.actions.map((act, i) => (
              <button
                key={i}
                onClick={() => onNavigate(act.tab)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all cursor-pointer font-mono"
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Drug Batches */}
        <div
          onClick={() => onNavigate('batches')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Batches</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalBatches}</div>
          <div className="flex items-center gap-1 text-[11px] text-teal-400 font-mono mt-2">
            <span>Registered on DrugChain</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Blockchain Blocks */}
        <div
          onClick={() => onNavigate('explorer')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Mined Blocks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalBlocks}</div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono mt-2">
            <span>SHA-256 Verified Ledger</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Active Shipments */}
        <div
          onClick={() => onNavigate('track')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Active In-Transit</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{activeShipments}</div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono mt-2">
            <span>Logistics Route Live</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Delivered Batches */}
        <div
          onClick={() => onNavigate('batches')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Delivered / Dispensed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{deliveredBatches}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-2">
            <span>Verified at Destination</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 5: Verified Medicines */}
        <div
          onClick={() => onNavigate('verify')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Verified Medicines</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{verifiedMedicines}</div>
          <div className="flex items-center gap-1 text-[11px] text-teal-400 font-mono mt-2">
            <span>100% Genuine Certificates</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 6: Suspicious / Tampered */}
        <div
          onClick={() => onNavigate('security')}
          className={`p-5 rounded-2xl shadow-lg transition-all group cursor-pointer border ${
            !isChainValid || suspiciousBatches > 0
              ? 'bg-red-950/40 border-red-500/40 hover:border-red-500'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Suspicious / Tampered</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold font-mono ${!isChainValid ? 'text-red-400' : 'text-white'}`}>
            {!isChainValid ? 'ALERT' : suspiciousBatches}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-red-400 font-mono mt-2">
            <span>{!isChainValid ? 'Hash Mismatch Detected' : 'Security lab active'}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 7: Expired Batches */}
        <div
          onClick={() => onNavigate('batches')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Expired Batches</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{expiredBatches}</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono mt-2">
            <span>Automated shelf-life check</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 8: Active Recall Alerts */}
        <div
          onClick={() => onNavigate('recalls')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-red-500/40 rounded-2xl shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Recall Alerts</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">{recallAlerts}</div>
          <div className="flex items-center gap-1 text-[11px] text-red-400 font-mono mt-2">
            <span>Emergency Quarantined</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Middle Row: Visual Charts & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Batch Distribution Chart */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-teal-400">Inventory Status</span>
                <h3 className="text-base font-bold text-white">Batch Distribution</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                {batches.length} total
              </span>
            </div>

            {/* Visual SVG Progress Breakdown */}
            <div className="space-y-3.5 my-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> Active Production
                  </span>
                  <span>{statusCounts.ACTIVE} ({Math.round((statusCounts.ACTIVE / (batches.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full"
                    style={{ width: `${(statusCounts.ACTIVE / (batches.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> In Transit
                  </span>
                  <span>{statusCounts.IN_TRANSIT} ({Math.round((statusCounts.IN_TRANSIT / (batches.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${(statusCounts.IN_TRANSIT / (batches.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Depot Stored
                  </span>
                  <span>{statusCounts.STORED} ({Math.round((statusCounts.STORED / (batches.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${(statusCounts.STORED / (batches.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Delivered / Dispensed
                  </span>
                  <span>{statusCounts.DELIVERED} ({Math.round((statusCounts.DELIVERED / (batches.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(statusCounts.DELIVERED / (batches.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Recalled
                  </span>
                  <span>{statusCounts.RECALLED} ({Math.round((statusCounts.RECALLED / (batches.length || 1)) * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${(statusCounts.RECALLED / (batches.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('batches')}
            className="w-full mt-4 py-2 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl transition-colors text-center"
          >
            Manage All Batches →
          </button>
        </div>

        {/* Chart 2: Cold Chain Live Gauge */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400">IoT Telemetry</span>
                <h3 className="text-base font-bold text-white">Cold-Chain Monitor</h3>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Live Sensor
              </span>
            </div>

            <div className="my-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Active Cold Batch:</span>
                <span className="text-sm font-bold text-white">Insulin Glargine (INS-2026-008)</span>
                <span className="text-xs font-mono text-teal-400 block mt-0.5">Target: 2°C – 8°C</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-400 flex items-center gap-1 justify-end">
                  <Thermometer className="w-5 h-5" /> 4.3°C
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  NORMAL / SAFE
                </span>
              </div>
            </div>

            {/* Vaccine sensor */}
            <div className="p-4 bg-slate-950/60 border border-red-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Critical Batch:</span>
                <span className="text-sm font-bold text-white">mRNA Vaccine (VAC-2026-021)</span>
                <span className="text-xs font-mono text-cyan-400 block mt-0.5">Target: -20°C to -10°C</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-red-400 flex items-center gap-1 justify-end">
                  <Thermometer className="w-5 h-5" /> -4.8°C
                </span>
                <span className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40">
                  ⚠ BREACH DETECTED
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('coldchain')}
            className="w-full mt-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors text-center"
          >
            Open Cold-Chain Center →
          </button>
        </div>

        {/* Live-Looking Activity Feed */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-teal-400">Immutable Ledger</span>
                <h3 className="text-base font-bold text-white">Live Activity Feed</h3>
              </div>
              <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {events.slice(-5).reverse().map((evt) => {
                const isBreach = evt.eventType === 'COLD_CHAIN_ALERT';
                const isRecall = evt.eventType === 'RECALLED';

                return (
                  <div
                    key={evt.eventId}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isRecall
                        ? 'bg-red-950/30 border-red-500/40 text-red-200'
                        : isBreach
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white font-mono text-[11px] truncate">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {evt.formattedTime.split(',')[1] || evt.formattedTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-1">{evt.notes}</p>

                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Batch: <strong className="text-teal-400">{evt.batchId}</strong></span>
                      <span className="text-cyan-400">Block #{evt.blockIndex}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-center"
          >
            Inspect Blockchain Ledger →
          </button>
        </div>
      </div>

      {/* Featured Demonstration Flow Stepper */}
      <div className="p-6 bg-slate-900 border border-teal-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
              Guided Demonstration Flow
            </span>
            <h3 className="text-lg font-bold text-white">
              End-to-End Pharma Blockchain Audit Scenario
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Execute each real-world regulatory milestone: register a batch, track custody, monitor cold-chain, test authenticity, simulate tamper detection, and audit the immutable ledger.
            </p>
          </div>
          <button
            onClick={() => verifyChain()}
            className="px-4 py-2 text-xs font-bold font-mono text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-lg shadow-teal-500/20 transition-all shrink-0 cursor-pointer"
          >
            Verify Full Ledger (SHA-256)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('register')}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 rounded-xl transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-110 transition-transform">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Register Drug Batch</h4>
            <p className="text-xs text-slate-400 mt-1">
              Create a batch, calculate SHA-256, and mint origin block.
            </p>
          </div>

          <div
            onClick={() => onNavigate('track', 'PCM-2026-001')}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-110 transition-transform">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Track Supply Chain</h4>
            <p className="text-xs text-slate-400 mt-1">
              Follow Paracetamol through logistics hubs to patient.
            </p>
          </div>

          <div
            onClick={() => onNavigate('security')}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-red-500/50 rounded-xl transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-110 transition-transform">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Tamper Detection Lab</h4>
            <p className="text-xs text-slate-400 mt-1">
              Simulate block tampering and observe broken SHA-256 hash chains.
            </p>
          </div>

          <div
            onClick={() => onNavigate('verify', 'PCM-2026-001')}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-110 transition-transform">
              4
            </div>
            <h4 className="text-sm font-bold text-white">Verify Authenticity</h4>
            <p className="text-xs text-slate-400 mt-1">
              8-point regulatory check with digital passport inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
