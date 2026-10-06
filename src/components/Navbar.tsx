import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Role } from '../blockchain/types';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Users,
  CheckCircle2,
  Activity,
  FileCheck2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    chain,
    batches,
    chainIntegrity,
    activeRole,
    setActiveRole,
    verifyChain,
    resetToDemoData,
    batches: allBatches,
    setPassportBatch,
  } = useBlockchain();

  const isChainValid = chainIntegrity ? chainIntegrity.isValid : true;

  const roles: { id: Role; label: string; icon: string }[] = [
    { id: 'MANUFACTURER', label: 'Manufacturer', icon: '🏭' },
    { id: 'DISTRIBUTOR', label: 'Distributor', icon: '🚚' },
    { id: 'WHOLESALER', label: 'Wholesaler', icon: '🏬' },
    { id: 'PHARMACY', label: 'Pharmacy', icon: '🏥' },
    { id: 'REGULATOR', label: 'Regulator', icon: '⚖️' },
    { id: 'PATIENT', label: 'Patient', icon: '👤' },
  ];

  const handleOpenPassport = () => {
    if (allBatches.length > 0) {
      setPassportBatch(allBatches[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white font-mono">
                    DRUG<span className="text-teal-400">CHAIN</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    MAINNET
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
                  BLOCKCHAIN PHARMA MONITORING & VERIFICATION
                </p>
              </div>
            </button>
          </div>

          {/* Network Health & Integrity Monitor */}
          <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
            {/* Blockchain blocks metric */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Blocks: <strong className="text-white">{chain.length}</strong></span>
            </div>

            {/* Batches metric */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Batches: <strong className="text-white">{batches.length}</strong></span>
            </div>

            {/* Cryptographic Integrity Badge */}
            <button
              onClick={() => verifyChain()}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isChainValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30 animate-pulse'
              }`}
              title="Click to perform full cryptographic SHA-256 chain verification"
            >
              {isChainValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CHAIN: VALID</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>TAMPERING DETECTED!</span>
                </>
              )}
            </button>
          </div>

          {/* Role Switcher & Action buttons */}
          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <span className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2">
                <Users className="w-3.5 h-3.5" /> Role:
              </span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as Role)}
                className="bg-transparent text-xs font-semibold text-teal-300 focus:outline-none cursor-pointer px-2 py-1"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Digital Passport Quick trigger */}
            <button
              onClick={handleOpenPassport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
              title="View Digital Drug Passport"
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Passport</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => resetToDemoData()}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Reset Blockchain & Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
