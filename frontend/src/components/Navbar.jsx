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

  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <aside className="w-60 shrink-0 border-r border-line flex flex-col">
        <div className="px-5 py-6 border-b border-line">
          <span className="font-display text-3xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-4 text-xs uppercase tracking-widest text-mute mb-2">Train</p>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses}>
              {item.label}
            </NavLink>
          ))}

          {role === "admin" && (
            <>
              <p className="px-4 text-xs uppercase tracking-widest text-mute mt-6 mb-2">Admin</p>
              {ADMIN_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClasses}>
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
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
