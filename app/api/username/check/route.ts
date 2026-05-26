import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsernameFormat } from "@/lib/username";

/** GET /api/username/check?username=foo — returns { available: boolean } */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";

  // Format must pass before we bother hitting the DB
  const format = validateUsernameFormat(username);
  if (!format.ok) {
    return NextResponse.json({ available: false });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  return NextResponse.json({ available: data === null });
}
