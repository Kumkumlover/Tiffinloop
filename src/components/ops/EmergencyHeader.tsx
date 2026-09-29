'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, IndianRupee, Users, ChefHat, Info } from 'lucide-react';

interface EmergencyHeaderProps {
  stats: {
    activeDropoutsCount: number;
    totalDisruptedOrders: number;
    totalDisruptedLunchOrders: number;
    totalDisruptedDinnerOrders: number;
    revenueAtRisk: number;
  };
  resolvedCount: number;
  operationalNotices?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
  }>;
}

export function EmergencyHeader({ stats, resolvedCount, operationalNotices = [] }: EmergencyHeaderProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(7200); // 2 hours to 12:30 PM

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const timeStr = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  const remainingDropouts = Math.max(0, stats.activeDropoutsCount - resolvedCount);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white p-4 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              LIVE CRISIS TRIAGE DESK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Anchor: 23-Sep-2026, 10:30 AM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            TiffinLoop Ops Emergency Desk
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-red-950/60 border border-red-700/60 px-4 py-2.5 rounded-xl text-red-200">
          <Clock className="w-6 h-6 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-red-300 font-semibold">
              Lunch Dispatch Window (12:30 PM)
            </div>
            <div className="text-xl font-mono font-bold text-red-100">
              {timeStr}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Unresolved Dropouts</span>
            <ChefHat className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold flex items-baseline gap-2">
            <span className={remainingDropouts > 0 ? "text-red-400" : "text-emerald-400"}>
              {remainingDropouts}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              of {stats.activeDropoutsCount} cooks
            </span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Orders at Risk</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 flex items-baseline gap-2">
            <span>{stats.totalDisruptedOrders}</span>
            <span className="text-xs text-amber-400/80 font-normal">
              ({stats.totalDisruptedLunchOrders} Lunch / {stats.totalDisruptedDinnerOrders} Dinner)
            </span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Revenue at Risk</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            ₹{stats.revenueAtRisk.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Subscribers Affected</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300 flex items-baseline gap-2">
            <span>{stats.totalDisruptedOrders}</span>
            <span className="text-xs text-blue-400/80 font-normal">
              (1 Duplicate Linked)
            </span>
          </div>
        </div>
      </div>

      {/* Operational Intelligence & Forward Look Strip */}
      {operationalNotices && operationalNotices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          {operationalNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                notice.type === 'FESTIVAL_WEEK'
                  ? 'bg-purple-950/40 border-purple-800/50 text-purple-200'
                  : notice.type === 'ADVANCE_LOGISTICS'
                  ? 'bg-blue-950/40 border-blue-800/50 text-blue-200'
                  : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  {notice.title}
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  {notice.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
