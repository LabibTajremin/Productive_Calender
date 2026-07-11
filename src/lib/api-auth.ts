import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { userId };
}
