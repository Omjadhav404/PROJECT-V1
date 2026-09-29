import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PlusCircle, RefreshCw, Activity, CheckCircle2, Clock, Wifi } from 'lucide-react';
import { api } from '../services/api';
import { IncidentTable } from '../components/IncidentTable';
import { NetworkIncident, IncidentStatus } from '../types';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<NetworkIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (id: string, status: IncidentStatus) => {
    try {
      await api.updateIncident(id, { status });
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteIncident(id);
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const activeCount = incidents.filter(i => i.status === 'active' || i.status === 'investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-cyan-400" />
            <span>Network Incidents & Outage Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical repository of Wi-Fi drops, ISP outages, packet loss spikes, and Gemini AI root cause diagnoses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <Link
            to="/incidents/new"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition shadow-glow-cyan"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Outage</span>
          </Link>
        </div>
      </div>

      {/* Mini status counter chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-telemetry">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-sans block">TOTAL LOGGED</span>
            <span className="text-2xl font-bold text-white">{incidents.length}</span>
          </div>
          <Activity className="w-6 h-6 text-slate-600" />
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-300 font-sans block">ACTIVE / UNRESOLVED</span>
            <span className="text-2xl font-bold text-rose-400">{activeCount}</span>
          </div>
          <Clock className="w-6 h-6 text-rose-400" />
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-sans block">RESOLVED & DOCUMENTED</span>
            <span className="text-2xl font-bold text-emerald-400">{resolvedCount}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Filterable Table */}
      <IncidentTable
        incidents={incidents}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </div>
  );
};
