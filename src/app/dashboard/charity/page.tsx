"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  total_raised: number;
}

export default function CharityPage() {
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [donationTotal, setDonationTotal] = useState(0);
  const [communityTotal, setCommunityTotal] = useState(0);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [savingPercentage, setSavingPercentage] = useState(false);
  const [percentageSaved, setPercentageSaved] = useState(false);

  useEffect(() => { loadCharity(); }, []);

  async function loadCharity() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("charity_id, charity_total, charity_percentage")
      .eq("id", userData.user.id)
      .single();

    const { data: charityRows } = await supabase
      .from("charities")
      .select("id, name, description, logo_url, total_raised")
      .eq("is_active", true)
      .order("name", { ascending: true });

    setCharities(charityRows || []);
    setSelectedCharity(profile?.charity_id || null);
    setDonationTotal(profile?.charity_total || 0);
    setCharityPercentage(profile?.charity_percentage || 10);
    const total = (charityRows || []).reduce((s, c) => s + Number(c.total_raised || 0), 0);
    setCommunityTotal(total);
    setLoading(false);
  }

  async function selectCharity(charityId: string) {
    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setSaving(false); return; }
    await supabase.from("profiles").update({ charity_id: charityId }).eq("id", userData.user.id);
    setSelectedCharity(charityId);
    setSaving(false);
  }

  async function savePercentage() {
    if (charityPercentage < 10) return;
    setSavingPercentage(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setSavingPercentage(false); return; }
    await supabase.from("profiles").update({ charity_percentage: charityPercentage }).eq("id", userData.user.id);
    setSavingPercentage(false);
    setPercentageSaved(true);
    setTimeout(() => setPercentageSaved(false), 3000);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const currentCharity = charities.find((c) => c.id === selectedCharity);

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 4 }}>My Charity</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Choose where your impact goes. A portion of subscription fees goes to your chosen charity.
      </p>

      {/* Impact stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>Your Total Impact</div>
          <div className="stat-counter" style={{ fontSize: "2.5rem", color: "var(--color-impact-400)" }}>{formatCurrency(donationTotal)}</div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>Current Charity</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem" }}>
            {currentCharity ? <><span style={{ marginRight: 6 }}>✨</span>{currentCharity.name}</> : <span style={{ color: "var(--color-text-muted)" }}>Not selected</span>}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>Community Total</div>
          <div className="stat-counter" style={{ fontSize: "2.5rem", color: "var(--color-success-400)" }}>{formatCurrency(communityTotal)}</div>
        </div>
      </div>

      {/* Contribution rate slider */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 8 }}>My Contribution Rate</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: 20 }}>
          Minimum 10% of your subscription is allocated to charity. Increase it anytime.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <input type="range" min={10} max={100} value={charityPercentage}
            onChange={(e) => setCharityPercentage(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--color-impact-500)" }} />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, minWidth: 64, textAlign: "right" }}>
            {charityPercentage}%
          </span>
        </div>
        <button className="btn btn-primary" onClick={savePercentage} disabled={savingPercentage}>
          {percentageSaved ? "✅ Saved!" : savingPercentage ? "Saving…" : "Update Contribution Rate"}
        </button>
      </div>

      {/* Charity selection grid */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 16 }}>Choose a Charity</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {charities.map((charity) => {
          const isSelected = selectedCharity === charity.id;
          return (
            <div key={charity.id} className="glass-card"
              style={{ padding: 24, border: isSelected ? "2px solid var(--color-primary-500)" : "1px solid var(--color-border)", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => !saving && selectCharity(charity.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{ fontSize: "2.25rem" }}>✨</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", marginBottom: 4 }}>{charity.name}</h3>
                    <span className={`badge ${isSelected ? "badge-primary" : "badge-info"}`}>Verified</span>
                  </div>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{charity.description}</p>
                  {isSelected && (
                    <div style={{ marginTop: 12, color: "var(--color-primary-400)", fontWeight: 600, fontSize: "0.875rem" }}>✅ Currently Selected</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
