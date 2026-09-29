import { NextResponse } from 'next/server';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import { findFallbackCandidates, generateOptimalTriagePlan } from '@/lib/fallback-engine';
import { generateSimulatedNotifications } from '@/lib/notification-service';

export async function GET() {
  try {
    const dataset = await loadTiffinLoopDataset();

    const stats = {
      totalCooks: dataset.cooks.length,
      totalSubscribers: dataset.subscribers.length,
      totalOrdersToday: dataset.orders.filter(o => o.isToday).length,
      activeDropoutsCount: dataset.activeDropouts.length,
      totalDisruptedOrders: dataset.activeDropouts.reduce((sum, d) => sum + d.affectedOrders.length, 0),
      totalDisruptedLunchOrders: dataset.activeDropouts.reduce(
        (sum, d) => sum + d.affectedOrders.filter(o => o.mealType === 'Lunch').length,
        0
      ),
      totalDisruptedDinnerOrders: dataset.activeDropouts.reduce(
        (sum, d) => sum + d.affectedOrders.filter(o => o.mealType === 'Dinner').length,
        0
      ),
      revenueAtRisk: dataset.activeDropouts.reduce(
        (sum, d) => sum + d.affectedOrders.reduce((ordSum, o) => ordSum + o.amountInr, 0),
        0
      ),
    };

    return NextResponse.json({
      anchorTime: dataset.anchorTime,
      activeDropouts: dataset.activeDropouts,
      operationalNotices: dataset.operationalNotices,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load triage dataset' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataset = await loadTiffinLoopDataset();

    const { action, cookId, manualAssignments } = body;

    const alert = dataset.activeDropouts.find(d => d.cookId === cookId);
    if (!alert) {
      return NextResponse.json({ error: `Dropout alert for ${cookId} not found` }, { status: 404 });
    }

    if (action === 'GET_CANDIDATES') {
      const candidates = findFallbackCandidates(alert, dataset);
      return NextResponse.json({ candidates });
    }

    if (action === 'AUTO_PLAN') {
      const plan = generateOptimalTriagePlan(alert, dataset);
      const notifications = generateSimulatedNotifications(plan.assignments, dataset, alert);

      return NextResponse.json({
        plan,
        notifications,
      });
    }

    if (action === 'CONFIRM_MANUAL') {
      const notifications = generateSimulatedNotifications(manualAssignments, dataset, alert);
      return NextResponse.json({
        assignments: manualAssignments,
        notifications,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Triage operation failed' }, { status: 500 });
  }
}
