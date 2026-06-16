import { corsair } from "@/corsair/client";

export interface CalendarEvent {
  id: string;
  summary?: string;
  start?: Date;
  end?: Date;
  description?: string;
}

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

// Global cache variables so they survive Hot Module Replacement (HMR) / Fast Refresh in development
const globalForCache = globalThis as unknown as {
  calendarCache?: Map<string, CacheEntry<CalendarEvent[]>>;
  pendingRequests?: Map<string, Promise<any>>;
};

const calendarCache: Map<string, CacheEntry<CalendarEvent[]>> = globalForCache.calendarCache ??= new Map();
const pendingRequests: Map<string, Promise<any>> = globalForCache.pendingRequests ??= new Map();

const CALENDAR_TTL = 15 * 1000; // 15 seconds

function getCachedItem<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // Evict expired entry
  }
  return null;
}

function setCachedItem<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs: number): void {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now >= v.expiresAt) {
      cache.delete(k);
    }
  }
  cache.set(key, {
    data,
    expiresAt: now + ttlMs,
  });
}

async function deduplicateRequest<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

export async function getCalendarEvents(
  tenantId: string
): Promise<CalendarEvent[]> {
  const cacheKey = `calendar:v1:${tenantId}`;
  
  // 1. Check cache first
  const cached = getCachedItem(calendarCache, cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Prevent concurrent identical fetches via request deduplication
  return deduplicateRequest(cacheKey, async () => {
    try {
      const tenant = corsair.withTenant(tenantId);

      const response =
        await tenant.googlecalendar.api.events.getMany({
          calendarId: "primary",
          singleEvents: true,
          timeMin: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // last 30 days
        });

      const events = (response.items ?? []).map((event) => ({
        id: event.id ?? "",
        summary: event.summary,
        start: event.start?.dateTime
          ? new Date(event.start.dateTime)
          : event.start?.date
          ? new Date(event.start.date)
          : undefined,
        end: event.end?.dateTime
          ? new Date(event.end.dateTime)
          : event.end?.date
          ? new Date(event.end.date)
          : undefined,
        description: event.description,
      }));

      // Cache complete response
      setCachedItem(calendarCache, cacheKey, events, CALENDAR_TTL);
      return events;
    } catch (error) {
      if (
        error instanceof Error && 
        error.message.includes("Account not found")
      ) {
        return [];
      }
      console.error("CALENDAR SERVICE ERROR:", error);
      throw error;
    }
  });
}