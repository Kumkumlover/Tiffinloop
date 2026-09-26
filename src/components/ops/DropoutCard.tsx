'use client';

import React from 'react';
import { DropoutAlert } from '@/lib/types';
import { ChefHat, CheckCircle2, AlertTriangle, MessageSquare, FileSpreadsheet, MapPin, Link as LinkIcon } from 'lucide-react';

interface DropoutCardProps {
  dropout: DropoutAlert;
  isSelected: boolean;
  isResolved: boolean;
  onSelect: () => void;
}

export function DropoutCard({
  dropout,
  isSelected,
  isResolved,
  onSelect,
}: DropoutCardProps) {
  const lunchCount = dropout.affectedOrders.filter(o => o.mealType === 'Lunch').length;
  const dinnerCount = dropout.affectedOrders.filter(o => o.mealType === 'Dinner').length;
  const jainCount = dropout.affectedOrders.filter(o => o.subscriber?.diet === 'Jain').length;
  const hasDuplicateSub = dropout.affectedOrders.some(
    o => o.subscriber?.isDuplicateOf || (o.subscriber?.duplicateIds && o.subscriber.duplicateIds.length > 0)
  );

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
      className={`relative text-left p-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-slate-800/95 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/50'
          : isResolved
          ? 'bg-slate-900/60 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700'
          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80'
      }`}
    >
      {/* Top Bar: Source badge & Resolution status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {dropout.source === 'WHATSAPP_UNRECORDED' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <MessageSquare className="w-3 h-3 text-amber-400" />
            WhatsApp Alert (7:41 AM)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <FileSpreadsheet className="w-3 h-3 text-slate-400" />
            Sheet (on_leave)
          </span>
        )}

        {isResolved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RESOLVED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            ACTION REQUIRED
          </span>
        )}
      </div>

      {/* Cook Name & ID */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-slate-400" />
            {dropout.cookName}
          </h3>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
            <span className="text-amber-400/90 font-semibold">{dropout.cookId}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {dropout.city}
            </span>
            <span>•</span>
            <span>{dropout.cuisineSpecialty}</span>
          </div>
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-300 italic bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/70 mb-3">
        &ldquo;{dropout.reason}&rdquo;
      </p>

      {/* Order Disruption Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Lunch (12:30 PM)</div>
          <div className="text-sm font-bold text-red-400 flex items-center gap-1">
            {lunchCount} Orders
            {lunchCount > 0 && <span className="text-[10px] px-1 bg-red-500/20 rounded">URGENT</span>}
          </div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Dinner (7:30 PM)</div>
          <div className="text-sm font-bold text-slate-200">
            {dinnerCount} Orders
          </div>
        </div>
      </div>

      {/* Warning Badges: Jain & Duplicate Subscriber */}
      <div className="flex flex-wrap gap-1.5">
        {jainCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {jainCount} Jain Order (MRV Constraint)
          </span>
        )}
        {hasDuplicateSub && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <LinkIcon className="w-3 h-3 text-blue-400" />
            Duplicate Subscriber (Tariq H.)
          </span>
        )}
        {dropout.source === 'WHATSAPP_UNRECORDED' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-950/40 text-red-300 border border-red-800/50">
            Unsheeted in CSV
          </span>
        )}
      </div>
    </div>
  );
}
