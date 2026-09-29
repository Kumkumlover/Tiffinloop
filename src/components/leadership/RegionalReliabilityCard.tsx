'use client';

import React from 'react';
import { CanonicalCity, LeadershipAnalyticsResponse } from '@/lib/types';
import { MapPin, TrendingDown, CheckCircle2, AlertTriangle, Users, ChefHat } from 'lucide-react';

interface RegionalReliabilityCardProps {
  analytics: LeadershipAnalyticsResponse;
  selectedCity: 'ALL' | CanonicalCity;
  onSelectCity: (city: 'ALL' | CanonicalCity) => void;
}

export function RegionalReliabilityCard({
  analytics,
  selectedCity,
  onSelectCity,
}: RegionalReliabilityCardProps) {
  const { regionalBreakdown, isSimulated } = analytics;

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Regional Hub Reliability Matrix (30 Days)
          </h2>
          <p className="text-xs text-slate-400">
            Comparative performance across Bengaluru, Mumbai, and Pune operational hubs.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Baseline vs Simulated Impact
        </div>
      </div>

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {regionalBreakdown.map(region => {
          const isSelected = selectedCity === region.city || selectedCity === 'ALL';
          const isPune = region.city === 'Pune';
          const isMumbai = region.city === 'Mumbai';

          return (
            <div
              key={region.city}
              onClick={() => onSelectCity(region.city)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/80 border-slate-700/90 shadow-md'
                  : 'bg-slate-900/40 border-slate-800/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-white text-base flex items-center gap-1.5">
                  {region.city}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isPune && !isSimulated
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : isMumbai || (isPune && isSimulated)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {isPune && !isSimulated
                    ? 'CRITICAL ALERT'
                    : isMumbai
                    ? 'MOST RELIABLE'
                    : isPune && isSimulated
                    ? 'EXCEPTIONAL (SIM)'
                    : 'SCALE HUB'}
                </span>
              </div>

              {/* Dropout Rate Big Number */}
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className={`text-2xl font-extrabold ${
                    isPune && !isSimulated
                      ? 'text-red-400'
                      : region.dropoutRate <= 1.2
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {region.dropoutRate}%
                </span>
                <span className="text-xs text-slate-400">dropout rate</span>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPune && !isSimulated
                      ? 'bg-red-500'
                      : region.dropoutRate <= 1.2
                      ? 'bg-emerald-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (region.dropoutRate / 6) * 100)}%` }}
                />
              </div>

              {/* Micro stats table */}
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Orders (30D):</span>
                  <span className="font-semibold text-white">{region.totalOrders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dropout Orders:</span>
                  <span className="font-semibold text-red-300">{region.dropoutOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Network:</span>
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <ChefHat className="w-3 h-3 text-slate-400" /> {region.activeCooks}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-slate-400" /> {region.activeSubscribers}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Callout Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <TrendingDown className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Leadership Insight:</strong> Bengaluru delivers 63.2% of total company volume (4,510 orders) with a sustainable 1.46% failure baseline. Mumbai operates with industry-leading 1.12% reliability. Pune&apos;s apparent unreliability (5.27%) is completely localized to 2 rogue vendors, not a structural delivery deficit.
        </div>
      </div>
    </div>
  );
}
