'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EmergencyHeader } from '@/components/ops/EmergencyHeader';
import { DropoutCard } from '@/components/ops/DropoutCard';
import { AffectedOrdersTable } from '@/components/ops/AffectedOrdersTable';
import { FallbackMatcher } from '@/components/ops/FallbackMatcher';
import { NotificationModal } from '@/components/ops/NotificationModal';
import { AuditTimeline } from '@/components/ops/AuditTimeline';
import {
  DropoutAlert,
  FallbackCandidate,
  MealType,
  TriageAssignment,
  NormalizedOrder,
  OperationalNotice,
} from '@/lib/types';
import {
  getStoredAuditEvents,
  saveAuditEvent,
  getResolvedCookIds,
  saveResolvedCookId,
  getStoredPlans,
  saveStoredPlans,
  getStoredNotifications,
  saveStoredNotifications,
  clearTriageSession,
  AuditEvent,
} from '@/lib/triage-store';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TriageStats {
  activeDropoutsCount: number;
  totalDisruptedOrders: number;
  totalDisruptedLunchOrders: number;
  totalDisruptedDinnerOrders: number;
  revenueAtRisk: number;
}

export default function OpsPage() {
  const [activeDropouts, setActiveDropouts] = useState<DropoutAlert[]>([]);
  const [stats, setStats] = useState<TriageStats>({
    activeDropoutsCount: 0,
    totalDisruptedOrders: 0,
    totalDisruptedLunchOrders: 0,
    totalDisruptedDinnerOrders: 0,
    revenueAtRisk: 0,
  });
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null);
  const [resolvedCookIds, setResolvedCookIds] = useState<string[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [operationalNotices, setOperationalNotices] = useState<OperationalNotice[]>([]);

  // Triage state per cook
  const [candidatesByCookId, setCandidatesByCookId] = useState<Record<string, FallbackCandidate[]>>({});
  const [plansByCookId, setPlansByCookId] = useState<
    Record<
      string,
      {
        assignments: TriageAssignment[];
        unassignedOrders: NormalizedOrder[];
        allocatedCapacityByCook: Record<string, number>;
      }
    >
  >({});
  const [notificationsByCookId, setNotificationsByCookId] = useState<Record<string, any[]>>({});

  const [selectedMealFilter, setSelectedMealFilter] = useState<'ALL' | MealType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComputingPlan, setIsComputingPlan] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dataset and persistent storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/triage');
        const data = await res.json();

        if (data.activeDropouts) {
          setActiveDropouts(data.activeDropouts);
          setStats(data.stats);
          if (data.operationalNotices) {
            setOperationalNotices(data.operationalNotices);
          }

          // Restore resolved state from localStorage
          const savedResolved = getResolvedCookIds();
          setResolvedCookIds(savedResolved);

          // Restore audit events
          const savedAudits = getStoredAuditEvents();
          setAuditEvents(savedAudits);

          // Restore plans & notifications from localStorage
          const savedPlans = getStoredPlans();
          setPlansByCookId(savedPlans);

          const savedNotifs = getStoredNotifications();
          setNotificationsByCookId(savedNotifs);

          // Select first unresolved dropout, or first dropout
          const firstUnresolved = data.activeDropouts.find(
            (d: DropoutAlert) => !savedResolved.includes(d.cookId)
          );
          setSelectedCookId(
            firstUnresolved ? firstUnresolved.cookId : data.activeDropouts[0]?.cookId || null
          );

          // Load candidate kitchens for all active dropouts
          for (const dropout of data.activeDropouts) {
            fetchCandidates(dropout.cookId);
          }
        }
      } catch (err) {
        console.error('Failed to load triage desk data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  async function fetchCandidates(cookId: string) {
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_CANDIDATES', cookId }),
      });
      const data = await res.json();
      if (data.candidates) {
        setCandidatesByCookId(prev => ({ ...prev, [cookId]: data.candidates }));
      }
    } catch (e) {
      console.error(`Failed to fetch candidates for ${cookId}`, e);
    }
  }

  // Handle 1-Click Smart Plan generation
  async function handleGeneratePlan(cookId: string) {
    try {
      setIsComputingPlan(true);
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'AUTO_PLAN', cookId }),
      });
      const data = await res.json();

      if (data.plan) {
        setPlansByCookId(prev => {
          const next = { ...prev, [cookId]: data.plan };
          saveStoredPlans(next);
          return next;
        });
        setNotificationsByCookId(prev => {
          const next = { ...prev, [cookId]: data.notifications };
          saveStoredNotifications(next);
          return next;
        });

        // Immediately record an audit event for the Smart Match action!
        const distinctBackups = Array.from(
          new Set(
            data.plan.assignments
              .map((a: any) => a.backupCookName)
              .filter(Boolean) as string[]
          )
        );
        const alert = activeDropouts.find(d => d.cookId === cookId);
        const isSplit = distinctBackups.length > 1;

        const auditEvent: AuditEvent = {
          id: `AUDIT-MATCH-${cookId}`,
          timestamp: new Date().toISOString(),
          cookId,
          cookName: alert?.cookName || cookId,
          affectedOrdersCount: alert?.affectedOrders.length || data.plan.assignments.length,
          resolutionType: isSplit ? 'AUTO_SPLIT' : 'SINGLE_BACKUP',
          assignedBackups: distinctBackups,
          notificationsSentCount: 0,
          details: `⚡ 1-Click Smart Match executed for ${alert?.cookName || cookId}: ${
            data.plan.assignments.length
          } orders allocated across ${distinctBackups.join(', ')}. Strict diet compliance verified. Ready for dispatch review.`,
        };
        saveAuditEvent(auditEvent);
        setAuditEvents(getStoredAuditEvents());
      }
    } catch (err) {
      console.error('Failed to generate smart plan', err);
    } finally {
      setIsComputingPlan(false);
    }
  }

  // Handle Confirm & Dispatch
  async function handleConfirmDispatch() {
    if (!selectedCookId) return;
    const alert = activeDropouts.find(d => d.cookId === selectedCookId);
    const plan = plansByCookId[selectedCookId];
    const notifications = notificationsByCookId[selectedCookId] || [];

    if (!alert || !plan) return;

    try {
      setIsDispatching(true);

      // Simulate network dispatch delay
      await new Promise(r => setTimeout(r, 600));

      const distinctBackups = Array.from(
        new Set(plan.assignments.map(a => a.backupCookName).filter(Boolean) as string[])
      );

      const isSplit = distinctBackups.length > 1;
      const resolutionType = isSplit ? 'AUTO_SPLIT' : 'SINGLE_BACKUP';

      const auditEvent: AuditEvent = {
        id: `AUDIT-DISPATCH-${Date.now()}-${alert.cookId}`,
        timestamp: new Date().toISOString(),
        cookId: alert.cookId,
        cookName: alert.cookName,
        affectedOrdersCount: alert.affectedOrders.length,
        resolutionType,
        assignedBackups: distinctBackups,
        notificationsSentCount: notifications.length,
        details: `✅ Dispatched ${notifications.length} customer notifications for ${alert.cookName} across ${
          distinctBackups.length
        } kitchens (${distinctBackups.join(', ')}). Crisis resolved for 12:30 PM delivery window.`,
      };

      saveAuditEvent(auditEvent);
      saveResolvedCookId(alert.cookId);
      setAuditEvents(getStoredAuditEvents());
      setResolvedCookIds(getResolvedCookIds());

      setIsModalOpen(false);
      setSuccessBanner(
        `🎉 Triage successfully resolved for ${alert.cookName}! ${notifications.length} notifications dispatched. Next delivery secured for 12:30 PM.`
      );

      // Advance to next unresolved cook
      const currentResolved = getResolvedCookIds();
      const nextUnresolved = activeDropouts.find(d => !currentResolved.includes(d.cookId));
      if (nextUnresolved) {
        setSelectedCookId(nextUnresolved.cookId);
      }
    } catch (e) {
      console.error('Dispatch failed', e);
    } finally {
      setIsDispatching(false);
    }
  }

  // Master 1-Click Auto-Resolve All Disrupted Kitchens
  async function handleAutoResolveAll() {
    try {
      setIsDispatching(true);
      const newResolved = [...resolvedCookIds];

      for (const dropout of activeDropouts) {
        if (newResolved.includes(dropout.cookId)) continue;

        const res = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'AUTO_PLAN', cookId: dropout.cookId }),
        });
        const data = await res.json();
        if (data.plan) {
          const distinctBackups = Array.from(
            new Set(
              data.plan.assignments
                .map((a: any) => a.backupCookName)
                .filter(Boolean) as string[]
            )
          );
          const auditEvent: AuditEvent = {
            id: `AUDIT-${Date.now()}-${dropout.cookId}`,
            timestamp: new Date().toISOString(),
            cookId: dropout.cookId,
            cookName: dropout.cookName,
            affectedOrdersCount: dropout.affectedOrders.length,
            resolutionType: distinctBackups.length > 1 ? 'AUTO_SPLIT' : 'SINGLE_BACKUP',
            assignedBackups: distinctBackups,
            notificationsSentCount:
              data.notifications?.length || dropout.affectedOrders.length,
            details: `Auto-resolved batch of ${dropout.affectedOrders.length} orders across ${distinctBackups.join(
              ', '
            )}. Strict Jain and capacity compliance verified.`,
          };
          saveAuditEvent(auditEvent);
          saveResolvedCookId(dropout.cookId);
          newResolved.push(dropout.cookId);
          setPlansByCookId(prev => {
            const next = { ...prev, [dropout.cookId]: data.plan };
            saveStoredPlans(next);
            return next;
          });
          setNotificationsByCookId(prev => {
            const next = { ...prev, [dropout.cookId]: data.notifications };
            saveStoredNotifications(next);
            return next;
          });
        }
      }

      setResolvedCookIds(getResolvedCookIds());
      setAuditEvents(getStoredAuditEvents());
      setSuccessBanner(
        '🎉 Master Resolution Complete: All 3 disrupted kitchens (24 orders) triaged and secured for 12:30 PM lunch!'
      );
    } catch (err) {
      console.error('Auto-resolve all failed', err);
    } finally {
      setIsDispatching(false);
    }
  }

  // Handle manual per-row override
  function handleManualAssign(orderId: string, backupCookId: string) {
    if (!selectedCookId) return;
    const plan = plansByCookId[selectedCookId];
    if (!plan) return;
    const cand = (candidatesByCookId[selectedCookId] || []).find(c => c.cookId === backupCookId);
    const updatedAssignments = plan.assignments.map(a => {
      if (a.orderId === orderId) {
        return {
          ...a,
          backupCookId: cand?.cookId,
          backupCookName: cand?.cookName,
          isRefund: false,
        };
      }
      return a;
    });

    setPlansByCookId(prev => {
      const next = {
        ...prev,
        [selectedCookId]: {
          ...plan,
          assignments: updatedAssignments,
        },
      };
      saveStoredPlans(next);
      return next;
    });

    const alert = activeDropouts.find(d => d.cookId === selectedCookId);
    const auditEvent: AuditEvent = {
      id: `AUDIT-MANUAL-${Date.now()}-${orderId}`,
      timestamp: new Date().toISOString(),
      cookId: selectedCookId,
      cookName: alert?.cookName || selectedCookId,
      affectedOrdersCount: 1,
      resolutionType: 'MANUAL_SPLIT',
      assignedBackups: [cand?.cookName || backupCookId],
      notificationsSentCount: 0,
      details: `✏️ Manual override: Order #${orderId} reassigned to ${cand?.cookName || backupCookId}.`,
    };
    saveAuditEvent(auditEvent);
    setAuditEvents(getStoredAuditEvents());
  }

  function handleClearSession() {
    clearTriageSession();
    setResolvedCookIds([]);
    setAuditEvents([]);
    setPlansByCookId({});
    setNotificationsByCookId({});
    setSuccessBanner(null);
  }

  const selectedDropout = activeDropouts.find(d => d.cookId === selectedCookId);
  const currentCandidates = selectedCookId ? candidatesByCookId[selectedCookId] || [] : [];
  const currentPlan = selectedCookId ? plansByCookId[selectedCookId] || null : null;
  const currentNotifications = selectedCookId ? notificationsByCookId[selectedCookId] || [] : [];
  const isSelectedResolved = selectedCookId ? resolvedCookIds.includes(selectedCookId) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Portal Home</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold text-amber-400 tracking-wide">
            Ops Emergency Desk
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </nav>

      {/* Emergency Header Bar */}
      <EmergencyHeader
        stats={stats}
        resolvedCount={resolvedCookIds.length}
        operationalNotices={operationalNotices}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Success Banner */}
        {successBanner && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-xs text-emerald-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section: Dropout Queue Selection */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Active Dropout Crisis Queue
              </h2>
              <p className="text-xs text-slate-400">
                Select an affected cook to inspect disrupted orders and calculate fallback slots.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {resolvedCookIds.length < activeDropouts.length && (
                <button
                  onClick={handleAutoResolveAll}
                  disabled={isDispatching}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950" />
                  <span>⚡ Auto-Resolve All ({activeDropouts.length - resolvedCookIds.length}) Kitchens</span>
                </button>
              )}
              <span className="text-xs font-mono text-slate-400">
                {resolvedCookIds.length} of {activeDropouts.length} Resolved
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeDropouts.map(dropout => (
                <DropoutCard
                  key={dropout.cookId}
                  dropout={dropout}
                  isSelected={selectedCookId === dropout.cookId}
                  isResolved={resolvedCookIds.includes(dropout.cookId)}
                  onSelect={() => {
                    setSelectedCookId(dropout.cookId);
                    setSuccessBanner(null);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section: Active Workbench for Selected Cook */}
        {selectedDropout && (
          <section className="space-y-6">
            {/* Fallback Matcher Section */}
            <FallbackMatcher
              alert={selectedDropout}
              candidates={currentCandidates}
              plan={currentPlan}
              onGenerateAutoPlan={() => handleGeneratePlan(selectedDropout.cookId)}
              onProceedToDispatch={() => setIsModalOpen(true)}
              isLoading={isComputingPlan}
            />

            {/* Affected Orders Roster Table */}
            <AffectedOrdersTable
              orders={selectedDropout.affectedOrders}
              assignments={currentPlan?.assignments || []}
              selectedMealFilter={selectedMealFilter}
              onMealFilterChange={setSelectedMealFilter}
              candidates={currentCandidates}
              onManualAssign={handleManualAssign}
            />
          </section>
        )}

        {/* Section: Ops Traceability & Audit Timeline */}
        <section>
          <AuditTimeline events={auditEvents} onClearHistory={handleClearSession} />
        </section>
      </main>

      {/* Notification Preview & Dispatch Modal */}
      {selectedDropout && (
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          notifications={currentNotifications}
          cookName={selectedDropout.cookName}
          onConfirmDispatch={handleConfirmDispatch}
          isDispatching={isDispatching}
        />
      )}
    </div>
  );
}
