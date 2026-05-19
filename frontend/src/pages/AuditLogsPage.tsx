import { useEffect, useState } from "react";
import { http } from "../api/http";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { TableShell } from "../components/TableShell";
import type { AuditLog } from "../types/iam";
import { formatDateTime } from "../utils/date";

export function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAuditLogs() {
    try {
      const response = await http.get<AuditLog[]>("/api/audit/logs/");
      setAuditLogs(response.data);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Security Monitoring"
          title="Audit Logs"
          description="Track authentication, authorization, and IAM administration events."
        />

        <button
          onClick={fetchAuditLogs}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      {isLoading && <DataState type="loading" message="Loading audit logs..." />}
      {error && <DataState type="error" message={error} />}
      {!isLoading && !error && auditLogs.length === 0 && (
        <DataState type="empty" message="No audit logs found." />
      )}

      {!isLoading && !error && auditLogs.length > 0 && (
        <TableShell>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {log.actor_username || "System"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {log.resource}
                  </td>
                  <td className="max-w-md px-6 py-4 text-slate-600">
                    {log.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {log.ip_address || "—"}
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
