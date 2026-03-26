"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";

type DrawMode = "random" | "algorithmic";

interface DrawItem {
  id: string;
  title: string;
  draw_date: string;
  status: "active" | "completed" | "canceled";
  total_pool: number;
}

interface SimulationResponse {
  participants: number;
  winningNumbers: number[];
  winnerCounts: { 3: number; 4: number; 5: number };
  payoutPreview: {
    fiveMatchEach: number;
    fourMatchEach: number;
    threeMatchEach: number;
    jackpotCarryover: boolean;
  };
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<DrawItem[]>([]);
  const [drawId, setDrawId] = useState("");
  const [mode, setMode] = useState<DrawMode>("random");
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDraws() {
      const supabase = createClient();
      const { data } = await supabase
        .from("draws")
        .select("id, title, draw_date, status, total_pool")
        .order("draw_date", { ascending: false });

      const rows = (data || []) as DrawItem[];
      setDraws(rows);
      const firstActive = rows.find((d) => d.status === "active");
      if (firstActive) setDrawId(firstActive.id);
      setLoading(false);
    }

    loadDraws();
  }, []);

  const selectedDraw = useMemo(() => draws.find((d) => d.id === drawId), [draws, drawId]);

  async function runSimulation() {
    if (!drawId) return;
    setMessage("");
    setSimulating(true);

    const response = await fetch("/api/admin/draws/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, mode }),
    });

    const payload = (await response.json()) as SimulationResponse & { error?: string };
    if (!response.ok) {
      setMessage(payload.error || "Simulation failed");
      setSimulating(false);
      return;
    }

    setSimulation(payload);
    setSimulating(false);
  }

  async function publishResults() {
    if (!drawId) return;
    setMessage("");
    setPublishing(true);

    const response = await fetch("/api/admin/draws/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, mode, winningNumbers: simulation?.winningNumbers }),
    });

    const payload = (await response.json()) as { error?: string; winnerCounts?: { five: number; four: number; three: number } };
    if (!response.ok) {
      setMessage(payload.error || "Publish failed");
      setPublishing(false);
      return;
    }

    setMessage("Results published successfully.");
    setPublishing(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", marginBottom: 8 }}>
        Draw Simulation & Publish
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Simulate draw outcomes before publishing official monthly results.
      </p>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
          <div>
            <label className="input-label" htmlFor="drawId">Draw</label>
            <select id="drawId" className="input-field" value={drawId} onChange={(e) => setDrawId(e.target.value)}>
              <option value="">Select draw...</option>
              {draws.map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.title} · {new Date(draw.draw_date).toLocaleDateString("en-GB")} · {draw.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="mode">Mode</label>
            <select id="mode" className="input-field" value={mode} onChange={(e) => setMode(e.target.value as DrawMode)}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>

          <button className="btn btn-primary" type="button" onClick={runSimulation} disabled={!drawId || simulating}>
            {simulating ? "Simulating..." : "Test Mission"}
          </button>

          <button
            className="btn btn-accent premium-glow"
            type="button"
            onClick={publishResults}
            disabled={!drawId || !simulation || publishing || selectedDraw?.status !== "active"}
          >
            {publishing ? "Finalizing..." : "Publish Results"}
          </button>
        </div>
      </div>

      {simulation && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 16 }}>Test Mission Result</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Participants: {simulation.participants}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {simulation.winningNumbers.map((n) => (
              <span key={n} className="badge badge-primary" style={{ fontSize: "0.95rem" }}>
                {n}
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>5-Match Winners</div>
              <div className="stat-counter">{simulation.winnerCounts[5]}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Each: {formatCurrency(simulation.payoutPreview.fiveMatchEach)}</div>
            </div>
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>4-Match Winners</div>
              <div className="stat-counter">{simulation.winnerCounts[4]}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Each: {formatCurrency(simulation.payoutPreview.fourMatchEach)}</div>
            </div>
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>3-Match Winners</div>
              <div className="stat-counter">{simulation.winnerCounts[3]}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Each: {formatCurrency(simulation.payoutPreview.threeMatchEach)}</div>
            </div>
          </div>

          {simulation.payoutPreview.jackpotCarryover && (
            <p style={{ marginTop: 12, color: "var(--color-warning-400)", fontSize: "0.85rem" }}>
              No 5-match winner detected. Jackpot carryover applies.
            </p>
          )}
        </div>
      )}

      {message && (
        <p style={{ marginTop: 14, color: message.includes("success") ? "var(--color-success-400)" : "var(--color-danger-400)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
