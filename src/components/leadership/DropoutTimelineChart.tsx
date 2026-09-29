'use client';

import React, { useState } from 'react';
import { CanonicalCity, LeadershipAnalyticsResponse } from '@/lib/types';
import { Calendar, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface DropoutTimelineChartProps {
  analytics: LeadershipAnalyticsResponse;
  selectedCity?: 'ALL' | CanonicalCity;
}

export function DropoutTimelineChart({
  analytics,
  selectedCity = 'ALL',
}: DropoutTimelineChartProps) {
  const { dailyTimeline } = analytics;
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Compute city-scoped values for each day
  const scopedTimeline = dailyTimeline.map(item => {
    let cityDropouts = item.dropouts;
    if (selectedCity === 'Bengaluru') cityDropouts = item.byCity.bengaluru;
    else if (selectedCity === 'Mumbai') cityDropouts = item.byCity.mumbai;
    else if (selectedCity === 'Pune') cityDropouts = item.byCity.pune;

    return {
      ...item,
      scopedDropouts: cityDropouts,
    };
  });

  const maxDropouts = Math.max(...scopedTimeline.map(d => d.scopedDropouts), 6);
  const activeHover =
    scopedTimeline.find(d => d.date === hoveredDate) || scopedTimeline[scopedTimeline.length - 1];

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            30-Day Daily Disruption Timeline &amp; Festival Surge
          </h2>
          <p className="text-xs text-slate-400">
            {selectedCity === 'ALL'
              ? 'Chronological breakdown of cook dropouts across Bengaluru, Mumbai, and Pune.'
              : `Daily dropouts recorded specifically in ${selectedCity}.`}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Scope: {selectedCity === 'ALL' ? 'All Hubs' : selectedCity}
          </span>
          <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
            Festival Week (22-23 Sep)
          </span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl">
        <div className="h-44 flex items-end gap-1.5 sm:gap-2 justify-between pt-6 pb-2">
          {scopedTimeline.map((item, idx) => {
            const heightPercent = Math.max(6, (item.scopedDropouts / maxDropouts) * 100);
            const isHovered = hoveredDate === item.date;
            const isFestival = item.isFestivalSurge;

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredDate(item.date)}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Festival Badge Callout above 23-Sep */}
                {item.date === '2026-09-23' && (
                  <div className="absolute -top-7 whitespace-nowrap bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow animate-bounce">
                    5.7x Spike!
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isFestival
                      ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-md shadow-purple-500/20'
                      : isHovered
                      ? 'bg-indigo-400'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Day Label */}
                <div className="text-[9px] font-mono text-slate-500 mt-1.5 truncate">
                  {idx % 5 === 0 || isFestival ? item.date.slice(8) : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Tooltip / Inspect Details */}
        {activeHover && (
          <div className="mt-3 pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                Date: {activeHover.date}
              </span>
              {activeHover.isFestivalSurge && (
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[10px]">
                  FESTIVAL SEASONALITY SURGE ACTIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 tabular-nums">
              <span>
                {selectedCity === 'ALL' ? 'Total Drops' : `${selectedCity} Drops`}:{' '}
                <strong className="text-red-400">{activeHover.scopedDropouts}</strong>
              </span>
              <span className="text-slate-400">
                BLR: {activeHover.byCity.bengaluru} | MUM: {activeHover.byCity.mumbai} | PUN: {activeHover.byCity.pune}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Operational Root Cause Alert */}
      <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">The Festival Seasonality Shock:</strong> Baseline dropouts held steady at 4.1/day until 22-Sep, when ops posted: <em>&ldquo;Reminder team, festival week starting. Expect more leave requests from cooks.&rdquo;</em> Without advance leave booking protocols or dynamic surge completion bonuses, 24 orders collapsed this morning alone.
        </div>
      </div>
    </div>
  );
}
