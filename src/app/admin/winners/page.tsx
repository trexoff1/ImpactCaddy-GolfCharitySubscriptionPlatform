"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type PaymentState = "pending" | "paid" | "rejected";

interface WinnerRow {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: 3 | 4 | 5;
  prize_amount: number;
  payment_status: PaymentState;
  proof_image_url: string | null;
  paid_at: string | null;
  created_at: string;
  draws: { title: string; draw_date: string } | null;
  profiles: { display_name: string; email: string } | null;
}

export default function AdminWinnersPage() {
  const [rows, setRows] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadRows() {
    const response = await fetch("/api/admin/winners");
    const payload = (await response.json()) as { winners?: WinnerRow[] };
    setRows(payload.winners || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function setState(id: string, paymentStatus: PaymentState) {
    setUpdatingId(id);
    await fetch("/api/admin/winners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paymentStatus }),
    });
    await loadRows();
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", marginBottom: 8 }}>Winner Verification</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>
        Review claims and move payment state from pending to paid.
      </p>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr style={{ fontFamily: "var(--font-heading)" }}>
              <th>Mission Draw</th>
              <th>Impact Winner</th>
              <th>Tier</th>
              <th>Prize</th>
              <th>Proof</th>
              <th>Impact Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.draws?.title || row.draw_id}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                    {row.draws?.draw_date ? new Date(row.draws.draw_date).toLocaleDateString("en-GB") : ""}
                  </div>
                </td>
                <td>
                  <div>{row.profiles?.display_name || "Unknown"}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{row.profiles?.email || row.user_id}</div>
                </td>
                <td><span className="badge badge-info">{row.match_tier}-match</span></td>
                <td>{formatCurrency(row.prize_amount)}</td>
                <td>
                  {row.proof_image_url ? (
                    <a href={row.proof_image_url} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary-400)", textDecoration: "none" }}>
                      View proof
                    </a>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>Not submitted</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${row.payment_status === "paid" ? "badge-success" : row.payment_status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                    {row.payment_status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={updatingId === row.id}
                      onClick={() => setState(row.id, "pending")}
                    >
                      Pending
                    </button>
                    <button
                      className="btn btn-sm btn-accent"
                      disabled={updatingId === row.id}
                      onClick={() => setState(row.id, "paid")}
                    >
                      Paid
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={updatingId === row.id}
                      onClick={() => setState(row.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
