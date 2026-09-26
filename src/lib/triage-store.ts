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

const STORAGE_KEY_AUDIT = 'tiffinloop_audit_events_v1';
const STORAGE_KEY_RESOLVED = 'tiffinloop_resolved_cooks_v1';

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
    events.unshift(event);
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(events));

    // Also track resolved cook
    const resolved = getResolvedCookIds();
    if (!resolved.includes(event.cookId)) {
      resolved.push(event.cookId);
      localStorage.setItem(STORAGE_KEY_RESOLVED, JSON.stringify(resolved));
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

export function clearTriageSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    localStorage.removeItem(STORAGE_KEY_RESOLVED);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}
