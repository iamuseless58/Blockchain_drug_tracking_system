import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  FileCode,
  Flame,
  Undo2,
} from 'lucide-react';
import { formatShortHash, calculateBlockHash } from '../blockchain/crypto';

interface SecurityLabViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const SecurityLabView: React.FC<SecurityLabViewProps> = ({ onNavigate }) => {
  const { chain, tamperBlock, restoreBlock, verifyChain, chainIntegrity } = useBlockchain();

  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [tamperedQuantity, setTamperedQuantity] = useState<number>(99999);
  const [tamperedManufacturer, setTamperedManufacturer] = useState('Counterfeit Syndicate Labs LLC');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    originalHash: string;
    newHash: string;
    blockIndex: number;
  } | null>(null);

  const selectedBlock = chain[selectedBlockIndex] || chain[1];
  const isChainValid = chainIntegrity ? chainIntegrity.isValid : true;

  const handleSimulateTampering = async () => {
    setIsSimulating(true);
    try {
      const modifiedDetails = {
        ...selectedBlock.data.details,
        quantity: Number(tamperedQuantity),
        manufacturer: tamperedManufacturer,
        unauthorizedNote: 'HACKED: Transaction payload altered directly in storage.',
      };

      const result = await tamperBlock(selectedBlockIndex, {
        description: `TAMPERED RECORD: Fake manufacturer injection for ${selectedBlock.data?.batchId || 'batch'}`,
        details: modifiedDetails,
      });

      setSimulationResult({
        originalHash: result.originalHash,
        newHash: result.newHash,
        blockIndex: selectedBlockIndex,
      });

      await verifyChain();
    } catch (err: any) {
      console.error('Tampering simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRestore = async () => {
    setIsSimulating(true);
    try {
      await restoreBlock(selectedBlockIndex);
      setSimulationResult(null);
      await verifyChain();
    } catch (err: any) {
      console.error('Restore error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-widest">
            Cryptographic Integrity & Tamper Sandbox
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Blockchain Security Lab
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Simulate malicious data alterations, observe cryptographic SHA-256 hash mismatches, and test instant restoration
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isChainValid ? (
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> LEDGER INTEGRITY: PRISTINE
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-500/20 border border-red-500/50 text-red-400 flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> TAMPERING DETECTED!
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Tamper Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tamper Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Tamper Simulation Controls
            </h3>
          </div>

          <div className="space-y-4">
            {/* Block selector */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Select Block to Attack (Index &gt; 0)
              </label>
              <select
                value={selectedBlockIndex}
                onChange={(e) => setSelectedBlockIndex(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono cursor-pointer"
              >
                {chain.slice(1).map((b) => (
                  <option key={b.index} value={b.index}>
                    Block #{b.index}: {b.eventType} ({b.data?.batchId || 'System'}) {b.isTampered ? '[TAMPERED]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Block Details Card */}
            {selectedBlock && (
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Block:</span>
                  <strong className="text-cyan-400">#{selectedBlock.index} ({selectedBlock.eventType})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className={selectedBlock.isTampered ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                    {selectedBlock.isTampered ? 'TAMPERED / CORRUPTED' : 'AUTHENTIC (SHA-256 Valid)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stored Hash:</span>
                  <span className="text-slate-200">{formatShortHash(selectedBlock.hash, 8, 6)}</span>
                </div>
              </div>
            )}

            {/* Alteration Parameters */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Simulated Payload Injection:
              </span>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Tamper Batch Quantity (e.g. Siphon 49,999 units)
                </label>
                <input
                  type="number"
                  value={tamperedQuantity}
                  onChange={(e) => setTamperedQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-red-500/30 focus:border-red-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-red-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Inject Fake Manufacturer Name
                </label>
                <input
                  type="text"
                  value={tamperedManufacturer}
                  onChange={(e) => setTamperedManufacturer(e.target.value)}
                  className="w-full bg-slate-950 border border-red-500/30 focus:border-red-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-red-300 font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSimulateTampering}
                disabled={isSimulating}
                className="w-full py-2.5 text-xs font-bold font-mono bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>SIMULATE DATA TAMPERING</span>
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={isSimulating || !selectedBlock?.isTampered}
                className="w-full py-2.5 text-xs font-bold font-mono bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
                <span>RESTORE ORIGINAL DATA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security Analysis & Cryptographic Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase text-teal-400 font-bold">
              Cryptographic Proof Engine
            </span>
            <h3 className="text-base font-bold text-white font-mono mt-0.5">
              Why Tampering Is Mathematically Impossible to Conceal
            </h3>
          </div>

          {/* Visual Step-by-Step Explanation Flow */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase font-mono text-slate-300 tracking-wider">
              Cryptographic Invariance Principle:
            </h4>

            <div className="space-y-3 font-mono text-xs">
              
              {/* Step 1 */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-teal-400 block font-bold text-[11px]">1. Pristine Block Data</span>
                  <span className="text-slate-300">
                    Original Payload in Block #{selectedBlockIndex}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-teal-400 block font-bold text-[11px]">2. Deterministic SHA-256 Hash</span>
                  <span className="text-slate-300">
                    Calculated Hash: {formatShortHash(selectedBlock?.originalHash || selectedBlock?.hash, 12, 10)}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                selectedBlock?.isTampered ? 'bg-red-950/30 border-red-500/40 text-red-200' : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}>
                <div>
                  <span className="font-bold text-[11px] block">3. Unauthorized Modification</span>
                  <span>
                    {selectedBlock?.isTampered ? 'Injected altered quantities into ledger record' : 'Awaiting tamper trigger above'}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                selectedBlock?.isTampered ? 'bg-red-950/40 border-red-500 text-red-100 font-bold' : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}>
                <div>
                  <span className="font-bold text-[11px] block">4. Hash Recalculation &amp; Avalanche Effect</span>
                  <span>
                    {selectedBlock?.isTampered
                      ? 'HASH MISMATCH! New calculated hash does not match stored block hash.'
                      : 'Hashes strictly equal. Verification passes.'}
                  </span>
                </div>
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </div>

              {/* Step 5 */}
              <div className={`p-3 rounded-lg border text-center font-bold ${
                selectedBlock?.isTampered
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {selectedBlock?.isTampered
                  ? '⚠ BLOCKCHAIN INTEGRITY COMPROMISED: CHAIN MARKED INVALID'
                  : '✓ BLOCKCHAIN INTEGRITY 100% SECURE'}
              </div>
            </div>
          </div>

          {/* Subsequent Blocks Impact Cascade */}
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
            <span className="text-slate-400 uppercase text-[11px] block">
              Subsequent Blocks Invalidation Cascade:
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              Because Block #{selectedBlockIndex + 1 || 2} references the previous block's hash, altering Block #{selectedBlockIndex} permanently breaks the cryptographic previousHash linkage for <strong>all subsequent {chain.length - selectedBlockIndex} blocks</strong> downstream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
