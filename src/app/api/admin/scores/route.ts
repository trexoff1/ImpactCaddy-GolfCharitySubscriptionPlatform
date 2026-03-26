import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: scores, error } = await admin
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("date_played", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scoreId, updates } = await request.json();
    const admin = createAdminClient();
    const { error } = await admin.from("scores").update(updates).eq("id", scoreId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scoreId } = await request.json();
    const admin = createAdminClient();
    const { error } = await admin.from("scores").delete().eq("id", scoreId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete score" }, { status: 500 });
  }
}
