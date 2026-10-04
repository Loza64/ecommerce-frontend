export const roles = {
  super_admin: 'SUPER_ADMIN',
  admin: 'ADMIN',
  user: 'USER',
  all: '*',
} as const

export type RoleName = (typeof roles)[keyof typeof roles]
