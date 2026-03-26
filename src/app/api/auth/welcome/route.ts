import { NextResponse } from "next/server";
import { emails } from "@/lib/email/service";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, user_metadata } = user;
    const name = user_metadata?.display_name || "Hero";

    // Trigger welcome email
    await emails.welcome(email!, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}
