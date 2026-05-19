import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { PermissionGuard } from "../components/PermissionGuard";
import { TableShell } from "../components/TableShell";
import type { Permission } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    codename: "",
    description: "",
  });

  async function fetchPermissions() {
    try {
      const response = await http.get<Permission[]>("/api/iam/permissions/");
      setPermissions(response.data);
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createPermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    try {
      await http.post("/api/iam/permissions/", form);
      setActionMessage("Permission created successfully.");
      setForm({ name: "", codename: "", description: "" });
      fetchPermissions();
    } catch {
      setActionMessage("Failed to create permission.");
    }
  }

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Authorization"
          title="Permissions"
          description="Review granular permission codes used for permission-based access control."
        />

        <button
          type="button"
          onClick={fetchPermissions}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <PermissionGuard permission="permissions.view">
        <form
          onSubmit={createPermission}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Create Permission
              </h2>
              <p className="text-sm text-slate-500">
                Add a new permission code for RBAC policies.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Admin action
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Permission name"
            />
            <input
              required
              value={form.codename}
              onChange={(event) =>
                setForm({ ...form, codename: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="permission.code"
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

          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Create Permission
          </button>
        </form>
      </PermissionGuard>

      {actionMessage && (
        <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          {actionMessage}
        </div>
      )}

      {isLoading && <DataState type="loading" message="Loading permissions..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && permissions.length === 0 && (
        <DataState type="empty" message="No permissions found." />
      )}

      {!isLoading && !error && permissions.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Permission</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {permission.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {permission.codename}
                    </span>
                  </td>
                  <td className="max-w-md px-6 py-4 text-slate-600">
                    {permission.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(permission.created_at)}
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
