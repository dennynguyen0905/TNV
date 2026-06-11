import type { User, UserRole, UserStatus } from "@prisma/client";

type UserWithCounts = User & {
  _count?: { attempts: number; progress: number };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isPremium: boolean;
  createdAt: string;
  attemptCount: number;
  progressCount: number;
};

// Strips passwordHash and any sensitive fields — only safe data reaches the client.
export function toAdminUser(user: UserWithCounts): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isPremium: user.isPremium,
    createdAt: user.createdAt.toISOString().split("T")[0],
    attemptCount: user._count?.attempts ?? 0,
    progressCount: user._count?.progress ?? 0,
  };
}
