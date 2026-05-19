import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { PermissionCode } from "../types/auth";

interface PermissionGuardProps {
  permission: PermissionCode;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
