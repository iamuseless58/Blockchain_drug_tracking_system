# DRUGCHAIN – Blockchain Drug Supply Chain Monitoring & Verification Platform

**DRUGCHAIN** is an enterprise-grade pharmaceutical supply chain monitoring, provenance tracking, and cryptographic verification web platform. It leverages **SHA-256 blockchain technology** via the native Web Crypto API to ensure complete transparency, tamper resistance, and verifiable traceability across the entire drug distribution lifecycle.

---

## 🚀 Key Modules & Capabilities

### 1. 🔗 Deterministic SHA-256 Blockchain Engine
- **Genesis Block (#0)**: Initialized with `previousHash: "0"` and pharmaceutical ledger protocol specifications.
- **Cryptographic Chaining**: Every batch creation, custody transfer, QC test, and cold-chain incident generates an immutable block linked by previous hash.
- **Native Web Crypto API**: Uses client-side browser Web Crypto API for deterministic SHA-256 computation (no external paid APIs).
- **Ledger Verification**: Traverses block #0 through #N to guarantee all hashes and linkages remain intact.

### 2. 🛡️ Tamper Detection Security Lab
- Interactive sandbox allowing users to select any blockchain block and click **"Simulate Data Tampering"**.
- Modifies transaction payloads (e.g., altered batch quantity or counterfeit manufacturer).
- Immediately detects SHA-256 hash mismatches, triggers high-priority alerts, and highlights subsequent broken links across the chain.
- **"Restore Original Data"** restores authentic records, re-verifies the hash chain, and returns the ledger to a verified state.

### 3. 📦 Drug Batch Registration
- Mint new drug batches with complete pharmaceutical parameters:
  - Brand Name, Generic Name (API), Unique Batch ID generator, Product NDC/GTIN.
  - Manufacturer details, GMP License, Manufacturing Date, Expiration Date.
  - Therapeutic Strength, Dosage Form, Batch Units, Origin Facility, Destination.
  - Storage Requirements (Ambient 15°C–25°C, Refrigerated 2°C–8°C, Frozen -20°C, Deep Freeze -70°C).
- Deterministic block mining and instant cryptographic proof generation.

### 4. 🚚 Multi-Stage Supply Chain Provenance & Route Tracking
- Tracks medicines through the complete chain of custody:
  $$\text{Raw Material Supplier} \longrightarrow \text{Manufacturer} \longrightarrow \text{Distributor} \longrightarrow \text{Wholesaler} \longrightarrow \text{Pharmacy / Hospital} \longrightarrow \text{Patient}$$
- Interactive route visualization across logistics hubs with stage inspection and animated custody progression.
- Timeline records with handler signatures, GPS facility coordinates, timestamps, transaction hashes, and block numbers.

### 5. 🔍 Medicine Authenticity Verification
- **8-Point Regulatory & Cryptographic Inspection**:
  1. Batch registry presence
  2. Authorized manufacturer accreditation
  3. SHA-256 cryptographic hash integrity
  4. Previous-hash linkage validation
  5. Good Manufacturing Practice (GMP) quality certificate
  6. Verified chain-of-custody event sequence
  7. Active recall status check
  8. Shelf-life and expiration date validation
- Outputs high-contrast badges: `✓ AUTHENTIC MEDICINE`, `⚠ SUSPICIOUS / INVALID MEDICINE`, `⚠ RECALLED PHARMACEUTICAL BATCH`, or `⚠ EXPIRED MEDICINE`.
- Pre-configured test cases for genuine products, cold-chain biologics, active recalls, and counterfeit batches.

### 6. 🛂 Digital Drug Passport & Procedural QR Code
- Vector-rendered SVG QR code with embedded cryptographic serial data.
- Full product passport display including GMP lab purity scores, storage conditions, and print/export readiness.

### 7. ❄️ Cold-Chain IoT Telemetry Monitoring
- Real-time thermal and humidity monitoring for temperature-sensitive pharmaceuticals (e.g., Insulin at 2°C–8°C, mRNA vaccines at -20°C).
- Status indicators: `NORMAL`, `WARNING`, and `CRITICAL`.
- **"Simulate Cold Chain Breach"**: Simulates compressor failures, raises temperatures above critical thresholds, and commits an immutable `COLD_CHAIN_ALERT` block to the blockchain.

### 8. 🚨 Drug Recall Command Center
- Quarantine batches with regulatory classifications (Quality failure, Contamination, Cold excursion, Counterfeit suspicion).
- Automatically freezes distribution and broadcasts recall notices across wholesale and pharmacy networks.

### 9. ⛓️ Blockchain Explorer & Analytics
- Visual block explorer detailing index, timestamp, transaction type, JSON payload, previous hash, current hash, and nonce.
- Analytics dashboards covering batch statuses, geographic hub distributions, and thermal excursion rates.

### 10. 👥 Role-Based Workspaces & AI Assistant
- Dynamic workspaces tailored for **Manufacturer**, **Distributor**, **Wholesaler**, **Pharmacy**, **Regulator**, and **Patient**.
- Built-in **DrugChain AI Specialist** powered by Gemini 3.8 Flash for guidance on DSCSA/EMA compliance, GDP standards, and cryptographic verification.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Cryptography**: Web Crypto API (`crypto.subtle.digest` SHA-256)
- **Backend / Proxy**: Express, Node.js (`server.ts`) with Vite middleware
- **Icons & Visuals**: Lucide React
- **Persistence**: LocalStorage with automatic demo seeding & reset capability

---

## 💻 Getting Started Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Verify TypeScript & Linting**:
   ```bash
   npm run lint
   ```

---

## 📜 Compliance & Standards

- **FDA DSCSA** (Drug Supply Chain Security Act) Interoperability Guidelines
- **EMA FMD** (Falsified Medicines Directive) Serial Number Verification
- **WHO Good Distribution Practice** (GDP) Thermal Transit Standards
