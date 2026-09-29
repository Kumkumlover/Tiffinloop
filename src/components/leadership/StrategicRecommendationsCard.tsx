'use client';

import React from 'react';
import { LeadershipAnalyticsResponse } from '@/lib/types';
import { Target, CheckCircle2, ArrowRight, ShieldCheck, Zap, DollarSign, Clock, X } from 'lucide-react';

interface StrategicRecommendationsCardProps {
  analytics: LeadershipAnalyticsResponse;
  deployedPolicies: string[];
  onTogglePolicy: (policyId: string) => void;
}

export function StrategicRecommendationsCard({
  analytics,
  deployedPolicies,
  onTogglePolicy,
}: StrategicRecommendationsCardProps) {
  const { strategicRecommendations } = analytics;

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Strategic Leadership Initiatives &amp; Implementation Roadmap
          </h2>
          <p className="text-xs text-slate-400">
            Click &ldquo;Deploy Policy&rdquo; to enact operational guardrails and calculate live impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {deployedPolicies.length > 0 && (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {deployedPolicies.length} Active {deployedPolicies.length === 1 ? 'Policy' : 'Policies'} Deployed
            </span>
          )}
          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Target Value: ~₹15.5 Lakhs ARR Preserved
          </div>
        </div>
      </div>

      {/* Grid of 4 Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategicRecommendations.map((rec, idx) => {
          const isDeployed = deployedPolicies.includes(rec.id);

          return (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isDeployed
                  ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                      isDeployed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    Initiative #{idx + 1} &bull; {rec.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    {rec.projectedRoi}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <span>{rec.title}</span>
                  {isDeployed && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      LIVE
                    </span>
                  )}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {rec.action}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="font-medium text-[11px] leading-tight">{rec.annualSavings}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Timeline: <strong className="text-slate-300 font-normal">{rec.timeline}</strong>
                  </span>

                  {/* Functional Deploy / Revoke Button */}
                  <button
                    onClick={() => onTogglePolicy(rec.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
                      isDeployed
                        ? 'bg-emerald-600 text-white hover:bg-red-600 shadow-md shadow-emerald-600/20 group'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isDeployed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 group-hover:hidden" />
                        <X className="w-3.5 h-3.5 text-red-200 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Policy Active</span>
                        <span className="hidden group-hover:inline">Revoke Policy</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Deploy Policy</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
