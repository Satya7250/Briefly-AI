import { getMessageById } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tenantId = await getTenantId()
    
    if (!tenantId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }
    
    const message = await getMessageById(tenantId, id);
    
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
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch message" }, { status: 500 });
  }
}