import { sendEmail } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check integration connection status
    const integrationStatus = await getIntegrationStatus(tenantId);
    if (!integrationStatus.gmailConnected) {
      return NextResponse.json(
        { success: false, error: "Gmail integration is not connected. Please connect Gmail in Settings." },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload" },
        { status: 400 }
      );
    }

    const { to, subject, body: emailBody } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || !subject || !emailBody || !emailRegex.test(to) || !subject.trim() || !emailBody.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid data: Check email formatting, non-empty subject and body" },
        { status: 400 }
      );
    }

    const result = await withTimeout(
      sendEmail(tenantId, to, subject, emailBody),
      12000,
      "Gmail API request timed out"
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

