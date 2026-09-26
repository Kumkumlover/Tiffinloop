import {
  DropoutAlert,
  MealType,
  TiffinLoopDataset,
  TriageAssignment,
} from './types';

export interface SimulatedNotification {
  subscriberId: string;
  subscriberName: string;
  phone: string;
  message: string;
  sentAt: string;
  isDuplicateConsolidated?: boolean;
}

export function generateSimulatedNotifications(
  assignments: TriageAssignment[],
  dataset: TiffinLoopDataset,
  alert: DropoutAlert
): SimulatedNotification[] {
  // Group assignments by normalized phone number or subscriberId
  const phoneGroups = new Map<string, TriageAssignment[]>();

  for (const a of assignments) {
    const sub = dataset.subscriberMap.get(a.subscriberId);
    const key = sub?.phone || a.subscriberId;
    const existing = phoneGroups.get(key) || [];
    existing.push(a);
    phoneGroups.set(key, existing);
  }

  const notifications: SimulatedNotification[] = [];
  const now = '2026-09-23T10:32:00+05:30';

  for (const [phoneKey, group] of phoneGroups.entries()) {
    const firstSub = dataset.subscriberMap.get(group[0].subscriberId);
    const subName = firstSub?.subscriberName || 'Valued Subscriber';
    const phoneDisplay = firstSub?.phoneDisplay || firstSub?.phone || phoneKey;
    const isDuplicate = group.length > 1;

    const orderIds = group.map(g => g.orderId);
    const orderIdStr = orderIds.length > 1 ? `#${orderIds.join(' & #')}` : `#${orderIds[0]}`;
    const boxCount = group.length > 1 ? `${group.length} meal boxes` : 'meal box';

    const mealType: MealType = group[0].mealType;
    const deliveryWindow = mealType === 'Lunch' ? '12:30 PM to 2:00 PM' : '7:30 PM to 9:00 PM';
    const diet = firstSub?.diet || 'Veg';

    const hasRefund = group.some(g => g.isRefund);
    const backupCookNames = Array.from(
      new Set(group.map(g => g.backupCookName).filter((name): name is string => !!name))
    );

    let message = '';
    if (hasRefund) {
      const totalAmount = group.reduce((sum, g) => {
        const o = dataset.orders.find(ord => ord.orderId === g.orderId);
        return sum + (o?.amountInr || 0);
      }, 0);

      message = `⚠️ TiffinLoop Update for ${subName}:\nDue to an emergency, your regular home cook ${alert.cookName} is unavailable today. Unfortunately, no alternative chef matching your strict dietary requirements was available.\n\n💳 An immediate 100% refund of ₹${totalAmount} has been processed back to your payment method + ₹50 TiffinLoop Apology Credit added to your wallet.\n\nWe sincerely apologize for the inconvenience. For assistance, reply to this message.`;
    } else {
      const chefStr = backupCookNames.length === 1 
        ? `Chef ${backupCookNames[0]}` 
        : `Chefs ${backupCookNames.join(' & ')}`;

      const verb = group.length > 1 ? 'have been' : 'has been';
      message = `🔔 TiffinLoop Update for ${subName}:\nDue to an unexpected situation, your assigned cook ${alert.cookName} is unavailable today.\n\n✅ To ensure you receive your ${mealType.toLowerCase()} on time, your ${boxCount} (${orderIdStr}) ${verb} reassigned to our top-rated ${chefStr}.\n🕒 Delivery Window: ${deliveryWindow}\n🥗 Dietary Assurance: 100% ${diet} verified.\n\nThank you for choosing TiffinLoop!`;
    }

    notifications.push({
      subscriberId: group[0].subscriberId,
      subscriberName: subName,
      phone: phoneDisplay,
      message,
      sentAt: now,
      isDuplicateConsolidated: isDuplicate,
    });
  }

  return notifications;
}
