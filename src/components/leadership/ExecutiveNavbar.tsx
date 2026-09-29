'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, BarChart3, Clock, ArrowRight, RefreshCw } from 'lucide-react';

interface ExecutiveNavbarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ExecutiveNavbar({ onRefresh, isLoading }: ExecutiveNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
          TL
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-white">
              TiffinLoop
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Executive Suite
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            30-Day Operational Intelligence & Strategic Governance
          </p>
        </div>
      </div>

      {/* Primary Navigation Switcher */}
      <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <Link
          href="/ops"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            pathname === '/ops'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Ops Emergency Desk</span>
        </Link>

        <Link
          href="/leadership"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            pathname === '/leadership'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Leadership Intelligence</span>
        </Link>
      </div>

      {/* Metadata & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700/60 font-mono">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Simulation Anchor: 23-Sep-2026 10:30 AM</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        )}
      </div>
    </nav>
  );
}
