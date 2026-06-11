import type { User, UserRole, UserStatus } from "@prisma/client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isPremium: boolean;
  createdAt: string;
};

// Strips passwordHash and any sensitive fields — only safe data reaches the client.
export function toAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isPremium: user.isPremium,
    createdAt: user.createdAt.toISOString().split("T")[0],
  };
}
