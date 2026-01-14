export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user'
} as const;

export const ALL_ROLES: RoleValues[] = Object.values(ROLES);

export type RoleValues = typeof ROLES[keyof typeof ROLES];
