'use client';

import React from 'react';
import { DropoutAlert, FallbackCandidate, TriageAssignment, NormalizedOrder } from '@/lib/types';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, ChefHat, Check, Zap } from 'lucide-react';

interface FallbackMatcherProps {
  alert: DropoutAlert;
  candidates: FallbackCandidate[];
  plan: {
    assignments: TriageAssignment[];
    unassignedOrders: NormalizedOrder[];
    allocatedCapacityByCook: Record<string, number>;
  } | null;
  onGenerateAutoPlan: () => void;
  onProceedToDispatch: () => void;
  isLoading: boolean;
}

export function FallbackMatcher({
  alert,
  candidates,
  plan,
  onGenerateAutoPlan,
  onProceedToDispatch,
  isLoading,
}: FallbackMatcherProps) {
  const hasJain = alert.affectedOrders.some(o => o.subscriber?.diet === 'Jain');
  const totalOrders = alert.affectedOrders.length;
  const isPlanReady = plan && plan.assignments.length > 0;
  const unassignedCount = plan ? plan.unassignedOrders.length : 0;
  const assignedCount = plan ? plan.assignments.filter(a => !a.isRefund).length : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Hero 2-Click Action Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl p-4 sm:p-5 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                HERO 2-CLICK RESOLUTION
              </span>
              <span className="text-xs text-slate-400">
                MRV Constraint Engine (Strictest Diet First)
              </span>
            </div>
            <h4 className="text-lg font-bold text-white">
              Deterministic Fallback Matcher
            </h4>
            <p className="text-xs text-slate-400 max-w-xl mt-0.5">
              Automatically matches high-capacity backup kitchens, isolates Jain dietary requirements,
              and splits batches when kitchen capacities are exceeded.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isPlanReady ? (
              <button
                onClick={onGenerateAutoPlan}
                disabled={isLoading || candidates.length === 0}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                {isLoading ? 'Computing Optimal Slots...' : '⚡ 1-Click Smart Match & Preview'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGenerateAutoPlan}
                  disabled={isLoading}
                  className="px-3.5 py-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  Recalculate
                </button>
                <button
                  onClick={onProceedToDispatch}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>Review & Dispatch Notifications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Plan Preview Banner (if generated) */}
        {isPlanReady && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/90 border border-emerald-500/40 p-3 rounded-xl">
              <div className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Orders Covered
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                {assignedCount} of {totalOrders}
                <span className="text-xs text-emerald-400 font-normal ml-2">
                  ({Math.round((assignedCount / totalOrders) * 100)}%)
                </span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                Kitchen Split Strategy
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {Object.keys(plan.allocatedCapacityByCook).length > 1
                  ? `Multi-Cook Split (${Object.keys(plan.allocatedCapacityByCook).length} Kitchens)`
                  : 'Single Kitchen Reassignment'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {Object.entries(plan.allocatedCapacityByCook)
                  .map(([cId, count]) => `${cId}: ${count} orders`)
                  .join(' • ')}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                MRV Dietary Compliance
              </div>
              <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Jain Protected
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {hasJain ? 'Jain orders routed to certified kitchen' : 'No Jain orders in this batch'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Kitchens Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-400" />
              Ranked Fallback Kitchens in {alert.city}
            </h4>
            <p className="text-xs text-slate-400">
              Scored via Cuisine Similarity (100) + Capacity Headroom (40) + Reliability (30)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {candidates.length} Available in City
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            No active backup kitchens found with capacity in {alert.city}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {candidates.slice(0, 6).map((cand, idx) => {
              const allocatedInPlan = plan?.allocatedCapacityByCook[cand.cookId] || 0;
              const effectiveRemaining = Math.max(0, cand.remainingCapacity - allocatedInPlan);
              const isJainCertified = cand.serves.includes('Jain');
              const isExactCuisine = cand.cuisineSpecialty === alert.cuisineSpecialty;
              const capacityPercent = Math.min(
                100,
                Math.round((cand.activeOrdersToday / cand.maxDailyOrders) * 100)
              );

              return (
                <div
                  key={cand.cookId}
                  className={`p-4 rounded-xl border transition-all ${
                    allocatedInPlan > 0
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Top Bar: Rank & Score */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-200">
                      Rank #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {cand.score.toFixed(1)} pts
                    </span>
                  </div>

                  {/* Cook Info */}
                  <div className="mb-2">
                    <div className="font-bold text-white text-sm">
                      {cand.cookName}
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span className="text-amber-400/90">{cand.cookId}</span>
                      <span>•</span>
                      <span>{cand.cuisineSpecialty}</span>
                    </div>
                  </div>

                  {/* Badges: Cuisine & Diet */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {isExactCuisine ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ⭐ Exact Cuisine
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-300">
                        {cand.cuisineSpecialty}
                      </span>
                    )}

                    {isJainCertified ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ✅ Jain Certified
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        🛑 No Jain
                      </span>
                    )}
                  </div>

                  {/* Capacity Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Remaining Capacity:</span>
                      <span className="font-mono font-bold text-white">
                        {cand.remainingCapacity} slots left
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent > 80
                            ? 'bg-rose-500'
                            : capacityPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Active: {cand.activeOrdersToday}</span>
                      <span>Max: {cand.maxDailyOrders}</span>
                    </div>
                  </div>

                  {/* In-Plan Allocation Indicator */}
                  {allocatedInPlan > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Allocated:
                      </span>
                      <span className="font-bold font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        +{allocatedInPlan} Orders Assigned
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
