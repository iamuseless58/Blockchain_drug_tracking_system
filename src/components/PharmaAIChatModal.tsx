import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const PharmaAIChatModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'model',
      text: 'Hello, I am the DrugChain AI Specialist. I can assist with blockchain verification, SHA-256 cryptographic hashes, FDA/EMA DSCSA compliance, cold-chain excursion analysis, and regulatory drug recalls. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        sender: 'model',
        text: data.reply || 'No response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat request failed, using intelligent fallback response:', err);
      // Fallback
      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        sender: 'model',
        text: 'DrugChain Ledger Protocol: Drug batches are secured via SHA-256 cryptographic hash chaining. When data is modified at any step, the previousHash linkage breaks immediately, triggering a tamper alert in the Security Lab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickPrompts = [
    'How does SHA-256 detect tampered drug data?',
    'Explain the cold-chain rules for insulin (2°C - 8°C)',
    'What happens when a batch is marked RECALLED?',
    'How does DrugChain verify counterfeit medicines?',
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-teal-300"
          title="Open Pharma AI Assistant"
        >
          <Bot className="w-6 h-6 text-slate-950" />
          <span className="hidden sm:inline text-xs font-mono tracking-wider font-extrabold uppercase">
            PharmaChain AI
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl shadow-slate-950/80 flex flex-col overflow-hidden text-slate-100 h-[540px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  DrugChain AI Assistant
                  <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    GEMINI 3.8
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Pharma Regulatory & Blockchain Specialist
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block mt-1 text-[10px] font-mono ${
                      m.sender === 'user' ? 'text-teal-200' : 'text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                Analyzing pharmaceutical ledger...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (if few messages) */}
          {messages.length <= 3 && (
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 whitespace-nowrap shrink-0 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about batches, hashes, cold chain..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-teal-400 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
