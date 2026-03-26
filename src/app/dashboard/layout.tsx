"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Impact Hub", icon: "📊" },
  { href: "/dashboard/scores", label: "My Legacies", icon: "⛳" },
  { href: "/dashboard/draws", label: "Missions", icon: "🎯" },
  { href: "/dashboard/leaderboard", label: "Impact Board", icon: "🏆" },
  { href: "/dashboard/winnings", label: "My Rewards", icon: "💸" },
  { href: "/dashboard/charity", label: "My Missions", icon: "❤️" },
  { href: "/dashboard/profile", label: "Identity", icon: "👤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; display_name?: string; is_admin?: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          display_name: data.user.user_metadata?.display_name || data.user.email?.split("@")[0],
          is_admin: false,
        });

        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser((prev) => (prev ? { ...prev, is_admin: Boolean(profile?.is_admin) } : prev));
          });
      }
    });
  }, []);

  const navItems = user?.is_admin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : NAV_ITEMS;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 199,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 72 : 260,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease",
          background: "rgba(10,10,10,0.95)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 200,
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "20px 12px" : "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "var(--color-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span style={{ color: "var(--color-impact-400)" }}>✨</span> ImpactCaddy
            </div>
          )}
          {collapsed && <span style={{ fontSize: "1.5rem", color: "var(--color-impact-400)" }}>✨</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.25rem",
              display: collapsed ? "none" : "block",
            }}
          >
            ◀
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "12px 0" : "10px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "var(--radius-md)",
                  color: active ? "var(--color-impact-300)" : "var(--color-text-secondary)",
                  background: active ? "rgba(14,165,233,0.1)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.2s",
                  borderLeft: active ? "3px solid var(--color-impact-400)" : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info / Sign out */}
        <div
          style={{
            padding: collapsed ? "16px 8px" : "16px 20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {!collapsed && user && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{user.display_name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(148,163,184,0.12)",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "0.8125rem",
              transition: "all 0.2s",
            }}
          >
            {collapsed ? "🚪" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: collapsed ? 72 : 260,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        {/* Top bar (mobile) */}
        <div
          style={{
            padding: "16px 24px",
            display: "none",
            alignItems: "center",
            borderBottom: "1px solid var(--color-border)",
          }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-primary)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>

        <div style={{ padding: "32px 32px 48px", maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%) !important;
          }
          .sidebar[style*="translateX(0)"] {
            transform: translateX(0) !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
