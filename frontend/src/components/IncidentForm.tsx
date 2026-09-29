import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wifi, 
  Router as RouterIcon, 
  Sparkles, 
  AlertTriangle, 
  Gauge, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Clock,
  Radio
} from 'lucide-react';
import { api } from '../services/api';
import { ConnectionType, NetworkIncident } from '../types';

const COMMON_ISPS = [
  'AT&T Fiber',
  'Comcast Xfinity',
  'Verizon Fios',
  'Spectrum (Charter)',
  'T-Mobile 5G Home Internet',
  'Starlink (Satellite)',
  'CenturyLink / Quantum Fiber',
  'Cox Communications',
  'Google Fiber'
];

const COMMON_SYMPTOMS = [
  'Total Outage (No Internet Connection)',
  'High Latency / Ping Spikes (Gaming / VoIP Lag)',
  'Wi-Fi Drops Intermittently (5GHz band disconnects)',
  'Packet Loss (>5% packet drop)',
  'DNS Resolution Failure (Sites will not load)',
  'Severe Bandwidth Throttling / Speed Drop',
  'Router Overheating & Continuous Reboots'
];

export const IncidentForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [ispName, setIspName] = useState<string>('AT&T Fiber');
  const [customIsp, setCustomIsp] = useState<string>('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('fiber');
  const [routerModel, setRouterModel] = useState<string>('ASUS RT-AX88U Pro');
  const [symptomCategory, setSymptomCategory] = useState<string>(COMMON_SYMPTOMS[0]);
  const [detailedDescription, setDetailedDescription] = useState<string>('');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0');
  const [uploadSpeed, setUploadSpeed] = useState<string>('0');
  const [pingMs, setPingMs] = useState<string>('0');
  const [isOngoing, setIsOngoing] = useState<boolean>(true);
  const [startedAt, setStartedAt] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 15);
    return d.toISOString().slice(0, 16);
  });
  const [resolvedAt, setResolvedAt] = useState<string>('');

  // Diagnostic Result State after submission
  const [createdIncident, setCreatedIncident] = useState<NetworkIncident | null>(null);

  // Instant Speed Probe Simulator
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const handleProbeSpeed = () => {
    setIsProbing(true);
    setTimeout(() => {
      if (symptomCategory.includes('Total Outage')) {
        setDownloadSpeed('0');
        setUploadSpeed('0');
        setPingMs('0');
      } else if (symptomCategory.includes('High Latency')) {
        setDownloadSpeed('140.2');
        setUploadSpeed('75.0');
        setPingMs('280');
      } else {
        setDownloadSpeed('350.5');
        setUploadSpeed('110.0');
        setPingMs('38');
      }
      setIsProbing(false);
    }, 1200);
  };

  const finalIsp = ispName === 'Other' ? (customIsp || 'Unknown ISP') : ispName;
  const fullSymptom = detailedDescription 
    ? `${symptomCategory}: ${detailedDescription}` 
    : symptomCategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload: Partial<NetworkIncident> = {
        isp_name: finalIsp,
        connection_type: connectionType,
        router_model: routerModel,
        symptom: fullSymptom,
        download_speed: parseFloat(downloadSpeed) || 0,
        upload_speed: parseFloat(uploadSpeed) || 0,
        ping_ms: parseInt(pingMs, 10) || 0,
        started_at: new Date(startedAt).toISOString(),
        resolved_at: (!isOngoing && resolvedAt) ? new Date(resolvedAt).toISOString() : undefined,
        status: isOngoing ? 'active' : 'resolved'
      };

      const result = await api.createIncident(payload);
      setCreatedIncident(result);
      setStep(3); // Go to results/diagnosis step
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Header Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </span>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
              Provider & Hardware
            </span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>

          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </span>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>
              Symptoms & Telemetry
            </span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>

          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </span>
            <span className={`text-xs font-semibold ${step >= 3 ? 'text-white' : 'text-slate-500'}`}>
              AI Doctor Diagnosis
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Provider & Hardware */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <span>Step 1: ISP Provider & Router Specs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your Internet Service Provider and local router equipment details.
            </p>
          </div>

          {/* ISP Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Internet Service Provider (ISP)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COMMON_ISPS.map(isp => (
                <button
                  type="button"
                  key={isp}
                  onClick={() => setIspName(isp)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                    ispName === isp
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {isp}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIspName('Other')}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                  ispName === 'Other'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Other Provider (Specify)
              </button>
            </div>

            {ispName === 'Other' && (
              <input
                type="text"
                value={customIsp}
                onChange={(e) => setCustomIsp(e.target.value)}
                placeholder="Enter custom ISP name (e.g. Starry, Frontier, Local WISP)"
                className="w-full mt-2 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            )}
          </div>

          {/* Connection Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              WAN Delivery Architecture
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['fiber', 'cable', 'dsl', 'satellite', '5g_home'] as ConnectionType[]).map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setConnectionType(type)}
                  className={`py-2 px-3 rounded-lg border text-center text-xs font-semibold uppercase tracking-wider transition ${
                    connectionType === type
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Router Model */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <RouterIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Router / Gateway Model</span>
            </label>
            <input
              type="text"
              value={routerModel}
              onChange={(e) => setRouterModel(e.target.value)}
              placeholder="e.g. ASUS RT-AX88U, Netgear Orbi, Eero Pro 6E, ISP BGW320 Gateway"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition shadow-glow-cyan"
            >
              <span>Next: Symptoms & Metrics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Symptoms & Telemetry */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Step 2: Symptoms & Speed Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select the network anomaly and enter your latest speed/ping readings.
            </p>
          </div>

          {/* Symptom Category Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Primary Anomaly Category
            </label>
            <div className="space-y-2">
              {COMMON_SYMPTOMS.map(sym => (
                <div
                  key={sym}
                  onClick={() => setSymptomCategory(sym)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs font-medium flex items-center justify-between transition ${
                    symptomCategory === sym
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{sym}</span>
                  {symptomCategory === sym && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Additional Observations (Optional)
            </label>
            <textarea
              rows={2}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="e.g. Downstream LED blinking amber, speed test fails on all Ethernet devices, DNS rebind error in logs"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Speed & Latency Probe Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Speed Test & Latency Metrics</span>
              </div>
              <button
                type="button"
                onClick={handleProbeSpeed}
                disabled={isProbing}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 flex items-center gap-1.5 transition"
              >
                {isProbing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                <span>{isProbing ? 'Simulating Probe...' : 'Auto-Fill Telemetry'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-telemetry">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DOWNLOAD (MBPS)</label>
                <input
                  type="number"
                  step="0.1"
                  value={downloadSpeed}
                  onChange={(e) => setDownloadSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">UPLOAD (MBPS)</label>
                <input
                  type="number"
                  step="0.1"
                  value={uploadSpeed}
                  onChange={(e) => setUploadSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PING (MS)</label>
                <input
                  type="number"
                  value={pingMs}
                  onChange={(e) => setPingMs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Incident Started At</span>
              </label>
              <input
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Current Outage State
                </label>
                <label className="flex items-center gap-1.5 text-xs text-cyan-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOngoing}
                    onChange={(e) => setIsOngoing(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                  />
                  <span>Currently Ongoing</span>
                </label>
              </div>

              {!isOngoing ? (
                <input
                  type="datetime-local"
                  value={resolvedAt}
                  onChange={(e) => setResolvedAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                  Incident is active; downtime counter will accrue until marked resolved.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center gap-2 transition shadow-glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Invoking Gemini AI Doctor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Trigger AI Diagnosis</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: AI Doctor Diagnosis Result */}
      {step === 3 && createdIncident && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Incident Logged & Analyzed Successfully</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                AI Diagnostic Telemetry Report
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Incident ID</span>
              <span className="font-mono text-[11px] text-cyan-400">{createdIncident.id.slice(0, 8)}...</span>
            </div>
          </div>

          {/* AI Diagnosis Card */}
          {createdIncident.ai_diagnosis && (
            <div className="bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Gemini 2.5 Flash Root Cause Analysis</span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  createdIncident.ai_diagnosis.severityLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  createdIncident.ai_diagnosis.severityLevel === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  Severity: {createdIncident.ai_diagnosis.severityLevel}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Root Cause
                </span>
                <p className="text-slate-200 text-sm leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {createdIncident.ai_diagnosis.rootCause}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Actionable Troubleshooting Protocol
                </span>
                <div className="space-y-2">
                  {createdIncident.ai_diagnosis.troubleshootingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                  Official ISP Escalation Script
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-900/60 font-mono text-xs text-slate-300 leading-relaxed">
                  "{createdIncident.ai_diagnosis.ispEscalationAdvice}"
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-glow-cyan"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/incidents')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              View All Incidents
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 transition"
            >
              Generate ISP SLA Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
