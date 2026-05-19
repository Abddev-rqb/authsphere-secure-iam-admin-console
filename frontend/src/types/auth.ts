export type PermissionCode =
  | "users.view"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "roles.view"
  | "roles.create"
  | "roles.update"
  | "roles.delete"
  | "permissions.view"
  | "api_keys.manage"
  | "sessions.view"
  | "sessions.revoke"
  | "audit_logs.view";

export interface AuthRole {
  id: number;
  name: string;
  permissions: PermissionCode[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  roles: AuthRole[];
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}
