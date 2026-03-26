"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface DashboardData {
  displayName: string;
  totalRounds: number;
  avgScore: number;
  bestScore: number;
  tier: string;
  subscriptionStatus: string;
  billingInterval: "monthly" | "yearly" | "unknown";
  renewalDate: string | null;
  drawEntries: number;
  charityTotal: number;
  recentScores: { id: string; date_played: string; course_name: string; stableford_points: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status, current_period_start, current_period_end")
        .eq("user_id", userData.user.id)
        .single();

      let billingInterval: "monthly" | "yearly" | "unknown" = "unknown";
      if (subscription?.current_period_start && subscription?.current_period_end) {
        const start = new Date(subscription.current_period_start).getTime();
        const end = new Date(subscription.current_period_end).getTime();
        const days = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        billingInterval = days >= 330 ? "yearly" : "monthly";
      }

      const { data: scores } = await supabase
        .from("scores")
        .select("id, stableford_points")
        .eq("user_id", userData.user.id);

      const { data: recentScores } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date_played", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const allScores = scores || [];
      const totalRounds = allScores.length;
      const avgScore = totalRounds > 0 ? Math.round(allScores.reduce((s, r) => s + r.stableford_points, 0) / totalRounds) : 0;
      const bestScore = totalRounds > 0 ? Math.max(...allScores.map((r) => r.stableford_points)) : 0;

      setData({
        displayName: profile?.display_name || userData.user.user_metadata?.display_name || "Golfer",
        totalRounds,
        avgScore,
        bestScore,
        tier: profile?.subscription_tier || "birdie",
        subscriptionStatus: subscription?.status || profile?.subscription_status || "trialing",
        billingInterval,
        renewalDate: subscription?.current_period_end || null,
        drawEntries: profile?.draw_entries || 0,
        charityTotal: profile?.charity_total || 0,
        recentScores: recentScores || [],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 8 }}>
        Welcome back, {data.displayName} 👋
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Here&apos;s your ImpactCaddy overview.
      </p>

      {/* Stat cards */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Total Rounds", value: data.totalRounds.toString(), icon: "⛳", color: "#fff" },
          { label: "Avg Score", value: data.avgScore.toString(), icon: "📊", color: "#fff" },
          { label: "Best Score", value: data.bestScore.toString(), icon: "🏆", color: "var(--color-accent-400)" },
          {
            label: "Subscription",
            value: `${data.subscriptionStatus.replace("_", " ")} · ${data.billingInterval}`,
            icon: "💳",
            color: "#fff",
          },
          { label: "Draw Entries", value: data.drawEntries.toString(), icon: "🎰", color: "#fff" },
          { label: "Charity Impact", value: formatCurrency(data.charityTotal), icon: "✨", color: "var(--color-impact-400)" },
        ].map((stat) => (
          <div className="glass-card" key={stat.label} style={{ padding: 24, position: "relative", overflow: "hidden" }}>
            {stat.label === "Charity Impact" && (
              <div style={{ position: "absolute", bottom: -20, right: -10, width: 80, height: 80, background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)" }}></div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  {stat.label}
                </div>
                <div
                  style={{ 
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: stat.label === "Subscription" ? "1.25rem" : "2.25rem", 
                    color: stat.color,
                    letterSpacing: "-0.04em"
                  }}
                >
                  {stat.value}
                </div>
                {stat.label === "Subscription" && data.renewalDate && (
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: 6 }}>
                    Renews {new Date(data.renewalDate).toLocaleDateString("en-GB")}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent scores & Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent scores */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem" }}>Recent Scores</h2>
            <Link href="/dashboard/scores" style={{ color: "var(--color-primary-400)", fontSize: "0.875rem", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {data.recentScores.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "32px 0" }}>
              No scores logged yet. Hit the course! ⛳
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.recentScores.map((score) => (
                <div
                  key={score.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(148,163,184,0.04)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{score.course_name}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                      {new Date(score.date_played).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: score.stableford_points >= 36 ? "var(--color-success-400)" : "var(--color-text-primary)",
                    }}
                  >
                    {score.stableford_points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 20 }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/dashboard/scores?new=1" className="btn btn-primary" style={{ justifyContent: "center" }}>
              ➕ Log a Score
            </Link>
            <Link href="/dashboard/draws" className="btn btn-accent" style={{ justifyContent: "center" }}>
              🎰 View Current Draw
            </Link>
            <Link href="/dashboard/leaderboard" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              🏆 Leaderboard
            </Link>
            <Link href="/dashboard/charity" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              ❤️ Choose a Charity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
