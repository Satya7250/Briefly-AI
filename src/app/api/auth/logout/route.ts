import { NextRequest, NextResponse } from "next/server";
import { clearTenantId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  
  // Clear session cookie (stable user.id)
  clearTenantId(response);
  
  // Prevent caching
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  
  // Instruct client side to clear specific application state stored in localStorage
  response.headers.set(
    "X-Clear-LocalStorage",
    "briefing:onboarded,briefing:connected,briefing:auth,email-unread,email-snoozes,briefing:onboarding"
  );
  
  return response;
}
