"use client";

import { useState } from "react";

interface User {
  id: string;
  email: string;
  display_name: string;
  handicap: number | null;
  home_course: string | null;
  subscription_status: string;
  subscription_tier: string;
  charity_percentage: number;
  is_admin: boolean;
  created_at: string;
  charities?: { name: string };
}

interface Score {
  id: string;
  course_name: string;
  date_played: string;
  stableford_points: number;
}

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userScores, setUserScores] = useState<Score[]>([]);
  const [viewingScoresUser, setViewingScoresUser] = useState<User | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: editingUser.id,
        updates: {
          display_name: editingUser.display_name,
          handicap: editingUser.handicap,
          home_course: editingUser.home_course,
          subscription_tier: editingUser.subscription_tier,
          subscription_status: editingUser.subscription_status,
        },
      }),
    });

    if (res.ok) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    }
  }

  async function loadScores(user: User) {
    setViewingScoresUser(user);
    setLoadingScores(true);
    const res = await fetch(`/api/admin/scores?userId=${user.id}`);
    const data = await res.json();
    setUserScores(data.scores || []);
    setLoadingScores(false);
  }

  async function deleteScore(scoreId: string) {
    if (!confirm("Delete this score?")) return;
    const res = await fetch("/api/admin/scores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreId }),
    });
    if (res.ok) {
      setUserScores(userScores.filter((s) => s.id !== scoreId));
    }
  }

  return (
    <div>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr style={{ fontFamily: "var(--font-heading)" }}>
              <th>User</th>
              <th>Subscription</th>
              <th>Tier</th>
              <th>Handicap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.display_name || "Golfer"}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>{u.email}</div>
                </td>
                <td>
                  <span className={`badge ${(u.subscription_status === "active" || u.subscription_status === "trialing") ? "badge-success" : "badge-info"}`}>
                    {u.subscription_status || "None"}
                  </span>
                </td>
                <td style={{ textTransform: "capitalize", fontWeight: 500 }}>{u.subscription_tier || "None"}</td>
                <td>{u.handicap || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingUser(u)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => loadScores(u)}>History</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ padding: 48, width: "100%", maxWidth: 520, position: "relative" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 32, letterSpacing: "-0.04em" }}>Edit User Legacy</h2>
            <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label className="input-label" style={{ marginTop: 0 }}>Golfer Profile Name</label>
                <input className="input-field" value={editingUser.display_name} onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label className="input-label" style={{ marginTop: 0 }}>Handicap</label>
                  <input className="input-field" type="number" step="0.1" value={editingUser.handicap || ""} onChange={(e) => setEditingUser({ ...editingUser, handicap: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div>
                  <label className="input-label" style={{ marginTop: 0 }}>Home Course</label>
                  <input className="input-field" value={editingUser.home_course || ""} onChange={(e) => setEditingUser({ ...editingUser, home_course: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label className="input-label" style={{ marginTop: 0 }}>Membership Tier</label>
                  <select className="input-field" value={editingUser.subscription_tier} onChange={(e) => setEditingUser({ ...editingUser, subscription_tier: e.target.value })}>
                    <option value="birdie">Birdie</option>
                    <option value="eagle">Eagle</option>
                    <option value="albatross">Albatross</option>
                  </select>
                </div>
                <div>
                  <label className="input-label" style={{ marginTop: 0 }}>Impact Status</label>
                  <select className="input-field" value={editingUser.subscription_status} onChange={(e) => setEditingUser({ ...editingUser, subscription_status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                    <option value="trialing">Trialing</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <button type="submit" className="btn btn-accent premium-glow" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingScoresUser && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card slide-up" style={{ padding: 32, width: "100%", maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem" }}>Scores: {viewingScoresUser.display_name}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingScoresUser(null)}>✕</button>
            </div>
            {loadingScores ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="loading-spinner" /></div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Points</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userScores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontSize: "0.8125rem" }}>{new Date(s.date_played).toLocaleDateString("en-GB")}</td>
                        <td>{s.course_name}</td>
                        <td>{s.stableford_points}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => deleteScore(s.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                    {userScores.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 20 }}>No scores found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
