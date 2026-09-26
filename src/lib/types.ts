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

export interface TiffinLoopDataset {
  anchorTime: string; // "2026-09-23T10:30:00+05:30"
  cooks: NormalizedCook[];
  subscribers: NormalizedSubscriber[];
  orders: NormalizedOrder[];
  activeDropouts: DropoutAlert[];
  cookMap: Map<string, NormalizedCook>;
  subscriberMap: Map<string, NormalizedSubscriber>;
}
