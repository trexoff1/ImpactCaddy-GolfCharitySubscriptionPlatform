"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Draw {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  draw_date: string;
  status: "active" | "completed";
  winner_id: string | null;
}

interface Entry {
  draw_id: string;
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submittingDrawId, setSubmittingDrawId] = useState<string | null>(null);

  useEffect(() => {
    loadDraws();
  }, []);

  async function loadDraws() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    setUserId(userData.user.id);

    const { data: drawData } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false });

    const { data: entryData } = await supabase
      .from("draw_entries")
      .select("draw_id")
      .eq("user_id", userData.user.id);

    setDraws(drawData || []);
    setEntries(entryData || []);
    setLoading(false);
  }

  function isEntered(drawId: string) {
    return entries.some((e) => e.draw_id === drawId);
  }

  async function enterDraw(drawId: string) {
    if (!userId || isEntered(drawId)) return;
    setSubmittingDrawId(drawId);
    const supabase = createClient();
    const { error } = await supabase
      .from("draw_entries")
      .insert({ draw_id: drawId, user_id: userId });

    // Unique constraint conflicts can happen if the user double-clicks quickly.
    if (error && error.code !== "23505") {
      setSubmittingDrawId(null);
      return;
    }

    await loadDraws();
    setSubmittingDrawId(null);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const activeDraws = draws.filter((d) => d.status === "active");
  const pastDraws = draws.filter((d) => d.status === "completed");

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: 4, letterSpacing: "-0.04em" }}>Impact Draws</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 40, fontSize: "1.125rem" }}>
        Every draw entry is a step toward global good. Play more, win more, give more.
      </p>

      {/* Active draws */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 24 }}>
        ✨ Current Missions
      </h2>
      {activeDraws.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎰</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>
            No Active Draws
          </h3>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Check back soon — new draws are launched monthly!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, marginBottom: 40 }}>
          {activeDraws.map((draw) => (
            <div className="glass-card" key={draw.id} style={{ padding: 28, position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "var(--color-primary-600)",
                }}
              />
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>🏆</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 8 }}>
                {draw.title}
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: 16 }}>
                {draw.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="badge badge-success">{draw.prize_description}</span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                  Draw: {new Date(draw.draw_date).toLocaleDateString("en-GB")}
                </span>
              </div>
              {isEntered(draw.id) ? (
                <button className="btn btn-ghost" disabled style={{ width: "100%", justifyContent: "center" }}>
                  ✅ Entered
                </button>
              ) : (
                <button
                  className="btn btn-accent premium-glow"
                  onClick={() => enterDraw(draw.id)}
                  disabled={submittingDrawId === draw.id}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {submittingDrawId === draw.id ? "Entering..." : "Commit to Draw"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past draws */}
      {pastDraws.length > 0 && (
        <>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 16 }}>
            📜 Past Draws
          </h2>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Draw</th>
                  <th>Prize</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastDraws.map((draw) => (
                  <tr key={draw.id}>
                    <td style={{ fontWeight: 500 }}>{draw.title}</td>
                    <td>{draw.prize_description}</td>
                    <td>{new Date(draw.draw_date).toLocaleDateString("en-GB")}</td>
                    <td>
                      {draw.winner_id === userId ? (
                        <span className="badge badge-success">🎉 You won!</span>
                      ) : (
                        <span className="badge badge-info">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
}
