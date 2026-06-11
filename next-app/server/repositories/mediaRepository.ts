import { prisma } from "@/lib/prisma";
import type { MediaType } from "@prisma/client";

export async function getAllMedia() {
  return prisma.media.findMany({
    include: { lesson: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMediaById(id: string) {
  return prisma.media.findUnique({ where: { id } });
}

export async function createMedia(data: {
  type: MediaType;
  url: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  altText?: string | null;
  lessonId?: string | null;
}) {
  return prisma.media.create({ data });
}

export async function updateMedia(
  id: string,
  data: Partial<{
    type: MediaType;
    url: string;
    filename: string;
    mimeType: string | null;
    sizeBytes: number | null;
    altText: string | null;
    lessonId: string | null;
  }>
) {
  return prisma.media.update({ where: { id }, data });
}

export async function deleteMedia(id: string) {
  return prisma.media.delete({ where: { id } });
}

export async function countMedia() {
  return prisma.media.count();
}
