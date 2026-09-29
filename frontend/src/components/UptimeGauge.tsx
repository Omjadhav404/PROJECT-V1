import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface UptimeGaugeProps {
  percentage: number;
  slaTarget?: number;
  periodLabel?: string;
  size?: number;
}

export const UptimeGauge: React.FC<UptimeGaugeProps> = ({
  percentage,
  slaTarget = 99.9,
  periodLabel = 'Last 30 Days',
  size = 220
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Map 0-100% to strokeDashoffset
  const normalizedValue = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  // Color determination
  const isHealthy = percentage >= slaTarget;
  const isWarning = percentage >= 95.0 && percentage < slaTarget;
  
  const strokeColor = isHealthy 
    ? '#10b981' // Emerald
    : isWarning 
      ? '#f59e0b' // Amber
      : '#f43f5e'; // Rose

  const glowShadow = isHealthy
    ? 'rgba(16, 185, 129, 0.4)'
    : isWarning
      ? 'rgba(245, 158, 11, 0.4)'
      : 'rgba(244, 63, 94, 0.4)';

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-panel relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${glowShadow})`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold tracking-tight font-mono-telemetry text-white">
              {percentage.toFixed(2)}
            </span>
            <span className="text-xl font-bold text-cyan-400 ml-0.5">%</span>
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 mt-1">
            Network Uptime
          </span>
          <div className="flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900/90 border border-slate-700/80">
            {isHealthy ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">SLA Compliant</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400">SLA Breached</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <span>Target: <strong className="text-slate-200 font-mono">{slaTarget}%</strong></span>
        <span>Window: <strong className="text-slate-200">{periodLabel}</strong></span>
      </div>
    </div>
  );
};
