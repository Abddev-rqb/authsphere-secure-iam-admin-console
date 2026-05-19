import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Users", path: "/users" },
  { label: "Roles", path: "/roles" },
  { label: "Permissions", path: "/permissions" },
  { label: "API Keys", path: "/api-keys" },
  { label: "Sessions", path: "/sessions" },
  { label: "Audit Logs", path: "/audit-logs" },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-200 bg-white px-5 py-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            AuthSphere
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            IAM Console
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <div>
            <p className="text-sm text-slate-500">Secure IAM Admin Console</p>
            <h2 className="text-lg font-semibold text-slate-950">
              Production-style access management workspace
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-950">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">
                {user?.is_superuser ? "Super Admin" : "IAM User"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="px-8 py-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
