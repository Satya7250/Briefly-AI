import { prepareMeetingBriefing } from "@/features/meetings/server/meeting-prep-service";
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
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId" },
        { status: 400 }
      );
    }

    const briefing = await prepareMeetingBriefing(tenantId, eventId);

    return NextResponse.json({ success: true, data: briefing });
  } catch (error: any) {
    console.error("Error preparing meeting:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to prepare meeting briefing" },
      { status: 500 }
    );
  }
}
