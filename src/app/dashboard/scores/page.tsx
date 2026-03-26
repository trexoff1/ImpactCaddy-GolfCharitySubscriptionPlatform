"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

interface Score {
  id: string;
  course_name: string;
  date_played: string;
  stableford_points: number;
  gross_score: number | null;
  notes: string | null;
}

export default function ScoresPage() {
  const searchParams = useSearchParams();
  const showNew = searchParams.get("new") === "1";
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(showNew);
  const [saving, setSaving] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);

  // Form state
  const [course, setCourse] = useState("");
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split("T")[0]);
  const [stablefordPoints, setStablefordPoints] = useState("");
  const [grossScore, setGrossScore] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("date_played", { ascending: false })
      .order("created_at", { ascending: false });

    setScores(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    const parsedStableford = parseInt(stablefordPoints, 10);
    if (!Number.isInteger(parsedStableford) || parsedStableford < 1 || parsedStableford > 45) {
      alert("Stableford points must be between 1 and 45.");
      setSaving(false);
      return;
    }

    if (editingScoreId) {
      await supabase
        .from("scores")
        .update({
          course_name: course,
          date_played: playedAt,
          stableford_points: parsedStableford,
          gross_score: grossScore ? parseInt(grossScore, 10) : null,
          notes: notes || null,
        })
        .eq("id", editingScoreId)
        .eq("user_id", userData.user.id);
    } else {
      await supabase.from("scores").insert({
        user_id: userData.user.id,
        course_name: course,
        date_played: playedAt,
        stableford_points: parsedStableford,
        gross_score: grossScore ? parseInt(grossScore, 10) : null,
        notes: notes || null,
      });

      // Keep only the latest 5 rounds per PRD.
      const { data: existingScores } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", userData.user.id)
        .order("date_played", { ascending: false })
        .order("created_at", { ascending: false });

      const staleIds = (existingScores || []).slice(5).map((s) => s.id);
      if (staleIds.length > 0) {
        await supabase.from("scores").delete().in("id", staleIds);
      }
    }

    // Reset form
    setEditingScoreId(null);
    setCourse("");
    setStablefordPoints("");
    setGrossScore("");
    setNotes("");
    setShowForm(false);
    setSaving(false);
    loadScores();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this score?")) return;
    const supabase = createClient();
    await supabase.from("scores").delete().eq("id", id);
    loadScores();
  }

  function handleEdit(score: Score) {
    setEditingScoreId(score.id);
    setCourse(score.course_name);
    setPlayedAt(score.date_played);
    setStablefordPoints(String(score.stableford_points));
    setGrossScore(score.gross_score ? String(score.gross_score) : "");
    setNotes(score.notes || "");
    setShowForm(true);
  }

  function resetForm() {
    setEditingScoreId(null);
    setCourse("");
    setPlayedAt(new Date().toISOString().split("T")[0]);
    setStablefordPoints("");
    setGrossScore("");
    setNotes("");
    setShowForm(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: 4, letterSpacing: "-0.04em" }}>My Legacies</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>Track the rounds that fuel your impact.</p>
        </div>
        <button className="btn btn-accent premium-glow" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Close Mission" : "➕ Log Round"}
        </button>
      </div>

      {/* Log score form */}
      {showForm && (
        <div className="glass-card slide-up" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 20 }}>
            {editingScoreId ? "Edit Score" : "Log a New Score"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label className="input-label" htmlFor="course">Course Name</label>
              <input
                id="course"
                className="input-field"
                placeholder="e.g. St Andrews Old Course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="playedAt">Date Played</label>
              <input
                id="playedAt"
                type="date"
                className="input-field"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="stableford">Stableford Points</label>
              <input
                id="stableford"
                type="number"
                className="input-field"
                placeholder="36"
                min="1"
                max="45"
                value={stablefordPoints}
                onChange={(e) => setStablefordPoints(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="gross">Gross Score (optional)</label>
              <input
                id="gross"
                type="number"
                className="input-field"
                placeholder="72"
                min="50"
                max="200"
                value={grossScore}
                onChange={(e) => setGrossScore(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="input-label" htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                className="input-field"
                placeholder="Great round, hit the fairway on 18..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Saving…" : editingScoreId ? "Save Changes" : "Save Score"}
                </button>
                <button type="button" className="btn btn-ghost btn-lg" onClick={resetForm} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Scores list */}
      {scores.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⛳</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>
            No Scores Yet
          </h3>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>
            Log your first round to start tracking your performance.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Log Your First Score
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Stableford</th>
                <th>Gross</th>
                <th>Notes</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(score.date_played).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ fontWeight: 500 }}>{score.course_name}</td>
                  <td>
                    <span
                      className={`badge ${score.stableford_points >= 36 ? "badge-success" : "badge-info"}`}
                    >
                      {score.stableford_points} pts
                    </span>
                  </td>
                  <td>{score.gross_score || "—"}</td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {score.notes || "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => handleEdit(score)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-primary-400)",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          opacity: 0.8,
                        }}
                        aria-label="Edit score"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-danger-400)",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          opacity: 0.6,
                        }}
                        aria-label="Delete score"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Summary stats */}
      {scores.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
            marginTop: 28,
          }}
        >
          {[
            { label: "Total Rounds", value: scores.length },
            {
              label: "Average Stableford",
              value: Math.round(scores.reduce((s, r) => s + r.stableford_points, 0) / scores.length),
            },
            { label: "Best Score", value: Math.max(...scores.map((r) => r.stableford_points)) },
            { label: "Worst Score", value: Math.min(...scores.map((r) => r.stableford_points)) },
          ].map((stat) => (
            <div className="glass-card" key={stat.label} style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 6 }}>{stat.label}</div>
              <div className="stat-counter" style={{ fontSize: "1.75rem" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
