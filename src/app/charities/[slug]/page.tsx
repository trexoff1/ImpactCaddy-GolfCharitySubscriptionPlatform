import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

export default async function CharityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!charity) return notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }} className="fade-in">
      {/* Nav */}
      <nav style={{ padding: "20px 32px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.04em", color: "var(--color-text-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--color-impact-400)" }}>✨</span> ImpactCaddy
        </Link>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/charities" className="btn btn-ghost btn-sm">← Impact Portfolio</Link>
          <Link href="/auth/signup" className="btn btn-accent btn-sm premium-glow">Commit to Mission</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
        {/* Header */}
        <div className="glass-card" style={{ padding: 60, marginBottom: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)" }}></div>
          <div style={{ fontSize: "5rem", marginBottom: 24, lineHeight: 1 }}>✨</div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", marginBottom: 16, letterSpacing: "-0.05em" }}>{charity.name}</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.25rem", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 40px" }}>
            {charity.description}
          </p>
          {charity.website_url && (
            <a href={charity.website_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
              Official Mission Resource ↗
            </a>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
          <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
              Legacy Fund Generated
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", fontWeight: 700, color: "var(--color-impact-400)" }}>
              {formatCurrency(charity.total_raised || 0)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
              Active Advocates
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", fontWeight: 700, color: "#fff" }}>
              {charity.supporter_count || 0}
            </div>
          </div>
        </div>

        {/* Action Board */}
        <div className="glass-card" style={{ padding: 60, textAlign: "center", border: "1px solid var(--color-impact-400)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: 16 }}>Fuel This Legacy</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 40, fontSize: "1.125rem", lineHeight: 1.6 }}>
            By joining ImpactCaddy, your rounds directly contribute to {charity.name}. We transform your passion for the game into tangible impact for this mission.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/auth/signup" className="btn btn-accent btn-lg premium-glow">
              Begin Your Support Flow
            </Link>
            <Link href="/charities" className="btn btn-ghost btn-lg">
              Explore More Missions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
