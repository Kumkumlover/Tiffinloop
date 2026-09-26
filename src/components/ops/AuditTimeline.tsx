'use client';

import React from 'react';
import { AuditEvent } from '@/lib/triage-store';
import { History, CheckCircle2, RotateCcw, Shield, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface AuditTimelineProps {
  events: AuditEvent[];
  onClearHistory: () => void;
}

export function AuditTimeline({ events, onClearHistory }: AuditTimelineProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            Ops Traceability &amp; Immutable Audit Ledger
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {events.length} Events Logged
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every triage decision, capacity assignment, and notification dispatch is recorded with timestamped evidence.
          </p>
        </div>

        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Session Log
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          No triage events logged yet in this session.
          <div className="text-slate-600 mt-1">
            Select an active dropout card above and run 1-Click Smart Match to generate your first audit record.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-slate-400 font-semibold">
                    {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-white">
                    {event.cookName}
                  </span>
                  <span className="font-mono text-amber-400">({event.cookId})</span>
                  
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      event.resolutionType === 'AUTO_SPLIT'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : event.resolutionType === 'SINGLE_BACKUP'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {event.resolutionType}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {event.details}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {event.affectedOrdersCount} Orders Resolved
                  </span>
                  <span>•</span>
                  <span>
                    Backups: <strong className="text-slate-200">{event.assignedBackups.join(', ') || 'None'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Notifications: <strong className="text-slate-200">{event.notificationsSentCount} Sent</strong>
                  </span>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  <Shield className="w-3 h-3" />
                  Audit Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
