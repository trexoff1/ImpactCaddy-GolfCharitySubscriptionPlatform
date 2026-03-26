"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type PaymentState = "pending" | "paid" | "rejected";

interface WinningRow {
  id: string;
  draw_id: string;
  match_tier: 3 | 4 | 5;
  prize_amount: number;
  payment_status: PaymentState;
  proof_image_url: string | null;
  paid_at: string | null;
  created_at: string;
  draws: { title: string; draw_date: string } | null;
}

export default function WinningsPage() {
  const [rows, setRows] = useState<WinningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofInput, setProofInput] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/winnings");
    const payload = (await response.json()) as { winnings?: WinningRow[] };
    setRows(payload.winnings || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitProof(id: string) {
    const url = proofInput[id]?.trim();
    if (!url) return;

    setSavingId(id);
    await fetch("/api/winnings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, proofUrl: url }),
    });
    await load();
    setSavingId(null);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const totalWon = rows.filter((r) => r.payment_status === "paid").reduce((sum, row) => sum + Number(row.prize_amount || 0), 0);

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 8 }}>My Winnings</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Track winner verification and payment status.
      </p>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Total Paid</div>
        <div className="stat-counter" style={{ fontSize: "2rem", color: "var(--color-success-400)" }}>{formatCurrency(totalWon)}</div>
      </div>

      {rows.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>No winning records yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((row) => (
            <div key={row.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", marginBottom: 4 }}>
                    {row.draws?.title || "Draw"} · {row.match_tier}-match
                  </h2>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                    {row.draws?.draw_date ? new Date(row.draws.draw_date).toLocaleDateString("en-GB") : ""}
                  </p>
                </div>
                <div>
                  <span className={`badge ${row.payment_status === "paid" ? "badge-success" : row.payment_status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                    {row.payment_status}
                  </span>
                </div>
              </div>

              <p style={{ marginTop: 10, marginBottom: 10 }}>Prize: <strong>{formatCurrency(row.prize_amount)}</strong></p>

              {row.proof_image_url ? (
                <p style={{ fontSize: "0.85rem" }}>
                  Proof: <a href={row.proof_image_url} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary-400)", textDecoration: "none" }}>View submission</a>
                </p>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    className="input-field"
                    placeholder="Paste proof screenshot URL"
                    value={proofInput[row.id] || ""}
                    onChange={(e) => setProofInput((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  />
                  <button className="btn btn-primary" onClick={() => submitProof(row.id)} disabled={savingId === row.id}>
                    {savingId === row.id ? "Submitting..." : "Submit Proof"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
