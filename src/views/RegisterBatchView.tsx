import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { StorageRequirement, Block } from '../blockchain/types';
import {
  PlusCircle,
  Cpu,
  Layers,
  CheckCircle2,
  Building,
  Calendar,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatShortHash } from '../blockchain/crypto';

interface RegisterBatchViewProps {
  onNavigate: (tab: string, batchId?: string) => void;
}

export const RegisterBatchView: React.FC<RegisterBatchViewProps> = ({ onNavigate }) => {
  const { registerBatch, setPassportBatch } = useBlockchain();

  const [drugName, setDrugName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productId, setProductId] = useState('');
  const [manufacturer, setManufacturer] = useState('Apex Pharma Labs Ltd.');
  const [manufacturingDate, setManufacturingDate] = useState('2026-03-01');
  const [expiryDate, setExpiryDate] = useState('2028-03-01');
  const [quantity, setQuantity] = useState<number>(30000);
  const [dosageForm, setDosageForm] = useState('Film-Coated Tablet');
  const [strength, setStrength] = useState('500 mg');
  const [originLocation, setOriginLocation] = useState('Bengaluru Formulations Facility (Zone 3)');
  const [destination, setDestination] = useState('Karnataka Central Medical Distribution Center');
  const [storageRequirement, setStorageRequirement] = useState<StorageRequirement>('AMBIENT');
  const [licenseNumber, setLicenseNumber] = useState('MFG-KA-2025-9920A');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastMinedBlock, setLastMinedBlock] = useState<Block | null>(null);
  const [lastRegisteredBatchId, setLastRegisteredBatchId] = useState<string | null>(null);

  const handleGenerateBatchId = () => {
    const prefix = drugName ? drugName.slice(0, 3).toUpperCase() : 'MED';
    const rand = Math.floor(100 + Math.random() * 900);
    const newId = `${prefix}-2026-${rand}`;
    setBatchId(newId);
    if (!productId) {
      setProductId(`NDC-${Math.floor(10000 + Math.random() * 90000)}-${rand}`);
    }
  };

  const handleFillDemo = (type: string) => {
    if (type === 'antibiotic') {
      setDrugName('Azithromycin 500mg');
      setGenericName('Azithromycin Dihydrate');
      setDosageForm('Film-Coated Tablet');
      setStrength('500 mg');
      setBatchId('AZM-2026-077');
      setProductId('NDC-0093-7146-56');
      setStorageRequirement('AMBIENT');
      setQuantity(25000);
    } else if (type === 'biologic') {
      setDrugName('Erythropoietin 4000 IU');
      setGenericName('Epoetin Alfa Injection');
      setDosageForm('Prefilled Syringe');
      setStrength('4000 IU / 0.4 mL');
      setBatchId('EPO-2026-019');
      setProductId('NDC-55513-144-10');
      setStorageRequirement('REFRIGERATED');
      setQuantity(10000);
    } else if (type === 'vaccine') {
      setDrugName('Rabies Vaccine Inactivated');
      setGenericName('Purified Vero Cell Rabies Vaccine');
      setDosageForm('Lyophilized Vial + Diluent');
      setStrength('2.5 IU / Dose');
      setBatchId('RAB-2026-033');
      setProductId('NDC-49281-250-51');
      setStorageRequirement('REFRIGERATED');
      setQuantity(15000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName || !genericName) return;

    setIsSubmitting(true);
    try {
      const finalBatchId = batchId || `${drugName.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;
      const finalProductId = productId || `NDC-48301-${Math.floor(100 + Math.random() * 900)}`;

      const { batch, block } = await registerBatch({
        drugName,
        genericName,
        batchId: finalBatchId,
        productId: finalProductId,
        manufacturer,
        manufacturingDate,
        expiryDate,
        quantity: Number(quantity),
        dosageForm,
        strength,
        originLocation,
        destination,
        storageRequirement,
        licenseNumber,
      });

      setLastMinedBlock(block);
      setLastRegisteredBatchId(batch.batchId);
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-teal-400 font-bold tracking-widest">
            Pharma Good Manufacturing Practice (GMP)
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Register New Pharmaceutical Batch
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Mint origin blockchain block with immutable SHA-256 cryptographic proof
          </p>
        </div>

        {/* Demo pre-fill pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Quick Template:</span>
          <button
            type="button"
            onClick={() => handleFillDemo('antibiotic')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors"
          >
            Antibiotic
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('biologic')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
          >
            Biologic
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('vaccine')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
          >
            Vaccine
          </button>
        </div>
      </div>

      {/* Confirmation Modal if block was mined */}
      {lastMinedBlock && lastRegisteredBatchId && (
        <div className="p-6 bg-teal-950/30 border-2 border-teal-500 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500 text-slate-950 rounded-xl font-bold shadow-lg shadow-teal-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase font-bold text-teal-300 tracking-wider">
                  Blockchain Block Mined Successfully
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Batch {lastRegisteredBatchId} Recorded on Ledger
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Block #{lastMinedBlock.index} • Deterministic SHA-256 Hash Generated
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setLastMinedBlock(null);
                setLastRegisteredBatchId(null);
              }}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Block Index:</span>
              <strong className="text-cyan-400">#{lastMinedBlock.index}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Previous Hash:</span>
              <span className="text-slate-300">{formatShortHash(lastMinedBlock.previousHash, 12, 10)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Block Hash (SHA-256):</span>
              <span className="text-teal-300 font-bold">{lastMinedBlock.hash}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('track', lastRegisteredBatchId)}
              className="px-4 py-2 text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors cursor-pointer"
            >
              Track Supply Chain →
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="px-4 py-2 text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              View in Blockchain Explorer →
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        
        {/* Section 1: Drug Identifiers */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-mono mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 1. Pharmaceutical Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Commercial Drug Brand Name *
              </label>
              <input
                type="text"
                required
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg, Remdesivir"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Active Pharmaceutical Ingredient (Generic Name) *
              </label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Acetaminophen, Amoxicillin Trihydrate"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                <span>Unique Batch ID *</span>
                <button
                  type="button"
                  onClick={handleGenerateBatchId}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-generate
                </button>
              </label>
              <input
                type="text"
                required
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g. PCM-2026-001"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                National Drug Code (NDC / GTIN)
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="e.g. NDC-50092-101"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Dosage Form
              </label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              >
                <option value="Film-Coated Tablet">Film-Coated Tablet</option>
                <option value="Hard Gelatin Capsule">Hard Gelatin Capsule</option>
                <option value="Injectable Solution (Vial)">Injectable Solution (Vial)</option>
                <option value="Prefilled Syringe">Prefilled Syringe</option>
                <option value="Lyophilized Powder for Reconstitution">Lyophilized Powder</option>
                <option value="Oral Suspension / Syrup">Oral Suspension / Syrup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Therapeutic Strength
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500 mg, 100 IU/mL"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Production & Compliance */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono mb-4 flex items-center gap-2">
            <Building className="w-4 h-4" /> 2. Manufacturing & Quality Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Licensed Manufacturer *
              </label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Apex Pharma Labs Ltd."
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                GMP Manufacturing License #
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. MFG-KA-2025-9920A"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Manufacturing Date
              </label>
              <input
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Lot Batch Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Storage & Cold-Chain Requirement *
              </label>
              <select
                value={storageRequirement}
                onChange={(e) => setStorageRequirement(e.target.value as StorageRequirement)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              >
                <option value="AMBIENT">Ambient Controlled (15°C – 25°C)</option>
                <option value="REFRIGERATED">Cold Chain Refrigerated (2°C – 8°C)</option>
                <option value="FROZEN">Frozen (-20°C to -10°C)</option>
                <option value="DEEP_FREEZE">Deep Freeze Cryo (-80°C to -60°C)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Origin & Logistics Destination */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 font-mono mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 3. Logistics & Transit Origin
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Origin Formulation Plant Location
              </label>
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="e.g. Bengaluru Manufacturing Campus"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Initial Destination Logistics Depot
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Central Distribution Hub"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl text-xs font-bold font-mono bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing SHA-256 & Mining Block...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Commit Batch to Blockchain (SHA-256)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
