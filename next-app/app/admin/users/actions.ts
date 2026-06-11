"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  userRoleUpdateSchema,
  userPremiumUpdateSchema,
  userStatusUpdateSchema,
  userProfileUpdateSchema,
} from "@/lib/validators";
import * as adminUserService from "@/server/services/adminUserService";
import { recordAudit, AUDIT_ACTIONS } from "@/server/services/auditService";
import type { User } from "@prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdminUser(): Promise<
  { ok: true; user: User } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return { ok: true, user };
}

export async function updateUserRoleAction(input: {
  id: string;
  role: string;
}): Promise<ActionResult> {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth;

  const parsed = userRoleUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    const updated = await adminUserService.setUserRole(parsed.data.id, parsed.data.role, auth.user.id);
    await recordAudit({
      actor: auth.user,
      action: AUDIT_ACTIONS.UPDATE_USER_ROLE,
      entityType: "User",
      entityId: parsed.data.id,
      summary: `Set ${updated.email} role to ${parsed.data.role}`,
      metadata: { role: parsed.data.role },
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update role" };
  }
}

export async function toggleUserPremiumAction(input: {
  id: string;
  isPremium: boolean;
}): Promise<ActionResult> {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth;

  const parsed = userPremiumUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    const updated = await adminUserService.setUserPremium(parsed.data.id, parsed.data.isPremium);
    await recordAudit({
      actor: auth.user,
      action: AUDIT_ACTIONS.UPDATE_USER_PREMIUM,
      entityType: "User",
      entityId: parsed.data.id,
      summary: `${parsed.data.isPremium ? "Granted" : "Revoked"} premium for ${updated.email}`,
      metadata: { isPremium: parsed.data.isPremium },
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update premium" };
  }
}

export async function updateUserStatusAction(input: {
  id: string;
  status: string;
}): Promise<ActionResult> {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth;

  const parsed = userStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminUserService.setUserStatus(parsed.data.id, parsed.data.status, auth.user.id);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

export async function updateUserProfileAction(input: {
  id: string;
  name: string;
  email: string;
}): Promise<ActionResult> {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth;

  const parsed = userProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminUserService.updateUserProfile(parsed.data.id, {
      name: parsed.data.name,
      email: parsed.data.email,
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}
