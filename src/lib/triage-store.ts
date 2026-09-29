export interface AuditEvent {
  id: string;
  timestamp: string;
  cookId: string;
  cookName: string;
  affectedOrdersCount: number;
  resolutionType: 'AUTO_SPLIT' | 'SINGLE_BACKUP' | 'MANUAL_SPLIT' | 'REFUND';
  assignedBackups: string[];
  notificationsSentCount: number;
  details: string;
}

const STORAGE_KEY_AUDIT = 'tiffinloop_audit_events_v2';
const STORAGE_KEY_RESOLVED = 'tiffinloop_resolved_cooks_v2';
const STORAGE_KEY_PLANS = 'tiffinloop_plans_by_cook_v2';
const STORAGE_KEY_NOTIFS = 'tiffinloop_notifs_by_cook_v2';

export function getStoredAuditEvents(): AuditEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAuditEvent(event: AuditEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const events = getStoredAuditEvents();
    // Avoid duplicate matching logs with identical id
    if (!events.some(e => e.id === event.id)) {
      events.unshift(event);
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(events));
    }
  } catch (e) {
    console.error('Failed to save audit event', e);
  }
}

export function getResolvedCookIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESOLVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveResolvedCookId(cookId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const resolved = getResolvedCookIds();
    if (!resolved.includes(cookId)) {
      resolved.push(cookId);
      localStorage.setItem(STORAGE_KEY_RESOLVED, JSON.stringify(resolved));
    }
  } catch (e) {
    console.error('Failed to save resolved cook', e);
  }
}

export function getStoredPlans(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredPlans(plans: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save stored plans', e);
  }
}

export function getStoredNotifications(): Record<string, any[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredNotifications(notifs: Record<string, any[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save stored notifications', e);
  }
}

export function clearTriageSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    localStorage.removeItem(STORAGE_KEY_RESOLVED);
    localStorage.removeItem(STORAGE_KEY_PLANS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}
