import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { PermissionGuard } from "../components/PermissionGuard";
import { StatusBadge } from "../components/StatusBadge";
import { TableShell } from "../components/TableShell";
import type { APIKey, User } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    user: "",
  });

  async function fetchApiKeys() {
    try {
      const response = await http.get<APIKey[]>("/api/iam/api-keys/");
      setApiKeys(response.data);
    } catch {
      setError("Failed to load API keys.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const response = await http.get<User[]>("/api/iam/users/");
      setUsers(response.data);
    } catch {
      // User dropdown is optional for page rendering.
    }
  }

  async function generateApiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    try {
      await http.post("/api/iam/api-keys/", {
        name: form.name,
        user: Number(form.user),
      });

      setActionMessage("API key generated successfully.");
      setForm({ name: "", user: "" });
      fetchApiKeys();
    } catch {
      setActionMessage("Failed to generate API key.");
    }
  }

  async function revokeApiKey(id: number) {
    setActionMessage("");

    try {
      await http.post(`/api/iam/api-keys/${id}/revoke/`);
      setActionMessage("API key revoked successfully.");
      fetchApiKeys();
    } catch {
      setActionMessage("Failed to revoke API key.");
    }
  }

  useEffect(() => {
    fetchApiKeys();
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Integration Security"
          title="API Keys"
          description="Generate, monitor, and revoke API keys used by integration clients."
        />

        <button
          type="button"
          onClick={fetchApiKeys}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <PermissionGuard permission="api_keys.manage">
        <form
          onSubmit={generateApiKey}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Generate API Key
              </h2>
              <p className="text-sm text-slate-500">
                Create a secure key for a selected user or integration owner.
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
              placeholder="API key name"
            />
            <select
              required
              value={form.user}
              onChange={(event) =>
                setForm({ ...form, user: event.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Select owner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Generate API Key
          </button>
        </form>
      </PermissionGuard>

      {actionMessage && (
        <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          {actionMessage}
        </div>
      )}

      {isLoading && <DataState type="loading" message="Loading API keys..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && apiKeys.length === 0 && (
        <DataState type="empty" message="No API keys found." />
      )}

      {!isLoading && !error && apiKeys.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Key Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Key Preview</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Revoked</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {apiKey.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {apiKey.username}
                  </td>
                  <td className="px-6 py-4">
                    <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {apiKey.key.slice(0, 12)}...{apiKey.key.slice(-6)}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      active={apiKey.is_active}
                      activeText="Active"
                      inactiveText="Revoked"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(apiKey.created_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(apiKey.revoked_at)}
                  </td>
                  <td className="px-6 py-4">
                    <PermissionGuard permission="api_keys.manage">
                      <button
                        disabled={!apiKey.is_active}
                        onClick={() => revokeApiKey(apiKey.id)}
                        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Revoke
                      </button>
                    </PermissionGuard>
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
