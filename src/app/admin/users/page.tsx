import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/auth/login");

  // Verify Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.is_admin) return redirect("/dashboard");

  // Fetch Users
  const adminClient = createAdminClient();
  
  // 1. Get Auth Users to get Emails (Needs Service Role)
  const { data: authData } = await adminClient.auth.admin.listUsers();
  const authUsers = authData.users || [];

  // 2. Get Profiles
  const { data: profiles } = await adminClient
    .from("profiles")
    .select(`*`)
    .order("created_at", { ascending: false });

  // 3. Merge
  const mergedUsers = (profiles || []).map((p) => {
    const authUser = authUsers.find((u) => u.id === p.id);
    return {
      ...p,
      email: authUser?.email || "Unknown",
    };
  });

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: 8 }}>
        User & Subscription Management
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 28 }}>
        View and edit registered golfers, their profiles, and subscription status.
      </p>

      <UsersTable initialUsers={mergedUsers} />
    </div>
  );
}
