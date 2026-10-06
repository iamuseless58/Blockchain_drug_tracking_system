import React from 'react';
import { DrugBatch, SupplyChainEvent } from '../blockchain/types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { formatShortHash } from '../blockchain/crypto';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Calendar,
  Building,
  CheckCircle2,
  Printer,
  Share2,
  Cpu,
  Layers,
} from 'lucide-react';

interface DigitalDrugPassportModalProps {
  batch: DrugBatch | null;
  events: SupplyChainEvent[];
  onClose: () => void;
}

export const DigitalDrugPassportModal: React.FC<DigitalDrugPassportModalProps> = ({
  batch,
  events,
  onClose,
}) => {
  if (!batch) return null;

  const batchEvents = events.filter((e) => e.batchId === batch.batchId);
  const isExpired = new Date(batch.expiryDate).getTime() < Date.now();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-950/50 text-slate-100 p-6 md:p-8">
        
        {/* Hologram Gradient Ribbon Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-500 rounded-t-2xl"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
          title="Close Passport"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
                  Global Digital Drug Passport
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  FDA DSCSA / EMA COMPLIANT
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                {batch.drugName}
              </h2>
              <p className="text-sm text-slate-400 font-mono">
                {batch.genericName} • {batch.strength} • {batch.dosageForm}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Export
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-6 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-3">
            {batch.isRecalled ? (
              <div className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> BATCH RECALLED
              </div>
            ) : isExpired ? (
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> EXPIRED PRODUCT
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> ✓ BLOCKCHAIN VERIFIED AUTHENTIC
              </div>
            )}

            <div className="text-xs text-slate-400 font-mono">
              Status: <span className="text-slate-200 font-semibold">{batch.status}</span> • Current Custody: <span className="text-teal-300 font-semibold">{batch.currentOwner}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Block #{batch.createdBlockIndex}</span>
          </div>
        </div>

        {/* Middle: 2-column layout with QR & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* QR Code Container */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
            <QRCodeDisplay
              data={batch.qrData}
              size={150}
              label={`BATCH #${batch.batchId}`}
            />
            <div className="mt-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 block">
                Product Code: {batch.productId}
              </span>
              <span className="text-[10px] text-teal-400/80 font-mono block mt-1">
                Cryptographically Sealed
              </span>
            </div>
          </div>

          {/* Core Batch Specifications */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Batch ID</span>
              <span className="font-bold text-white font-mono text-base">{batch.batchId}</span>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Manufacturer</span>
              <span className="font-semibold text-teal-200 flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4 text-teal-400" /> {batch.manufacturer}
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Manufacturing Date</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-slate-400" /> {batch.manufacturingDate}
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Expiry Date</span>
              <span className={`font-semibold flex items-center gap-1.5 mt-0.5 ${isExpired ? 'text-amber-400' : 'text-slate-200'}`}>
                <Calendar className="w-4 h-4 text-slate-400" /> {batch.expiryDate}
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Storage Specification</span>
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                {batch.storageCondition.minTemp}°C to {batch.storageCondition.maxTemp}°C ({batch.storageRequirement})
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-mono block">Units / Quantity</span>
              <span className="font-semibold text-white font-mono text-base">
                {batch.remainingQuantity.toLocaleString()} / {batch.quantity.toLocaleString()} units
              </span>
            </div>
          </div>
        </div>

        {/* Quality Certificate & Lab Info */}
        {batch.qualityCertificate && (
          <div className="mt-6 p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-teal-400 uppercase tracking-wider block">
                GMP Quality Release Certificate
              </span>
              <span className="text-slate-300">
                Audited by {batch.qualityCertificate.lab} • Purity Score: <span className="text-emerald-400 font-bold">{batch.qualityCertificate.purityScore}%</span>
              </span>
            </div>
            <div className="font-mono text-slate-400">
              Inspector: <span className="text-slate-200">{batch.qualityCertificate.inspector}</span>
            </div>
          </div>
        )}

        {/* Supply Chain Trajectory Timeline Preview */}
        <div className="mt-6 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Chain of Custody Events ({batchEvents.length})
          </h3>

          <div className="space-y-3">
            {batchEvents.map((evt, idx) => (
              <div
                key={evt.eventId || idx}
                className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold font-mono text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-white mr-2">{evt.eventType}</span>
                    <span className="text-slate-400">
                      {evt.fromEntity} → <span className="text-teal-300 font-medium">{evt.toEntity}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>{evt.formattedTime}</span>
                  <span className="text-cyan-400/90 font-mono">
                    Tx: {formatShortHash(evt.txHash, 6, 4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <span>License: {batch.licenseNumber}</span>
          <span className="text-teal-500">Secured by DrugChain Cryptographic Protocol</span>
        </div>
      </div>
    </div>
  );
};
