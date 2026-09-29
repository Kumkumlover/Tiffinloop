'use client';

import React, { useState, useEffect } from 'react';
import { CanonicalCity, LeadershipAnalyticsResponse } from '@/lib/types';
import { ExecutiveNavbar } from '@/components/leadership/ExecutiveNavbar';
import { ExecutiveFilterHeader } from '@/components/leadership/ExecutiveFilterHeader';
import { MacroKPIBar } from '@/components/leadership/MacroKPIBar';
import { RegionalReliabilityCard } from '@/components/leadership/RegionalReliabilityCard';
import { DropoutTimelineChart } from '@/components/leadership/DropoutTimelineChart';
import { RogueCookLeaderboard } from '@/components/leadership/RogueCookLeaderboard';
import { PredictiveRiskPanel } from '@/components/leadership/PredictiveRiskPanel';
import { StrategicRecommendationsCard } from '@/components/leadership/StrategicRecommendationsCard';
import { CausalLoopDiagram } from '@/components/leadership/CausalLoopDiagram';
import { Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function LeadershipPage() {
  const [analytics, setAnalytics] = useState<LeadershipAnalyticsResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState<'ALL' | CanonicalCity>('ALL');
  const [isSimulated, setIsSimulated] = useState(false);
  const [deployedPolicies, setDeployedPolicies] = useState<string[]>([]);
  const [policyToast, setPolicyToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics(simulated: boolean) {
    try {
      setIsLoading(true);
      setError(null);
      const url = `/api/analytics${simulated ? '?simulateOffboarding=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load leadership analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics(isSimulated);
  }, [isSimulated]);

  function handleToggleSimulation() {
    const nextState = !isSimulated;
    setIsSimulated(nextState);
    if (nextState) {
      if (!deployedPolicies.includes('REC-1')) {
        setDeployedPolicies(prev => [...prev, 'REC-1']);
      }
      setPolicyToast('⚡ Simulation Active: Rogue cooks CK080 & CK062 suspended! Pune drop rate drops to 0.97%.');
    } else {
      setDeployedPolicies(prev => prev.filter(p => p !== 'REC-1'));
      setPolicyToast('Reset: Reverted to 30-day baseline data.');
    }
  }

  function handleTogglePolicy(policyId: string) {
    setDeployedPolicies(prev => {
      const exists = prev.includes(policyId);
      let next: string[];

      if (exists) {
        next = prev.filter(p => p !== policyId);
        setPolicyToast(`Policy ${policyId} revoked.`);
        if (policyId === 'REC-1' && isSimulated) {
          setIsSimulated(false);
        }
      } else {
        next = [...prev, policyId];
        if (policyId === 'REC-1') {
          setIsSimulated(true);
          setPolicyToast('✅ Policy REC-1 Enacted: Automated 3-strike deactivation on CK080 & CK062 live! Pune drop rate collapses to 0.97%.');
        } else if (policyId === 'REC-2') {
          setPolicyToast('✅ Policy REC-2 Enacted: Pune Standby Cook Pool contracted (CK018 & CK021 on ₹300/day retainer).');
        } else if (policyId === 'REC-3') {
          setPolicyToast('✅ Policy REC-3 Enacted: +₹25 Festival Surge Completion Bonus & 48h Advance Notice Freeze active.');
        } else if (policyId === 'REC-4') {
          setPolicyToast('✅ Policy REC-4 Enacted: Subscriber Churn Shield deployed (15-min auto-refunds & VIP upgrades active).');
        }
      }
      return next;
    });
  }

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <ExecutiveNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">
            Crunching 7,138 orders and normalizing 30-day vendor reliability metrics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <ExecutiveNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 max-w-md">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="font-bold mb-1">Failed to load analytics</div>
            <div className="text-xs text-red-300 mb-4">{error}</div>
            <button
              onClick={() => fetchAnalytics(isSimulated)}
              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-xs font-semibold text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Executive Navigation */}
      <ExecutiveNavbar onRefresh={() => fetchAnalytics(isSimulated)} isLoading={isLoading} />

      {/* Main Executive View Content: Expands gracefully across wide monitors */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1720px] w-full mx-auto space-y-6">
        {/* Dynamic Policy Feedback Toast */}
        {policyToast && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{policyToast}</span>
            </div>
            <button
              onClick={() => setPolicyToast(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter & Hero Simulation Switch */}
        <ExecutiveFilterHeader
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isSimulated={isSimulated}
          onToggleSimulation={handleToggleSimulation}
          puneBaselineRate={5.27}
          puneSimulatedRate={analytics.rogueCooks.counterfactualPuneRate}
        />

        {/* 4 Executive KPI Tiles (Dynamically filtered by selectedCity) */}
        <MacroKPIBar analytics={analytics} selectedCity={selectedCity} />

        {/* 2-Column Responsive Section 1: Geography & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegionalReliabilityCard
            analytics={analytics}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
          <DropoutTimelineChart analytics={analytics} selectedCity={selectedCity} />
        </div>

        {/* 2-Column Responsive Section 2: Rogue Vendors & Predictive Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RogueCookLeaderboard analytics={analytics} selectedCity={selectedCity} />
          <PredictiveRiskPanel analytics={analytics} selectedCity={selectedCity} />
        </div>

        {/* Section 3: Systems Thinking & Causality Loops (Leyla Acaroglu) */}
        <CausalLoopDiagram />

        {/* Section 4: Executive Strategic Initiatives & Roadmap with Interactive Deploy Controls */}
        <StrategicRecommendationsCard
          analytics={analytics}
          deployedPolicies={deployedPolicies}
          onTogglePolicy={handleTogglePolicy}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        TiffinLoop AI Product Manager Assignment &bull; Built with Next.js 15, React 19, Tailwind CSS &amp; ECC Operating System
      </footer>
    </div>
  );
}
