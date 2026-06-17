import { sendEmail } from "@/features/mail/server/gmail-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || !subject || !emailBody || !emailRegex.test(to) || !subject.trim() || !emailBody.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid data: Check email formatting, non-empty subject and body" },
        { status: 400 }
      );
    }

    const result = await sendEmail(tenantId, to, subject, emailBody);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
