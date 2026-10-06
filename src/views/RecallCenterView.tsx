import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Building,
  MapPin,
  Calendar,
  Layers,
  Cpu,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface RecallCenterViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const RecallCenterView: React.FC<RecallCenterViewProps> = ({ onNavigate }) => {
  const { batches, recallBatch, activeRole } = useBlockchain();

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [reasonCategory, setReasonCategory] = useState('Quality failure');
  const [reasonNotes, setReasonNotes] = useState(
    'Stability testing indicated analytical HPLC purity degradation exceeding pharmacopeial limit.'
  );
  const [recalledBy, setRecalledBy] = useState('National Drug Regulatory Authority & QA Directorate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nonRecalledBatches = batches.filter((b) => !b.isRecalled);
  const recalledBatches = batches.filter((b) => b.isRecalled);

  const targetBatch = batches.find((b) => b.batchId === (selectedBatchId || nonRecalledBatches[0]?.batchId));

  const handleIssueRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    const batchIdToRecall = selectedBatchId || nonRecalledBatches[0]?.batchId;
    if (!batchIdToRecall) return;

    setIsSubmitting(true);
    try {
      const fullReason = `${reasonCategory}: ${reasonNotes}`;
      await recallBatch(batchIdToRecall, fullReason, recalledBy);
      setSelectedBatchId('');
    } catch (err: any) {
      console.error('Failed to issue recall:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-widest">
            Regulatory Emergency Command
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Pharmaceutical Drug Recall Center
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Issue cryptographically binding safety recalls on the blockchain to immediately halt distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {recalledBatches.length} Active Recall Notices
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recall Issuance Console */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Initiate Emergency Recall
            </h3>
          </div>

          <form onSubmit={handleIssueRecall} className="space-y-4">
            {/* Select batch */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Select Batch to Recall *
              </label>
              <select
                value={selectedBatchId || nonRecalledBatches[0]?.batchId || ''}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono cursor-pointer"
              >
                {nonRecalledBatches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} – {b.drugName} (Qty: {b.remainingQuantity.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Batch Info Summary */}
            {targetBatch && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Custody:</span>
                  <span className="font-semibold text-teal-300">{targetBatch.currentOwner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-white">{targetBatch.currentLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Inventory:</span>
                  <span className="font-semibold text-red-300">
                    {targetBatch.remainingQuantity.toLocaleString()} units
                  </span>
                </div>
              </div>
            )}

            {/* Reason Category */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Regulatory Recall Classification *
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono cursor-pointer"
              >
                <option value="Quality failure">Quality Failure / Stability Degradation</option>
                <option value="Contamination">Particulate / Microbial Contamination</option>
                <option value="Expired product">Expired Product Distribution Attempt</option>
                <option value="Temperature breach">Severe Cold-Chain Temperature Excursion</option>
                <option value="Counterfeit suspicion">Suspected Counterfeit Packaging Infiltration</option>
                <option value="Regulatory issue">Regulatory License Non-Compliance / Labeling Error</option>
              </select>
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Authorized Recall Authority
              </label>
              <input
                type="text"
                required
                value={recalledBy}
                onChange={(e) => setRecalledBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            {/* Detailed reason notes */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Clinical & Regulatory Justification Notes
              </label>
              <textarea
                rows={3}
                required
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || nonRecalledBatches.length === 0}
              className="w-full py-2.5 text-xs font-bold font-mono bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Recall Block to Ledger...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Execute Recall & Lock Distribution</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Active Recalled Batches List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-red-400 font-bold">
                Active Recall Register
              </span>
              <h3 className="text-sm font-bold text-white font-mono">
                Quarantined Batches on DrugChain ({recalledBatches.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-red-400">
              Immediate Dispensing Ban Active
            </span>
          </div>

          <div className="space-y-4">
            {recalledBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-5 bg-red-950/20 border border-red-500/40 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      EMERGENCY RECALL
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {batch.drugName} ({batch.batchId})
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {batch.manufacturer} • NDC: {batch.productId}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-500 text-white rounded-lg">
                    QUARANTINED
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg text-xs font-mono space-y-1.5 border border-slate-800">
                  <div className="text-slate-300">
                    <strong className="text-red-300">Reason:</strong> {batch.recallDetails?.reason}
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                    <span>Issued By: <strong className="text-slate-200">{batch.recallDetails?.recalledBy}</strong></span>
                    <span>Date: {batch.recallDetails?.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Affected Quantity:</span>
                    <strong className="text-red-400">{batch.remainingQuantity.toLocaleString()} units</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Quarantine Depot:</span>
                    <strong className="text-white truncate block">{batch.currentLocation}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onNavigate('track', batch.batchId)}
                    className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    View Custody Route →
                  </button>
                  <button
                    onClick={() => onNavigate('verify', batch.batchId)}
                    className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors"
                  >
                    Run Verification Check →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
