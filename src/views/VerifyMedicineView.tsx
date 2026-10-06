import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { MedicineVerificationReport } from '../blockchain/types';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Cpu,
  Layers,
  Building,
  Calendar,
  MapPin,
  RefreshCw,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface VerifyMedicineViewProps {
  initialQuery?: string;
  onNavigate: (tab: string, batchId?: string) => void;
}

export const VerifyMedicineView: React.FC<VerifyMedicineViewProps> = ({
  initialQuery,
  onNavigate,
}) => {
  const { verifyMedicine, setPassportBatch } = useBlockchain();

  const [query, setQuery] = useState(initialQuery || 'PCM-2026-001');
  const [report, setReport] = useState<MedicineVerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (queryToTest?: string) => {
    const targetQuery = (queryToTest || query).trim();
    if (!targetQuery) return;

    setIsVerifying(true);
    try {
      const res = await verifyMedicine(targetQuery);
      setReport(res);
    } catch (err: any) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  React.useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleVerify(initialQuery);
    } else {
      handleVerify('PCM-2026-001');
    }
  }, [initialQuery]);

  const testCases = [
    { label: '✓ Authentic Paracetamol', id: 'PCM-2026-001' },
    { label: '❄ Cold-Chain Insulin', id: 'INS-2026-008' },
    { label: '⚠ Active Recalled Batch', id: 'ANT-2026-017' },
    { label: '🛑 Counterfeit Fake Batch', id: 'FAKE-COUNTERFEIT-888' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          FDA DSCSA & EMA COMPLIANT VERIFICATION
        </span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Verify Medicine Authenticity
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-xl mx-auto">
          Cryptographic ledger validation against the immutable blockchain. Verifies manufacturer accreditation, SHA-256 block hashes, and custody history.
        </p>
      </div>

      {/* Search Input & Test Scenarios */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Batch ID (e.g. PCM-2026-001) or Product ID..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 rounded-xl font-bold font-mono text-xs bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Ledger...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Medicine Now</span>
              </>
            )}
          </button>
        </form>

        {/* Quick test buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Quick Test Cases:</span>
          {testCases.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(tc.id);
                handleVerify(tc.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors cursor-pointer"
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Results Output */}
      {report && (
        <div className="space-y-6">
          
          {/* Main Huge Verification Result Badge */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border-2 shadow-2xl transition-all ${
              report.statusBadge === 'AUTHENTIC'
                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                : report.statusBadge === 'RECALLED'
                ? 'bg-red-950/40 border-red-500 text-red-200'
                : report.statusBadge === 'COUNTERFEIT'
                ? 'bg-red-950/50 border-red-500 text-red-100'
                : 'bg-amber-950/40 border-amber-500 text-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div
                className={`p-4 rounded-2xl shrink-0 ${
                  report.isAuthentic
                    ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30'
                    : 'bg-red-500 text-white shadow-xl shadow-red-500/30'
                }`}
              >
                {report.isAuthentic ? (
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-80">
                  Cryptographic Audit Result
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {report.title}
                </h3>
                <p className="text-sm font-sans text-slate-200 leading-relaxed max-w-2xl">
                  {report.summary}
                </p>

                {report.batch && (
                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={() => setPassportBatch(report.batch!)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>View Digital Drug Passport</span>
                    </button>

                    <button
                      onClick={() => onNavigate('track', report.batch!.batchId)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Track Full Journey</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8-Point Cryptographic & Regulatory Breakdown */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-mono mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 8-Point Regulatory & Cryptographic Verification Criteria
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.checks.map((chk, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    chk.status === 'PASS'
                      ? 'bg-slate-950/60 border-slate-800'
                      : chk.status === 'WARN'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-red-950/20 border-red-500/40'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {chk.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : chk.status === 'WARN' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-white block mb-0.5">{chk.name}</span>
                    <span className="text-slate-400 font-mono text-[11px] leading-relaxed block">
                      {chk.details}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Specifications (if found) */}
          {report.batch && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono mb-4 flex items-center gap-2">
                <Building className="w-4 h-4" /> Verified Batch Metadata
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Manufacturer</span>
                  <span className="font-semibold text-white truncate block">{report.batch.manufacturer}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Manufacturing Date</span>
                  <span className="font-semibold text-slate-200 truncate block">{report.batch.manufacturingDate}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Expiry Date</span>
                  <span className="font-semibold text-slate-200 truncate block">{report.batch.expiryDate}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Current Custody</span>
                  <span className="font-semibold text-teal-300 truncate block">{report.batch.currentOwner}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
