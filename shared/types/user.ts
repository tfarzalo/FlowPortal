import { RoleValues } from '../config/roles';

export interface User {
  id: string;
  _id?: string; // For backward compatibility
  email: string;
  role: RoleValues;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  lastLoginAt?: string;
  last_login_at?: string;
  isActive?: boolean;
  is_active?: boolean;
  refreshToken?: string;
  refresh_token?: string;
}
