import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { PermissionGuard } from "../components/PermissionGuard";
import { StatusBadge } from "../components/StatusBadge";
import { TableShell } from "../components/TableShell";
import type { UserSession } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function SessionsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function fetchSessions() {
    try {
      const response = await http.get<UserSession[]>("/api/iam/sessions/");
      setSessions(response.data);
    } catch {
      setError("Failed to load sessions.");
    } finally {
      setIsLoading(false);
    }
  }

  async function revokeSession(id: number) {
    setActionMessage("");

    try {
      await http.post(`/api/iam/sessions/${id}/revoke/`);
      setActionMessage("Session revoked successfully.");
      fetchSessions();
    } catch {
      setActionMessage("Failed to revoke session.");
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Session Security"
          title="Sessions"
          description="Monitor active user sessions and revoke suspicious access."
        />

        <button
          onClick={fetchSessions}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {actionMessage && (
        <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          {actionMessage}
        </div>
      )}

      {isLoading && <DataState type="loading" message="Loading sessions..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && sessions.length === 0 && (
        <DataState type="empty" message="No sessions found." />
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">User Agent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Last Seen</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {session.username}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {session.ip_address || "—"}
                  </td>
                  <td className="max-w-sm truncate px-6 py-4 text-slate-600">
                    {session.user_agent || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      active={session.is_active}
                      activeText="Active"
                      inactiveText="Revoked"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(session.created_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(session.last_seen_at)}
                  </td>
                  <td className="px-6 py-4">
                    <PermissionGuard permission="sessions.revoke">
                      <button
                        disabled={!session.is_active}
                        onClick={() => revokeSession(session.id)}
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
