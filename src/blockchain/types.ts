export type Role = 
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'WHOLESALER'
  | 'PHARMACY'
  | 'REGULATOR'
  | 'PATIENT';

export type SupplyChainStage = 
  | 'RAW_MATERIAL'
  | 'MANUFACTURING'
  | 'DISTRIBUTION'
  | 'WHOLESALE'
  | 'RETAIL_PHARMACY'
  | 'PATIENT_DISPENSED';

export type EventType =
  | 'BATCH_CREATED'
  | 'QUALITY_CHECKED'
  | 'PACKED'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'STORED'
  | 'DISTRIBUTED'
  | 'TRANSFERRED'
  | 'DELIVERED'
  | 'DISPENSED'
  | 'COLD_CHAIN_ALERT'
  | 'RECALLED';

export type StorageRequirement = 
  | 'AMBIENT' // 15°C - 25°C
  | 'REFRIGERATED' // 2°C - 8°C
  | 'FROZEN' // -20°C to -10°C
  | 'DEEP_FREEZE' // -80°C to -60°C
  | 'CONTROLLED_ROOM';

export interface StorageCondition {
  type: StorageRequirement;
  minTemp: number;
  maxTemp: number;
  humidityRange: string;
  notes: string;
}

export interface ColdChainTelemetry {
  readingId: string;
  batchId: string;
  temperature: number;
  humidity: number;
  location: string;
  timestamp: number;
  formattedTime: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  deviceSensorId: string;
  batteryLevel?: number;
}

export interface SupplyChainEvent {
  eventId: string;
  batchId: string;
  eventType: EventType;
  stage: SupplyChainStage;
  fromEntity: string;
  toEntity: string;
  handler: string;
  location: string;
  timestamp: number;
  formattedTime: string;
  quantity: number;
  notes: string;
  telemetry?: {
    temperature: number;
    humidity: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };
  blockIndex: number;
  txHash: string;
}

export interface DrugBatch {
  batchId: string;
  productId: string;
  drugName: string;
  genericName: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  remainingQuantity: number;
  dosageForm: string; // e.g., 'Film-Coated Tablet', 'Injectable Solution', 'Capsule'
  strength: string; // e.g., '500 mg', '100 IU/mL'
  originLocation: string;
  destination: string;
  storageRequirement: StorageRequirement;
  storageCondition: StorageCondition;
  licenseNumber: string;
  currentStage: SupplyChainStage;
  currentLocation: string;
  currentOwner: string;
  status: 'ACTIVE' | 'IN_TRANSIT' | 'STORED' | 'DELIVERED' | 'DISPENSED' | 'RECALLED' | 'QUARANTINED';
  isRecalled: boolean;
  recallDetails?: {
    reason: string;
    timestamp: string;
    recalledBy: string;
    affectedUnits: number;
  };
  qualityPassed: boolean;
  qualityCertificate?: {
    passed: boolean;
    lab: string;
    purityScore: number;
    inspectionDate: string;
    inspector: string;
  };
  createdBlockIndex: number;
  qrData: string;
}

export interface Block {
  index: number;
  timestamp: number;
  formattedTimestamp: string;
  eventType: EventType | 'GENESIS';
  data: {
    batchId?: string;
    description: string;
    details: Record<string, any>;
  };
  previousHash: string;
  hash: string;
  nonce: number;
  isTampered?: boolean;
  originalData?: any;
  originalHash?: string;
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  invalidBlockIndex?: number;
  errorReason?: string;
  blocksChecked: {
    blockIndex: number;
    expectedHash: string;
    actualHash: string;
    isPrevHashValid: boolean;
    isCurrentHashValid: boolean;
    isValid: boolean;
  }[];
}

export interface MedicineVerificationReport {
  batchId: string;
  isAuthentic: boolean;
  statusBadge: 'AUTHENTIC' | 'SUSPICIOUS' | 'COUNTERFEIT' | 'RECALLED' | 'TAMPERED' | 'EXPIRED';
  title: string;
  summary: string;
  batch?: DrugBatch;
  checks: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    details: string;
  }[];
  blockchainProof: {
    genesisVerified: boolean;
    chainIntegrity: boolean;
    blockCount: boolean;
    lastVerifiedHash: string;
    blocksInvolved: number[];
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
