"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface Charity {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  total_raised: number;
  supporter_count: number;
}

export default function CharityDirectoryPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("charities")
      .select("id, slug, name, description, logo_url, website_url, total_raised, supporter_count")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setCharities(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }} className="fade-in">
      {/* Nav */}
      <nav style={{ padding: "20px 32px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.04em", color: "var(--color-text-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--color-impact-400)" }}>✨</span> ImpactCaddy
        </Link>
        <Link href="/auth/signup" className="btn btn-accent btn-sm premium-glow">Start Your Impact</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ marginBottom: 60 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: 16, letterSpacing: "-0.05em" }}>
            The Impact Portfolio
          </h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: 600, fontSize: "1.125rem", lineHeight: 1.6 }}>
            Choose your mission. Every round you play and every score you log generates direct power for these vetted legacy partners.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 60, maxWidth: 400 }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700 }}>Search Missions</div>
          <input
            className="input-field"
            placeholder="Search by cause or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <div className="stat-counter" style={{ fontSize: "1rem", color: "var(--color-impact-400)" }}>Initializing Missions…</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }} className="stagger-children">
            {filtered.map((charity) => (
              <div key={charity.id} className="glass-card" style={{ padding: 40, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: -20, right: -10, fontSize: "4rem", opacity: 0.03, fontWeight: 900 }}>MISSION</div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: 16 }}>{charity.name}</h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, flex: 1, marginBottom: 32 }}>
                  {charity.description.slice(0, 140)}{charity.description.length > 140 ? '…' : ''}
                </p>
                
                <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.125rem" }}>{formatCurrency(charity.total_raised)}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", textTransform: "uppercase" }}>Impact</div>
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.125rem" }}>{charity.supporter_count}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", textTransform: "uppercase" }}>Advocates</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <Link href={`/charities/${charity.slug}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Full Portfolio
                  </Link>
                  <Link href="/auth/signup" className="btn btn-ghost btn-sm">Support</Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-muted)", gridColumn: "1/-1", textAlign: "center", padding: 80, border: "1px dashed var(--color-border)", borderRadius: 12 }}>
                No missions match your search criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
