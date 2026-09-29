import React from 'react';
import { IncidentForm } from '../components/IncidentForm';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewIncidentPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident Log</span>
        </Link>
      </div>

      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 mb-3 shadow-glow-cyan">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Log Network Incident
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Record a Wi-Fi disconnect, ping spike, or ISP outage. Gemini AI will evaluate telemetry and generate instant troubleshooting steps.
        </p>
      </div>

      <IncidentForm />
    </div>
  );
};
