export type CanonicalCity = 'Bengaluru' | 'Mumbai' | 'Pune';

export type CuisineType = 
  | 'North Indian' 
  | 'Punjabi' 
  | 'South Indian' 
  | 'Gujarati' 
  | 'Bengali' 
  | 'Maharashtrian' 
  | 'Continental';

export type DietType = 'Veg' | 'Jain' | 'Non-Veg';

export type MealType = 'Lunch' | 'Dinner';

export type MealPlan = 'Lunch Only' | 'Dinner Only' | 'Lunch + Dinner';

export type CanonicalOrderStatus = 
  | 'DELIVERED' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'COOK_DROPOUT';

export type DropoutDetectionSource = 
  | 'SHEET_ON_LEAVE' 
  | 'WHATSAPP_UNRECORDED';

export type DropoutTriageStatus = 
  | 'UNRESOLVED' 
  | 'IN_TRIAGE' 
  | 'RESOLVED';

export interface NormalizedCook {
  cookId: string;
  cookName: string;
  city: CanonicalCity;
  cuisineSpecialty: CuisineType;
  serves: DietType[];
  phone: string | null;
  phoneDisplay: string;
  sheetStatus: 'active' | 'on_leave' | 'inactive';
  statusSince: string | null;
  joinedDate: string;
  maxDailyOrders: number;
  activeOrdersToday: number;
  remainingCapacity: number;
  isDuplicateOf?: string;
  duplicateCookIds?: string[];
}

export interface NormalizedSubscriber {
  subscriberId: string;
  subscriberName: string;
  city: CanonicalCity;
  phone: string | null;
  phoneDisplay: string;
  assignedCookId: string;
  mealPlan: MealPlan;
  cuisinePref: CuisineType;
  diet: DietType;
  subscriptionStatus: 'active' | 'paused' | 'cancelled';
  startDate: string;
  isDuplicateOf?: string;
  duplicateIds?: string[];
}

export interface NormalizedOrder {
  orderId: string;
  orderDate: string; // ISO YYYY-MM-DD
  rawOrderDate: string;
  subscriberId: string;
  cookId: string;
  mealType: MealType;
  status: CanonicalOrderStatus;
  rawStatus: string;
  amountInr: number;
  isToday: boolean;
  isDisrupted: boolean;
  subscriber?: NormalizedSubscriber;
  originalCook?: NormalizedCook;
  reassignedCookId?: string;
}

export interface DropoutAlert {
  cookId: string;
  cookName: string;
  city: CanonicalCity;
  cuisineSpecialty: CuisineType;
  serves: DietType[];
  source: DropoutDetectionSource;
  reportedAt: string;
  reason: string;
  affectedOrders: NormalizedOrder[];
  affectedSubscribers: NormalizedSubscriber[];
  triageStatus: DropoutTriageStatus;
}

export interface FallbackCandidate {
  cookId: string;
  cookName: string;
  city: CanonicalCity;
  cuisineSpecialty: CuisineType;
  serves: DietType[];
  remainingCapacity: number;
  activeOrdersToday: number;
  maxDailyOrders: number;
  score: number;
  scoreBreakdown: {
    cuisine: number;
    capacity: number;
    reliability: number;
  };
}

export interface TriageAssignment {
  orderId: string;
  subscriberId: string;
  backupCookId?: string;
  backupCookName?: string;
  isRefund?: boolean;
  mealType: MealType;
}

export interface TriageDecision {
  dropoutCookId: string;
  resolvedAt: string;
  resolutionType: 'SINGLE_REASSIGN' | 'MULTI_SPLIT' | 'REFUND_ALL';
  assignments: TriageAssignment[];
  simulatedNotifications: Array<{
    subscriberId: string;
    subscriberName: string;
    phone: string;
    message: string;
    sentAt: string;
    isDuplicateConsolidated?: boolean;
  }>;
}

export interface OperationalNotice {
  id: string;
  type: 'ADVANCE_LOGISTICS' | 'FESTIVAL_WEEK' | 'CAPACITY_SAFEGUARD';
  title: string;
  description: string;
  cookId?: string;
  cookName?: string;
  city?: CanonicalCity;
  targetDate?: string;
}

export interface TiffinLoopDataset {
  anchorTime: string; // "2026-09-23T10:30:00+05:30"
  cooks: NormalizedCook[];
  subscribers: NormalizedSubscriber[];
  orders: NormalizedOrder[];
  activeDropouts: DropoutAlert[];
  operationalNotices: OperationalNotice[];
  cookMap: Map<string, NormalizedCook>;
  subscriberMap: Map<string, NormalizedSubscriber>;
}

export interface LeadershipAnalyticsResponse {
  summary: {
    totalOrders30D: number;
    totalDropouts30D: number;
    networkReliabilityRate: number;
    networkDropoutRate: number;
    totalGmvLostInr: number;
    totalRefundCostInr: number;
    annualizedChurnLossInr: number;
    uniqueSubscribersImpacted: number;
    repeatDisruptionSubscribers: number;
  };
  regionalBreakdown: Array<{
    city: CanonicalCity;
    totalOrders: number;
    dropoutOrders: number;
    dropoutRate: number;
    shareOfAllDropouts: number;
    activeCooks: number;
    activeSubscribers: number;
  }>;
  rogueCooks: {
    puneTotalDropouts: number;
    combinedRogueDropouts: number;
    concentrationPercentage: number;
    counterfactualPuneRate: number;
    cooks: Array<{
      cookId: string;
      cookName: string;
      city: CanonicalCity;
      cuisine: CuisineType;
      dropouts: number;
      totalOrders: number;
      dropoutRate: number;
      governanceStatus: 'ROGUE' | 'WATCHLIST' | 'MONITORED';
    }>;
  };
  dailyTimeline: Array<{
    date: string;
    totalOrders: number;
    dropouts: number;
    dropoutRate: number;
    isFestivalSurge: boolean;
    byCity: {
      bengaluru: number;
      mumbai: number;
      pune: number;
    };
  }>;
  predictiveSignals: Array<{
    cookId: string;
    cookName: string;
    city: CanonicalCity;
    healthScore: number;
    riskTier: 'HIGH' | 'MEDIUM' | 'LOW';
    activeOrdersToday: number;
    maxDailyCapacity: number;
    capacityUtilization: number;
    precursorDropouts: number;
    warningReasons: string[];
  }>;
  strategicRecommendations: Array<{
    id: string;
    title: string;
    tag: string;
    category: 'GOVERNANCE' | 'RESERVE_CAPACITY' | 'INCENTIVES' | 'RETENTION';
    action: string;
    projectedRoi: string;
    annualSavings: string;
    timeline: string;
  }>;
  isSimulated: boolean;
  simulatedOffboardIds: string[];
}

