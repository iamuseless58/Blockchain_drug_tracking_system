import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { formatShortHash } from '../blockchain/crypto';
import {
  Search,
  Truck,
  CheckCircle2,
  Building,
  Calendar,
  Thermometer,
  ShieldCheck,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  Clock,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';

interface TrackDrugViewProps {
  initialBatchId?: string;
  onNavigate: (tab: string, batchId?: string) => void;
}

export const TrackDrugView: React.FC<TrackDrugViewProps> = ({
  initialBatchId,
  onNavigate,
}) => {
  const { batches, events, selectedBatchId, setSelectedBatchId, setPassportBatch } =
    useBlockchain();

  const [searchQuery, setSearchQuery] = useState(initialBatchId || selectedBatchId || 'PCM-2026-001');

  useEffect(() => {
    if (initialBatchId) {
      setSearchQuery(initialBatchId);
      setSelectedBatchId(initialBatchId);
    }
  }, [initialBatchId, setSelectedBatchId]);

  // Find batch
  const currentBatch =
    batches.find(
      (b) =>
        b.batchId.toLowerCase() === searchQuery.trim().toLowerCase() ||
        b.productId.toLowerCase() === searchQuery.trim().toLowerCase() ||
        b.drugName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ) || batches[0];

  const batchEvents = events.filter((e) => e.batchId === currentBatch?.batchId);

  const handleSelectBatch = (id: string) => {
    setSearchQuery(id);
    setSelectedBatchId(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Search & Preset Selector */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Track Batch (e.g. PCM-2026-001, INS-2026-008, VAC-2026-021)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>

        {/* Quick batch presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 shrink-0">Presets:</span>
          {batches.slice(0, 4).map((b) => (
            <button
              key={b.batchId}
              onClick={() => handleSelectBatch(b.batchId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shrink-0 transition-colors cursor-pointer ${
                currentBatch?.batchId === b.batchId
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {b.batchId}
            </button>
          ))}
        </div>
      </div>

      {currentBatch && (
        <>
          {/* Main Drug Overview Card */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 rounded-2xl shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    BATCH #{currentBatch.batchId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Product ID: {currentBatch.productId}
                  </span>
                  {currentBatch.isRecalled && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      RECALLED
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentBatch.drugName}
                </h2>
                <p className="text-sm text-slate-400 font-mono">
                  {currentBatch.genericName} • {currentBatch.strength} • {currentBatch.dosageForm}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setPassportBatch(currentBatch)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-teal-400" />
                  <span>Digital Passport</span>
                </button>

                <button
                  onClick={() => onNavigate('events', currentBatch.batchId)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Supply Chain Event</span>
                </button>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs font-mono">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Manufacturer</span>
                <span className="font-semibold text-white truncate block">{currentBatch.manufacturer}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Current Custody</span>
                <span className="font-semibold text-teal-300 truncate block">{currentBatch.currentOwner}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Current Location</span>
                <span className="font-semibold text-white truncate block">{currentBatch.currentLocation}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Storage Condition</span>
                <span className="font-semibold text-cyan-300 truncate block">
                  {currentBatch.storageCondition.minTemp}°C to {currentBatch.storageCondition.maxTemp}°C
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Logistics Map */}
          <InteractiveRouteMap batch={currentBatch} events={events} />

          {/* Detailed Journey Blockchain Timeline */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
                  Cryptographic Provenance
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Complete Supply Chain Journey & Blockchain Signatures
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {batchEvents.length} verified lifecycle transactions committed with SHA-256 hash linking
                </p>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {batchEvents.map((evt, idx) => {
                const isAlert = evt.eventType === 'COLD_CHAIN_ALERT';
                const isRecall = evt.eventType === 'RECALLED';

                return (
                  <div key={evt.eventId} className="relative group">
                    {/* Step Icon Marker */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs font-mono border-2 shadow-lg ${
                        isRecall
                          ? 'bg-red-500 text-slate-950 border-red-300 ring-2 ring-red-500/30'
                          : isAlert
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/30'
                          : 'bg-teal-500 text-slate-950 border-teal-300 ring-2 ring-teal-500/30'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Step Content Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        isRecall
                          ? 'bg-red-950/20 border-red-500/40 text-red-200'
                          : isAlert
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                              isRecall
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : isAlert
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            }`}
                          >
                            {evt.eventType.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Stage: <strong className="text-slate-200">{evt.stage}</strong>
                          </span>
                        </div>

                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {evt.formattedTime}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 font-medium mb-4">
                        {evt.notes}
                      </p>

                      {/* Transition Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">From Organization:</span>
                          <span className="font-semibold text-slate-200 truncate block">{evt.fromEntity}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">To Organization:</span>
                          <span className="font-semibold text-teal-300 truncate block">{evt.toEntity}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Authorized Handler:</span>
                          <span className="font-semibold text-slate-200 truncate block">{evt.handler}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">GPS / Facility:</span>
                          <span className="font-semibold text-slate-200 truncate block">{evt.location}</span>
                        </div>
                      </div>

                      {/* Blockchain Proof Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Cpu className="w-3.5 h-3.5" /> Block #{evt.blockIndex}
                          </span>
                          <span className="text-slate-400">
                            Hash: <span className="text-slate-200 font-semibold">{formatShortHash(evt.txHash, 10, 8)}</span>
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Verification: OK
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
