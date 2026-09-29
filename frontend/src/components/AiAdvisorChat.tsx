import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, Radio, Shield, Terminal, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Why does my 5GHz Wi-Fi drop every 30 minutes?',
  'How do I fix bufferbloat and gaming lag spikes?',
  'Is my ISP throttling my bandwidth or is my modem failing?',
  'What are the best DNS servers for lowest ping?'
];

export const AiAdvisorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `### 🤖 NetPulse AI Network Doctor Active
Hello! I am your principal network engineer and Wi-Fi diagnostics specialist. 

I can analyze router channel congestion, diagnose bufferbloat, troubleshoot DOCSIS/fiber handshake drops, and craft technical escalation scripts for your ISP.

**Ask me a question or select a quick topic below to begin:**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await api.chatWithDoctor(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ Could not contact the diagnostic engine. Please verify the backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">NetPulse AI Network Doctor</h3>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Gemini 2.5 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Wi-Fi, Router Firmware & ISP Outage Engineering
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          title="Clear Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Strip */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Quick Topics:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition shrink-0 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                isUser
                  ? 'bg-blue-600/90 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <div className="whitespace-pre-line font-sans">
                  {msg.text}
                </div>
                <div className={`text-[10px] mt-1 font-mono-telemetry ${isUser ? 'text-blue-200' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NetPulse AI is diagnosing network telemetry and routing paths...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your Wi-Fi drop, latency spike, or router symptom..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-glow-cyan disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
