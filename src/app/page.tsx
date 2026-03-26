import Link from "next/link";
import { TIERS, type SubscriptionTier } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // Featured = highest supporter count
  const featured = charities
    ? [...charities].sort((a, b) => (b.supporter_count || 0) - (a.supporter_count || 0))[0]
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }} className="fade-in">
      {/* ─── Nav ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.4rem",
            letterSpacing: "-0.04em",
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span style={{ color: "var(--color-impact-400)" }}>✨</span> ImpactCaddy
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/charities" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }} className="btn-ghost btn-sm">Global Impact</Link>
          <Link href="/auth/login" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }} className="btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/signup" className="btn btn-accent btn-sm premium-glow">Join the Movement</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "160px 24px 100px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Abstract background glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", zIndex: 0 }}></div>

        <div className="badge badge-info float-animation" style={{ marginBottom: 28 }}>
          Building Legacies Through Sport
        </div>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(3.5rem, 8vw, 6rem)",
            fontWeight: 800,
            lineHeight: 0.95,
            maxWidth: 1000,
            marginBottom: 28,
            letterSpacing: "-0.06em",
            position: "relative",
            zIndex: 1
          }}
        >
          Your Game.<br />
          <span style={{ color: "var(--color-impact-400)" }}>Their Future.</span>
        </h1>

        <p
          style={{
            maxWidth: 600,
            fontSize: "1.25rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: 48,
            position: "relative",
            zIndex: 1,
            fontWeight: 400
          }}
        >
          ImpactCaddy is an emotion-first subscription platform where every score you log translates directly into charitable power. Win prizes, track your game, and fund the causes that define your legacy.
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <Link href="/auth/signup" className="btn btn-accent btn-lg premium-glow">
            Start Your Impact
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            Discover the Mission
          </a>
        </div>

        {/* Global Stats Split */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 60,
            marginTop: 100,
            maxWidth: 900,
            width: "100%",
            position: "relative",
            zIndex: 1
          }}
        >
          {[
            { value: "₹1,42,500", label: "Direct Impact Raised", color: "var(--color-impact-400)" },
            { value: "2,400+", label: "Golfer Legacies", color: "#fff" },
            { value: "62", label: "Missions Completed", color: "#fff" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "2.5rem", color: s.color }}>{s.value}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The Mission ─── */}
      <section
        id="how-it-works"
        style={{
          padding: "140px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "3rem", marginBottom: 16 }}>The Cycle of Good</h2>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: 500, margin: "0 auto" }}>We believe the best way to win is to give. Here is how your subscription changes everything.</p>
        </div>

        <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          {[
            {
              title: "Choice",
              desc: "Choose a mission. From clean water to youth education, pick the cause that resonates with your values.",
              num: "01"
            },
            {
              title: "Consistency",
              desc: "Play your rounds and log your scores. Every stroke recorded is a commitment to your chosen charity.",
              num: "02"
            },
            {
              title: "Momentum",
              desc: "Win monthly prize pools while fueling a constant stream of support to frontline causes.",
              num: "03"
            },
          ].map((step) => (
            <div
              key={step.title}
              className="glass-card"
              style={{ padding: 48, position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -20, right: -10, fontSize: "8rem", fontWeight: 900, color: "rgba(255,255,255,0.02)", lineHeight: 1 }}>{step.num}</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: 20 }}>{step.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Impact Portfolio ─── */}
      <section
        style={{
          padding: "140px 24px",
          background: "linear-gradient(to bottom, transparent, var(--color-bg-secondary))",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "3rem", marginBottom: 16 }}>Active Impact</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>Direct your rounds to the missions that matter most.</p>
          </div>

          {/* Spotlight Hero Card */}
          {featured && (
            <div className="glass-card" style={{ padding: 60, marginBottom: 40, position: "relative", overflow: "hidden", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap", border: "1px solid var(--color-impact-400)" }}>
              <div style={{ position: "absolute", bottom: -50, right: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)", zIndex: 0 }}></div>
              <div style={{ flex: 1, minWidth: 300, position: "relative", zIndex: 1 }}>
                <div style={{ color: "var(--color-impact-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.75rem", marginBottom: 12 }}>Spotlight Mission</div>
                <h3 style={{ fontSize: "2.5rem", marginBottom: 20 }}>{featured.name}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "1.25rem", lineHeight: 1.6, marginBottom: 32 }}>{featured.description}</p>
                <div style={{ display: "flex", gap: 40, marginBottom: 40 }}>
                  <div><div style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>{formatCurrency(featured.total_raised || 0)}</div><div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Impact Generated</div></div>
                  <div><div style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>{featured.supporter_count || 0}</div><div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Advocates</div></div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <Link href={`/charities/${featured.slug}`} className="btn btn-primary">View Full Profile</Link>
                  <Link href="/auth/signup" className="btn btn-accent premium-glow">Support This Mission</Link>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {charities?.filter(c => c.id !== featured?.id).slice(0, 3).map((charity) => (
              <div key={charity.id} className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: 16 }}>{charity.name}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 24, lineHeight: 1.5 }}>{charity.description.slice(0, 100)}...</p>
                <Link href={`/charities/${charity.slug}`} style={{ color: "#fff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>Explore Mission →</Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <Link href="/charities" className="btn btn-ghost btn-lg">Explore Full Impact Portfolio</Link>
          </div>
        </div>
      </section>

      {/* ─── Commitment Tiers ─── */}
      <section style={{ padding: "140px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontSize: "3.5rem", marginBottom: 16 }}>Join the Movement</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>Choose your level of commitment to global good.</p>
          </div>

          <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            {(Object.entries(TIERS) as [SubscriptionTier, typeof TIERS[SubscriptionTier]][]).map(
              ([key, tier]) => (
                <div key={key} className="glass-card" style={{ padding: 48, display: "flex", flexDirection: "column", border: key === "eagle" ? "1px solid var(--color-impact-400)" : undefined, position: "relative" }}>
                  {key === "eagle" && <div className="badge badge-info" style={{ position: "absolute", top: 20, right: 20 }}>Most Effective</div>}
                  <h3 style={{ fontSize: "1.75rem", marginBottom: 8 }}>{tier.name}</h3>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 28 }}>{tier.description}</p>
                  <div style={{ marginBottom: 40 }}>
                    <span style={{ fontSize: "3rem", fontWeight: 800 }}>{formatCurrency(tier.price)}</span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "1.125rem" }}> /month</span>
                  </div>
                  <ul style={{ listStyle: "none", flex: 1, marginBottom: 40 }}>
                    {tier.features.map((f) => (
                      <li key={f} style={{ padding: "10px 0", color: "var(--color-text-secondary)", fontSize: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: "var(--color-impact-400)" }}>✨</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`btn btn-lg ${key === "eagle" ? "btn-accent premium-glow" : "btn-primary"}`}>Commit to {tier.name}</Link>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── Minimal Footer ─── */}
      <footer style={{ padding: "100px 24px 60px", borderTop: "1px solid var(--color-border)", textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.04em", marginBottom: 16, color: "#fff" }}>ImpactCaddy</div>
        <p style={{ marginBottom: 40 }}>A legacy of impact through the spirit of play.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, fontSize: "0.875rem" }}>
          <Link href="/charities" style={{ color: "inherit", textDecoration: "none" }}>Our Partners</Link>
          <Link href="/auth/signup" style={{ color: "inherit", textDecoration: "none" }}>Join Mission</Link>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms of Legacy</a>
        </div>
        <div style={{ marginTop: 60, opacity: 0.5, fontSize: "0.75rem" }}>© {new Date().getFullYear()} ImpactCaddy. All legacies preserved.</div>
      </footer>
    </div>
  );
}
