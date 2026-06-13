import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/constants/auth"

export async function getTenantId(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value
  console.log("[AUTH_LIB] getTenantId(), cookie present:", !!cookieValue)
  return cookieValue || null
}

export function setTenantId(
  tenantId: string,
  response: NextResponse
): NextResponse {
  console.log("[AUTH_LIB] setTenantId() called")
  response.cookies.set(
    SESSION_COOKIE_NAME,
    tenantId,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  )
  console.log("[AUTH_LIB] Cookie set successfully")
  return response
}

export function clearTenantId(
  response: NextResponse
): NextResponse {
  console.log("[AUTH_LIB] clearTenantId() called")
  response.cookies.delete(
    SESSION_COOKIE_NAME
  )
  return response
}