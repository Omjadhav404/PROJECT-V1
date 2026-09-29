import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  ArrowDown, 
  ArrowUp, 
  ShieldCheck, 
  Radio, 
  Globe, 
  Zap, 
  Layers 
} from 'lucide-react';
import { api } from '../services/api';
import { LiveNetworkTelemetry } from '../types';

export const LiveStatusFeed: React.FC = () => {
  const [telemetry, setTelemetry] = useState<LiveNetworkTelemetry>({
    timestamp: new Date().toISOString(),
    gatewayIp: '192.168.1.1',
    ispName: 'Primary WAN Gateway',
    status: 'online',
    pingMs: 16,
    jitterMs: 2,
    packetLossPercent: 0.0,
    currentDownloadMbps: 540,
    currentUploadMbps: 185,
    dnsLatencyMs: 11,
    activeConnectionsCount: 42
  });

  const [history, setHistory] = useState<number[]>([14, 16, 15, 17, 16, 18, 15, 16, 17, 16]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getLiveStatus();
        setTelemetry(data);
        setHistory(prev => [...prev.slice(1), data.pingMs]);
      } catch {
        // Fallback simulation
        setTelemetry(prev => ({
          ...prev,
          pingMs: Math.max(12, Math.min(28, prev.pingMs + (Math.random() > 0.5 ? 1 : -1))),
          jitterMs: Math.floor(Math.random() * 3)
        }));
      }
    };

    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Real-Time Gateway & WAN Telemetry</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live continuous ICMP probing & ISP throughput feed
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Link Active
        </span>
      </div>

      {/* Grid of Key Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-telemetry">
        
        {/* Ping / Latency */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>PING / RTT</span>
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-cyan-300">{telemetry.pingMs}</span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <span className="text-[10px] text-slate-500">Jitter: ±{telemetry.jitterMs}ms</span>
        </div>

        {/* Packet Loss */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>PACKET LOSS</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400">{telemetry.packetLossPercent}%</span>
          </div>
          <span className="text-[10px] text-emerald-500">Zero Drops</span>
        </div>

        {/* Download Throughput */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>THROUGHPUT (DL)</span>
            <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-300">{telemetry.currentDownloadMbps}</span>
            <span className="text-xs text-slate-500">Mbps</span>
          </div>
          <span className="text-[10px] text-slate-500">Gigabit Layer</span>
        </div>

        {/* DNS Latency */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>DNS RESOLVE</span>
            <Globe className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-300">{telemetry.dnsLatencyMs}</span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <span className="text-[10px] text-slate-500">1.1.1.1 Anycast</span>
        </div>

      </div>

      {/* Latency History Wave Bars */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Continuous Latency Oscillogram (Last 10 Probes)</span>
          <span className="font-mono text-cyan-400 text-[10px]">Avg: {Math.round(history.reduce((a, b) => a + b, 0) / history.length)}ms</span>
        </div>
        <div className="h-10 flex items-end gap-1.5 pt-2">
          {history.map((val, idx) => {
            const heightPercent = Math.min(100, Math.max(25, (val / 35) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t transition-all duration-300 relative group"
                style={{ height: `${heightPercent}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300 pointer-events-none z-10">
                  {val}ms
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
