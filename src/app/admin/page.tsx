import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: subsCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .in("status", ["active", "trialing"]);

  const { count: scoresCount } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  const { data: draws } = await supabase
    .from("draws")
    .select("total_pool, status, winner_id");
  
  const completedDraws = (draws || []).filter(d => d.status === 'completed');
  const totalPoolAllTime = completedDraws.reduce((acc, d) => acc + Number(d.total_pool || 0), 0);
  const avgPool = completedDraws.length > 0 ? totalPoolAllTime / completedDraws.length : 0;
  const rollovers = completedDraws.filter(d => !d.winner_id).length;

  const { data: profilesForCharity } = await supabase
    .from("profiles")
    .select("charity_total");
  const totalCharity = (profilesForCharity || []).reduce(
    (acc, p) => acc + (p.charity_total || 0),
    0
  );

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.50rem", marginBottom: 8, letterSpacing: "-0.05em" }}>
        Admin Headquarters
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 40, fontSize: "1.125rem" }}>
        Platform overview, impact analytics, and global moderation tools.
      </p>

      {/* Main Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Registered Golfers</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>{usersCount || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Active Subscribers</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>{subsCount || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Rounds Logged</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>{scoresCount || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 32, border: "1px solid var(--color-impact-400)" }}>
          <div style={{ color: "var(--color-impact-400)", fontSize: "0.75rem", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Charity Generated</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", fontWeight: 700, color: "var(--color-impact-400)", letterSpacing: "-0.04em" }}>{formatCurrency(totalCharity)}</div>
        </div>
      </div>

      {/* Draw Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
        <div className="glass-card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Avg. Monthly Pool</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{formatCurrency(avgPool)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Jackpot Rollovers</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{rollovers}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Total Completed Draws</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{completedDraws.length}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Total Prize Payouts</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{formatCurrency(totalPoolAllTime)}</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 16 }}>
        Management Tools
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <Link href="/admin/users" className="glass-card" style={{ padding: 28, textDecoration: "none", color: "inherit", transition: "all 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>👥 User Management</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Edit golfer profiles, manage scores, and adjust subscriptions.
          </p>
        </Link>

        <Link href="/admin/charities" className="glass-card" style={{ padding: 28, textDecoration: "none", color: "inherit", transition: "all 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>✨ Charity Setup</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Add, edit, or toggle visibility for listed charity partners.
          </p>
        </Link>

        <Link href="/admin/draws" className="glass-card" style={{ padding: 28, textDecoration: "none", color: "inherit", transition: "all 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>🎰 Draw Control</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Build pools, run algorithms, and publish official draws.
          </p>
        </Link>

        <Link href="/admin/winners" className="glass-card" style={{ padding: 28, textDecoration: "none", color: "inherit", transition: "all 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>✅ Verification</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Verify proof uploads and resolve winner payouts physically.
          </p>
        </Link>
      </div>
    </div>
  );
}
