import { corsair } from "@/corsair/client";

export interface InboxMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  createdAt: Date;
}

export interface FullGmailMessage {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  body: string;
  snippet: string;
  createdAt: Date;
}

interface GmailHeader {
  name?: string;
  value?: string;
}

interface GmailBody {
  data?: string;
  [key: string]: unknown;
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: GmailBody;
  parts?: GmailPayloadPart[];
  [key: string]: unknown;
}

interface GmailPayload {
  mimeType?: string;
  body?: GmailBody;
  parts?: GmailPayloadPart[];
  headers?: GmailHeader[];
  [key: string]: unknown;
}

function decodeBase64(data?: string): string {
  if (!data) return "";

  try {
    return Buffer.from(
      data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8");
  } catch {
    return "";
  }
}

function findHtmlPart(payload?: GmailPayloadPart): string | null {
  if (!payload) return null;

  if (
    payload.mimeType === "text/html" &&
    payload.body?.data
  ) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = findHtmlPart(part);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function findTextPart(payload?: GmailPayloadPart): string | null {
  if (!payload) return null;

  if (
    payload.mimeType === "text/plain" &&
    payload.body?.data
  ) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const result = findTextPart(part);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function extractBody(payload?: GmailPayload): string {
  if (!payload) return "";
  
  const htmlBody = findHtmlPart(payload);

  if (htmlBody) {
    return htmlBody;
  }

  const textBody = findTextPart(payload);

  if (textBody) {
    return textBody;
  }

  if (payload?.body?.data) {
    return decodeBase64(payload.body.data);
  }

  return "";
}

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

// Global cache variables so they survive Hot Module Replacement (HMR) / Fast Refresh in development
const globalForCache = globalThis as unknown as {
  inboxCache?: Map<string, CacheEntry<InboxMessage[]>>;
  unreadCache?: Map<string, CacheEntry<InboxMessage[]>>;
  messageCache?: Map<string, CacheEntry<FullGmailMessage>>;
  pendingRequests?: Map<string, Promise<any>>;
};

const inboxCache: Map<string, CacheEntry<InboxMessage[]>> = globalForCache.inboxCache ??= new Map<string, CacheEntry<InboxMessage[]>>();
const unreadCache: Map<string, CacheEntry<InboxMessage[]>> = globalForCache.unreadCache ??= new Map<string, CacheEntry<InboxMessage[]>>();
const messageCache: Map<string, CacheEntry<FullGmailMessage>> = globalForCache.messageCache ??= new Map<string, CacheEntry<FullGmailMessage>>();
const pendingRequests: Map<string, Promise<any>> = globalForCache.pendingRequests ??= new Map<string, Promise<any>>();

// Cache TTL choices:
// - Inbox/Unread lists: 15 seconds to ensure fast updates but minimize redundant Gmail list calls.
// - Message details: 5 minutes since once fetched, email contents do not change.
const INBOX_TTL = 15 * 1000;
const UNREAD_TTL = 15 * 1000;
const MESSAGE_TTL = 5 * 60 * 1000;

// Reusable cache lookup helper
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

// Reusable cache insertion helper (prunes expired entries to avoid memory growth)
function setCachedItem<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs: number): void {
  const now = Date.now();
  // Simple periodic pruning during inserts
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

// Request deduplication helper to collapse concurrent calls into a single execution
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

export async function getInboxMessages(tenantId: string): Promise<InboxMessage[]> {
  const cacheKey = `inbox:v1:${tenantId}`;
  
  // 1. Check cache first
  const cached = getCachedItem(inboxCache, cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Prevent concurrent identical fetches via request deduplication
  return deduplicateRequest(cacheKey, async () => {
    try {
      const tenant = corsair.withTenant(tenantId);
      const result = await tenant.gmail.api.messages.list({ maxResults: 20 });
      
      if (!result.messages) return [];
      
      // Fetch details of listed messages, utilizing the detail cache for each message
      const messages = await Promise.all(
        result.messages
          .filter((msg): msg is { id: string; [key: string]: unknown } => msg.id !== undefined)
          .map(async (msg) => {
            const msgCacheKey = `message:v1:${tenantId}:${msg.id}`;
            const cachedMsg = getCachedItem(messageCache, msgCacheKey);
            if (cachedMsg) {
              return {
                id: cachedMsg.id,
                threadId: cachedMsg.threadId,
                subject: cachedMsg.subject,
                from: cachedMsg.sender,
                snippet: cachedMsg.snippet,
                createdAt: cachedMsg.createdAt,
              };
            }

            const message = await tenant.gmail.api.messages.get({ id: msg.id, format: "metadata" });
            
            const subject = message.payload?.headers?.find((h: GmailHeader) => h.name === "Subject")?.value || "No Subject";
            const from = message.payload?.headers?.find((h: GmailHeader) => h.name === "From")?.value || "Unknown Sender";
            const createdAt = new Date(parseInt(message.internalDate as string));
            
            const formatted = {
              id: message.id as string,
              threadId: message.threadId as string,
              subject,
              from,
              snippet: message.snippet as string,
              createdAt,
            };

            // Pre-warm the details cache (without full body)
            setCachedItem(messageCache, msgCacheKey, {
              id: formatted.id,
              threadId: formatted.threadId,
              subject: formatted.subject,
              sender: formatted.from,
              body: "",
              snippet: formatted.snippet,
              createdAt: formatted.createdAt,
            }, MESSAGE_TTL);

            return formatted;
          })
      );
      
      const sorted = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Store complete response in cache
      setCachedItem(inboxCache, cacheKey, sorted, INBOX_TTL);
      return sorted;
    } catch (error) {
      if (
        error instanceof Error && 
        error.message.includes("Account not found")
      ) {
        return [];
      }
      console.error("GMAIL SERVICE ERROR:", error);
      throw error;
    }
  });
}

export async function getMessageById(tenantId: string, messageId: string): Promise<FullGmailMessage> {
  const cacheKey = `message:v1:${tenantId}:${messageId}`;
  
  // Return cached result immediately if it exists and has the message body fetched
  const cached = getCachedItem(messageCache, cacheKey);
  if (cached && cached.body) {
    return cached;
  }

  // Deduplicate concurrent get requests for the same message ID
  return deduplicateRequest(cacheKey, async () => {
    const tenant = corsair.withTenant(tenantId);
    const message = await tenant.gmail.api.messages.get({ id: messageId, format: "full" });
    
    const subject = message.payload?.headers?.find(
      (h: GmailHeader) => h.name === "Subject"
    )?.value ?? "No Subject";
    
    const sender = message.payload?.headers?.find(
      (h: GmailHeader) => h.name === "From"
    )?.value ?? "Unknown Sender";
    
    const body = extractBody(message.payload as GmailPayload);

    const fullMessage: FullGmailMessage = {
      id: message.id as string,
      threadId: message.threadId as string,
      subject,
      sender,
      body,
      snippet: message.snippet as string,
      createdAt: new Date(parseInt(message.internalDate as string)),
    };

    setCachedItem(messageCache, cacheKey, fullMessage, MESSAGE_TTL);
    return fullMessage;
  });
}

export async function getUnreadEmails(tenantId: string): Promise<InboxMessage[]> {
  const cacheKey = `unread:v1:${tenantId}`;
  
  const cached = getCachedItem(unreadCache, cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const tenant = corsair.withTenant(tenantId);
      const response = await tenant.gmail.api.messages.list({
        maxResults: 20,
        q: "is:unread",
      });

      if (!response.messages) return [];

      const messages = await Promise.all(
        response.messages
          .filter((msg): msg is { id: string; [key: string]: unknown } => msg.id !== undefined)
          .map(async (msg) => {
            const msgCacheKey = `message:v1:${tenantId}:${msg.id}`;
            const cachedMsg = getCachedItem(messageCache, msgCacheKey);
            if (cachedMsg) {
              return {
                id: cachedMsg.id,
                threadId: cachedMsg.threadId,
                subject: cachedMsg.subject,
                from: cachedMsg.sender,
                snippet: cachedMsg.snippet,
                createdAt: cachedMsg.createdAt,
              };
            }

            const message = await tenant.gmail.api.messages.get({ id: msg.id, format: "metadata" });
            
            const subject = message.payload?.headers?.find((h: GmailHeader) => h.name === "Subject")?.value || "No Subject";
            const from = message.payload?.headers?.find((h: GmailHeader) => h.name === "From")?.value || "Unknown Sender";
            const createdAt = new Date(parseInt(message.internalDate as string));
            
            const formatted = {
              id: message.id as string,
              threadId: message.threadId as string,
              subject,
              from,
              snippet: message.snippet as string,
              createdAt,
            };

            setCachedItem(messageCache, msgCacheKey, {
              id: formatted.id,
              threadId: formatted.threadId,
              subject: formatted.subject,
              sender: formatted.from,
              body: "",
              snippet: formatted.snippet,
              createdAt: formatted.createdAt,
            }, MESSAGE_TTL);

            return formatted;
          })
      );

      const sorted = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setCachedItem(unreadCache, cacheKey, sorted, UNREAD_TTL);
      return sorted;
    } catch (error) {
      if (
        error instanceof Error && 
        error.message.includes("Account not found")
      ) {
        return [];
      }
      console.error("GET UNREAD EMAILS ERROR:", error);
      throw error;
    }
  });
}

export async function getUserProfile(tenantId: string): Promise<{ email: string; displayName?: string } | null> {
  try {
    const tenant = corsair.withTenant(tenantId);
    // Manually call Gmail's users.getProfile API
    const gmailKeys = tenant.gmail.keys;
    const accessToken = await gmailKeys.get_access_token();
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }
    
    const profile = await response.json();
    if (profile.emailAddress) {
      return {
        email: profile.emailAddress as string,
        displayName: (profile as any).displayName,
      };
    }
    return null;
  } catch (error) {
    if (
      error instanceof Error && 
      (error.message.includes("Account not found") || error.message.includes("Cannot read properties"))
    ) {
      return null;
    }
    console.error("GET USER PROFILE ERROR:", error);
    return null;
  }
}

