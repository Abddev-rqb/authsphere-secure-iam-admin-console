import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const DASHBOARD_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      totalUsers
      totalRoles
      totalPermissions
      totalApiKeys
      totalSessions
      totalAuditLogs
    }
  }
`;

interface DashboardSummaryData {
  dashboardSummary: {
    totalUsers: number;
    totalRoles: number;
    totalPermissions: number;
    totalApiKeys: number;
    totalSessions: number;
    totalAuditLogs: number;
  };
}

const metricLabels = [
  ["totalUsers", "Users"],
  ["totalRoles", "Roles"],
  ["totalPermissions", "Permissions"],
  ["totalApiKeys", "API Keys"],
  ["totalSessions", "Sessions"],
  ["totalAuditLogs", "Audit Logs"],
] as const;

export function DashboardPage() {
  const { data, loading, error, refetch } =
    useQuery<DashboardSummaryData>(DASHBOARD_QUERY);

  if (loading) {
    return <p className="text-slate-600">Loading dashboard metrics...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700">
        Failed to load dashboard metrics.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            IAM Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Centralized visibility into users, roles, permissions, API keys,
            sessions, and audit activity.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map(([key, label]) => (
          <div
            key={key}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-4 text-4xl font-bold text-slate-950">
              {data?.dashboardSummary[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Highlights
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            "JWT authentication with protected frontend routing",
            "Role-based access control and permission-aware UI foundation",
            "GraphQL dashboard summary powered by Django backend",
            "REST APIs for IAM resource management",
            "Audit logging for security-sensitive actions",
            "Docker-ready backend and PostgreSQL service",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
