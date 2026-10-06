import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Block } from '../blockchain/types';
import {
  Cpu,
  Layers,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  Hash,
  Clock,
  ShieldCheck,
  FileCode,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface BlockchainExplorerViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const BlockchainExplorerView: React.FC<BlockchainExplorerViewProps> = ({
  onNavigate,
}) => {
  const { chain, verifyChain, chainIntegrity } = useBlockchain();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredBlocks = chain.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.index.toString() === q ||
      b.hash.toLowerCase().includes(q) ||
      b.previousHash.toLowerCase().includes(q) ||
      b.eventType.toLowerCase().includes(q) ||
      b.data?.batchId?.toLowerCase().includes(q) ||
      b.data?.description?.toLowerCase().includes(q)
    );
  });

  const handleCopy = (hashText: string) => {
    navigator.clipboard.writeText(hashText);
    setCopiedHash(hashText);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
            Immutable Distributed Ledger
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            DrugChain Blockchain Explorer
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Direct cryptographic inspection of linked blocks from Genesis #0 to Block #{chain.length - 1}
          </p>
        </div>

        <button
          onClick={() => verifyChain()}
          className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verify All Block Hashes (SHA-256)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by block #, SHA-256 hash, Batch ID, or Event Type..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>

        <span className="text-xs font-mono text-slate-400 shrink-0">
          Showing {filteredBlocks.length} of {chain.length} blocks
        </span>
      </div>

      {/* Linked Blockchain Visual Stream */}
      <div className="space-y-4">
        {filteredBlocks.map((block, idx) => {
          const isExpanded = expandedIndex === block.index;
          const isGenesis = block.index === 0;
          const isTampered = block.isTampered;

          return (
            <div key={block.index} className="relative">
              
              {/* Connector line down to next block */}
              {idx < filteredBlocks.length - 1 && (
                <div className="absolute left-8 top-full h-4 w-0.5 bg-gradient-to-b from-teal-500 to-slate-800 z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                </div>
              )}

              {/* Block Card */}
              <div
                className={`p-5 rounded-2xl border transition-all shadow-xl ${
                  isTampered
                    ? 'bg-red-950/30 border-red-500 text-red-200 ring-2 ring-red-500/30'
                    : isGenesis
                    ? 'bg-slate-900 border-teal-500/50 hover:border-teal-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-sm border-2 shrink-0 ${
                        isTampered
                          ? 'bg-red-500 text-white border-red-300'
                          : isGenesis
                          ? 'bg-teal-500 text-slate-950 border-teal-300'
                          : 'bg-slate-800 text-teal-400 border-teal-500/40'
                      }`}
                    >
                      #{block.index}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isTampered
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : isGenesis
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {block.eventType}
                        </span>

                        {isTampered ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> TAMPERED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                        {block.data.description}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {block.formattedTimestamp.split(',')[0]}
                    </span>

                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : block.index)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Hashes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Previous Hash</span>
                      <span className="text-slate-300 font-medium">
                        {isGenesis ? '0 (Genesis Root)' : formatShortHash(block.previousHash, 14, 12)}
                      </span>
                    </div>
                    {!isGenesis && (
                      <button
                        onClick={() => handleCopy(block.previousHash)}
                        className="text-slate-500 hover:text-teal-400 p-1"
                        title="Copy Previous Hash"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Block Hash (SHA-256)</span>
                      <span className={`font-bold ${isTampered ? 'text-red-400' : 'text-teal-300'}`}>
                        {formatShortHash(block.hash, 14, 12)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(block.hash)}
                      className="text-slate-500 hover:text-teal-400 p-1"
                      title="Copy Block Hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Full Block Payload */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        Raw Block Manifest & Cryptographic Parameters
                      </span>
                      <span>Nonce: <strong className="text-white">{block.nonce}</strong></span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto">
                      <div>
                        <span className="text-teal-400 block font-bold mb-1">// Full 64-character SHA-256 Hash</span>
                        <code className="text-white bg-slate-900 px-2 py-1 rounded block break-all">
                          {block.hash}
                        </code>
                      </div>

                      <div>
                        <span className="text-teal-400 block font-bold mb-1">// Previous Block Hash</span>
                        <code className="text-slate-400 bg-slate-900 px-2 py-1 rounded block break-all">
                          {block.previousHash}
                        </code>
                      </div>

                      <div>
                        <span className="text-teal-400 block font-bold mb-1">// Transaction Data Payload</span>
                        <pre className="text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {block.data?.batchId && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => onNavigate('track', block.data.batchId)}
                          className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors"
                        >
                          Track Batch {block.data.batchId} →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
