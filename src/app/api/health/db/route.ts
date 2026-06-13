import { checkDatabaseHealth } from "@/db/queries/health";

export async function GET() {
  const data = await checkDatabaseHealth();
  return Response.json({
    success: true,
    data,
  });
}
