'use client';

import React from 'react';
import { CanonicalCity, LeadershipAnalyticsResponse } from '@/lib/types';
import { AlertOctagon, CheckCircle2, ShieldAlert, Award, CheckCircle } from 'lucide-react';

interface RogueCookLeaderboardProps {
  analytics: LeadershipAnalyticsResponse;
  selectedCity?: 'ALL' | CanonicalCity;
}

export function RogueCookLeaderboard({ analytics, selectedCity = 'ALL' }: RogueCookLeaderboardProps) {
  const { rogueCooks, isSimulated } = analytics;

  // Filter cooks based on city selection
  const filteredCooks =
    selectedCity === 'ALL'
      ? rogueCooks.cooks.slice(0, 8)
      : rogueCooks.cooks.filter(c => c.city === selectedCity).slice(0, 8);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            Vendor Governance &amp; Rogue Cook Leaderboard
          </h2>
          <p className="text-xs text-slate-400">
            {selectedCity === 'ALL'
              ? 'Ranked high-dropout vendors across all hubs. 2 cooks generated 81.6% of Pune dropouts.'
              : `Vendors with recorded dropouts in ${selectedCity}.`}
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Scope: {selectedCity === 'ALL' ? 'All Hubs' : selectedCity}
          </span>
          <span className="hidden sm:inline">&gt;20% Failure = Offboard</span>
        </div>
      </div>

      {/* Table */}
      {filteredCooks.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">Zero High-Risk Vendors in {selectedCity}</div>
          <div className="text-xs text-slate-400 mt-1">
            All cooks in {selectedCity} operate within safe reliability parameters (&lt;2% failure).
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rank / ID</th>
                <th className="py-2.5 px-3">Chef Name</th>
                <th className="py-2.5 px-3">Hub &amp; Cuisine</th>
                <th className="py-2.5 px-3 text-center">30D Drops</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3 text-center">Failure Rate</th>
                <th className="py-2.5 px-3 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCooks.map((cook, idx) => {
                const isRogue = cook.governanceStatus === 'ROGUE';
                const isOffboardedInSim = isSimulated && (cook.cookId === 'CK080' || cook.cookId === 'CK062');

                return (
                  <tr
                    key={cook.cookId}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isOffboardedInSim
                        ? 'bg-emerald-950/20 opacity-70'
                        : isRogue
                        ? 'bg-red-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400 flex items-center gap-1.5 tabular-nums">
                      <span>#{idx + 1}</span>
                      <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        {cook.cookId}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-white">
                      <span className={isOffboardedInSim ? 'line-through text-slate-500' : ''}>
                        {cook.cookName}
                      </span>
                      {isOffboardedInSim && (
                        <span className="ml-2 text-[10px] text-emerald-400 font-bold">
                          (OFFBOARDED)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      <span>{cook.city}</span> &bull; <span className="text-slate-400">{cook.cuisine}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                      <span
                        className={
                          isOffboardedInSim
                            ? 'text-slate-500 line-through'
                            : isRogue
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }
                      >
                        {cook.dropouts}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums">
                      {cook.totalOrders}
                    </td>

                    <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                      <span
                        className={
                          isOffboardedInSim
                            ? 'text-slate-500 line-through'
                            : isRogue
                            ? 'text-red-400 font-extrabold'
                            : 'text-amber-400'
                        }
                      >
                        {cook.dropoutRate}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isOffboardedInSim ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          PREVENTED
                        </span>
                      ) : isRogue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          <ShieldAlert className="w-3 h-3" />
                          IMMEDIATE OFFBOARD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          WATCHLIST
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Discovery Box */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">The 3-Strike Governance Solution:</strong> Over 78% of TiffinLoop&apos;s 92 cooks have <em>zero dropouts</em>. Chronic no-shows like Imran Agarwal and Salman Sharma in Pune account for 40 dropouts. Establishing an automated 3-strike deactivation gate permanently restores market integrity.
        </div>
      </div>
    </div>
  );
}
