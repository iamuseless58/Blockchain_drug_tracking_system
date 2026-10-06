import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Cpu,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface ColdChainViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const ColdChainView: React.FC<ColdChainViewProps> = ({ onNavigate }) => {
  const { batches, telemetry, recordColdChainBreach, events } = useBlockchain();

  const [selectedBatchId, setSelectedBatchId] = useState('INS-2026-008');
  const [breachTemp, setBreachTemp] = useState<number>(14.5);
  const [isSimulating, setIsSimulating] = useState(false);

  const coldBatches = batches.filter(
    (b) => b.storageRequirement === 'REFRIGERATED' || b.storageRequirement === 'FROZEN'
  );

  const activeBatch = batches.find((b) => b.batchId === selectedBatchId) || coldBatches[0];

  const batchTelemetry = telemetry.filter((t) => t.batchId === activeBatch?.batchId);
  const coldChainEvents = events.filter((e) => e.eventType === 'COLD_CHAIN_ALERT');

  const handleSimulateBreach = async () => {
    if (!activeBatch) return;
    setIsSimulating(true);
    try {
      await recordColdChainBreach(
        activeBatch.batchId,
        Number(breachTemp),
        68,
        activeBatch.currentLocation
      );
    } catch (err: any) {
      console.error('Breach simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-widest">
            IoT Sensor Telemetry Network
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Pharmaceutical Cold-Chain Monitoring
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time thermal monitoring for biologics, insulins, and vaccines with automated blockchain breach logging
          </p>
        </div>

        {/* Batch selector for cold products */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Cold Lot:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {coldBatches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchId} – {b.drugName} ({b.storageRequirement})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Active IoT Telemetry Console */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Sensor Gauge Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase">
                    Active Telemetry Hub
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {activeBatch.drugName} ({activeBatch.batchId})
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Location: <strong className="text-slate-200">{activeBatch.currentLocation}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Sensor SENS-COLDLINK-018
                  </span>
                </div>
              </div>

              {/* Big Sensor Gauge Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Temperature */}
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Core Temperature</span>
                  <div className="my-2">
                    <span className="text-4xl font-black font-mono text-cyan-300 flex items-center justify-center gap-1">
                      <Thermometer className="w-8 h-8 text-cyan-400" />
                      4.2°C
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 inline-block">
                    SAFE ({activeBatch.storageCondition.minTemp}°C to {activeBatch.storageCondition.maxTemp}°C)
                  </span>
                </div>

                {/* Humidity */}
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Ambient Humidity</span>
                  <div className="my-2">
                    <span className="text-4xl font-black font-mono text-slate-100">
                      52%
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Range: {activeBatch.storageCondition.humidityRange}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Audit Status</span>
                  <div className="my-2">
                    <span className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-6 h-6" /> SAFE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-teal-300">
                    Compliant with GDP Guidelines
                  </span>
                </div>
              </div>

              {/* Simulated Excursion Breach Trigger */}
              <div className="p-5 bg-red-950/20 border border-red-500/40 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Simulate Cold Chain Breach Scenario
                    </h4>
                    <p className="text-xs text-slate-300">
                      Simulate an auxiliary cooler compressor failure. Raises temperature and commits a cryptographic <code className="text-red-300 font-mono">COLD_CHAIN_ALERT</code> block to the blockchain ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span>Simulated Spike:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={breachTemp}
                      onChange={(e) => setBreachTemp(Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-red-500/40 focus:border-red-400 rounded-lg px-2.5 py-1.5 text-red-300 font-mono text-xs focus:outline-none"
                    />
                    <span>°C</span>
                  </div>

                  <button
                    onClick={handleSimulateBreach}
                    disabled={isSimulating}
                    className="flex-1 py-2 text-xs font-bold font-mono bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Logging Breach to Chain...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Trigger Simulated Breach</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Historical Telemetry Stream */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white font-mono flex items-center justify-between">
                <span>Telemetry Telemetry Readings for {activeBatch.batchId}</span>
                <span className="text-xs text-slate-400 font-normal">
                  {batchTelemetry.length} sensor readings recorded
                </span>
              </h4>

              <div className="space-y-2">
                {batchTelemetry.map((t) => (
                  <div
                    key={t.readingId}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      t.status === 'CRITICAL'
                        ? 'bg-red-950/30 border-red-500/40 text-red-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-cyan-400">{t.readingId}</span>
                      <span>
                        Temp: <strong className={t.status === 'CRITICAL' ? 'text-red-400' : 'text-white'}>{t.temperature}°C</strong>
                      </span>
                      <span className="hidden sm:inline text-slate-400">Humidity: {t.humidity}%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">{t.formattedTime}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Blockchain Excursion Blocks & Alert Ledger */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-mono uppercase text-red-400 font-bold">
                  On-Chain Incident Stream
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                  Blockchain Cold-Chain Excursions ({coldChainEvents.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Whenever a breach occurs, a tamper-proof block is added to alert downstream pharmacies.
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {coldChainEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                        ⚠ COLD CHAIN BREACH
                      </span>
                      <span className="text-slate-400">{evt.formattedTime}</span>
                    </div>

                    <p className="text-slate-200 font-sans text-xs">
                      {evt.notes}
                    </p>

                    <div className="p-2.5 bg-slate-950/70 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Lot ID:</span>
                        <strong className="text-teal-300">{evt.batchId}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Block Index:</span>
                        <span className="text-cyan-400 font-bold">Block #{evt.blockIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tx Hash:</span>
                        <span className="text-slate-400">{formatShortHash(evt.txHash, 8, 6)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('explorer')}
              className="w-full mt-4 py-2 text-xs font-mono font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-center cursor-pointer"
            >
              Verify Incident Blocks in Explorer →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
