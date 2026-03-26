"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
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
        background: "var(--color-bg-primary)",
        position: "relative",
        overflow: "hidden"
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
            Return to your mission
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label className="input-label" htmlFor="email" style={{ marginBottom: 12 }}>Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password" style={{ marginBottom: 12 }}>Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
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
            {loading ? "Verifying…" : "Sign In to Impact"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          New to the movement?{" "}
          <Link href="/auth/signup" style={{ color: "var(--color-impact-400)", textDecoration: "none", fontWeight: 600 }}>
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
