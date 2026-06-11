import type { Media, MediaType } from "@prisma/client";

type PrismaMediaWithLesson = Media & {
  lesson?: { id: string; title: string } | null;
};

export type AdminMedia = {
  id: string;
  type: MediaType;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number | null;
  altText: string;
  lessonId: string | null;
  lessonTitle: string | null;
  createdAt: string;
};

export function toAdminMedia(media: PrismaMediaWithLesson): AdminMedia {
  return {
    id: media.id,
    type: media.type,
    url: media.url,
    filename: media.filename,
    mimeType: media.mimeType ?? "",
    sizeBytes: media.sizeBytes ?? null,
    altText: media.altText ?? "",
    lessonId: media.lessonId ?? null,
    lessonTitle: media.lesson?.title ?? null,
    createdAt: media.createdAt.toISOString().split("T")[0],
  };
}
