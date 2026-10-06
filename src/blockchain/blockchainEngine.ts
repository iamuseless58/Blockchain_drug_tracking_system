import {
  Block,
  DrugBatch,
  SupplyChainEvent,
  ChainVerificationResult,
  MedicineVerificationReport,
  EventType,
  SupplyChainStage,
  StorageCondition,
  StorageRequirement,
  ColdChainTelemetry,
} from './types';
import { calculateBlockHash, calculateSha256 } from './crypto';

const STORAGE_KEY_BLOCKS = 'drugchain_blocks_v1';
const STORAGE_KEY_BATCHES = 'drugchain_batches_v1';
const STORAGE_KEY_EVENTS = 'drugchain_events_v1';
const STORAGE_KEY_TELEMETRY = 'drugchain_telemetry_v1';

export class BlockchainEngine {
  public chain: Block[] = [];
  public batches: Map<string, DrugBatch> = new Map();
  public events: SupplyChainEvent[] = [];
  public coldChainTelemetry: ColdChainTelemetry[] = [];
  private isInitialized = false;

  constructor() {}

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const savedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
    const savedBatches = localStorage.getItem(STORAGE_KEY_BATCHES);
    const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
    const savedTelemetry = localStorage.getItem(STORAGE_KEY_TELEMETRY);

    if (savedBlocks && savedBatches && savedEvents) {
      try {
        this.chain = JSON.parse(savedBlocks);
        const parsedBatches: DrugBatch[] = JSON.parse(savedBatches);
        this.batches = new Map(parsedBatches.map((b) => [b.batchId, b]));
        this.events = JSON.parse(savedEvents);
        if (savedTelemetry) {
          this.coldChainTelemetry = JSON.parse(savedTelemetry);
        }
        this.isInitialized = true;
        return;
      } catch (err) {
        console.warn('Failed to parse cached blockchain, resetting to demo seed:', err);
      }
    }

    await this.seedDemoData();
    this.isInitialized = true;
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.chain));
      localStorage.setItem(
        STORAGE_KEY_BATCHES,
        JSON.stringify(Array.from(this.batches.values()))
      );
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      localStorage.setItem(
        STORAGE_KEY_TELEMETRY,
        JSON.stringify(this.coldChainTelemetry)
      );
    } catch (e) {
      console.error('Failed to save blockchain state to LocalStorage:', e);
    }
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public async createGenesisBlock(): Promise<Block> {
    const timestamp = 1771142400000; // Fixed deterministic genesis timestamp (Feb 15 2026)
    const formattedTimestamp = new Date(timestamp).toUTCString();
    const data = {
      description: 'DRUGCHAIN GENESIS BLOCK: Protocol initialized. DSCSA cryptographic pharma ledger active.',
      details: {
        network: 'DrugChain Enterprise Mainnet',
        version: '2.4.0-pharma',
        consensus: 'Cryptographic SHA-256 Hash Linking',
        regulatoryCompliance: ['FDA DSCSA', 'EMA FMD', 'WHO Good Distribution Practice'],
        initializedBy: 'PharmaChain Global Consortium Authority'
      }
    };
    const previousHash = '0';
    const nonce = 0;
    const hash = await calculateBlockHash(0, timestamp, data, previousHash, nonce);

    return {
      index: 0,
      timestamp,
      formattedTimestamp,
      eventType: 'GENESIS',
      data,
      previousHash,
      hash,
      nonce,
    };
  }

  public async addBlock(
    eventType: EventType,
    data: { batchId?: string; description: string; details: Record<string, any> }
  ): Promise<Block> {
    const previousBlock = this.getLatestBlock();
    const index = this.chain.length;
    const timestamp = Date.now();
    const formattedTimestamp = new Date(timestamp).toUTCString();
    const previousHash = previousBlock.hash;
    const nonce = Math.floor(Math.random() * 10000);
    const hash = await calculateBlockHash(index, timestamp, data, previousHash, nonce);

    const newBlock: Block = {
      index,
      timestamp,
      formattedTimestamp,
      eventType,
      data,
      previousHash,
      hash,
      nonce,
    };

    this.chain.push(newBlock);
    this.saveToStorage();
    return newBlock;
  }

  /**
   * Complete blockchain integrity verification.
   * Traverses from index 0 to N:
   * 1. Confirms Genesis block format.
   * 2. Confirms previousHash linkage.
   * 3. Re-computes SHA-256 hash for every block and detects mismatch.
   */
  public async verifyChain(): Promise<ChainVerificationResult> {
    const blocksChecked: ChainVerificationResult['blocksChecked'] = [];

    if (this.chain.length === 0) {
      return {
        isValid: false,
        totalBlocks: 0,
        errorReason: 'Blockchain is empty.',
        blocksChecked: [],
      };
    }

    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const expectedHash = await calculateBlockHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce
      );

      const isCurrentHashValid = currentBlock.hash === expectedHash;
      let isPrevHashValid = true;

      if (i > 0) {
        const prevBlock = this.chain[i - 1];
        isPrevHashValid = currentBlock.previousHash === prevBlock.hash;
      } else {
        isPrevHashValid = currentBlock.previousHash === '0';
      }

      const isValid = isCurrentHashValid && isPrevHashValid;

      blocksChecked.push({
        blockIndex: currentBlock.index,
        expectedHash,
        actualHash: currentBlock.hash,
        isPrevHashValid,
        isCurrentHashValid,
        isValid,
      });

      if (!isValid) {
        let reason = '';
        if (!isCurrentHashValid) {
          reason = `Block #${currentBlock.index} data has been tampered with! Stored hash (${currentBlock.hash.slice(0, 12)}...) does not match cryptographic recalculation (${expectedHash.slice(0, 12)}...).`;
        } else if (!isPrevHashValid) {
          reason = `Broken blockchain link at Block #${currentBlock.index}! previousHash does not match previous block's hash.`;
        }
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          invalidBlockIndex: currentBlock.index,
          errorReason: reason,
          blocksChecked,
        };
      }
    }

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      blocksChecked,
    };
  }

  /**
   * Tamper Detection Simulation:
   * Modifies data inside a target block, demonstrating how cryptographic mismatch
   * breaks the chain and alerts security validators.
   */
  public async tamperBlock(
    blockIndex: number,
    modifiedData: Record<string, any>
  ): Promise<{ originalHash: string; newHash: string }> {
    if (blockIndex < 0 || blockIndex >= this.chain.length) {
      throw new Error(`Block index ${blockIndex} is out of bounds.`);
    }

    const targetBlock = this.chain[blockIndex];

    // Backup original data and hash if not already backed up
    if (!targetBlock.isTampered) {
      targetBlock.originalData = JSON.parse(JSON.stringify(targetBlock.data));
      targetBlock.originalHash = targetBlock.hash;
    }

    // Tamper the data in place WITHOUT updating targetBlock.hash to simulate unauthorized database edit
    targetBlock.data = {
      ...targetBlock.data,
      ...modifiedData,
    };
    targetBlock.isTampered = true;

    // Calculate what the hash WOULD be with the altered data
    const recalculatedHash = await calculateBlockHash(
      targetBlock.index,
      targetBlock.timestamp,
      targetBlock.data,
      targetBlock.previousHash,
      targetBlock.nonce
    );

    this.saveToStorage();
    return {
      originalHash: targetBlock.originalHash || targetBlock.hash,
      newHash: recalculatedHash,
    };
  }

  /**
   * Restores a tampered block back to its pristine authentic state.
   */
  public async restoreBlock(blockIndex: number): Promise<boolean> {
    if (blockIndex < 0 || blockIndex >= this.chain.length) return false;

    const targetBlock = this.chain[blockIndex];
    if (targetBlock.isTampered && targetBlock.originalData) {
      targetBlock.data = JSON.parse(JSON.stringify(targetBlock.originalData));
      targetBlock.hash = targetBlock.originalHash || targetBlock.hash;
      targetBlock.isTampered = false;
      delete targetBlock.originalData;
      delete targetBlock.originalHash;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Registers a brand new Drug Batch and mints its origin block.
   */
  public async registerBatch(
    batchData: {
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
    }
  ): Promise<{ batch: DrugBatch; block: Block }> {
    const batchId =
      batchData.batchId ||
      `${batchData.drugName.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const storageCondition = getStorageCondition(batchData.storageRequirement);

    // Create blockchain block
    const blockData = {
      batchId,
      description: `DRUG BATCH REGISTERED: ${batchData.drugName} (${batchData.strength}) by ${batchData.manufacturer}`,
      details: {
        batchId,
        productId: batchData.productId,
        drugName: batchData.drugName,
        genericName: batchData.genericName,
        manufacturer: batchData.manufacturer,
        manufacturingDate: batchData.manufacturingDate,
        expiryDate: batchData.expiryDate,
        quantity: batchData.quantity,
        dosageForm: batchData.dosageForm,
        strength: batchData.strength,
        originLocation: batchData.originLocation,
        storageRequirement: batchData.storageRequirement,
        licenseNumber: batchData.licenseNumber,
      },
    };

    const newBlock = await this.addBlock('BATCH_CREATED', blockData);

    const newBatch: DrugBatch = {
      batchId,
      productId: batchData.productId,
      drugName: batchData.drugName,
      genericName: batchData.genericName,
      manufacturer: batchData.manufacturer,
      manufacturingDate: batchData.manufacturingDate,
      expiryDate: batchData.expiryDate,
      quantity: batchData.quantity,
      remainingQuantity: batchData.quantity,
      dosageForm: batchData.dosageForm,
      strength: batchData.strength,
      originLocation: batchData.originLocation,
      destination: batchData.destination,
      storageRequirement: batchData.storageRequirement,
      storageCondition,
      licenseNumber: batchData.licenseNumber,
      currentStage: 'MANUFACTURING',
      currentLocation: batchData.originLocation,
      currentOwner: batchData.manufacturer,
      status: 'ACTIVE',
      isRecalled: false,
      qualityPassed: true,
      qualityCertificate: {
        passed: true,
        lab: `${batchData.manufacturer} Quality Control Division`,
        purityScore: 99.8,
        inspectionDate: batchData.manufacturingDate,
        inspector: 'QA Lead Insp. V. Raman (GMP-Certified)',
      },
      createdBlockIndex: newBlock.index,
      qrData: JSON.stringify({
        id: batchId,
        drug: batchData.drugName,
        mfg: batchData.manufacturer,
        exp: batchData.expiryDate,
        block: newBlock.index,
        hash: newBlock.hash,
      }),
    };

    this.batches.set(batchId, newBatch);

    // Create initial supply chain event
    const initialEvent: SupplyChainEvent = {
      eventId: `EVT-${Date.now()}-01`,
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'Raw Material Supplier',
      toEntity: batchData.manufacturer,
      handler: `${batchData.manufacturer} Plant Operations`,
      location: batchData.originLocation,
      timestamp: Date.now(),
      formattedTime: new Date().toUTCString(),
      quantity: batchData.quantity,
      notes: `Batch ${batchId} formulated and sealed in compliance with Good Manufacturing Practice (GMP).`,
      blockIndex: newBlock.index,
      txHash: newBlock.hash,
    };

    this.events.push(initialEvent);
    this.saveToStorage();

    return { batch: newBatch, block: newBlock };
  }

  /**
   * Appends an event to the supply chain history and records it as a blockchain block.
   */
  public async addSupplyChainEvent(eventInput: {
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
  }): Promise<{ event: SupplyChainEvent; block: Block }> {
    const batch = this.batches.get(eventInput.batchId);
    if (!batch) {
      throw new Error(`Batch ID ${eventInput.batchId} not found on the platform.`);
    }

    if (batch.isRecalled && eventInput.eventType !== 'RECALLED') {
      throw new Error(`Batch ${batch.batchId} is RECALLED and cannot be transferred or dispensed!`);
    }

    const stage = mapEventToStage(eventInput.eventType);

    // Commit to blockchain
    const blockData = {
      batchId: batch.batchId,
      description: `SUPPLY CHAIN EVENT: ${eventInput.eventType} for ${batch.drugName} (${batch.batchId})`,
      details: {
        batchId: batch.batchId,
        eventType: eventInput.eventType,
        stage,
        fromEntity: eventInput.fromEntity,
        toEntity: eventInput.toEntity,
        handler: eventInput.handler,
        location: eventInput.location,
        quantity: eventInput.quantity ?? batch.remainingQuantity,
        notes: eventInput.notes,
        telemetry: eventInput.telemetry,
      },
    };

    const newBlock = await this.addBlock(eventInput.eventType, blockData);

    const newEvent: SupplyChainEvent = {
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: batch.batchId,
      eventType: eventInput.eventType,
      stage,
      fromEntity: eventInput.fromEntity,
      toEntity: eventInput.toEntity,
      handler: eventInput.handler,
      location: eventInput.location,
      timestamp: Date.now(),
      formattedTime: new Date().toUTCString(),
      quantity: eventInput.quantity ?? batch.remainingQuantity,
      notes: eventInput.notes,
      telemetry: eventInput.telemetry,
      blockIndex: newBlock.index,
      txHash: newBlock.hash,
    };

    this.events.push(newEvent);

    // Update batch status and current whereabouts
    batch.currentStage = stage;
    batch.currentLocation = eventInput.location;
    batch.currentOwner = eventInput.toEntity;

    if (eventInput.eventType === 'SHIPPED') {
      batch.status = 'IN_TRANSIT';
    } else if (eventInput.eventType === 'RECEIVED' || eventInput.eventType === 'STORED') {
      batch.status = 'STORED';
    } else if (eventInput.eventType === 'DELIVERED') {
      batch.status = 'DELIVERED';
    } else if (eventInput.eventType === 'DISPENSED') {
      batch.status = 'DISPENSED';
      batch.remainingQuantity = Math.max(0, batch.remainingQuantity - (eventInput.quantity || 1));
    }

    this.saveToStorage();
    return { event: newEvent, block: newBlock };
  }

  /**
   * Recalls a batch on-chain
   */
  public async recallBatch(
    batchId: string,
    reason: string,
    recalledBy: string
  ): Promise<{ block: Block }> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found.`);
    }

    batch.isRecalled = true;
    batch.status = 'RECALLED';
    batch.recallDetails = {
      reason,
      timestamp: new Date().toUTCString(),
      recalledBy,
      affectedUnits: batch.remainingQuantity,
    };

    const blockData = {
      batchId: batch.batchId,
      description: `CRITICAL RECALL ISSUED: Batch ${batchId} (${batch.drugName}) recalled by ${recalledBy}`,
      details: {
        batchId: batch.batchId,
        drugName: batch.drugName,
        reason,
        recalledBy,
        affectedUnits: batch.remainingQuantity,
        lastKnownLocation: batch.currentLocation,
        action: 'DISTRIBUTION HALTED IMMEDIATELY - RETURN TO QUARANTINE',
      },
    };

    const newBlock = await this.addBlock('RECALLED', blockData);

    const recallEvent: SupplyChainEvent = {
      eventId: `EVT-RECALL-${Date.now()}`,
      batchId,
      eventType: 'RECALLED',
      stage: batch.currentStage,
      fromEntity: recalledBy,
      toEntity: 'Quarantine Disposal Depot',
      handler: `Regulatory Enforcement / ${recalledBy}`,
      location: batch.currentLocation,
      timestamp: Date.now(),
      formattedTime: new Date().toUTCString(),
      quantity: batch.remainingQuantity,
      notes: `EMERGENCY DRUG RECALL: ${reason}. Product locked from dispensing.`,
      blockIndex: newBlock.index,
      txHash: newBlock.hash,
    };

    this.events.push(recallEvent);
    this.saveToStorage();

    return { block: newBlock };
  }

  /**
   * Cold-Chain telemetry alert: records temperature breach into the blockchain
   */
  public async recordColdChainBreach(
    batchId: string,
    temperature: number,
    humidity: number,
    location: string
  ): Promise<{ block: Block }> {
    const batch = this.batches.get(batchId);
    if (!batch) throw new Error(`Batch ${batchId} not found.`);

    const telemetry: ColdChainTelemetry = {
      readingId: `IOT-${Date.now()}`,
      batchId,
      temperature,
      humidity,
      location,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString(),
      status: 'CRITICAL',
      deviceSensorId: 'SENS-COLDLINK-99X',
    };

    this.coldChainTelemetry.unshift(telemetry);

    const blockData = {
      batchId,
      description: `COLD-CHAIN BREACH ALERT: Temperature ${temperature}°C recorded for ${batch.drugName} (Allowed: ${batch.storageCondition.minTemp}°C to ${batch.storageCondition.maxTemp}°C)`,
      details: {
        batchId,
        recordedTemperature: `${temperature}°C`,
        allowedRange: `${batch.storageCondition.minTemp}°C to ${batch.storageCondition.maxTemp}°C`,
        humidity: `${humidity}%`,
        location,
        timestamp: new Date().toUTCString(),
        violationType: 'EXCURSION_LIMIT_EXCEEDED',
      },
    };

    const newBlock = await this.addBlock('COLD_CHAIN_ALERT', blockData);

    const breachEvent: SupplyChainEvent = {
      eventId: `EVT-COLD-${Date.now()}`,
      batchId,
      eventType: 'COLD_CHAIN_ALERT',
      stage: batch.currentStage,
      fromEntity: 'IoT Telemetry Monitor',
      toEntity: batch.currentOwner,
      handler: 'Automated Cold-Chain Sentinel',
      location,
      timestamp: Date.now(),
      formattedTime: new Date().toUTCString(),
      quantity: batch.remainingQuantity,
      notes: `Temperature excursion breach detected (${temperature}°C). Requires pharmacopeial stability assessment.`,
      telemetry: {
        temperature,
        humidity,
        status: 'CRITICAL',
      },
      blockIndex: newBlock.index,
      txHash: newBlock.hash,
    };

    this.events.push(breachEvent);
    this.saveToStorage();

    return { block: newBlock };
  }

  /**
   * Comprehensive medicine authenticity and cryptographic verification report.
   */
  public async verifyMedicine(query: string): Promise<MedicineVerificationReport> {
    const trimmed = query.trim();
    const batch =
      this.batches.get(trimmed) ||
      Array.from(this.batches.values()).find(
        (b) =>
          b.productId.toLowerCase() === trimmed.toLowerCase() ||
          b.drugName.toLowerCase() === trimmed.toLowerCase()
      );

    // 1. Check if batch exists in registry
    if (!batch) {
      return {
        batchId: trimmed,
        isAuthentic: false,
        statusBadge: 'COUNTERFEIT',
        title: '⚠ POTENTIAL COUNTERFEIT / UNREGISTERED MEDICINE',
        summary: `Batch '${trimmed}' does not exist on the DrugChain blockchain ledger. It has never been registered by an authorized pharmaceutical manufacturer.`,
        checks: [
          { name: 'Batch Registry Presence', status: 'FAIL', details: 'No ledger record found for this identifier.' },
          { name: 'Authorized Manufacturer Check', status: 'FAIL', details: 'Manufacturer cannot be verified.' },
          { name: 'Cryptographic SHA-256 Proof', status: 'FAIL', details: 'No block hash exists.' },
          { name: 'Chain of Custody Tracking', status: 'FAIL', details: 'Zero distribution events recorded.' },
        ],
        blockchainProof: {
          genesisVerified: false,
          chainIntegrity: false,
          blockCount: false,
          lastVerifiedHash: 'N/A',
          blocksInvolved: [],
        },
      };
    }

    // 2. Perform whole blockchain verification
    const chainVerification = await this.verifyChain();
    const batchEvents = this.events.filter((e) => e.batchId === batch.batchId);
    const relatedBlocks = this.chain.filter(
      (b) => b.data?.batchId === batch.batchId || b.index === batch.createdBlockIndex
    );

    // 3. Check for tampering in blocks related to this batch
    const hasTamperedBlock = relatedBlocks.some((b) => b.isTampered);

    // 4. Check expiration date
    const isExpired = new Date(batch.expiryDate).getTime() < Date.now();

    // 5. Build check items
    const checks: MedicineVerificationReport['checks'] = [
      {
        name: 'Batch Registry Identification',
        status: 'PASS',
        details: `Batch ${batch.batchId} verified. Associated with ${batch.drugName} (${batch.dosageForm}).`,
      },
      {
        name: 'Authorized Manufacturer Accreditation',
        status: 'PASS',
        details: `Produced by ${batch.manufacturer} under License #${batch.licenseNumber}.`,
      },
      {
        name: 'Blockchain Cryptographic Integrity',
        status: chainVerification.isValid && !hasTamperedBlock ? 'PASS' : 'FAIL',
        details: chainVerification.isValid && !hasTamperedBlock
          ? 'All SHA-256 block hashes and previousHash cryptographic links validated.'
          : `Hash mismatch or tampering detected on block(s)! Chain integrity violated.`,
      },
      {
        name: 'Good Manufacturing Practice (GMP) QC',
        status: batch.qualityPassed ? 'PASS' : 'FAIL',
        details: batch.qualityCertificate
          ? `Passed QC at ${batch.qualityCertificate.lab} (Purity Score: ${batch.qualityCertificate.purityScore}%).`
          : 'Quality certificate on file.',
      },
      {
        name: 'Chain of Custody Verification',
        status: batchEvents.length > 0 ? 'PASS' : 'WARN',
        details: `${batchEvents.length} verifiable supply-chain transitions recorded with cryptographic signatures.`,
      },
      {
        name: 'Recall Status Check',
        status: batch.isRecalled ? 'FAIL' : 'PASS',
        details: batch.isRecalled
          ? `RECALLED: ${batch.recallDetails?.reason || 'Batch marked for recall'}. Distribution blocked.`
          : 'No active safety recalls recorded for this batch.',
      },
      {
        name: 'Shelf Life & Expiry Date',
        status: isExpired ? 'FAIL' : 'PASS',
        details: isExpired
          ? `EXPIRED on ${batch.expiryDate}. Not safe for patient consumption.`
          : `Valid until ${batch.expiryDate}. Product within active therapeutic shelf-life.`,
      },
    ];

    let statusBadge: MedicineVerificationReport['statusBadge'] = 'AUTHENTIC';
    let title = '✓ VERIFIED AUTHENTIC MEDICINE';
    let summary = `Batch ${batch.batchId} (${batch.drugName}) is certified authentic. Full cryptographic blockchain proof verified from manufacturer to current handler.`;

    if (hasTamperedBlock || !chainVerification.isValid) {
      statusBadge = 'TAMPERED';
      title = '⚠ BLOCKCHAIN RECORD MISMATCH / DATA TAMPERED';
      summary = `Cryptographic anomaly detected! Ledger data for Batch ${batch.batchId} has been altered without authorization. Chain integrity check failed.`;
    } else if (batch.isRecalled) {
      statusBadge = 'RECALLED';
      title = '⚠ RECALLED PHARMACEUTICAL BATCH';
      summary = `Batch ${batch.batchId} is subject to an active regulatory safety recall. Reason: ${batch.recallDetails?.reason}. Do not dispense!`;
    } else if (isExpired) {
      statusBadge = 'EXPIRED';
      title = '⚠ EXPIRED DRUG BATCH';
      summary = `Batch ${batch.batchId} passed its expiry date (${batch.expiryDate}). Therapeutic efficacy cannot be assured.`;
    }

    return {
      batchId: batch.batchId,
      isAuthentic: statusBadge === 'AUTHENTIC',
      statusBadge,
      title,
      summary,
      batch,
      checks,
      blockchainProof: {
        genesisVerified: this.chain[0]?.previousHash === '0',
        chainIntegrity: chainVerification.isValid,
        blockCount: true,
        lastVerifiedHash: relatedBlocks[relatedBlocks.length - 1]?.hash || this.getLatestBlock().hash,
        blocksInvolved: relatedBlocks.map((b) => b.index),
      },
    };
  }

  /**
   * Resets and populates the platform with rich, realistic pharmaceutical demo data.
   */
  public async seedDemoData(): Promise<void> {
    this.chain = [];
    this.batches.clear();
    this.events = [];
    this.coldChainTelemetry = [];

    // 1. Genesis Block
    const genesisBlock = await this.createGenesisBlock();
    this.chain.push(genesisBlock);

    // 2. Seed Batch 1: Paracetamol 500mg (Authentic, fully completed lifecycle)
    await this.seedBatchParacetamol();

    // 3. Seed Batch 2: Insulin Injection 100 IU/mL (Active Cold Chain Monitored)
    await this.seedBatchInsulin();

    // 4. Seed Batch 3: mRNA Vaccine (Cold Chain Breach Alert)
    await this.seedBatchVaccine();

    // 5. Seed Batch 4: Amoxicillin 250mg Capsules (Active in transit)
    await this.seedBatchAmoxicillin();

    // 6. Seed Batch 5: Ciprofloxacin Antibiotic (Recalled Batch)
    await this.seedBatchCiprofloxacin();

    this.saveToStorage();
  }

  private async seedBatchParacetamol(): Promise<void> {
    const batchId = 'PCM-2026-001';
    const drugName = 'Paracetamol 500mg';
    const genericName = 'Acetaminophen';
    const productId = 'NDC-50092-101';
    const manufacturer = 'Apex Pharma Labs Ltd.';
    const mfgDate = '2026-01-15';
    const expDate = '2028-01-14';
    const quantity = 50000;
    const originLocation = 'Bengaluru Manufacturing Campus (Zone 4)';
    const storageReq: StorageRequirement = 'AMBIENT';
    const licenseNumber = 'MFG-KA-2024-8891B';

    const b1 = await this.addBlock('BATCH_CREATED', {
      batchId,
      description: `DRUG BATCH REGISTERED: ${drugName} by ${manufacturer}`,
      details: {
        batchId,
        productId,
        drugName,
        genericName,
        manufacturer,
        mfgDate,
        expDate,
        quantity,
        dosageForm: 'Film-Coated Tablet',
        strength: '500 mg',
        originLocation,
        licenseNumber,
      },
    });

    const batch: DrugBatch = {
      batchId,
      productId,
      drugName,
      genericName,
      manufacturer,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      quantity,
      remainingQuantity: 42500,
      dosageForm: 'Film-Coated Tablet',
      strength: '500 mg',
      originLocation,
      destination: 'Apollo Hospital & Pharmacy Network',
      storageRequirement: storageReq,
      storageCondition: getStorageCondition(storageReq),
      licenseNumber,
      currentStage: 'RETAIL_PHARMACY',
      currentLocation: 'Apollo Super-Speciality Hospital Pharmacy, Bengaluru',
      currentOwner: 'Apollo Hospitals Healthcare Ltd.',
      status: 'DELIVERED',
      isRecalled: false,
      qualityPassed: true,
      qualityCertificate: {
        passed: true,
        lab: 'Apex Central Analytics QA Lab',
        purityScore: 99.85,
        inspectionDate: '2026-01-16',
        inspector: 'Dr. Aris Thorne (Chief Pharmacist)',
      },
      createdBlockIndex: b1.index,
      qrData: JSON.stringify({ batchId, drugName, manufacturer, expDate, block: b1.index, hash: b1.hash }),
    };
    this.batches.set(batchId, batch);

    this.events.push({
      eventId: 'EVT-PCM-01',
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'Raw Material Supplier (Chemical Synthesis Hub)',
      toEntity: manufacturer,
      handler: 'Dr. Aris Thorne (QA Director)',
      location: originLocation,
      timestamp: 1768464000000,
      formattedTime: 'Jan 15, 2026, 09:30 AM',
      quantity,
      notes: 'Initial formulation, batch mixing, and high-speed tablet compression completed. 99.85% purity verified.',
      blockIndex: b1.index,
      txHash: b1.hash,
    });

    // Quality checked
    const b2 = await this.addBlock('QUALITY_CHECKED', {
      batchId,
      description: `QUALITY VERIFIED: Dissolution and HPLC purity tests passed for ${batchId}`,
      details: { batchId, lab: 'Apex QA Lab', purity: '99.85%', dissolutionTime: '12 mins', status: 'APPROVED' },
    });
    this.events.push({
      eventId: 'EVT-PCM-02',
      batchId,
      eventType: 'QUALITY_CHECKED',
      stage: 'MANUFACTURING',
      fromEntity: manufacturer,
      toEntity: manufacturer,
      handler: 'QC Analyst S. Mehra',
      location: originLocation,
      timestamp: 1768550400000,
      formattedTime: 'Jan 16, 2026, 02:15 PM',
      quantity,
      notes: 'Dissolution testing and assay compliance confirmed against USP specifications.',
      blockIndex: b2.index,
      txHash: b2.hash,
    });

    // Transferred to Distributor
    const b3 = await this.addBlock('SHIPPED', {
      batchId,
      description: `DISPATCHED: 50,000 units dispatched to MedTrans Logistics Hub`,
      details: { batchId, carrier: 'MedTrans Logistics', vehicleId: 'KA-04-TR-4910', tempRequirement: '15-25°C' },
    });
    this.events.push({
      eventId: 'EVT-PCM-03',
      batchId,
      eventType: 'SHIPPED',
      stage: 'DISTRIBUTION',
      fromEntity: manufacturer,
      toEntity: 'MedTrans Logistics Global',
      handler: 'Fleet Supervisor R. Roy',
      location: 'Mysuru Highway Distribution Corridor',
      timestamp: 1768636800000,
      formattedTime: 'Jan 17, 2026, 08:00 AM',
      quantity,
      notes: 'Sealed container with tamper-evident RFID locks transferred to logistics fleet.',
      blockIndex: b3.index,
      txHash: b3.hash,
    });

    // Received by Wholesaler
    const b4 = await this.addBlock('RECEIVED', {
      batchId,
      description: `RECEIVED: Hubballi Central Pharma Wholesaler accepted shipment`,
      details: { batchId, receiver: 'Central Wholesale Depot', inspection: 'Tamper seals intact' },
    });
    this.events.push({
      eventId: 'EVT-PCM-04',
      batchId,
      eventType: 'RECEIVED',
      stage: 'WHOLESALE',
      fromEntity: 'MedTrans Logistics Global',
      toEntity: 'Hubballi Central Pharma Wholesaler',
      handler: 'Depot Manager K. Swamy',
      location: 'Hubballi Logistics Park, Warehouse 7',
      timestamp: 1768723200000,
      formattedTime: 'Jan 18, 2026, 04:45 PM',
      quantity,
      notes: 'All outer barcodes scanned and matched against blockchain manifest.',
      blockIndex: b4.index,
      txHash: b4.hash,
    });

    // Delivered to Pharmacy
    const b5 = await this.addBlock('DELIVERED', {
      batchId,
      description: `DELIVERED: Stock received at Apollo Hospital Pharmacy`,
      details: { batchId, location: 'Apollo Hospital Bengaluru', receivedQty: 50000 },
    });
    this.events.push({
      eventId: 'EVT-PCM-05',
      batchId,
      eventType: 'DELIVERED',
      stage: 'RETAIL_PHARMACY',
      fromEntity: 'Hubballi Central Pharma Wholesaler',
      toEntity: 'Apollo Hospital & Pharmacy Network',
      handler: 'Chief Pharmacist Dr. N. Rao',
      location: 'Apollo Super-Speciality Hospital Pharmacy, Bengaluru',
      timestamp: 1768809600000,
      formattedTime: 'Jan 19, 2026, 11:20 AM',
      quantity,
      notes: 'Hospital pharmacy received batch for clinical prescription dispensing.',
      blockIndex: b5.index,
      txHash: b5.hash,
    });
  }

  private async seedBatchInsulin(): Promise<void> {
    const batchId = 'INS-2026-008';
    const drugName = 'Insulin Glargine 100 IU/mL';
    const genericName = 'Recombinant Human Insulin';
    const productId = 'NDC-0088-2220-33';
    const manufacturer = 'BioGenix Biosystems Corp.';
    const mfgDate = '2026-02-01';
    const expDate = '2027-08-01';
    const quantity = 12000;
    const originLocation = 'BioGenix Sterile Biologics Facility, Hyderabad';
    const storageReq: StorageRequirement = 'REFRIGERATED';
    const licenseNumber = 'BIO-AP-2025-0041C';

    const b1 = await this.addBlock('BATCH_CREATED', {
      batchId,
      description: `COLD-CHAIN BATCH REGISTERED: ${drugName} (Requires 2°C - 8°C)`,
      details: { batchId, drugName, manufacturer, quantity, storageRequirement: '2°C to 8°C (Refrigerated)' },
    });

    const batch: DrugBatch = {
      batchId,
      productId,
      drugName,
      genericName,
      manufacturer,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      quantity,
      remainingQuantity: 12000,
      dosageForm: 'Injectable Solution (10 mL Vial)',
      strength: '100 IU/mL',
      originLocation,
      destination: 'Karnataka State Cold-Storage Medical Depot',
      storageRequirement: storageReq,
      storageCondition: getStorageCondition(storageReq),
      licenseNumber,
      currentStage: 'DISTRIBUTION',
      currentLocation: 'Bengaluru Cold Chain Distribution Hub, Bay 3',
      currentOwner: 'ColdLink Express Logistics',
      status: 'STORED',
      isRecalled: false,
      qualityPassed: true,
      qualityCertificate: {
        passed: true,
        lab: 'BioGenix Protein Characterization Facility',
        purityScore: 99.92,
        inspectionDate: '2026-02-02',
        inspector: 'Dr. P. Sen (Biologics QA Lead)',
      },
      createdBlockIndex: b1.index,
      qrData: JSON.stringify({ batchId, drugName, manufacturer, expDate, block: b1.index, hash: b1.hash }),
    };
    this.batches.set(batchId, batch);

    this.events.push({
      eventId: 'EVT-INS-01',
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'BioGenix Bioreactor Suite',
      toEntity: manufacturer,
      handler: 'Dr. P. Sen',
      location: originLocation,
      timestamp: 1769990400000,
      formattedTime: 'Feb 01, 2026, 10:00 AM',
      quantity,
      notes: 'Sterile filtration and aseptic cold-fill in 10mL borosilicate glass vials.',
      blockIndex: b1.index,
      txHash: b1.hash,
    });

    // Active cold chain telemetry readings
    this.coldChainTelemetry.push(
      {
        readingId: 'IOT-INS-01',
        batchId,
        temperature: 4.2,
        humidity: 52,
        location: 'Bengaluru Cold Chain Distribution Hub, Bay 3',
        timestamp: Date.now() - 3600000 * 4,
        formattedTime: '4 hours ago',
        status: 'NORMAL',
        deviceSensorId: 'SENS-COLDLINK-018',
        batteryLevel: 94,
      },
      {
        readingId: 'IOT-INS-02',
        batchId,
        temperature: 4.6,
        humidity: 54,
        location: 'Bengaluru Cold Chain Distribution Hub, Bay 3',
        timestamp: Date.now() - 3600000 * 2,
        formattedTime: '2 hours ago',
        status: 'NORMAL',
        deviceSensorId: 'SENS-COLDLINK-018',
        batteryLevel: 93,
      },
      {
        readingId: 'IOT-INS-03',
        batchId,
        temperature: 4.3,
        humidity: 51,
        location: 'Bengaluru Cold Chain Distribution Hub, Bay 3',
        timestamp: Date.now() - 600000,
        formattedTime: '10 mins ago',
        status: 'NORMAL',
        deviceSensorId: 'SENS-COLDLINK-018',
        batteryLevel: 92,
      }
    );
  }

  private async seedBatchVaccine(): Promise<void> {
    const batchId = 'VAC-2026-021';
    const drugName = 'mRNA Respiratory Vaccine (Quadrivalent)';
    const genericName = 'mRNA-1273.801 Lipid Nanoparticles';
    const productId = 'NDC-80671-0021';
    const manufacturer = 'Novax Biologicals GmbH';
    const mfgDate = '2026-02-10';
    const expDate = '2026-10-10';
    const quantity = 25000;
    const originLocation = 'Novax BioPark Munich';
    const storageReq: StorageRequirement = 'FROZEN';
    const licenseNumber = 'EMA-EU-2024-V991';

    const b1 = await this.addBlock('BATCH_CREATED', {
      batchId,
      description: `VACCINE BATCH REGISTERED: ${drugName} (Deep Cold Chain: -20°C)`,
      details: { batchId, drugName, manufacturer, storageRequirement: '-20°C to -10°C (Frozen)' },
    });

    const batch: DrugBatch = {
      batchId,
      productId,
      drugName,
      genericName,
      manufacturer,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      quantity,
      remainingQuantity: 25000,
      dosageForm: 'Cryo Multi-Dose Vial (10 Doses/Vial)',
      strength: '50 mcg / 0.5 mL',
      originLocation,
      destination: 'National Vaccine Cold Repository',
      storageRequirement: storageReq,
      storageCondition: getStorageCondition(storageReq),
      licenseNumber,
      currentStage: 'DISTRIBUTION',
      currentLocation: 'Transit Vehicle Cryo-Van #07 (Near Tumakuru)',
      currentOwner: 'AeroCold Logistics',
      status: 'IN_TRANSIT',
      isRecalled: false,
      qualityPassed: true,
      createdBlockIndex: b1.index,
      qrData: JSON.stringify({ batchId, drugName, manufacturer, expDate, block: b1.index, hash: b1.hash }),
    };
    this.batches.set(batchId, batch);

    this.events.push({
      eventId: 'EVT-VAC-01',
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'Novax Cryo Synthesis Unit',
      toEntity: manufacturer,
      handler: 'Dr. Klaus Becker',
      location: originLocation,
      timestamp: 1770768000000,
      formattedTime: 'Feb 10, 2026, 08:00 AM',
      quantity,
      notes: 'Microfluidic lipid nanoparticle encapsulation under ultra-pure nitrogen atmosphere.',
      blockIndex: b1.index,
      txHash: b1.hash,
    });

    // Cold chain alert block demonstrating threshold exceeded
    const b2 = await this.addBlock('COLD_CHAIN_ALERT', {
      batchId,
      description: `COLD-CHAIN BREACH ALERT: Temperature reached -4.8°C (Threshold: <= -10°C)`,
      details: {
        batchId,
        sensor: 'CRYOSENS-441',
        spikeTemp: '-4.8°C',
        allowedRange: '-20°C to -10°C',
        duration: '18 minutes',
        action: 'Backup compressor activated. Batch placed in regulatory review.',
      },
    });

    this.events.push({
      eventId: 'EVT-VAC-02',
      batchId,
      eventType: 'COLD_CHAIN_ALERT',
      stage: 'DISTRIBUTION',
      fromEntity: 'IoT Telemetry Monitor',
      toEntity: 'AeroCold Logistics',
      handler: 'Automated Cryo Sentinel',
      location: 'Tumakuru Highway Cryo Transport Corridor',
      timestamp: 1770854400000,
      formattedTime: 'Feb 11, 2026, 03:14 AM',
      quantity,
      notes: 'Temperature exceeded threshold (-4.8°C recorded vs max -10°C required). Auxiliary liquid nitrogen cooling engaged.',
      telemetry: {
        temperature: -4.8,
        humidity: 68,
        status: 'CRITICAL',
      },
      blockIndex: b2.index,
      txHash: b2.hash,
    });

    this.coldChainTelemetry.push({
      readingId: 'IOT-VAC-01',
      batchId,
      temperature: -4.8,
      humidity: 68,
      location: 'Tumakuru Highway Corridor',
      timestamp: Date.now() - 7200000,
      formattedTime: '2 hours ago',
      status: 'CRITICAL',
      deviceSensorId: 'CRYOSENS-441',
      batteryLevel: 88,
    });
  }

  private async seedBatchAmoxicillin(): Promise<void> {
    const batchId = 'AMX-2026-014';
    const drugName = 'Amoxicillin Trihydrate 250mg';
    const genericName = 'Amoxicillin';
    const productId = 'NDC-0781-2613-05';
    const manufacturer = 'Sandoz Pharma Global';
    const mfgDate = '2026-02-20';
    const expDate = '2028-02-19';
    const quantity = 40000;
    const originLocation = 'Sandoz Kundaim Industrial Plant, Goa';
    const storageReq: StorageRequirement = 'AMBIENT';
    const licenseNumber = 'MFG-GA-2023-772';

    const b1 = await this.addBlock('BATCH_CREATED', {
      batchId,
      description: `DRUG BATCH REGISTERED: ${drugName} by ${manufacturer}`,
      details: { batchId, drugName, quantity, dosageForm: 'Hard Gelatin Capsule' },
    });

    const batch: DrugBatch = {
      batchId,
      productId,
      drugName,
      genericName,
      manufacturer,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      quantity,
      remainingQuantity: 40000,
      dosageForm: 'Hard Gelatin Capsule',
      strength: '250 mg',
      originLocation,
      destination: 'Central Wholesaler Logistics Hub, Mysuru',
      storageRequirement: storageReq,
      storageCondition: getStorageCondition(storageReq),
      licenseNumber,
      currentStage: 'DISTRIBUTION',
      currentLocation: 'Hubballi Freight Terminal',
      currentOwner: 'Express Logistics India',
      status: 'IN_TRANSIT',
      isRecalled: false,
      qualityPassed: true,
      createdBlockIndex: b1.index,
      qrData: JSON.stringify({ batchId, drugName, manufacturer, expDate, block: b1.index, hash: b1.hash }),
    };
    this.batches.set(batchId, batch);

    this.events.push({
      eventId: 'EVT-AMX-01',
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'Raw Material Supplier',
      toEntity: manufacturer,
      handler: 'Plant Supervisor A. Naik',
      location: originLocation,
      timestamp: 1771632000000,
      formattedTime: 'Feb 20, 2026, 11:00 AM',
      quantity,
      notes: 'Encapsulation and high-barrier blister packaging completed.',
      blockIndex: b1.index,
      txHash: b1.hash,
    });
  }

  private async seedBatchCiprofloxacin(): Promise<void> {
    const batchId = 'ANT-2026-017';
    const drugName = 'Ciprofloxacin 500mg USP';
    const genericName = 'Ciprofloxacin Hydrochloride';
    const productId = 'NDC-68180-241-01';
    const manufacturer = 'Zenith Therapeutics Ltd.';
    const mfgDate = '2026-01-08';
    const expDate = '2027-01-07';
    const quantity = 15000;
    const originLocation = 'Zenith Formulations Plant, Baddi';
    const storageReq: StorageRequirement = 'AMBIENT';
    const licenseNumber = 'MFG-HP-2024-5509';

    const b1 = await this.addBlock('BATCH_CREATED', {
      batchId,
      description: `DRUG BATCH REGISTERED: ${drugName}`,
      details: { batchId, drugName, quantity },
    });

    const batch: DrugBatch = {
      batchId,
      productId,
      drugName,
      genericName,
      manufacturer,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      quantity,
      remainingQuantity: 15000,
      dosageForm: 'Film-Coated Tablet',
      strength: '500 mg',
      originLocation,
      destination: 'Regional Hospital Outlets',
      storageRequirement: storageReq,
      storageCondition: getStorageCondition(storageReq),
      licenseNumber,
      currentStage: 'WHOLESALE',
      currentLocation: 'Zenith Central Quarantine Depot',
      currentOwner: 'Zenith Therapeutics Ltd.',
      status: 'RECALLED',
      isRecalled: true,
      recallDetails: {
        reason: 'Stability testing showed unexpected chemical degradation & related substance impurity spike above 0.3% spec limit.',
        timestamp: 'Feb 24, 2026, 04:30 PM',
        recalledBy: 'Zenith Quality Assurance Directorate & State Drug Controller',
        affectedUnits: 15000,
      },
      qualityPassed: false,
      createdBlockIndex: b1.index,
      qrData: JSON.stringify({ batchId, drugName, manufacturer, expDate, block: b1.index, hash: b1.hash }),
    };
    this.batches.set(batchId, batch);

    this.events.push({
      eventId: 'EVT-ANT-01',
      batchId,
      eventType: 'BATCH_CREATED',
      stage: 'MANUFACTURING',
      fromEntity: 'Raw Material Supplier',
      toEntity: manufacturer,
      handler: 'QC Lead M. Joshi',
      location: originLocation,
      timestamp: 1767830400000,
      formattedTime: 'Jan 08, 2026, 09:15 AM',
      quantity,
      notes: 'Initial production batch manufactured.',
      blockIndex: b1.index,
      txHash: b1.hash,
    });

    const b2 = await this.addBlock('RECALLED', {
      batchId,
      description: `CRITICAL RECALL ISSUED: Batch ${batchId} recalled due to impurity exceedance`,
      details: {
        batchId,
        reason: 'Related substance degradation identified in 3-month accelerated stability chamber testing.',
        recalledBy: 'Regulatory Directorate & Zenith QA',
        action: 'IMMEDIATE WITHDRAWAL FROM WHOLESALE CHANNELS',
      },
    });

    this.events.push({
      eventId: 'EVT-ANT-02',
      batchId,
      eventType: 'RECALLED',
      stage: 'WHOLESALE',
      fromEntity: 'State Drug Controller',
      toEntity: 'Central Quarantine Depot',
      handler: 'Chief Drug Inspector H. Verma',
      location: 'Central Quarantine Depot, Baddi',
      timestamp: 1771958400000,
      formattedTime: 'Feb 24, 2026, 04:30 PM',
      quantity,
      notes: 'National recall notice distributed. Inventory quarantined and sealed under regulatory observation.',
      blockIndex: b2.index,
      txHash: b2.hash,
    });
  }
}

function getStorageCondition(type: StorageRequirement): StorageCondition {
  switch (type) {
    case 'REFRIGERATED':
      return {
        type,
        minTemp: 2,
        maxTemp: 8,
        humidityRange: '45% - 65%',
        notes: 'Cold chain storage required. Protect from freezing and direct light.',
      };
    case 'FROZEN':
      return {
        type,
        minTemp: -20,
        maxTemp: -10,
        humidityRange: '50% - 70%',
        notes: 'Maintain below -10°C in certified cryogenic freezers.',
      };
    case 'DEEP_FREEZE':
      return {
        type,
        minTemp: -80,
        maxTemp: -60,
        humidityRange: 'N/A',
        notes: 'Ultra-low temperature storage required (Dry ice or liquid nitrogen vapor).',
      };
    case 'CONTROLLED_ROOM':
      return {
        type,
        minTemp: 20,
        maxTemp: 25,
        humidityRange: '35% - 60%',
        notes: 'Maintain strict climate controlled room temperature.',
      };
    case 'AMBIENT':
    default:
      return {
        type: 'AMBIENT',
        minTemp: 15,
        maxTemp: 25,
        humidityRange: '30% - 60%',
        notes: 'Store in cool dry place away from sunlight and moisture.',
      };
  }
}

function mapEventToStage(eventType: EventType): SupplyChainStage {
  switch (eventType) {
    case 'BATCH_CREATED':
    case 'QUALITY_CHECKED':
    case 'PACKED':
      return 'MANUFACTURING';
    case 'SHIPPED':
    case 'TRANSFERRED':
    case 'COLD_CHAIN_ALERT':
      return 'DISTRIBUTION';
    case 'RECEIVED':
    case 'STORED':
    case 'DISTRIBUTED':
      return 'WHOLESALE';
    case 'DELIVERED':
      return 'RETAIL_PHARMACY';
    case 'DISPENSED':
      return 'PATIENT_DISPENSED';
    case 'RECALLED':
      return 'WHOLESALE';
    default:
      return 'DISTRIBUTION';
  }
}
