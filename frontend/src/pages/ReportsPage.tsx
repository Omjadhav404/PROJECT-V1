import React from 'react';
import { ReportGenerator } from '../components/ReportGenerator';
import { FileText, ShieldAlert, Scale, HelpCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-cyan-400" />
          <span>ISP SLA Compliance & Outage Compensation Reports</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated legal complaint letters and SLA credit demands based on verifiable NetPulse network telemetry.
        </p>
      </div>

      {/* Main Generator Component */}
      <ReportGenerator />

      {/* Regulatory & Rights Guidance */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Consumer Telecommunications Rights & SLA Escalation Protocol</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">1. Formal ISP Escalation:</strong>
            Submit this letter directly to your ISP’s Executive Resolution or Retention department. Mention specific ticket numbers and timestamped telemetry.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">2. FCC Consumer Dispute:</strong>
            If your ISP fails to respond within 30 days, file an informal complaint via consumercomplaints.fcc.gov citing continuous service degradation.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">3. SLA Credit Claiming:</strong>
            Most major ISPs (Comcast, AT&T, Spectrum) provide pro-rated billing credits when unscheduled total outages exceed 4 consecutive hours.
          </div>
        </div>
      </div>
    </div>
  );
};
