'use client';

import React, { useState } from 'react';
import { GitFork, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export function CausalLoopDiagram() {
  const [activeLoop, setActiveLoop] = useState<'FAILURE' | 'BALANCING'>('FAILURE');

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-400" />
            Systems Thinking &amp; Causality Loops (Leyla Acaroglu Model)
          </h2>
          <p className="text-xs text-slate-400">
            Visualizing the reinforcing operational doom-loop vs. the balancing governance intervention.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveLoop('FAILURE')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeLoop === 'FAILURE'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reinforcing Failure Loop
          </button>
          <button
            onClick={() => setActiveLoop('BALANCING')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeLoop === 'BALANCING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Balancing Governance Loop
          </button>
        </div>
      </div>

      {activeLoop === 'FAILURE' ? (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>The Reactive Doom-Loop Currently Paralyzing TiffinLoop Operations</span>
          </div>

          {/* Interactive visual loop flow */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-red-800/60 shadow">
              <div className="text-[10px] text-red-400 font-bold uppercase">Root Cause</div>
              <div className="font-extrabold text-white text-xs mt-1">Rogue Cooks (CK080/CK062)</div>
              <div className="text-[10px] text-slate-400 mt-1">20 no-shows each without suspension</div>
            </div>

            <div className="text-red-400 font-mono text-xs hidden sm:flex justify-center">
              ──►
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-red-800/60 shadow">
              <div className="text-[10px] text-red-400 font-bold uppercase">System Shock</div>
              <div className="font-extrabold text-red-300 text-xs mt-1">Dropouts Surge (5.27%)</div>
              <div className="text-[10px] text-slate-400 mt-1">40 unfulfilled meals in Pune alone</div>
            </div>

            <div className="text-red-400 font-mono text-xs hidden sm:flex justify-center">
              ──►
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-red-800/60 shadow">
              <div className="text-[10px] text-red-400 font-bold uppercase">Customer Churn</div>
              <div className="font-extrabold text-amber-300 text-xs mt-1">₹8.55L ARR Bleed</div>
              <div className="text-[10px] text-slate-400 mt-1">35% churn on 95 disrupted subs</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
            <strong className="text-red-300">Why it keeps repeating:</strong> Because morning triage coordinators are forced to frantically reassign meals under a 120-minute countdown, they never have time to file vendor deactivations. The system blindly allocates tomorrow&apos;s orders right back to the same rogue cooks, perpetuating the crisis every single week.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Balancing Governance System Implemented in Build 2</span>
          </div>

          {/* Interactive visual loop flow */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/60 shadow">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Policy Filter</div>
              <div className="font-extrabold text-white text-xs mt-1">Automated 3-Strike Rule</div>
              <div className="text-[10px] text-slate-400 mt-1">Auto-deactivates chronic no-shows</div>
            </div>

            <div className="text-emerald-400 font-mono text-xs hidden sm:flex justify-center">
              ──►
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/60 shadow">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Standby Buffer</div>
              <div className="font-extrabold text-emerald-300 text-xs mt-1">Pune Standby Pool</div>
              <div className="text-[10px] text-slate-400 mt-1">2 retainers guarantee 10 backup meals</div>
            </div>

            <div className="text-emerald-400 font-mono text-xs hidden sm:flex justify-center">
              ──►
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/60 shadow">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Permanent Win</div>
              <div className="font-extrabold text-emerald-300 text-xs mt-1">Pune Rate: 0.97%</div>
              <div className="text-[10px] text-slate-400 mt-1">98.68% Network Reliability</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
            <strong className="text-emerald-300">The Balancing Intervention:</strong> By replacing manual discretion with an algorithmic 3-strike deactivation gate and pre-purchasing standby buffer capacity in Pune, the failure loop is broken permanently. Pune transforms from TiffinLoop&apos;s worst city to its #1 most reliable market.
          </div>
        </div>
      )}
    </div>
  );
}
