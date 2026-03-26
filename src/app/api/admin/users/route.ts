import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, updates } = await request.json();
    if (!userId || !updates) {
      return NextResponse.json({ error: "userId and updates are required" }, { status: 400 });
    }

    const admin = createAdminClient();
    
    // Update profile
    const { error: profileError } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (profileError) throw profileError;

    // If tier or status updated, also ensure subscriptions table is in sync if it exists
    if (updates.subscription_tier || updates.subscription_status) {
       await admin.from("subscriptions").upsert({
         user_id: userId,
         tier: updates.subscription_tier,
         status: updates.subscription_status,
         updated_at: new Date().toISOString(),
       }, { onConflict: 'user_id' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
