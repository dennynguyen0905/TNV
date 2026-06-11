import type { User } from "@prisma/client";

/**
 * Premium access rules (placeholder — no real payment; see lib/config.ts
 * PAYMENT_ENABLED=false).
 *
 *  - Free lessons are accessible to everyone (including anonymous visitors).
 *  - Premium lessons are accessible to ADMINs and users with isPremium=true.
 *  - Anonymous and non-premium users see a locked/preview state.
 *
 * NOTE: This only governs *premium* access. Whether a lesson is publicly
 * visible at all (PUBLISHED vs DRAFT/REVIEW/ARCHIVED) is enforced separately in
 * the repository/query layer.
 */
export type AccessUser = Pick<User, "role" | "isPremium"> | null | undefined;
export type AccessLesson = { isPremium: boolean };

export function canAccessLesson(user: AccessUser, lesson: AccessLesson): boolean {
  if (!lesson.isPremium) return true;
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return user.isPremium === true;
}
