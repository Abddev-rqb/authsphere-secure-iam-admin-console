import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { TableShell } from "../components/TableShell";
import type { Permission, Role } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    permission_ids: [] as number[],
  });

  async function fetchRoles() {
    try {
      const response = await http.get<Role[]>("/api/iam/roles/");
      setRoles(response.data);
    } catch {
      setError("Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPermissions() {
    try {
      const response = await http.get<Permission[]>("/api/iam/permissions/");
      setPermissions(response.data);
    } catch {
      setActionMessage("Failed to load permissions for role form.");
    }
  }

  async function createRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    try {
      await http.post("/api/iam/roles/", form);
      setActionMessage("Role created successfully.");
      setForm({ name: "", description: "", permission_ids: [] });
      fetchRoles();
    } catch {
      setActionMessage("Failed to create role.");
    }
  }

  function togglePermission(permissionId: number) {
    const exists = form.permission_ids.includes(permissionId);

    setForm({
      ...form,
      permission_ids: exists
        ? form.permission_ids.filter((id) => id !== permissionId)
        : [...form.permission_ids, permissionId],
    });
  }

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="RBAC"
          title="Roles"
          description="Create and maintain access roles mapped to granular permission sets."
        />

        <button
          type="button"
          onClick={fetchRoles}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <form
        onSubmit={createRole}
        className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Create Role</h2>
            <p className="text-sm text-slate-500">
              Create a role and attach permissions to it.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Admin action
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Role name"
          />

          <input
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Description"
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Attach Permissions
          </p>

          <div className="grid max-h-64 gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={form.permission_ids.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                />
                {permission.codename}
              </label>
            ))}
          </div>
        </div>

        <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Create Role
        </button>
      </form>

      {actionMessage && (
        <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          {actionMessage}
        </div>
      )}

      {isLoading && <DataState type="loading" message="Loading roles..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && roles.length === 0 && (
        <DataState type="empty" message="No roles found." />
      )}

      {!isLoading && !error && roles.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Permissions</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {role.name}
                  </td>

                  <td className="max-w-md px-6 py-4 text-slate-600">
                    {role.description || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex max-w-md flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission.id}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {permission.codename}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(role.created_at)}
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
