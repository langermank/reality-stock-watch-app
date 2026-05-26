import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsernameFormat } from "@/lib/username";

/** POST /api/username/save — saves a validated username to the authenticated user's profile. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();

  // Re-validate server-side
  const format = validateUsernameFormat(username ?? "");
  if (!format.ok) return NextResponse.json({ error: format.error }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (error) {
    // Unique violation = taken
    const taken = error.code === "23505";
    return NextResponse.json(
      { error: taken ? "Username is already taken" : "Something went wrong" },
      { status: taken ? 409 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
