// Logged-in survey page (issue #41). State-driven single route.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSurveyPageState } from "@/lib/survey/source";
import { SurveyView } from "@/components/survey/SurveyView";

// Survey + response state changes frequently; never statically cache.
export const dynamic = "force-dynamic";

export default async function SurveyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const state = await getSurveyPageState(user.id);
  return <SurveyView state={state} />;
}
