import { NextResponse } from "next/server";
import { getTenantId } from "@/lib/auth";
import { getUserProfile } from "@/features/mail/server/gmail-service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // First, try to get user from users table
    const userRecords = await db.select().from(users).where(eq(users.id, tenantId)).limit(1);
    let userData = null;

    if (userRecords.length > 0) {
      const user = userRecords[0];
      userData = {
        email: user.email,
        displayName: user.name,
      };
    } else {
      // Fallback to Gmail API
      userData = await getUserProfile(tenantId);
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 });
  }
}
