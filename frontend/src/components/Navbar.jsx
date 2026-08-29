import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/exercises", label: "Exercise library" },
  { to: "/advisor", label: "Workout advisor" },
  { to: "/chat", label: "Diet chat" },
];

const ADMIN_ITEMS = [
  { to: "/admin/insights", label: "Insights" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/exercises", label: "Manage exercises" },
];

function linkClasses({ isActive }) {
  return [
    "block px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
    isActive
      ? "bg-volt text-ink"
      : "text-mute hover:text-bone hover:bg-panel2",
  ].join(" ");
}

export default function Navbar() {
  const { role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-ink text-bone md:flex">
      {/* Mobile top bar — only visible below md */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-ink z-30">
        <span className="font-display text-2xl tracking-wide text-volt">
          FIT<span className="text-bone">TRACK</span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-bone"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Backdrop, mobile only, shown when drawer is open */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on desktop, sliding drawer on mobile */}
      <aside
        className={[
          "w-64 shrink-0 border-r border-line flex flex-col bg-ink",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="px-5 py-6 border-b border-line flex items-center justify-between">
          <span className="font-display text-3xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <button onClick={closeMobile} aria-label="Close menu" className="md:hidden p-1 text-mute">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs uppercase tracking-widest text-mute mb-2">Train</p>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses} onClick={closeMobile}>
              {item.label}
            </NavLink>
          ))}

          {role === "admin" && (
            <>
              <p className="px-4 text-xs uppercase tracking-widest text-mute mt-6 mb-2">Admin</p>
              {ADMIN_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClasses} onClick={closeMobile}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-line">
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 text-sm font-medium text-mute hover:text-ember hover:bg-panel2 rounded-md transition-colors text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
