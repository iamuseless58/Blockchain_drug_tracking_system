import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { DrugBatch, StorageRequirement } from '../blockchain/types';
import {
  Search,
  Filter,
  PlusCircle,
  FileCheck2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Building,
  Calendar,
  Thermometer,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DrugBatchesViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const DrugBatchesView: React.FC<DrugBatchesViewProps> = ({ onNavigate }) => {
  const { batches, setSelectedBatchId, setPassportBatch, activeRole } = useBlockchain();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storageFilter, setStorageFilter] = useState('ALL');

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'RECALLED' && batch.isRecalled) ||
      batch.status === statusFilter;

    const matchesStorage =
      storageFilter === 'ALL' || batch.storageRequirement === storageFilter;

    return matchesSearch && matchesStatus && matchesStorage;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
            Cryptographic Pharmaceutical Registry
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Registered Drug Batches
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Total {batches.length} lots sealed on DrugChain distributed ledger
          </p>
        </div>

        <button
          onClick={() => onNavigate('register')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register New Batch</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Batch ID, Drug Name, Generic, Manufacturer, or NDC..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="STORED">Depot Stored</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DISPENSED">Dispensed</option>
              <option value="RECALLED">Recalled</option>
            </select>
          </div>

          {/* Storage filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Storage:</span>
            <select
              value={storageFilter}
              onChange={(e) => setStorageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="ALL">All Storage Types</option>
              <option value="AMBIENT">Ambient (15-25°C)</option>
              <option value="REFRIGERATED">Cold Chain (2-8°C)</option>
              <option value="FROZEN">Frozen (-20°C)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map((batch) => {
          const isExpired = new Date(batch.expiryDate).getTime() < Date.now();

          return (
            <div
              key={batch.batchId}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xl ${
                batch.isRecalled
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-teal-400 border border-slate-700">
                      {batch.batchId}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                      {batch.drugName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {batch.genericName} • {batch.strength}
                    </p>
                  </div>

                  {batch.isRecalled ? (
                    <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                      RECALLED
                    </span>
                  ) : isExpired ? (
                    <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                      EXPIRED
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                      {batch.status}
                    </span>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs font-mono border-t border-b border-slate-800/80 py-3 my-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" /> Manufacturer:
                    </span>
                    <span className="font-semibold truncate max-w-[170px] text-right">
                      {batch.manufacturer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Expiry:
                    </span>
                    <span className={isExpired ? 'text-amber-400 font-bold' : ''}>
                      {batch.expiryDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-500" /> Storage:
                    </span>
                    <span className="text-cyan-300">
                      {batch.storageCondition.minTemp}°C to {batch.storageCondition.maxTemp}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500" /> Current Owner:
                    </span>
                    <span className="truncate max-w-[170px] text-teal-300 text-right">
                      {batch.currentOwner}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Inventory:</span>
                    <span className="text-white font-bold">
                      {batch.remainingQuantity.toLocaleString()} / {batch.quantity.toLocaleString()} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onNavigate('track', batch.batchId)}
                  className="py-2 px-2 text-[11px] font-mono font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Truck className="w-3 h-3" />
                  <span>Track</span>
                </button>

                <button
                  onClick={() => setPassportBatch(batch)}
                  className="py-2 px-2 text-[11px] font-mono font-semibold rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-center transition-colors flex items-center justify-center gap-1"
                >
                  <FileCheck2 className="w-3 h-3" />
                  <span>Passport</span>
                </button>

                <button
                  onClick={() => onNavigate('verify', batch.batchId)}
                  className="py-2 px-2 text-[11px] font-mono font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-center transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verify</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-mono text-sm">
            No pharmaceutical batches matched your search filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setStorageFilter('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-slate-800 text-teal-400 hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
