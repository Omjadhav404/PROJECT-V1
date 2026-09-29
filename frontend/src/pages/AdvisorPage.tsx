import React from 'react';
import { AiAdvisorChat } from '../components/AiAdvisorChat';
import { 
  Bot, 
  Wifi, 
  Radio, 
  ShieldCheck, 
  Layers, 
  Zap, 
  ExternalLink,
  Cpu
} from 'lucide-react';

export const AdvisorPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-cyan-400" />
          <span>AI Network Doctor & Troubleshooting Advisor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Autonomous engineering assistant powered by Google GenAI. Ask questions about router firmware, channel interference, latency jitter, or ISP escalation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Interactive Chat Window */}
        <div className="lg:col-span-8">
          <AiAdvisorChat />
        </div>

        {/* Sidebar Knowledge Reference Cards */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Card 1: Channel Reference */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Optimal Wi-Fi Channels</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 font-mono-telemetry">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 font-bold block">2.4 GHz Band (20MHz only)</span>
                <span className="text-[11px] text-slate-400">Lock strictly to: <strong>1, 6, or 11</strong></span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 font-bold block">5 GHz Non-DFS Bands</span>
                <span className="text-[11px] text-slate-400">UNII-1: <strong>36-48</strong> | UNII-3: <strong>149-161</strong></span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-purple-400 font-bold block">6 GHz Wi-Fi 6E/7</span>
                <span className="text-[11px] text-slate-400">PSC Preferred: <strong>37, 69, 101, 133</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Card 2: Anycast DNS Leaderboard */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Recommended DNS Resolvers</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 font-mono-telemetry">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Cloudflare (Fastest)</span>
                  <span className="text-[11px] text-slate-400">1.1.1.1 / 1.0.0.1</span>
                </div>
                <span className="text-[11px] text-cyan-400 font-bold">~9ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Quad9 (Malware Block)</span>
                  <span className="text-[11px] text-slate-400">9.9.9.9 / 149.112.112.112</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">~12ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Google Public DNS</span>
                  <span className="text-[11px] text-slate-400">8.8.8.8 / 8.8.4.4</span>
                </div>
                <span className="text-[11px] text-purple-400 font-bold">~14ms</span>
              </div>
            </div>
          </div>

          {/* Quick Card 3: Bufferbloat Diagnosis */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bufferbloat Fix Checklist</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Enable SQM (Smart Queue Management) in router settings.</li>
              <li>Select Cake or FQ-CoDel algorithm.</li>
              <li>Cap WAN bandwidth to 90% of provisioned speed.</li>
              <li>Eliminate gaming jitter and Discord voice drops.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
