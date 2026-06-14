interface CacheEntry {
  briefing: string;
  createdAt: number;
}

const globalForCache = global as unknown as {
  briefingCache: Map<string, CacheEntry>;
};

export const briefingCache = globalForCache.briefingCache || new Map<string, CacheEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForCache.briefingCache = briefingCache;
}
