'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, CheckCheck, X, Send, AlertTriangle } from 'lucide-react';

interface SimulatedNotification {
  subscriberId: string;
  subscriberName: string;
  phone: string;
  message: string;
  sentAt: string;
  isDuplicateConsolidated?: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SimulatedNotification[];
  cookName: string;
  onConfirmDispatch: () => void;
  isDispatching: boolean;
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  cookName,
  onConfirmDispatch,
  isDispatching,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const hasDuplicateConsolidated = notifications.some(n => n.isDuplicateConsolidated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Simulated Subscriber WhatsApp Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Review automated emergency customer communications for disrupted orders from {cookName}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Deduplication Safeguard Banner */}
          {hasDuplicateConsolidated && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-600/50 text-blue-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Deduplication Safeguard Triggered (Tariq Hussain)
              </div>
              <p className="text-blue-200/90 leading-relaxed">
                Subscribers <span className="font-mono font-semibold">SUB0511</span> &amp;{' '}
                <span className="font-mono font-semibold">SUB0512</span> share phone{' '}
                <span className="font-mono font-semibold">+91 98123 45678</span>. Both meal orders
                (#ORD07117 &amp; #ORD07118) have been consolidated into a <strong>single WhatsApp message</strong>{' '}
                to prevent double notifications.
              </p>
            </div>
          )}

          {/* List of Simulated Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
              <span>{notifications.length} Messages Prepared for Dispatch</span>
              <span>Simulation Anchor: 10:30 AM</span>
            </div>

            {notifications.map((notif, index) => (
              <div
                key={`${notif.subscriberId}-${index}`}
                className={`p-4 rounded-xl border transition-all ${
                  notif.isDuplicateConsolidated
                    ? 'bg-blue-950/20 border-blue-500/40'
                    : 'bg-slate-800/60 border-slate-700/70'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{notif.subscriberName}</span>
                    <span className="font-mono text-slate-400">{notif.phone}</span>
                    {notif.isDuplicateConsolidated && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Consolidated 2 Orders
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <span>10:30 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-emerald-950/40 border border-emerald-700/40 p-3 rounded-lg text-xs font-sans text-emerald-100 whitespace-pre-line leading-relaxed shadow-sm">
                  {notif.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Dispatching dispatches simulated messages and logs an immutable audit event.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isDispatching}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel / Adjust Plan
            </button>
            <button
              onClick={onConfirmDispatch}
              disabled={isDispatching || notifications.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isDispatching
                ? 'Dispatching Notifications...'
                : `✅ Confirm & Dispatch All (${notifications.length}) Messages`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
