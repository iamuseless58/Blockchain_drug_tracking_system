import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { EventType } from '../blockchain/types';
import {
  Layers,
  Cpu,
  PlusCircle,
  Truck,
  CheckCircle2,
  Calendar,
  Building,
  User,
  MapPin,
  Clock,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface SupplyChainEventsViewProps {
  initialBatchId?: string;
  onNavigate: (tab: string, batchId?: string) => void;
}

export const SupplyChainEventsView: React.FC<SupplyChainEventsViewProps> = ({
  initialBatchId,
  onNavigate,
}) => {
  const { batches, events, addSupplyChainEvent } = useBlockchain();

  const [selectedBatchId, setSelectedBatchId] = useState(
    initialBatchId || batches[0]?.batchId || 'PCM-2026-001'
  );
  const [eventType, setEventType] = useState<EventType>('TRANSFERRED');
  const [fromEntity, setFromEntity] = useState('Central Logistics Hub');
  const [toEntity, setToEntity] = useState('Regional Medical Depot');
  const [handler, setHandler] = useState('Logistics Officer S. Kumar (GDP-Certified)');
  const [location, setLocation] = useState('Hubballi Cold-Storage Transit Depot');
  const [quantity, setQuantity] = useState<number>(5000);
  const [notes, setNotes] = useState('Batch verified at transit checkpoint. Integrity seal unbroken.');
  const [temperature, setTemperature] = useState<number>(4.5);
  const [humidity, setHumidity] = useState<number>(52);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    setIsSubmitting(true);
    try {
      await addSupplyChainEvent({
        batchId: selectedBatchId,
        eventType,
        fromEntity,
        toEntity,
        handler,
        location,
        quantity: Number(quantity),
        notes,
        telemetry: {
          temperature: Number(temperature),
          humidity: Number(humidity),
          status: 'NORMAL',
        },
      });

      setNotes('');
    } catch (err: any) {
      console.error('Failed to add event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
            Supply Chain Event Engine
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Add Supply Chain Custody Event
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Append verified custody transitions to the immutable blockchain ledger
          </p>
        </div>
      </div>

      {/* 2-column layout: Left Form, Right Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Event Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Record Blockchain Transition
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Batch selector */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Select Pharmaceutical Batch *
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = batches.find((x) => x.batchId === e.target.value);
                  if (b) {
                    setFromEntity(b.currentOwner);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} – {b.drugName} ({b.status})
                  </option>
                ))}
              </select>
              {selectedBatch && (
                <div className="mt-1 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Current Custody: <strong className="text-teal-300">{selectedBatch.currentOwner}</strong></span>
                  <span>Rem. Qty: <strong className="text-white">{selectedBatch.remainingQuantity.toLocaleString()}</strong></span>
                </div>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Supply Chain Event Type *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono cursor-pointer"
              >
                <option value="QUALITY_CHECKED">Quality Checked (QC Lab Testing)</option>
                <option value="PACKED">Packed & Sealed (Tamper-Evident Packaging)</option>
                <option value="SHIPPED">Shipped (Dispatch via Logistics)</option>
                <option value="RECEIVED">Received (Inbound Depot Verification)</option>
                <option value="STORED">Stored (Warehouse / Cold Depot)</option>
                <option value="DISTRIBUTED">Distributed (Regional Allocation)</option>
                <option value="TRANSFERRED">Transferred (Custody Handover)</option>
                <option value="DELIVERED">Delivered (Hospital / Retail Pharmacy)</option>
                <option value="DISPENSED">Dispensed (End Patient Prescription)</option>
                <option value="RECALLED">Recalled (Regulatory Safety Freeze)</option>
              </select>
            </div>

            {/* From & To Entities */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  From Entity
                </label>
                <input
                  type="text"
                  required
                  value={fromEntity}
                  onChange={(e) => setFromEntity(e.target.value)}
                  placeholder="Transferring party"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  To Entity
                </label>
                <input
                  type="text"
                  required
                  value={toEntity}
                  onChange={(e) => setToEntity(e.target.value)}
                  placeholder="Receiving party"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Handler & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Authorized Handler
                </label>
                <input
                  type="text"
                  required
                  value={handler}
                  onChange={(e) => setHandler(e.target.value)}
                  placeholder="Name and title"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Location / Facility
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Depot, Zone"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Units Transferred / Processed
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            {/* Telemetry inputs */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Temp Reading (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Inspection & Custody Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of inspection, tamper seal condition, carrier license..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              <Cpu className="w-4 h-4" />
              <span>Record Event on Blockchain (SHA-256)</span>
            </button>
          </form>
        </div>

        {/* Right: Comprehensive Events Log */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-teal-400">Ledger Stream</span>
              <h3 className="text-sm font-bold text-white font-mono">
                Recent Supply Chain Custody Transactions ({events.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Filtered for all active drugs
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {events.slice().reverse().map((evt) => (
              <div
                key={evt.eventId}
                className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 font-bold font-mono text-[10px] rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {evt.eventType}
                    </span>
                    <span className="font-bold font-mono text-white">
                      Batch: {evt.batchId}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {evt.formattedTime}
                  </span>
                </div>

                <p className="text-slate-300 font-sans text-xs">
                  {evt.notes}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    From: <span className="text-slate-200">{evt.fromEntity}</span>
                  </div>
                  <div>
                    To: <span className="text-teal-300">{evt.toEntity}</span>
                  </div>
                  <div>
                    Handler: <span className="text-slate-200">{evt.handler}</span>
                  </div>
                  <div>
                    Location: <span className="text-slate-200">{evt.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Block #{evt.blockIndex}
                  </span>
                  <span className="text-slate-400">
                    Tx Hash: <span className="text-slate-200">{formatShortHash(evt.txHash, 10, 8)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
