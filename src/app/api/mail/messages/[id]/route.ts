import { getMessageById } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tenantId = await getTenantId()
    
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Check integration connection status
    const integrationStatus = await getIntegrationStatus(tenantId);
    if (!integrationStatus.gmailConnected) {
      return NextResponse.json(
        { success: false, error: "Gmail integration is not connected. Please connect Gmail in Settings." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing message id" }, { status: 400 });
    }
    
    const message = await withTimeout(
      getMessageById(tenantId, id),
      15000,
      "Gmail API request timed out"
    );
    
    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        threadId: message.threadId,
        subject: message.subject,
        sender: message.sender,
        body: message.body,
        snippet: message.snippet,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching message:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch message" }, { status: 500 });
  }
}