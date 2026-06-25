// import { sendEmail } from "@/features/mail/server/gmail-service";
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db";
// import { user, corsairAccounts, corsairIntegrations } from "@/db/schema";
// import { eq, and } from "drizzle-orm";
// import { logger } from "@/lib/logger";

// function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
//   return Promise.race([
//     promise,
//     new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
//   ]);
// }

// async function resolveSystemSender(email: string) {
//   // 1. Find user by email
//   const userResult = await db
//     .select({
//       id: user.id,
//       email: user.email,
//     })
//     .from(user)
//     .where(eq(user.email, email))
//     .limit(1);

//   if (userResult.length === 0) {
//     return { foundUser: false, email };
//   }

//   const userId = userResult[0].id;

//   // 2. Find their connected Gmail account
//   const accounts = await db
//     .select({
//       accountId: corsairAccounts.id,
//     })
//     .from(corsairAccounts)
//     .innerJoin(
//       corsairIntegrations,
//       eq(corsairAccounts.integrationId, corsairIntegrations.id)
//     )
//     .where(
//       and(
//         eq(corsairAccounts.tenantId, userId),
//         eq(corsairIntegrations.name, "gmail")
//       )
//     )
//     .limit(1);

//   if (accounts.length === 0) {
//     return { foundUser: true, userId, gmailConnected: false, email };
//   }

//   return {
//     foundUser: true,
//     userId,
//     gmailConnected: true,
//     email,
//     accountId: accounts[0].accountId,
//   };
// }

// export async function POST(request: NextRequest) {
//   try {
//     // 1. Verify Authentication
//     const authHeader = request.headers.get("authorization");
//     const apiKey = process.env.INTERNAL_API_KEY;

//     if (!apiKey || !authHeader || authHeader !== `Bearer ${apiKey}`) {
//       logger.warn("Unauthorized attempt to access internal send-email API");
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // 2. Parse Request Body
//     let body;
//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json(
//         { success: false, error: "Invalid JSON request payload" },
//         { status: 400 }
//       );
//     }

//     const { to, subject, html } = body;

//     // 3. Validate Request Body Types
//     if (typeof to !== "string" || typeof subject !== "string" || typeof html !== "string") {
//       return NextResponse.json(
//         { success: false, error: "Invalid request body: 'to', 'subject', and 'html' must be strings" },
//         { status: 400 }
//       );
//     }

//     // 4. Validate Email Format and Non-Empty Strings
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!to.trim() || !subject.trim() || !html.trim() || !emailRegex.test(to)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid data: Check email formatting, non-empty subject and html" },
//         { status: 400 }
//       );
//     }

//     // 5. Determine Tenant ID (using the system sender email)
//     const systemEmail = process.env.SYSTEM_SENDER_EMAIL;
//     if (!systemEmail || !systemEmail.trim()) {
//       logger.error("SYSTEM_SENDER_EMAIL is not configured.");
//       return NextResponse.json(
//         {
//           success: false,
//           error: "SYSTEM_SENDER_EMAIL is not configured. Please configure it in the environment variables."
//         },
//         { status: 500 }
//       );
//     }
//     const senderInfo = await resolveSystemSender(systemEmail);

//     if (!senderInfo.foundUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `System sender account (${systemEmail}) is not configured. Please create a Briefly user with this email and connect its Gmail integration in Settings.`
//         },
//         { status: 503 }
//       );
//     }

//     if (!senderInfo.gmailConnected) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Gmail integration is not connected for the system sender account (${systemEmail}). Please connect Gmail in Settings.`
//         },
//         { status: 503 }
//       );
//     }

//     // The user's ID acts as the tenantId in our multi-tenant setup
//     const tenantId = senderInfo.userId!;

//     // 7. Send the Email using the existing service
//     const result = await withTimeout(
//       sendEmail(tenantId, to, subject, html),
//       12000,
//       "Gmail API request timed out"
//     );

//     // 8. Return Gmail Message ID
//     if (!result || !result.id) {
//       logger.error("Gmail API succeeded but did not return a message ID", { result });
//       return NextResponse.json(
//         { success: false, error: "Gmail API did not return a message ID" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       messageId: result.id,
//     });
//   } catch (error: unknown) {
//     const err = error as Error;
//     logger.error("Error in internal send-email API:", {
//       message: err.message,
//       stack: err.stack,
//     });
//     return NextResponse.json(
//       { success: false, error: err.message || "Failed to send email" },
//       { status: 500 }
//     );
//   }
// }
