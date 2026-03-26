"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  website_url: string | null;
  is_active: boolean;
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Charity | null>(null);

  async function loadCharities() {
    const supabase = createClient();
    const { data } = await supabase.from("charities").select("*").order("name");
    setCharities(data || []);
    setLoading(false);
  }

  useEffect(() => { loadCharities(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    
    const supabase = createClient();
    if (editing.id === "new") {
      await supabase.from("charities").insert({
        name: editing.name,
        description: editing.description,
        website_url: editing.website_url || null,
        is_active: editing.is_active
      });
    } else {
      await supabase.from("charities").update({
        name: editing.name,
        description: editing.description,
        website_url: editing.website_url || null,
        is_active: editing.is_active
      }).eq("id", editing.id);
    }
    
    setEditing(null);
    loadCharities();
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", marginBottom: 8, letterSpacing: "-0.04em" }}>Mission Partners</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>Curate the charitable missions that golfers fund through their rounds.</p>
        </div>
        <button className="btn btn-accent premium-glow" onClick={() => setEditing({ id: "new", name: "", description: "", website_url: "", is_active: true })}>
          ➕ Create New Mission
        </button>
      </div>

      {editing && (
        <div className="glass-card slide-up" style={{ padding: 28, marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 20 }}>
            {editing.id === "new" ? "New Charity Partner" : "Edit Charity Partner"}
          </h2>
          <form onSubmit={handleSave} style={{ display: "grid", gap: 20 }}>
            <div>
              <label className="input-label">Charity Name</label>
              <input className="input-field" value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} required />
            </div>
            <div>
              <label className="input-label">Description (Keep it brief and impactful)</label>
              <input className="input-field" value={editing.description} onChange={(e) => setEditing({...editing, description: e.target.value})} required />
            </div>
            <div>
              <label className="input-label">Website URL (Optional)</label>
              <input className="input-field" type="url" value={editing.website_url || ""} onChange={(e) => setEditing({...editing, website_url: e.target.value})} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <input type="checkbox" id="active" checked={editing.is_active} onChange={(e) => setEditing({...editing, is_active: e.target.checked})} style={{ width: 18, height: 18 }} />
              <label htmlFor="active" style={{ color: "var(--color-text-primary)", fontSize: "0.9375rem", cursor: "pointer" }}>Listed and Active for all new signups</label>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary btn-lg">Save Changes</button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr style={{ fontFamily: "var(--font-heading)" }}>
              <th>Impact Status</th>
              <th>Mission Name</th>
              <th>Legacy Profile</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className={`badge ${c.is_active ? "badge-success" : "badge-info"}`}>
                    {c.is_active ? "Active" : "Archived"}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "1.0625rem" }}>{c.name}</div>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: "0.8125rem", color: "var(--color-impact-400)", textDecoration: "none", marginTop: 4, fontWeight: 500 }}>
                      {new URL(c.website_url).hostname} ↗
                    </a>
                  )}
                </td>
                <td style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", maxWidth: 400, lineHeight: 1.6 }}>{c.description}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>Refine</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
