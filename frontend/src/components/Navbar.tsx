import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu, LogOut, User, Wifi, Sparkles, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LiveNetworkTelemetry } from '../types';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<LiveNetworkTelemetry | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await api.getLiveStatus();
        setTelemetry(data);
      } catch {
        // Fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#080d1a]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-5 h-5 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                NetPulse<span className="text-cyan-400 font-black">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                SLA & Doctor
              </span>
            </div>
          </Link>
        </div>

        {/* Live Telemetry Ping Pill */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">WAN Gateway</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-telemetry">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-semibold">{telemetry ? `${telemetry.pingMs} ms` : '18 ms'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono-telemetry font-medium">
            <span>0.0% loss</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/incidents/new"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all duration-200 shadow-glow-cyan"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Incident</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Profile & Routers"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
                    {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium max-w-[120px] truncate">
                    {user.fullName || user.email}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition shadow-glow-cyan"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
