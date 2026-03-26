"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type BillingInterval = "monthly" | "yearly";
type Tier = "birdie" | "eagle" | "albatross";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [selectedTier, setSelectedTier] = useState<Tier>("birdie");
  const [subscriptionStatus, setSubscriptionStatus] = useState("trialing");
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [billingError, setBillingError] = useState("");

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("birdie");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    setEmail(userData.user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userData.user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setHandicap(profile.handicap?.toString() || "");
      setHomeClub(profile.home_course || "");
      setTier((profile.subscription_tier || "birdie") as Tier);
      setSelectedTier((profile.subscription_tier || "birdie") as Tier);
      setSubscriptionStatus(profile.subscription_status || "trialing");
    }
    setRenewalDate(subscription?.current_period_end || null);
    if (subscription?.status) {
      setSubscriptionStatus(subscription.status);
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    await supabase
      .from("profiles")
      .upsert({
        id: userData.user.id,
        display_name: displayName,
        handicap: handicap ? parseFloat(handicap) : null,
        home_course: homeClub || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.user.id);

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleCheckout() {
    setBillingError("");
    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, interval: billingInterval }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to create checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Checkout failed");
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingError("");
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open billing portal");
      }

      window.location.href = data.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Billing portal failed");
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const tierData: Record<Tier, { label: string; color: string; icon: string; monthly: string; yearly: string }> = {
    birdie: { label: "Birdie", color: "var(--color-success-400)", icon: "🐦", monthly: "₹999/mo", yearly: "₹9,999/yr" },
    eagle: { label: "Eagle", color: "var(--color-primary-400)", icon: "🦅", monthly: "₹2,499/mo", yearly: "₹24,999/yr" },
    albatross: { label: "Albatross", color: "var(--color-accent-400)", icon: "🏆", monthly: "₹4,999/mo", yearly: "₹49,999/yr" },
  };

  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 4 }}>Profile</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Manage your ImpactCaddy profile and settings.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Profile form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 20 }}>
            Personal Details
          </h2>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="input-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input-field"
                value={email}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                className="input-field"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your golfer name"
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="handicap">Handicap</label>
              <input
                id="handicap"
                type="number"
                step="0.1"
                min="-5"
                max="54"
                className="input-field"
                value={handicap}
                onChange={(e) => setHandicap(e.target.value)}
                placeholder="e.g. 12.4"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="homeClub">Home Club</label>
              <input
                id="homeClub"
                className="input-field"
                value={homeClub}
                onChange={(e) => setHomeClub(e.target.value)}
                placeholder="e.g. Royal Birkdale"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? "Saving…" : success ? "✅ Saved!" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Subscription details */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 20 }}>
            Subscription
          </h2>
          <div
            style={{
              padding: 24,
              borderRadius: "var(--radius-lg)",
              background: "rgba(148,163,184,0.04)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: "3rem" }}>{tierData[tier]?.icon || "⛳"}</span>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: tierData[tier]?.color,
                marginTop: 12,
              }}
            >
              {tierData[tier]?.label || tier} Plan
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: 8 }}>
              {tier === "birdie" && "Starter plan with draw entries and score tracking."}
              {tier === "eagle" && "Popular plan with more entries and enhanced draw access."}
              {tier === "albatross" && "Top-tier plan with premium experiences and maximum impact."}
            </p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", marginTop: 8 }}>
              Status: <strong>{subscriptionStatus.replace("_", " ")}</strong>
              {renewalDate ? ` · Renews ${new Date(renewalDate).toLocaleDateString("en-GB")}` : ""}
            </p>
          </div>

          <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                className={`btn btn-sm ${billingInterval === "monthly" ? "btn-primary" : "btn-ghost"}`}
                type="button"
                onClick={() => setBillingInterval("monthly")}
              >
                Monthly
              </button>
              <button
                className={`btn btn-sm ${billingInterval === "yearly" ? "btn-primary" : "btn-ghost"}`}
                type="button"
                onClick={() => setBillingInterval("yearly")}
              >
                Yearly (20% off)
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(Object.keys(tierData) as Tier[]).map((planTier) => {
                const selected = selectedTier === planTier;
                return (
                  <button
                    key={planTier}
                    type="button"
                    className={`btn btn-sm ${selected ? "btn-accent" : "btn-ghost"}`}
                    onClick={() => setSelectedTier(planTier)}
                  >
                    {tierData[planTier].label}
                  </button>
                );
              })}
            </div>

            <p style={{ marginTop: 12, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {billingInterval === "monthly" ? tierData[selectedTier].monthly : tierData[selectedTier].yearly}
            </p>

            <button
              className="btn btn-accent btn-lg"
              type="button"
              disabled={checkoutLoading}
              onClick={handleCheckout}
              style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
            >
              {checkoutLoading ? "Redirecting to Stripe..." : "Subscribe with Stripe"}
            </button>

            {isActive && (
              <button
                className="btn btn-ghost btn-lg"
                type="button"
                disabled={portalLoading}
                onClick={handleManageBilling}
                style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
              >
                {portalLoading ? "Opening portal..." : "Manage Billing"}
              </button>
            )}

            {billingError && (
              <p style={{ color: "var(--color-danger-400)", fontSize: "0.8125rem", marginTop: 10 }}>
                {billingError}
              </p>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", marginBottom: 12 }}>
              Plan Benefits
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { text: "Score tracking & stats", included: true },
                { text: "Community leaderboard", included: true },
                { text: "Monthly draw entries", included: true },
                { text: "Charity donation allocation", included: true },
                { text: "Priority prize draws", included: tier !== "birdie" },
                { text: "Detailed analytics", included: tier !== "birdie" },
                { text: "VIP golfing experiences", included: tier === "albatross" },
                { text: "Unlimited draw entries", included: tier === "albatross" },
              ].map((benefit) => (
                <div key={benefit.text} style={{ display: "flex", alignItems: "center", gap: 8, opacity: benefit.included ? 1 : 0.4 }}>
                  <span>{benefit.included ? "✅" : "❌"}</span>
                  <span style={{ fontSize: "0.875rem" }}>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
