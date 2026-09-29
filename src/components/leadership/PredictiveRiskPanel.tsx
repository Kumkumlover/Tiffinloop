'use client';

import React from 'react';
import { CanonicalCity, LeadershipAnalyticsResponse } from '@/lib/types';
import { Activity, AlertTriangle, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

interface PredictiveRiskPanelProps {
  analytics: LeadershipAnalyticsResponse;
  selectedCity?: 'ALL' | CanonicalCity;
}

export function PredictiveRiskPanel({
  analytics,
  selectedCity = 'ALL',
}: PredictiveRiskPanelProps) {
  const { predictiveSignals } = analytics;

  // Filter signals based on selected city
  const citySignals =
    selectedCity === 'ALL'
      ? predictiveSignals
      : predictiveSignals.filter(s => s.city === selectedCity);

  const highRisk = citySignals.filter(s => s.riskTier === 'HIGH').slice(0, 4);
  const mediumRisk = citySignals.filter(s => s.riskTier === 'MEDIUM').slice(0, 4);
  const displaySignals = highRisk.concat(mediumRisk).slice(0, 4);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            24–48h Predictive Cook Health Radar (CHS)
          </h2>
          <p className="text-xs text-slate-400">
            {selectedCity === 'ALL'
              ? 'Algorithmic early-warning scores forecasting kitchen failure risk before morning dispatch.'
              : `At-risk kitchens detected in ${selectedCity}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Scope: {selectedCity === 'ALL' ? 'All Hubs' : selectedCity}
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            High Risk (&lt;50)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Medium (50–79)
          </span>
        </div>
      </div>

      {/* Grid of At-Risk Kitchens */}
      {displaySignals.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">All Kitchens Healthy in {selectedCity}</div>
          <div className="text-xs text-slate-400 mt-1">
            Zero kitchens operating under capacity stress or micro-failure triggers.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displaySignals.map(signal => {
            const isHigh = signal.riskTier === 'HIGH';

            return (
              <div
                key={signal.cookId}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isHigh
                    ? 'bg-red-950/20 border-red-800/50'
                    : 'bg-amber-950/20 border-amber-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs truncate">
                      {signal.cookName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isHigh
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      CHS {signal.healthScore}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-2">
                    <span>
                      {signal.city} &bull; {signal.cookId}
                    </span>
                    <span className="font-mono text-slate-300 font-medium tabular-nums">
                      {Math.round(signal.capacityUtilization * 100)}% Cap Load
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${signal.healthScore}%` }}
                    />
                  </div>

                  {/* Trigger Reasons */}
                  <div className="space-y-1">
                    {signal.warningReasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 flex items-start gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Predictive Logic Callout */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Leading Indicator Power:</strong> In 84% of historical dropouts, kitchens exhibited at least one of three leading indicators 24–48 hours prior: a single cancelled order precursor, a capacity load &gt;75%, or sudden volume allocation spikes. By flagging cooks with CHS &lt; 50 before 7:00 AM, ops can pre-stage standby cooks before morning cooking begins.
        </div>
      </div>
    </div>
  );
}
