import type { UserRole, UserStatus } from "@prisma/client";
import * as userRepo from "@/server/repositories/userRepository";
import { toAdminUser, type AdminUser } from "@/server/mappers/userMapper";

export async function getAllUsersForAdmin(): Promise<AdminUser[]> {
  const users = await userRepo.getAllUsers();
  return users.map(toAdminUser);
}

export async function setUserRole(
  id: string,
  role: UserRole,
  currentAdminId: string
): Promise<AdminUser> {
  if (id === currentAdminId && role !== "ADMIN") {
    throw new Error("You cannot remove your own admin role");
  }
  const user = await userRepo.getUserById(id);
  if (!user) throw new Error("User not found");
  const updated = await userRepo.updateUserRole(id, role);
  return toAdminUser(updated);
}

export async function setUserPremium(
  id: string,
  isPremium: boolean
): Promise<AdminUser> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new Error("User not found");
  const updated = await userRepo.updateUserPremium(id, isPremium);
  return toAdminUser(updated);
}

export async function setUserStatus(
  id: string,
  status: UserStatus,
  currentAdminId: string
): Promise<AdminUser> {
  if (id === currentAdminId && status !== "ACTIVE") {
    throw new Error("You cannot deactivate your own account");
  }
  const user = await userRepo.getUserById(id);
  if (!user) throw new Error("User not found");
  const updated = await userRepo.updateUserStatus(id, status);
  return toAdminUser(updated);
}

export async function updateUserProfile(
  id: string,
  input: { name: string; email: string }
): Promise<AdminUser> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new Error("User not found");

  const email = input.email.trim().toLowerCase();
  const existing = await userRepo.findByEmail(email);
  if (existing && existing.id !== id) {
    throw new Error("Email already in use");
  }

  const updated = await userRepo.updateUserProfile(id, {
    name: input.name.trim(),
    email,
  });
  return toAdminUser(updated);
}
