import {
  CuisineType,
  DietType,
  DropoutAlert,
  FallbackCandidate,
  NormalizedOrder,
  TiffinLoopDataset,
  TriageAssignment,
} from './types';

// Pre-computed cuisine affinities
export function computeCuisineScore(candidateCuisine: CuisineType, targetCuisine: CuisineType): number {
  if (candidateCuisine === targetCuisine) {
    return 1.0;
  }

  // Regional clusters
  const northCluster: CuisineType[] = ['North Indian', 'Punjabi'];
  if (northCluster.includes(candidateCuisine) && northCluster.includes(targetCuisine)) {
    return 0.4;
  }

  const westCluster: CuisineType[] = ['Gujarati', 'Maharashtrian'];
  if (westCluster.includes(candidateCuisine) && westCluster.includes(targetCuisine)) {
    return 0.4;
  }

  return 0.1;
}

// Compute historical reliability score (0.0 to 1.0)
export function computeReliabilityScore(cookId: string, dataset: TiffinLoopDataset): number {
  let pastDropouts = 0;
  for (const o of dataset.orders) {
    if (!o.isToday && o.cookId === cookId && o.status === 'COOK_DROPOUT') {
      pastDropouts++;
    }
  }

  if (pastDropouts === 0) return 1.0;
  if (pastDropouts <= 2) return 0.7;
  if (pastDropouts <= 5) return 0.4;
  return 0.1;
}

export function findFallbackCandidates(
  alert: DropoutAlert,
  dataset: TiffinLoopDataset,
  requiredDiet?: DietType
): FallbackCandidate[] {
  const activeDropoutIds = new Set(dataset.activeDropouts.map(d => d.cookId));

  const eligible = dataset.cooks.filter(cook => {
    // 1. Same canonical city
    if (cook.city !== alert.city) return false;

    // 2. Active status & not in today's dropouts
    if (cook.sheetStatus !== 'active' || activeDropoutIds.has(cook.cookId)) return false;

    // 3. Must have positive remaining capacity
    if (cook.remainingCapacity <= 0) return false;

    // 4. Dietary compliance
    if (requiredDiet === 'Jain') {
      if (!cook.serves.includes('Jain')) return false;
    } else if (requiredDiet === 'Veg') {
      if (!cook.serves.includes('Veg') && !cook.serves.includes('Jain')) return false;
    }

    return true;
  });

  const candidates: FallbackCandidate[] = eligible.map(cook => {
    const cuiScore = computeCuisineScore(cook.cuisineSpecialty, alert.cuisineSpecialty);
    const capScore = Math.min(1.0, cook.remainingCapacity / 20);
    const relScore = computeReliabilityScore(cook.cookId, dataset);

    const totalScore = Math.round(100 * cuiScore + 40 * capScore + 30 * relScore);

    return {
      cookId: cook.cookId,
      cookName: cook.cookName,
      city: cook.city,
      cuisineSpecialty: cook.cuisineSpecialty,
      serves: cook.serves,
      remainingCapacity: cook.remainingCapacity,
      activeOrdersToday: cook.activeOrdersToday,
      maxDailyOrders: cook.maxDailyOrders,
      score: totalScore,
      scoreBreakdown: {
        cuisine: Math.round(100 * cuiScore),
        capacity: Math.round(40 * capScore),
        reliability: Math.round(30 * relScore),
      },
    };
  });

  // Sort by score descending, then remainingCapacity descending
  return candidates.sort((a, b) => b.score - a.score || b.remainingCapacity - a.remainingCapacity);
}

export interface OptimalTriagePlan {
  assignments: TriageAssignment[];
  unassignedOrders: NormalizedOrder[];
  allocatedCapacityByCook: Record<string, number>;
}

export function generateOptimalTriagePlan(
  alert: DropoutAlert,
  dataset: TiffinLoopDataset
): OptimalTriagePlan {
  // 1. Sort affected orders using MRV (Minimum Remaining Values - Strict diet first)
  const sortedOrders = [...alert.affectedOrders].sort((a, b) => {
    const dietRank: Record<DietType, number> = { Jain: 1, 'Non-Veg': 2, Veg: 3 };
    const rankA = dietRank[a.subscriber?.diet || 'Veg'];
    const rankB = dietRank[b.subscriber?.diet || 'Veg'];

    if (rankA !== rankB) return rankA - rankB;

    // Priority: Lunch before Dinner (Urgency)
    if (a.mealType === 'Lunch' && b.mealType === 'Dinner') return -1;
    if (a.mealType === 'Dinner' && b.mealType === 'Lunch') return 1;

    return 0;
  });

  // 2. Track capacity allocations
  const localCapacity = new Map<string, number>();
  for (const c of dataset.cooks) {
    localCapacity.set(c.cookId, c.remainingCapacity);
  }

  const assignments: TriageAssignment[] = [];
  const unassignedOrders: NormalizedOrder[] = [];
  const allocatedCapacityByCook: Record<string, number> = {};

  for (const order of sortedOrders) {
    const subscriberDiet = order.subscriber?.diet || 'Veg';

    // Find candidates for this order with capacity > 0
    const candidates = findFallbackCandidates(alert, dataset, subscriberDiet).filter(
      cand => (localCapacity.get(cand.cookId) || 0) > 0
    );

    if (candidates.length > 0) {
      const best = candidates[0];
      const curCap = localCapacity.get(best.cookId) || 0;
      localCapacity.set(best.cookId, curCap - 1);
      allocatedCapacityByCook[best.cookId] = (allocatedCapacityByCook[best.cookId] || 0) + 1;

      assignments.push({
        orderId: order.orderId,
        subscriberId: order.subscriberId,
        backupCookId: best.cookId,
        backupCookName: best.cookName,
        mealType: order.mealType,
        isRefund: false,
      });
    } else {
      // No remaining capacity -> auto-refund escalation
      unassignedOrders.push(order);
      assignments.push({
        orderId: order.orderId,
        subscriberId: order.subscriberId,
        mealType: order.mealType,
        isRefund: true,
      });
    }
  }

  return {
    assignments,
    unassignedOrders,
    allocatedCapacityByCook,
  };
}
