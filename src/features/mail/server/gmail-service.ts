import { corsair } from "@/corsair/client";
import { GmailRepository } from "./gmail.repository";

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

export async function getInboxMessages(tenantId: string): Promise<InboxMessage[]> {
  try {
    return await GmailRepository.getRecentMessages(tenantId, 20);
  } catch (error) {
    console.error("GMAIL SERVICE ERROR:", error);
    return [];
  }
}

export async function getMessageById(tenantId: string, messageId: string): Promise<FullGmailMessage> {
  const message = await GmailRepository.getMessage(tenantId, messageId);
  
  if (!message) {
    throw new Error("Message not found in local database.");
  }

  const msg = message as any;
  const subject = msg.payload?.headers?.find(
    (h: GmailHeader) => h.name === "Subject"
  )?.value ?? "No Subject";
  
  const sender = msg.payload?.headers?.find(
    (h: GmailHeader) => h.name === "From"
  )?.value ?? "Unknown Sender";
  
  const body = extractBody(msg.payload as GmailPayload);

  let createdAt: Date;
  if (msg.internalDate) {
    const parsed = parseInt(msg.internalDate);
    createdAt = !isNaN(parsed) ? new Date(parsed) : new Date(msg.internalDate);
  } else if (msg.createdAt) {
    createdAt = new Date(msg.createdAt);
  } else {
    createdAt = new Date();
  }
  if (isNaN(createdAt.getTime())) {
    createdAt = new Date();
  }

  return {
    id: msg.id as string,
    threadId: msg.threadId as string,
    subject,
    sender,
    body,
    snippet: msg.snippet as string,
    createdAt,
  };
}

export async function getUnreadEmails(tenantId: string): Promise<InboxMessage[]> {
  try {
    return await GmailRepository.getUnreadMessages(tenantId, 20);
  } catch (error) {
    console.error("GET UNREAD EMAILS ERROR:", error);
    return [];
  }
}

export async function getUserProfile(tenantId: string): Promise<{ email: string; displayName?: string } | null> {
  try {
    const tenant = corsair.withTenant(tenantId);
    // Manually call Gmail's users.getProfile API since it's an API action
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
    console.error("GET USER PROFILE ERROR:", error);
    return null;
  }
}

export async function sendEmail(
  tenantId: string,
  to: string,
  subject: string,
  body: string
): Promise<any> {
  return await GmailRepository.sendEmail(tenantId, to, subject, body);
}
