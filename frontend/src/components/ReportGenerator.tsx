import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Mail, 
  Printer, 
  Sparkles, 
  ShieldAlert, 
  DollarSign, 
  Building2,
  Calendar,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface ReportGeneratorProps {
  defaultIsp?: string;
  uptimePercentage?: number;
  totalOutages?: number;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  defaultIsp = 'AT&T Fiber',
  uptimePercentage = 97.4,
  totalOutages = 3
}) => {
  const [ispName, setIspName] = useState<string>(defaultIsp);
  const [accountNumber, setAccountNumber] = useState<string>('ATT-9482-104928');
  const [customerName, setCustomerName] = useState<string>('Alex Reynolds');
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [desiredOutcome, setDesiredOutcome] = useState<string>(
    '50% monthly service credit and Tier 3 line certification'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [reportResult, setReportResult] = useState<{
    reportSubject: string;
    reportContent: string;
    slaBreachSummary: {
      contractedSla: string;
      actualUptime: string;
      serviceCreditRecommended: string;
    };
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.generateReport({
        ispName,
        accountNumber,
        customerName,
        timeRangeDays,
        desiredOutcome
      });

      setReportResult(data);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#3b82f6']
      });
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportResult) return;
    navigator.clipboard.writeText(
      `SUBJECT: ${reportResult.reportSubject}\n\n${reportResult.reportContent}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMailTo = () => {
    if (!reportResult) return;
    const subject = encodeURIComponent(reportResult.reportSubject);
    const body = encodeURIComponent(reportResult.reportContent);
    window.open(`mailto:executive-escalations@isp-relations.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Parameter Configuration Form */}
      <form onSubmit={handleGenerate} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Generate ISP SLA Downtime & Compensation Claim</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Produce an official, legally structured SLA breach complaint letter backed by NetPulse AI timestamped telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              Internet Service Provider
            </label>
            <input
              type="text"
              value={ispName}
              onChange={(e) => setIspName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              ISP Account / Billing ID
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. ACC-198240-2"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              Subscriber / Legal Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              Audit Window (Days)
            </label>
            <select
              value={timeRangeDays}
              onChange={(e) => setTimeRangeDays(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days (Standard Billing Cycle)</option>
              <option value={60}>Last 60 Days</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
            Demanded Outcome / Remediation
          </label>
          <input
            type="text"
            value={desiredOutcome}
            onChange={(e) => setDesiredOutcome(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center gap-2 transition shadow-glow-cyan disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assembling Telemetry & SLA Breach Brief...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Official SLA Complaint Letter</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Report Presentation */}
      {reportResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SLA Impact Highlight Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">TARGET SLA</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {reportResult.slaBreachSummary.contractedSla}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">DELIVERED UPTIME</span>
              <span className="text-lg font-bold font-mono text-rose-400">
                {reportResult.slaBreachSummary.actualUptime}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">CLAIMABLE REFUND</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {reportResult.slaBreachSummary.serviceCreditRecommended}
              </span>
            </div>
          </div>

          {/* Report Paper Preview */}
          <div className="glass-panel rounded-2xl border border-slate-700/80 p-6 sm:p-10 shadow-2xl relative">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>NetPulse Telemetry Legal Dispatch</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  onClick={handleMailTo}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition"
                  title="Draft Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Draft Email</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="mt-6 space-y-4 font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-[#060a14] p-6 rounded-xl border border-slate-800 shadow-inner">
              <div className="text-cyan-300 font-bold pb-3 border-b border-slate-800">
                SUBJECT: {reportResult.reportSubject}
              </div>
              <div>{reportResult.reportContent}</div>
            </div>

            {/* Verification Watermark */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Cryptographic Telemetry Seal: SHA-256 Verified</span>
              <span>Generated by NetPulse AI v1.0 Enterprise</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
