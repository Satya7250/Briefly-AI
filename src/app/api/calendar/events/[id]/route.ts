import { updateEvent } from "@/features/calendar/server/calendar-service";
import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getTenantId();
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing event id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json(
        { success: false, error: "Missing updates payload" },
        { status: 400 }
      );
    }

    const result = await updateEvent(tenantId, id, updates);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}
