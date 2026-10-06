import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  TrendingUp,
  Layers,
  Cpu,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Thermometer,
  Activity,
  Building,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const { batches, chain, events, telemetry } = useBlockchain();

  const totalBatches = batches.length;
  const verifiedBatches = batches.filter((b) => b.qualityPassed && !b.isRecalled).length;
  const recalledBatches = batches.filter((b) => b.isRecalled).length;
  const expiredBatches = batches.filter((b) => new Date(b.expiryDate).getTime() < Date.now()).length;
  const totalTransfers = events.length;
  const tempBreaches = events.filter((e) => e.eventType === 'COLD_CHAIN_ALERT').length;

  // Location distributions
  const locationCounts: Record<string, number> = {};
  batches.forEach((b) => {
    const loc = b.currentLocation.split(',')[0].trim();
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
          Platform Intelligence & Compliance Analytics
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Supply Chain & Blockchain Analytics
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time metrics on pharmaceutical movement, thermal excursions, and ledger throughput
        </p>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Batches</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{totalBatches}</div>
          <span className="text-[11px] font-mono text-teal-400">100% on-chain</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 uppercase">Verification Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {Math.round((verifiedBatches / (totalBatches || 1)) * 100)}%
          </div>
          <span className="text-[11px] font-mono text-emerald-400">{verifiedBatches} verified authentic</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Custody Events</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{totalTransfers}</div>
          <span className="text-[11px] font-mono text-cyan-400">Immutable transactions</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 uppercase">Cold Excursions</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{tempBreaches}</div>
          <span className="text-[11px] font-mono text-amber-400">Triggered alerts</span>
        </div>
      </div>

      {/* Analytics Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Geographic Distribution Breakdown */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-teal-400">Geographic Logistics</span>
              <h3 className="text-base font-bold text-white">Active Inventory by Regional Hub</h3>
            </div>
            <MapPin className="w-4 h-4 text-teal-400" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(locationCounts).map(([loc, count], idx) => {
              const pct = Math.round((count / (totalBatches || 1)) * 100);
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>{loc}</span>
                    <span className="text-teal-300 font-semibold">{count} batches ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cold-Chain Health Breakdown */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400">Thermal Compliance</span>
              <h3 className="text-base font-bold text-white">Cold-Chain Excursion Statistics</h3>
            </div>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 my-2 text-xs font-mono">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Average Ambient Temp:</span>
              <span className="text-2xl font-bold text-white font-mono">19.4°C</span>
              <span className="text-[10px] text-teal-400 block mt-1">Normal ambient range</span>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Cold-Chain Accuracy:</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">98.2%</span>
              <span className="text-[10px] text-emerald-400 block mt-1">Compliant reading ratio</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Avg Biologic Transit Time:</span>
              <strong className="text-white">18.4 hours</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sensor Battery Average:</span>
              <strong className="text-emerald-400">93.5%</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Automated On-Chain Alert Latency:</span>
              <strong className="text-cyan-400">&lt; 1.2 seconds</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
