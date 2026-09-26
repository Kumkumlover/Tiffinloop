import Link from 'next/link';
import { AlertCircle, BarChart3, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/30">
          <Clock className="w-4 h-4" />
          <span>Simulation Active: 23-Sep-2026, 10:30 AM (Lunch in 2 hrs)</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          TiffinLoop Operations Portal
        </h1>
        <p className="text-slate-400 text-lg">
          Emergency cook dropout triage desk and 30-day reliability analytics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
          <Link
            href="/ops"
            className="p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-red-500/20 text-red-400">
                CRISIS DESK
              </span>
              <AlertCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1">Ops Emergency Triage</h2>
            <p className="text-sm text-slate-400">
              Detect active dropouts, match backup cooks with remaining capacity, and notify subscribers before 12:30 PM.
            </p>
          </Link>

          <Link
            href="/leadership"
            className="p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                EXECUTIVE VIEW
              </span>
              <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-xl font-bold mb-1">30-Day Reliability</h2>
            <p className="text-sm text-slate-400">
              Spot dropout patterns across Bengaluru, Mumbai, and Pune. Track chronic no-shows and revenue impact.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
