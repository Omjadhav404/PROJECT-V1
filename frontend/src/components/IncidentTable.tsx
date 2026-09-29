import React, { useState } from 'react';
import { NetworkIncident, IncidentStatus } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Trash2, 
  Check, 
  Filter, 
  Wifi, 
  Activity,
  ArrowUpDown,
  Search,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IncidentTableProps {
  incidents: NetworkIncident[];
  onUpdateStatus: (id: string, status: IncidentStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectIncident?: (incident: NetworkIncident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onUpdateStatus,
  onDelete,
  onSelectIncident
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ispFilter, setIspFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Extract unique ISPs for filter
  const isps = Array.from(new Set(incidents.map(i => i.isp_name)));

  // Filter logic
  const filtered = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (ispFilter !== 'all' && inc.isp_name !== ispFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSymptom = inc.symptom.toLowerCase().includes(q);
      const matchIsp = inc.isp_name.toLowerCase().includes(q);
      const matchRouter = inc.router_model?.toLowerCase().includes(q);
      if (!matchSymptom && !matchIsp && !matchRouter) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onUpdateStatus(id, 'resolved');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#10b981', '#3b82f6']
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this incident record?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search symptoms, ISP, or router..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950/80 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Drops</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* ISP Filter */}
          <div className="relative">
            <select
              value={ispFilter}
              onChange={(e) => { setIspFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950/80 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="all">All Providers</option>
              {isps.map(isp => (
                <option key={isp} value={isp}>{isp}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        {paginated.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Wifi className="w-10 h-10 mx-auto text-slate-600 mb-3 animate-pulse" />
            <p className="text-base font-semibold text-slate-300">No network incidents found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or log a new Wi-Fi / ISP outage to begin tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {paginated.map((inc) => {
              const isExpanded = expandedId === inc.id;
              const hasAi = !!inc.ai_diagnosis;
              const durationMins = inc.resolved_at 
                ? Math.round((new Date(inc.resolved_at).getTime() - new Date(inc.started_at).getTime()) / (60 * 1000))
                : Math.round((Date.now() - new Date(inc.started_at).getTime()) / (60 * 1000));

              return (
                <div key={inc.id} className="transition-colors hover:bg-slate-800/30">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    {/* Status & ISP Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="mt-1">
                        {inc.status === 'resolved' ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : inc.status === 'investigating' ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Clock className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <AlertCircle className="w-4 h-4 animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-100 text-sm">{inc.isp_name}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                            {inc.connection_type}
                          </span>
                          {inc.status === 'active' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Active Outage
                            </span>
                          )}
                          {inc.status === 'resolved' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Restored
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 mt-1 line-clamp-1 max-w-xl">
                          {inc.symptom}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-mono-telemetry">
                          <span>Started: {new Date(inc.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>Duration: {durationMins > 60 ? `${(durationMins / 60).toFixed(1)} hrs` : `${durationMins} mins`}</span>
                          {inc.ping_ms !== undefined && inc.ping_ms > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400">Ping: {inc.ping_ms}ms</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions & AI Pills */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {hasAi && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">AI Doctor Ready</span>
                        </div>
                      )}

                      {inc.status !== 'resolved' && (
                        <button
                          onClick={(e) => handleResolve(inc.id, e)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5"
                          title="Mark Resolved"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(inc.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-400">
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded AI Diagnosis & Technical Metrics Drawer */}
                  {isExpanded && (
                    <div className="px-6 py-5 bg-slate-950/70 border-t border-slate-800 space-y-4 text-xs animate-fadeIn">
                      
                      {/* Technical Specs Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-mono-telemetry">
                        <div>
                          <span className="text-slate-500 block text-[10px]">ROUTER / CPE:</span>
                          <span className="text-slate-200 font-semibold">{inc.router_model || 'Standard Gateway'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">DOWNLOAD:</span>
                          <span className="text-slate-200 font-semibold">{inc.download_speed !== undefined ? `${inc.download_speed} Mbps` : '0 Mbps'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">UPLOAD:</span>
                          <span className="text-slate-200 font-semibold">{inc.upload_speed !== undefined ? `${inc.upload_speed} Mbps` : '0 Mbps'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">LATENCY:</span>
                          <span className="text-cyan-400 font-semibold">{inc.ping_ms || 0} ms</span>
                        </div>
                      </div>

                      {/* AI Diagnosis Details */}
                      {inc.ai_diagnosis ? (
                        <div className="space-y-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-cyan-300">
                              <Sparkles className="w-4 h-4 text-cyan-400" />
                              <span>Gemini Network Diagnosis</span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              inc.ai_diagnosis.severityLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                              inc.ai_diagnosis.severityLevel === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}>
                              Severity: {inc.ai_diagnosis.severityLevel}
                            </span>
                          </div>

                          <div>
                            <strong className="text-slate-300 block mb-1">Root Cause Analysis:</strong>
                            <p className="text-slate-400 leading-relaxed">{inc.ai_diagnosis.rootCause}</p>
                          </div>

                          <div>
                            <strong className="text-slate-300 block mb-1">Recommended Troubleshooting Steps:</strong>
                            <ul className="list-disc list-inside space-y-1 text-slate-300">
                              {inc.ai_diagnosis.troubleshootingSteps.map((step, idx) => (
                                <li key={idx} className="leading-relaxed">{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-cyan-900/50">
                            <strong className="text-cyan-400 block mb-1">ISP Escalation Script:</strong>
                            <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
                              "{inc.ai_diagnosis.ispEscalationAdvice}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">
                          No AI diagnosis recorded for this incident yet.
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing page {currentPage} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
