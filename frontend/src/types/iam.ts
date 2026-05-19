export interface Permission {
  id: number;
  name: string;
  codename: string;
  description: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface APIKey {
  id: number;
  name: string;
  key: string;
  user: number;
  username: string;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
}

export interface UserSession {
  id: number;
  user: number;
  username: string;
  ip_address: string | null;
  user_agent: string;
  is_active: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface AuditLog {
  id: number;
  actor: number | null;
  actor_username: string | null;
  action: string;
  resource: string;
  description: string;
  ip_address: string | null;
  created_at: string;
}
