import type { ReactNode } from "react";

interface TableShellProps {
  children: ReactNode;
}

export function TableShell({ children }: TableShellProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
