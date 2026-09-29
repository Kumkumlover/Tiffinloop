'use client';

import React from 'react';
import { CanonicalCity } from '@/lib/types';
import { Sparkles, Zap, Building2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ExecutiveFilterHeaderProps {
  selectedCity: 'ALL' | CanonicalCity;
  onSelectCity: (city: 'ALL' | CanonicalCity) => void;
  isSimulated: boolean;
  onToggleSimulation: () => void;
  puneBaselineRate: number;
  puneSimulatedRate: number;
}

export function ExecutiveFilterHeader({
  selectedCity,
  onSelectCity,
  isSimulated,
  onToggleSimulation,
  puneBaselineRate,
  puneSimulatedRate,
}: ExecutiveFilterHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
        {/* City Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            Market Scope:
          </span>
          {(['ALL', 'Bengaluru', 'Mumbai', 'Pune'] as const).map(city => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {city === 'ALL' ? 'All Hubs (Network)' : city}
            </button>
          ))}
        </div>

        {/* Hero Interactive Simulation Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Rogue Offboarding</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Auto-exclude CK080 & CK062 (40 drops)
            </div>
          </div>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
              isSimulated
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30 border border-emerald-400'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600 shadow-amber-600/20'
            }`}
          >
            {isSimulated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Simulation Active (CK080 & CK062 Removed)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>⚡ Simulate Offboarding CK080 & CK062</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Counterfactual Impact Banner when active */}
      {isSimulated ? (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-100 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl shadow-emerald-500/10">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Data-Driven Governance Simulation: Rogue Cooks Suspended</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/30">
                  COUNTERFACTUAL MODEL
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed max-w-3xl">
                By enforcing automated deactivation on chronic no-shows <strong>Imran Agarwal (CK080)</strong> and <strong>Salman Sharma (CK062)</strong>, Pune dropouts drop from <strong>49 to 9</strong>. Pune&apos;s failure rate drops from <span className="line-through text-red-400">{puneBaselineRate}%</span> to <span className="font-bold text-emerald-300">{puneSimulatedRate}%</span>, outperforming even Mumbai (1.12%) to become TiffinLoop&apos;s #1 most reliable city with ₹2.85 Lakhs in preserved annual ARR!
              </p>
            </div>
          </div>

          <button
            onClick={onToggleSimulation}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700 transition-colors cursor-pointer"
          >
            Reset to Baseline
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Executive Discovery:</strong> Pune suffers a 5.27% dropout rate, but <strong>81.6% (40 of 49)</strong> of all Pune dropouts were caused by just two unmanaged cooks.
            </span>
          </div>
          <button
            onClick={onToggleSimulation}
            className="text-xs font-bold text-amber-300 hover:text-white underline cursor-pointer shrink-0 flex items-center gap-1"
          >
            <span>Simulate Solution</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
