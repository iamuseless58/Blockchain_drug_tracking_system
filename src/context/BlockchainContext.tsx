import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Block,
  DrugBatch,
  SupplyChainEvent,
  ChainVerificationResult,
  MedicineVerificationReport,
  Role,
  EventType,
  StorageRequirement,
  ColdChainTelemetry,
  ToastMessage,
} from '../blockchain/types';
import { BlockchainEngine } from '../blockchain/blockchainEngine';

interface BlockchainContextType {
  chain: Block[];
  batches: DrugBatch[];
  events: SupplyChainEvent[];
  telemetry: ColdChainTelemetry[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  selectedBatchId: string;
  setSelectedBatchId: (id: string) => void;
  chainIntegrity: ChainVerificationResult | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  passportBatch: DrugBatch | null;
  setPassportBatch: (batch: DrugBatch | null) => void;

  // Actions
  registerBatch: (data: {
    drugName: string;
    genericName: string;
    batchId?: string;
    productId: string;
    manufacturer: string;
    manufacturingDate: string;
    expiryDate: string;
    quantity: number;
    dosageForm: string;
    strength: string;
    originLocation: string;
    destination: string;
    storageRequirement: StorageRequirement;
    licenseNumber: string;
  }) => Promise<{ batch: DrugBatch; block: Block }>;

  addSupplyChainEvent: (data: {
    batchId: string;
    eventType: EventType;
    fromEntity: string;
    toEntity: string;
    handler: string;
    location: string;
    quantity?: number;
    notes: string;
    telemetry?: {
      temperature: number;
      humidity: number;
      status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    };
  }) => Promise<{ event: SupplyChainEvent; block: Block }>;

  recallBatch: (batchId: string, reason: string, recalledBy: string) => Promise<{ block: Block }>;
  recordColdChainBreach: (batchId: string, temperature: number, humidity: number, location: string) => Promise<{ block: Block }>;
  tamperBlock: (blockIndex: number, modifiedData: Record<string, any>) => Promise<{ originalHash: string; newHash: string }>;
  restoreBlock: (blockIndex: number) => Promise<boolean>;
  verifyChain: () => Promise<ChainVerificationResult>;
  verifyMedicine: (query: string) => Promise<MedicineVerificationReport>;
  resetToDemoData: () => Promise<void>;
  syncState: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

const engine = new BlockchainEngine();

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chain, setChain] = useState<Block[]>([]);
  const [batches, setBatches] = useState<DrugBatch[]>([]);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [telemetry, setTelemetry] = useState<ColdChainTelemetry[]>([]);
  const [activeRole, setActiveRole] = useState<Role>('MANUFACTURER');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('PCM-2026-001');
  const [chainIntegrity, setChainIntegrity] = useState<ChainVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [passportBatch, setPassportBatch] = useState<DrugBatch | null>(null);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const syncState = useCallback(async () => {
    setChain([...engine.chain]);
    setBatches(Array.from(engine.batches.values()));
    setEvents([...engine.events]);
    setTelemetry([...engine.coldChainTelemetry]);
    const integrity = await engine.verifyChain();
    setChainIntegrity(integrity);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await engine.initialize();
        if (mounted) {
          await syncState();
          setIsLoading(false);
          addToast(
            'success',
            'Blockchain Ledger Synchronized',
            `Connected to DrugChain Mainnet. Genesis block + ${engine.chain.length - 1} blocks loaded.`
          );
        }
      } catch (err) {
        console.error('Failed to init engine:', err);
        if (mounted) setIsLoading(false);
      }
    };
    init();

    return () => {
      mounted = false;
    };
  }, [addToast, syncState]);

  const registerBatch = useCallback(
    async (data: Parameters<BlockchainContextType['registerBatch']>[0]) => {
      const result = await engine.registerBatch(data);
      await syncState();
      setSelectedBatchId(result.batch.batchId);
      addToast(
        'success',
        `✓ Batch Registered: ${result.batch.batchId}`,
        `Mined Block #${result.block.index} with SHA-256 hash ${result.block.hash.slice(0, 14)}...`
      );
      return result;
    },
    [addToast, syncState]
  );

  const addSupplyChainEvent = useCallback(
    async (data: Parameters<BlockchainContextType['addSupplyChainEvent']>[0]) => {
      const result = await engine.addSupplyChainEvent(data);
      await syncState();
      addToast(
        'info',
        `✓ Event Recorded: ${data.eventType}`,
        `Transferred to ${data.toEntity} in Block #${result.block.index}. Hash: ${result.block.hash.slice(0, 12)}...`
      );
      return result;
    },
    [addToast, syncState]
  );

  const recallBatch = useCallback(
    async (batchId: string, reason: string, recalledBy: string) => {
      const result = await engine.recallBatch(batchId, reason, recalledBy);
      await syncState();
      addToast(
        'error',
        `⚠ DRUG RECALL ISSUED: Batch ${batchId}`,
        `Emergency recall recorded in Block #${result.block.index}. All dispensing prohibited.`
      );
      return result;
    },
    [addToast, syncState]
  );

  const recordColdChainBreach = useCallback(
    async (batchId: string, temperature: number, humidity: number, location: string) => {
      const result = await engine.recordColdChainBreach(batchId, temperature, humidity, location);
      await syncState();
      addToast(
        'warning',
        `⚠ Cold-Chain Breach: ${temperature}°C`,
        `Temperature excursion recorded on blockchain in Block #${result.block.index}!`
      );
      return result;
    },
    [addToast, syncState]
  );

  const tamperBlock = useCallback(
    async (blockIndex: number, modifiedData: Record<string, any>) => {
      const result = await engine.tamperBlock(blockIndex, modifiedData);
      await syncState();
      addToast(
        'error',
        `⚠ TAMPERING SIMULATED: Block #${blockIndex}`,
        `Data payload altered. Cryptographic hash mismatch triggered!`
      );
      return result;
    },
    [addToast, syncState]
  );

  const restoreBlock = useCallback(
    async (blockIndex: number) => {
      const success = await engine.restoreBlock(blockIndex);
      if (success) {
        await syncState();
        addToast(
          'success',
          `✓ Block #${blockIndex} Restored`,
          `Original payload recovered. Cryptographic SHA-256 integrity restored.`
        );
      }
      return success;
    },
    [addToast, syncState]
  );

  const verifyChain = useCallback(async () => {
    const result = await engine.verifyChain();
    setChainIntegrity(result);
    if (result.isValid) {
      addToast(
        'success',
        '✓ Blockchain Integrity Verified',
        `All ${result.totalBlocks} blocks pass cryptographic SHA-256 verification and hash linkage.`
      );
    } else {
      addToast(
        'error',
        '⚠ Blockchain Integrity Compromised',
        result.errorReason || 'Tampered block detected in chain!'
      );
    }
    return result;
  }, [addToast]);

  const verifyMedicine = useCallback(async (query: string) => {
    return engine.verifyMedicine(query);
  }, []);

  const resetToDemoData = useCallback(async () => {
    setIsLoading(true);
    await engine.seedDemoData();
    await syncState();
    setSelectedBatchId('PCM-2026-001');
    setIsLoading(false);
    addToast(
      'info',
      'Demo Dataset Restored',
      'Reset all blockchain records, batches, cold-chain telemetry, and events to pristine state.'
    );
  }, [addToast, syncState]);

  return (
    <BlockchainContext.Provider
      value={{
        chain,
        batches,
        events,
        telemetry,
        activeRole,
        setActiveRole,
        selectedBatchId,
        setSelectedBatchId,
        chainIntegrity,
        isLoading,
        toasts,
        addToast,
        removeToast,
        passportBatch,
        setPassportBatch,
        registerBatch,
        addSupplyChainEvent,
        recallBatch,
        recordColdChainBreach,
        tamperBlock,
        restoreBlock,
        verifyChain,
        verifyMedicine,
        resetToDemoData,
        syncState,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
