import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Bot, 
  FileText, 
  PlusCircle, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  Shield,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { UptimeGauge } from '../components/UptimeGauge';
import { LiveStatusFeed } from '../components/LiveStatusFeed';
import { IncidentTable } from '../components/IncidentTable';
import { NetworkIncident, UptimeAnalytics, IncidentStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<UptimeAnalytics | null>(null);
  const [incidents, setIncidents] = useState<NetworkIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [analyticsData, incidentsData] = await Promise.all([
        api.getUptimeAnalytics(),
        api.getIncidents()
      ]);
      setAnalytics(analyticsData);
      setIncidents(incidentsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: IncidentStatus) => {
    try {
      await api.updateIncident(id, { status });
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteIncident(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Loading Telemetry Dashboard...</span>
        </div>
      </div>
    );
  }

  const uptime = analytics ? analytics.uptimePercentage : 98.4;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Live Autonomous Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Network Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Continuous ISP uptime monitoring, Gemini AI diagnostics, and SLA compliance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <Link
            to="/incidents/new"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition shadow-glow-cyan"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Outage</span>
          </Link>

          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">SLA Report</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Mean Time Between Failures */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>MTBF (STABILITY)</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 font-mono-telemetry">
            <span className="text-3xl font-extrabold text-white">
              {analytics ? analytics.mtbfHours : 148.5}
            </span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-cyan-400 block mt-2 font-medium">
            Mean Time Between Failures
          </span>
        </div>

        {/* KPI 2: Total Downtime */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>TOTAL DOWNTIME</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 font-mono-telemetry">
            <span className="text-3xl font-extrabold text-rose-400">
              {analytics ? analytics.totalDowntimeHours : 3.8}
            </span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-rose-300 block mt-2 font-medium">
            Accumulated in 30-Day Cycle
          </span>
        </div>

        {/* KPI 3: Average Latency */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>AVERAGE LATENCY</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 font-mono-telemetry">
            <span className="text-3xl font-extrabold text-blue-300">
              {analytics ? analytics.averagePingMs : 24}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <span className="text-[11px] text-blue-300 block mt-2 font-medium">
            Edge to First ISP Hop
          </span>
        </div>

        {/* KPI 4: Active Drops */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>ACTIVE INCIDENTS</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 font-mono-telemetry">
            <span className={`text-3xl font-extrabold ${analytics?.activeIncidents ? 'text-amber-400' : 'text-emerald-400'}`}>
              {analytics ? analytics.activeIncidents : 0}
            </span>
            <span className="text-xs text-slate-400">unresolved</span>
          </div>
          <span className={`text-[11px] block mt-2 font-medium ${analytics?.activeIncidents ? 'text-amber-400' : 'text-emerald-400'}`}>
            {analytics?.activeIncidents ? 'Requires diagnostic attention' : 'All systems normal'}
          </span>
        </div>

      </div>

      {/* Main Visual Section: Uptime Gauge + Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SVG Uptime Gauge */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <UptimeGauge percentage={uptime} slaTarget={99.9} />
        </div>

        {/* Live Status Feed & Telemetry Oscillogram */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <LiveStatusFeed />
        </div>

      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 14-Day Uptime Percentage Timeline */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>14-Day Network Uptime Timeline</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daily continuous availability percentage vs. SLA 99.9% contractual line
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-full">
              Avg: {uptime.toFixed(1)}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyUptimeTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[94, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [`${value}%`, 'Uptime']}
                />
                <Area 
                  type="monotone" 
                  dataKey="uptimePercent" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#uptimeGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Outage Hours Distribution */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Peak Disruption Hours</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Historical distribution of network drops by hour of day
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.peakOutageHours?.slice(0, 6) || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [`${value} incidents`, 'Outages']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(analytics?.peakOutageHours || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Incidents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Network Incidents & Diagnoses</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verified logs with Gemini AI root cause analysis and resolution status
            </p>
          </div>

          <Link
            to="/incidents"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View All ({incidents.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <IncidentTable
          incidents={incidents.slice(0, 5)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      </div>

    </div>
  );
};
