import { prisma } from "@/lib/prisma";
import type { UserRole, UserStatus } from "@prisma/client";

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attempts: true, progress: true } } },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getRecentUsers(limit: number) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUsers() {
  return prisma.user.count();
}

export async function countPremiumUsers() {
  return prisma.user.count({ where: { isPremium: true } });
}

export async function updateUserRole(id: string, role: UserRole) {
  return prisma.user.update({ where: { id }, data: { role } });
}

export async function updateUserPremium(id: string, isPremium: boolean) {
  return prisma.user.update({ where: { id }, data: { isPremium } });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  return prisma.user.update({ where: { id }, data: { status } });
}

export async function updateUserProfile(
  id: string,
  data: { name: string; email: string }
) {
  return prisma.user.update({ where: { id }, data });
}
