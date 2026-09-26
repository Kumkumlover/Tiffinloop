'use client';

import React from 'react';
import { NormalizedOrder, TriageAssignment, MealType, FallbackCandidate } from '@/lib/types';
import { Clock, AlertTriangle, Link as LinkIcon, CheckCircle2, RotateCcw } from 'lucide-react';

interface AffectedOrdersTableProps {
  orders: NormalizedOrder[];
  assignments: TriageAssignment[];
  selectedMealFilter: 'ALL' | MealType;
  onMealFilterChange: (filter: 'ALL' | MealType) => void;
  candidates?: FallbackCandidate[];
  onManualAssign?: (orderId: string, backupCookId: string) => void;
}

export function AffectedOrdersTable({
  orders,
  assignments,
  selectedMealFilter,
  onMealFilterChange,
  candidates = [],
  onManualAssign,
}: AffectedOrdersTableProps) {
  const lunchCount = orders.filter(o => o.mealType === 'Lunch').length;
  const dinnerCount = orders.filter(o => o.mealType === 'Dinner').length;

  const filteredOrders = orders.filter(order => {
    if (selectedMealFilter === 'ALL') return true;
    return order.mealType === selectedMealFilter;
  });

  const assignmentMap = new Map<string, TriageAssignment>();
  for (const a of assignments) {
    assignmentMap.set(a.orderId, a);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header & Filter Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Disrupted Orders Roster
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredOrders.length} orders
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritize 12:30 PM lunch delivery window. Jain orders require strict root-vegetable exclusion.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => onMealFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedMealFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => onMealFilterChange('Lunch')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              selectedMealFilter === 'Lunch'
                ? 'bg-red-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lunch ({lunchCount})
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-bold">12:30 PM</span>
          </button>
          <button
            onClick={() => onMealFilterChange('Dinner')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedMealFilter === 'Dinner'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dinner ({dinnerCount})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Subscriber</th>
              <th className="py-3 px-4">Meal</th>
              <th className="py-3 px-4">Dietary Spec</th>
              <th className="py-3 px-4">Cuisine Pref</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Triage Status & Fallback Assignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No orders found for this meal filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const sub = order.subscriber;
                const assignment = assignmentMap.get(order.orderId);
                const isJain = sub?.diet === 'Jain';
                const isTariq = sub?.phone?.includes('9812345678') || order.subscriberId === 'SUB0511' || order.subscriberId === 'SUB0512';

                return (
                  <tr
                    key={order.orderId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isJain ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {order.orderId}
                      {order.rawStatus && (
                        <div className="text-[10px] text-slate-500 uppercase">{order.rawStatus}</div>
                      )}
                    </td>

                    {/* Subscriber */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {sub?.subscriberName || order.subscriberId}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {sub?.phoneDisplay || sub?.phone || 'No phone'}
                      </div>
                      {isTariq && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <LinkIcon className="w-2.5 h-2.5" />
                          Duplicate Sub: Tariq Hussain
                        </div>
                      )}
                    </td>

                    {/* Meal */}
                    <td className="py-3 px-4">
                      {order.mealType === 'Lunch' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          <Clock className="w-3 h-3 text-red-400" />
                          Lunch (12:30 PM)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Dinner (7:30 PM)
                        </span>
                      )}
                    </td>

                    {/* Diet */}
                    <td className="py-3 px-4">
                      {isJain ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          JAIN (Strict No Root Veg)
                        </span>
                      ) : sub?.diet === 'Non-Veg' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Non-Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Veg
                        </span>
                      )}
                    </td>

                    {/* Cuisine Pref */}
                    <td className="py-3 px-4 text-slate-300">
                      {sub?.cuisinePref || 'Standard'}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      ₹{order.amountInr}
                    </td>

                    {/* Triage Assignment */}
                    <td className="py-3 px-4">
                      {assignment ? (
                        assignment.isRefund ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <RotateCcw className="w-3.5 h-3.5" />
                            Refund + ₹50 Wallet Credit
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              {assignment.backupCookName}
                              <span className="font-mono text-[10px] text-emerald-400/80">
                                ({assignment.backupCookId})
                              </span>
                            </span>

                            {onManualAssign && candidates.length > 0 && (
                              <select
                                value={assignment.backupCookId || ''}
                                onChange={(e) => onManualAssign(order.orderId, e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded px-2 py-1 focus:ring-1 focus:ring-amber-500 outline-none"
                              >
                                {candidates.map(cand => {
                                  const canServe = !isJain || cand.serves.includes('Jain');
                                  return (
                                    <option
                                      key={cand.cookId}
                                      value={cand.cookId}
                                      disabled={!canServe || cand.remainingCapacity <= 0}
                                    >
                                      {cand.cookName} ({cand.cookId}) {!canServe ? '❌ No Jain' : `[${cand.remainingCapacity} left]`}
                                    </option>
                                  );
                                })}
                              </select>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Unassigned (Ready for Match)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
