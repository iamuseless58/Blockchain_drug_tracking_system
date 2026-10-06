import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Gemini AI Chat Route for Pharma Supply Chain Assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai) {
      // Offline fallback with deep pharmaceutical domain intelligence
      const fallbackResponses: Record<string, string> = {
        verify: "To verify a drug on DrugChain, input the Batch ID into the 'Verify Medicine' portal. The system checks SHA-256 cryptographic hashes against the immutable ledger, verifies Good Distribution Practice (GDP) timestamps, and confirms previousHash linkages.",
        tamper: "Blockchain tamper resistance works because each block's SHA-256 hash incorporates the previous block's hash. If even a single byte (like quantity or expiry date) is modified, its hash changes completely, breaking all subsequent chain links and triggering an immediate red alert in the Security Lab.",
        coldchain: "Cold-chain monitoring tracks temperature-sensitive pharmaceuticals (such as Insulin at 2°C–8°C or mRNA Vaccines at -20°C). When IoT telemetry detects a temperature breach, an immutable alert is committed to the blockchain, notifying distributors and pharmacies before the compromised batch is dispensed.",
        recall: "A drug recall can be initiated in the Recall Center for reasons like quality failure, contamination, or temperature breaches. Once committed, the batch status is locked to RECALLED on-chain, preventing downstream distribution across all hospitals and pharmacies."
      };

      const lower = message.toLowerCase();
      let reply = "DrugChain AI Specialist: Blockchain verification ensures DSCSA (Drug Supply Chain Security Act) compliance through tamper-evident cryptographic ledgers, real-time IoT cold-chain tracking, and digital passports.";
      if (lower.includes('tamper') || lower.includes('security') || lower.includes('hash')) {
        reply = fallbackResponses.tamper;
      } else if (lower.includes('cold') || lower.includes('temp') || lower.includes('sensor')) {
        reply = fallbackResponses.coldchain;
      } else if (lower.includes('recall') || lower.includes('contaminat')) {
        reply = fallbackResponses.recall;
      } else if (lower.includes('verify') || lower.includes('authentic') || lower.includes('counterfeit')) {
        reply = fallbackResponses.verify;
      }

      res.json({ reply, source: 'offline-agent' });
      return;
    }

    // Call Gemini 3.8 Flash model
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.sender === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: `You are the DrugChain AI Specialist, an expert pharmaceutical supply chain advisor and regulatory verification assistant.
You provide precise, authoritative, and helpful answers regarding:
1. Blockchain drug traceability from Raw Material -> Manufacturer -> Distributor -> Wholesaler -> Pharmacy -> Patient.
2. Cryptographic SHA-256 verification and tamper detection.
3. Good Distribution Practice (GDP) and Cold-Chain temperature safety (e.g. 2°C - 8°C for insulin/vaccines).
4. Counterfeit drug prevention and Digital Drug Passports.
5. Drug Recall protocols and DSCSA / EMA compliance.
Keep answers concise, professional, clear, and actionable.`,
      },
    });

    res.json({ reply: response.text || 'No response generated', source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DrugChain server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
