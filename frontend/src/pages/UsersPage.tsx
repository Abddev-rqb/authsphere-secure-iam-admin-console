import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { PermissionGuard } from "../components/PermissionGuard";
import { StatusBadge } from "../components/StatusBadge";
import { TableShell } from "../components/TableShell";
import type { Role, User } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_staff: false,
    role_id: "",
  });

  async function fetchUsers() {
    try {
      const response = await http.get<User[]>("/api/iam/users/");
      setUsers(response.data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const response = await http.get<Role[]>("/api/iam/roles/");
      setRoles(response.data);
    } catch {
      // Role dropdown is optional for the page to load.
    }
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    try {
      await http.post("/api/iam/users/", {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        is_staff: form.is_staff,
        role_ids: form.role_id ? [Number(form.role_id)] : [],
      });

      setActionMessage("User created successfully.");
      setForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        is_staff: false,
        role_id: "",
      });
      fetchUsers();
    } catch {
      setActionMessage("Failed to create user.");
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="User Management"
          title="Users"
          description="Manage platform users, staff access, account status, and assigned IAM roles."
        />

        <button
          type="button"
          onClick={fetchUsers}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <PermissionGuard permission="users.create">
        <form
          onSubmit={createUser}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Create User</h2>
              <p className="text-sm text-slate-500">
                Add a new IAM user and optionally assign a role.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Admin action
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              required
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Username"
            />
            <input
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Email"
            />
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Password"
            />
            <input
              value={form.first_name}
              onChange={(event) =>
                setForm({ ...form, first_name: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="First name"
            />
            <input
              value={form.last_name}
              onChange={(event) =>
                setForm({ ...form, last_name: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Last name"
            />
            <select
              value={form.role_id}
              onChange={(event) =>
                setForm({ ...form, role_id: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">No role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_staff}
              onChange={(event) =>
                setForm({ ...form, is_staff: event.target.checked })
              }
            />
            Staff access
          </label>

          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Create User
          </button>
        </form>
      </PermissionGuard>

      {actionMessage && (
        <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          {actionMessage}
        </div>
      )}

      {isLoading && <DataState type="loading" message="Loading users..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && users.length === 0 && (
        <DataState type="empty" message="No users found." />
      )}

      {!isLoading && !error && users.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Staff</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-950">
                      {user.first_name || user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email || "—"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      active={user.is_staff}
                      activeText="Staff"
                      inactiveText="Standard"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      active={user.is_active}
                      activeText="Active"
                      inactiveText="Disabled"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(user.date_joined)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}
