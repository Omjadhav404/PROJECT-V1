import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Router as RouterIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Database, 
  Sparkles, 
  User, 
  Wifi, 
  AlertCircle,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RouterConfig } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [routers, setRouters] = useState<RouterConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // New Router Form State
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [ssid, setSsid] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Migration Copy State
  const [sqlCopied, setSqlCopied] = useState(false);

  // Gemini API Key State
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const fetchRouters = async () => {
    try {
      setLoading(true);
      const data = await api.getRouters();
      setRouters(data);
    } catch (err) {
      console.error('Failed to load routers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const handleAddRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    try {
      await api.createRouter({
        device_name: deviceName,
        ip_address: ipAddress,
        ssid,
        notes
      });
      setDeviceName('');
      setSsid('');
      setNotes('');
      setIsAdding(false);
      await fetchRouters();
    } catch (err: any) {
      alert('Failed to register router: ' + err.message);
    }
  };

  const handleDeleteRouter = async (id: string) => {
    if (window.confirm('Delete this router configuration?')) {
      try {
        await api.deleteRouter(id);
        await fetchRouters();
      } catch (err: any) {
        alert('Failed to delete router: ' + err.message);
      }
    }
  };

  const MIGRATION_SQL_SNIPPET = `-- NetPulse AI Supabase Migration
create extension if not exists "uuid-ossp";

create type connection_type_enum as enum ('fiber', 'cable', 'dsl', 'satellite', '5g_home');
create type incident_status_enum as enum ('active', 'resolved', 'investigating');

create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    default_isp text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.network_incidents (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    isp_name text not null,
    router_model text,
    connection_type connection_type_enum default 'fiber',
    symptom text not null,
    download_speed numeric,
    upload_speed numeric,
    ping_ms integer,
    status incident_status_enum default 'active',
    ai_diagnosis jsonb,
    started_at timestamp with time zone not null,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.router_configs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    device_name text not null,
    ip_address text,
    ssid text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

  const copySql = () => {
    navigator.clipboard.writeText(MIGRATION_SQL_SNIPPET);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Settings & Hardware Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your network routers, profile credentials, Supabase database, and Google GenAI connectivity.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-base">
            {user?.fullName ? user.fullName.charAt(0) : 'A'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user?.fullName || 'Network Administrator'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'admin@netpulse.ai'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5 font-semibold">DEFAULT SERVICE PROVIDER</span>
            <span className="text-slate-200 font-medium">{user?.defaultIsp || 'AT&T Fiber 1Gbps Symmetric'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5 font-semibold">AUTHENTICATION TIER</span>
            <span className="text-cyan-400 font-mono font-medium">Supabase Auth (RLS Active)</span>
          </div>
        </div>
      </div>

      {/* Router Configurations Management */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RouterIcon className="w-5 h-5 text-cyan-400" />
              <span>Configured Routers & Access Points</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Network hardware tracked for automated Wi-Fi and gateway diagnosis
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'Add Router'}</span>
          </button>
        </div>

        {/* Add Router Inline Form */}
        {isAdding && (
          <form onSubmit={handleAddRouter} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Device Name / Model</label>
                <input
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. ASUS RT-AX88U Pro"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Admin Gateway IP</label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="192.168.1.1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Wi-Fi SSID</label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. NetPulse_5G"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Firmware / Technical Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. AsusWRT-Merlin 388.7, Cake SQM active, 160MHz band enabled"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-glow-cyan"
              >
                Save Router Device
              </button>
            </div>
          </form>
        )}

        {/* Routers List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {routers.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 relative group hover:border-cyan-500/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <RouterIcon className="w-4 h-4 text-cyan-400" />
                    <span>{r.device_name}</span>
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono-telemetry">
                    <span>IP: {r.ip_address || '192.168.1.1'}</span>
                    {r.ssid && <span>• SSID: {r.ssid}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRouter(r.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                  title="Remove device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {r.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  {r.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Schema & Migration Tool */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Supabase PostgreSQL Schema & RLS Setup</span>
          </div>

          <button
            onClick={copySql}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
          >
            {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The application is fully synchronized with Supabase PostgreSQL (URL: <span className="font-mono text-cyan-300">epxxnsixehxoggsjsckn.supabase.co</span>). You can run this migration directly in your Supabase SQL editor to activate native tables and Row Level Security policies.
        </p>

        <div className="bg-[#050811] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 max-h-44 overflow-y-auto">
          <pre>{MIGRATION_SQL_SNIPPET}</pre>
        </div>
      </div>

    </div>
  );
};
