"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [charityId, setCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState("10");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCharities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("charities")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setCharities(data || []);
      if (data && data.length > 0) {
        setCharityId(data[0].id);
      }
    }
    loadCharities();
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedPercentage = Number(charityPercentage);
    if (!charityId) {
      setError("Please select a charity.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parsedPercentage) || parsedPercentage < 10) {
      setError("Charity contribution must be at least 10%.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          charity_id: charityId,
          charity_percentage: parsedPercentage,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Trigger welcome email (non-blocking)
    fetch("/api/auth/welcome", { method: "POST" }).catch(console.error);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)",
      }}
    >
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)", zIndex: 0 }}></div>

      <div className="glass-card fade-in" style={{ maxWidth: 420, width: "100%", padding: 60, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: "2.25rem",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12
            }}
          >
            <span style={{ color: "var(--color-impact-400)" }}>✨</span> ImpactCaddy
          </div>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 12, fontSize: "1rem" }}>
            Join the movement. Change the future.
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="input-label" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="charityId">Choose Charity</label>
            <select
              id="charityId"
              className="input-field"
              value={charityId}
              onChange={(e) => setCharityId(e.target.value)}
              required
            >
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="charityPercentage">Charity Contribution %</label>
            <input
              id="charityPercentage"
              type="number"
              min={10}
              max={100}
              className="input-field"
              value={charityPercentage}
              onChange={(e) => setCharityPercentage(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(239,68,68,0.1)",
                color: "var(--color-danger-400)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-accent btn-lg premium-glow" disabled={loading} style={{ width: "100%", marginTop: 12 }}>
            {loading ? "Committing..." : "Begin Your Impact Flow"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--color-primary-400)", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
