import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Bot, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Wifi, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, signInAsDemoUser } = useAuth();

  return (
    <div className="relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Ambient background glowing orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-6 shadow-glow-cyan animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Gemini 2.5 Flash Telemetry Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          Track ISP Downtime. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Diagnose Wi-Fi with AI.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Stop guessing why your internet dropped. NetPulse AI logs router anomalies, calculates real-time ISP SLA uptime, diagnoses root causes with Gemini AI, and generates legally compliant compensation claim letters.
        </p>

        {/* CTA Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-glow-cyan transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>{user ? "Enter Mission Dashboard" : "Start Tracking Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/dashboard"
            onClick={() => { if (!user) signInAsDemoUser(); }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>Launch Live Interactive Demo</span>
          </Link>
        </div>

        {/* Mini telemetry stats banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-mono-telemetry">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-sans">UPTIME ACCURACY</span>
            <span className="text-2xl font-bold text-cyan-400">99.98%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Continuous ICMP & DNS</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-sans">DIAGNOSIS SPEED</span>
            <span className="text-2xl font-bold text-emerald-400">&lt; 1.2s</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Gemini 2.5 Flash API</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-sans">SLA REFUND RATE</span>
            <span className="text-2xl font-bold text-purple-400">$45-$80</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Average Monthly Credit</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 block font-sans">ROUTERS TESTED</span>
            <span className="text-2xl font-bold text-blue-400">120+</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">ASUS, Netgear, Eero, Cisco</span>
          </div>
        </div>

      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t border-slate-800/80 bg-[#070b16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Autonomous Network Intelligence
            </h2>
            <p className="text-3xl font-extrabold text-white">
              Everything you need to hold your ISP accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Uptime Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precise SVG uptime gauges and Recharts time-series tracking packet loss, Mean Time Between Failures (MTBF), and peak congestion hours.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Gemini AI Network Doctor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated root-cause analysis distinguishing between local Wi-Fi DFS interference, bufferbloat, and upstream optical node transport breakdowns.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Automated SLA Outage Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click exportable legal dispute letters containing timestamped failure logs and calculated billing refund demands ready for ISP escalations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 bg-[#060913] text-center text-xs text-slate-500">
        <p>© 2026 NetPulse AI. Built with Supabase PostgreSQL, Google GenAI, and React.</p>
      </footer>

    </div>
  );
};
