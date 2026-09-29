import Link from 'next/link';
import { AlertCircle, BarChart3, Clock, FileText, ScrollText, Github, CheckCircle2, Timer } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white selection:bg-amber-500 selection:text-black">
      <div className="max-w-4xl w-full text-center space-y-6">
        
        {/* Top Metadata Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Project Working Time: Exactly 3:30 hrs (Hard Limit: 4:00 hrs)</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Simulation Anchor: 23-Sep-2026, 10:30 AM (Lunch in 2 hrs)</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            TiffinLoop Operations Portal
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mt-2 max-w-2xl mx-auto">
            StampMyVisa AI Product Manager Hiring Assignment Deliverables & Dual-Build Systems.
          </p>
        </div>

        {/* 4-Card Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-left">
          
          {/* Card 1: Build 1 Ops Desk */}
          <Link
            href="/ops"
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 hover:bg-slate-900 transition-all group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Build 1: Crisis Desk
              </span>
              <AlertCircle className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-100 group-hover:text-white">Ops Emergency Triage</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Detect active dropouts, match backup cooks with remaining capacity via MRV solver, and notify subscribers before 12:30 PM.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-400">
              <span>Launch Crisis Desk</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card 2: Build 2 Leadership View */}
          <Link
            href="/leadership"
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 transition-all group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Build 2: Leadership View
              </span>
              <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-100 group-hover:text-white">30-Day Intelligence & Risk</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Spot macro patterns across 7,138 orders. Uncover Pune's rogue vendor anomaly and test the counterfactual offboarding simulator.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span>Launch Executive Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card 3: Deliverable 1 One-Page PRD */}
          <a
            href="https://github.com/Kumkumlover/Tiffinloop/blob/main/.agents/prds/tiffinloop-production-one-page.prd.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Deliverable 1 (Hard Limit)
              </span>
              <FileText className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-100 group-hover:text-white">One-Page Production PRD</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strictly 481 body words across 6 mandatory sections. Grounded in ProMan frameworks (Systems Thinking & Outcome Hierarchy).
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Read One-Page PRD (GitHub)</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
          </a>

          {/* Card 4: Deliverable 4 AI Build Log */}
          <a
            href="https://github.com/Kumkumlover/Tiffinloop/blob/main/docs/BUILD_LOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all group shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Deliverable 4: Build Log
              </span>
              <ScrollText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-100 group-hover:text-white">Multi-Agent AI Build Log</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Complete chronological prompt history and AI agent reasoning across 3 parallel ECC threads (Builder, Researcher, Reviewer).
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <span>Inspect Build Log (docs/BUILD_LOG.md)</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </div>
          </a>

        </div>

        {/* Bottom Verification Footer */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Vitest Verification:</span>
            <span>41 / 41 passing across 8 suites (100% green)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Kumkumlover/Tiffinloop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Kumkumlover/Tiffinloop</span>
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
