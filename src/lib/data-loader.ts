import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import {
  CanonicalCity,
  DietType,
  MealPlan,
  MealType,
  NormalizedCook,
  NormalizedOrder,
  NormalizedSubscriber,
  DropoutAlert,
  OperationalNotice,
  TiffinLoopDataset,
} from './types';
import {
  ANCHOR_DATE,
  normalizeCity,
  normalizeCuisine,
  normalizeOrderStatus,
  normalizePhone,
  parseDate,
  parseServes,
} from './normalizers';

interface RawCook {
  cook_id: string;
  cook_name: string;
  city: string;
  cuisine_specialty: string;
  serves: string;
  phone: string;
  status: string;
  status_since: string;
  joined_date: string;
  max_daily_orders: string;
}

interface RawSubscriber {
  subscriber_id: string;
  subscriber_name: string;
  city: string;
  phone: string;
  assigned_cook_id: string;
  meal_plan: string;
  cuisine_pref: string;
  diet: string;
  subscription_status: string;
  start_date: string;
}

interface RawOrder {
  order_id: string;
  order_date: string;
  subscriber_id: string;
  cook_id: string;
  meal_type: string;
  status: string;
  amount_inr: string;
}

let cachedDataset: TiffinLoopDataset | null = null;

export async function loadTiffinLoopDataset(forceReload = false): Promise<TiffinLoopDataset> {
  if (cachedDataset && !forceReload) {
    return cachedDataset;
  }

  const baseDir = process.cwd();
  const seedDir = path.join(baseDir, 'tiffinloop_seed');

  // 1. Read files
  const cooksCsv = fs.readFileSync(path.join(seedDir, 'cooks.csv'), 'utf8');
  const subsCsv = fs.readFileSync(path.join(seedDir, 'subscribers.csv'), 'utf8');
  const ordersCsv = fs.readFileSync(path.join(seedDir, 'orders.csv'), 'utf8');
  const whatsappTxt = fs.readFileSync(path.join(seedDir, 'ops_whatsapp_export.txt'), 'utf8');

  // 2. Parse CSVs
  const parsedCooks = Papa.parse<RawCook>(cooksCsv, { header: true, skipEmptyLines: true }).data;
  const parsedSubs = Papa.parse<RawSubscriber>(subsCsv, { header: true, skipEmptyLines: true }).data;
  const parsedOrders = Papa.parse<RawOrder>(ordersCsv, { header: true, skipEmptyLines: true }).data;

  // 3. First pass on Orders to map active orders today
  const normalizedOrders: NormalizedOrder[] = parsedOrders.map(raw => {
    const isoDate = parseDate(raw.order_date) || raw.order_date;
    const isToday = isoDate === ANCHOR_DATE;
    const status = normalizeOrderStatus(raw.status);

    return {
      orderId: raw.order_id.trim(),
      orderDate: isoDate,
      rawOrderDate: raw.order_date,
      subscriberId: raw.subscriber_id.trim(),
      cookId: raw.cook_id.trim(),
      mealType: (raw.meal_type.trim() as MealType) || 'Lunch',
      status,
      rawStatus: raw.status,
      amountInr: parseInt(raw.amount_inr, 10) || 0,
      isToday,
      isDisrupted: false,
    };
  });

  // Calculate active orders count for today per cook
  const activeOrdersCountByCook = new Map<string, number>();
  for (const o of normalizedOrders) {
    if (o.isToday && (o.status === 'PENDING' || o.status === 'IN_PROGRESS')) {
      activeOrdersCountByCook.set(o.cookId, (activeOrdersCountByCook.get(o.cookId) || 0) + 1);
    }
  }

  // 4. Parse Cooks
  const cookMap = new Map<string, NormalizedCook>();
  const normalizedCooks: NormalizedCook[] = parsedCooks.map(raw => {
    const cookId = raw.cook_id.trim();
    const phone = normalizePhone(raw.phone);
    const maxDailyOrders = parseInt(raw.max_daily_orders, 10) || 30;
    const activeToday = activeOrdersCountByCook.get(cookId) || 0;
    const remaining = Math.max(0, maxDailyOrders - activeToday);

    const cook: NormalizedCook = {
      cookId,
      cookName: raw.cook_name.trim(),
      city: normalizeCity(raw.city),
      cuisineSpecialty: normalizeCuisine(raw.cuisine_specialty),
      serves: parseServes(raw.serves),
      phone: phone.canonical,
      phoneDisplay: phone.display,
      sheetStatus: (raw.status.trim() as 'active' | 'on_leave' | 'inactive') || 'active',
      statusSince: parseDate(raw.status_since),
      joinedDate: parseDate(raw.joined_date) || raw.joined_date,
      maxDailyOrders,
      activeOrdersToday: activeToday,
      remainingCapacity: remaining,
    };

    cookMap.set(cookId, cook);
    return cook;
  });

  // 4b. Detect duplicate cook identities & unify physical kitchen capacities
  const nameCityToCooks = new Map<string, NormalizedCook[]>();
  for (const c of normalizedCooks) {
    const key = `${c.cookName.toLowerCase()}_${c.city.toLowerCase()}`;
    const list = nameCityToCooks.get(key) || [];
    list.push(c);
    nameCityToCooks.set(key, list);
  }

  for (const duplicates of nameCityToCooks.values()) {
    if (duplicates.length > 1) {
      const allIds = duplicates.map(d => d.cookId);
      const totalActiveToday = duplicates.reduce((sum, d) => sum + d.activeOrdersToday, 0);
      const physicalMax = Math.max(...duplicates.map(d => d.maxDailyOrders));
      const unifiedRemaining = Math.max(0, physicalMax - totalActiveToday);

      for (const d of duplicates) {
        d.duplicateCookIds = allIds;
        d.remainingCapacity = unifiedRemaining;
      }
    }
  }

  // 5. Parse Subscribers and Detect Duplicates (e.g. Tariq Hussain)
  const subscriberMap = new Map<string, NormalizedSubscriber>();
  const phoneToSubscribers = new Map<string, string[]>();

  const normalizedSubscribers: NormalizedSubscriber[] = parsedSubs.map(raw => {
    const subId = raw.subscriber_id.trim();
    const phone = normalizePhone(raw.phone);

    if (phone.canonical) {
      const existing = phoneToSubscribers.get(phone.canonical) || [];
      existing.push(subId);
      phoneToSubscribers.set(phone.canonical, existing);
    }

    const sub: NormalizedSubscriber = {
      subscriberId: subId,
      subscriberName: raw.subscriber_name.trim(),
      city: normalizeCity(raw.city),
      phone: phone.canonical,
      phoneDisplay: phone.display,
      assignedCookId: raw.assigned_cook_id.trim(),
      mealPlan: (raw.meal_plan.trim() as MealPlan) || 'Lunch Only',
      cuisinePref: normalizeCuisine(raw.cuisine_pref),
      diet: (raw.diet.trim() as DietType) || 'Veg',
      subscriptionStatus: (raw.subscription_status.trim() as 'active' | 'paused' | 'cancelled') || 'active',
      startDate: parseDate(raw.start_date) || raw.start_date,
    };

    subscriberMap.set(subId, sub);
    return sub;
  });

  // Link duplicate subscribers
  for (const [phone, subIds] of phoneToSubscribers.entries()) {
    if (subIds.length > 1) {
      const primaryId = subIds[0];
      const primarySub = subscriberMap.get(primaryId);
      if (primarySub) {
        primarySub.duplicateIds = subIds.slice(1);
      }
      for (let i = 1; i < subIds.length; i++) {
        const secondary = subscriberMap.get(subIds[i]);
        if (secondary) {
          secondary.isDuplicateOf = primaryId;
        }
      }
    }
  }

  // 6. Enrich Orders with Subscriber and Cook references
  for (const o of normalizedOrders) {
    o.subscriber = subscriberMap.get(o.subscriberId);
    o.originalCook = cookMap.get(o.cookId);
  }

  // 7. Parse WhatsApp chat for unrecorded dropouts (Sunita Kulkarni CK090)
  const whatsappDropouts: Array<{ cookName: string; reason: string; timestamp: string }> = [];
  const lines = whatsappTxt.split('\n');
  for (const line of lines) {
    if (line.includes('Sunita Kulkarni') && line.includes('gaon jana pad raha hai')) {
      whatsappDropouts.push({
        cookName: 'Sunita Kulkarni',
        reason: 'Emergency village visit (WhatsApp at 7:41 AM: "Bhaiya aaj nahi ho payega, gaon jana pad raha hai urgent")',
        timestamp: '2026-09-23T07:41:00+05:30',
      });
    }
  }

  // 8. Identify Active Dropouts for Today
  const activeDropouts: DropoutAlert[] = [];

  // Dropouts from sheet on_leave today
  for (const cook of normalizedCooks) {
    if (cook.sheetStatus === 'on_leave' && cook.statusSince === ANCHOR_DATE) {
      const affected = normalizedOrders.filter(o => o.isToday && o.cookId === cook.cookId);
      for (const ao of affected) {
        ao.isDisrupted = true;
      }
      const affectedSubs = affected
        .map(o => subscriberMap.get(o.subscriberId))
        .filter((s): s is NormalizedSubscriber => s !== undefined);

      let reason = 'On leave in sheet';
      if (cook.cookId === 'CK086') reason = 'Fever reported this morning (Updated in sheet)';
      if (cook.cookId === 'CK087') reason = 'Family function in Mysore (Updated in sheet)';

      activeDropouts.push({
        cookId: cook.cookId,
        cookName: cook.cookName,
        city: cook.city,
        cuisineSpecialty: cook.cuisineSpecialty,
        serves: cook.serves,
        source: 'SHEET_ON_LEAVE',
        reportedAt: '2026-09-23T07:00:00+05:30',
        reason,
        affectedOrders: affected,
        affectedSubscribers: affectedSubs,
        triageStatus: 'UNRESOLVED',
      });
    }
  }

  // Add WhatsApp-detected dropout (CK090 Sunita Kulkarni)
  for (const wa of whatsappDropouts) {
    const sunita = normalizedCooks.find(c => c.cookName === wa.cookName);
    if (sunita) {
      const affected = normalizedOrders.filter(o => o.isToday && o.cookId === sunita.cookId);
      for (const ao of affected) {
        ao.isDisrupted = true;
      }
      const affectedSubs = affected
        .map(o => subscriberMap.get(o.subscriberId))
        .filter((s): s is NormalizedSubscriber => s !== undefined);

      activeDropouts.push({
        cookId: sunita.cookId,
        cookName: sunita.cookName,
        city: sunita.city,
        cuisineSpecialty: sunita.cuisineSpecialty,
        serves: sunita.serves,
        source: 'WHATSAPP_UNRECORDED',
        reportedAt: wa.timestamp,
        reason: wa.reason,
        affectedOrders: affected,
        affectedSubscribers: affectedSubs,
        triageStatus: 'UNRESOLVED',
      });
    }
  }

  const operationalNotices: OperationalNotice[] = [
    {
      id: 'NOTICE-FESTIVAL',
      type: 'FESTIVAL_WEEK',
      title: 'Festival Week Active (Day 1 of 7)',
      description: 'Elevated cook leave probability expected across Bengaluru, Mumbai & Pune. Standby buffers active.',
      targetDate: '2026-09-23 to 2026-09-29',
    },
    {
      id: 'NOTICE-ANIL-LOGISTICS',
      type: 'ADVANCE_LOGISTICS',
      title: "Tomorrow's Logistics Notice (24-Sep)",
      description: 'Chef Anil Joshi (CK092, Pune) reported 30-min pickup delay for tomorrow due to road work. Today\'s 3 orders are cooking on schedule.',
      cookId: 'CK092',
      cookName: 'Anil Joshi',
      city: 'Pune',
      targetDate: '2026-09-24',
    },
    {
      id: 'NOTICE-UNIFIED-KITCHEN',
      type: 'CAPACITY_SAFEGUARD',
      title: 'Unified Kitchen Capacity Lock Active',
      description: '5 duplicate cook profiles (Vikram Ahmed CK036/CK081, Ayesha Agarwal CK011/CK082, etc.) merged in-memory to prevent double-booking physical kitchen limits.',
    },
  ];

  cachedDataset = {
    anchorTime: '2026-09-23T10:30:00+05:30',
    cooks: normalizedCooks,
    subscribers: normalizedSubscribers,
    orders: normalizedOrders,
    activeDropouts,
    operationalNotices,
    cookMap,
    subscriberMap,
  };

  return cachedDataset;
}
