import { getServerSession } from "@/features/auth/actions";

export default async function TestPage() {
  const session = await getServerSession();

  return (
    <pre>{JSON.stringify(session, null, 2)}</pre>
  );
}