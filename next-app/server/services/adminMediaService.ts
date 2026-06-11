import type { MediaType } from "@prisma/client";
import * as mediaRepo from "@/server/repositories/mediaRepository";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import { toAdminMedia, type AdminMedia } from "@/server/mappers/mediaMapper";

/**
 * Media admin is metadata-only (placeholder): we record url/path, filename,
 * type and an optional lesson association. No real file storage / upload /
 * audio processing happens here.
 */

export async function getAllMediaForAdmin(): Promise<AdminMedia[]> {
  const media = await mediaRepo.getAllMedia();
  return media.map(toAdminMedia);
}

type MediaInput = {
  type: MediaType;
  url: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string;
  lessonId?: string;
};

async function assertLessonExists(lessonId?: string) {
  if (!lessonId) return;
  const lesson = await lessonRepo.getLessonAccessInfo(lessonId);
  if (!lesson) throw new Error("Selected lesson does not exist");
}

export async function createMedia(input: MediaInput): Promise<AdminMedia> {
  await assertLessonExists(input.lessonId);
  const created = await mediaRepo.createMedia({
    type: input.type,
    url: input.url.trim(),
    filename: input.filename.trim(),
    mimeType: input.mimeType?.trim() || null,
    sizeBytes: input.sizeBytes ?? null,
    altText: input.altText?.trim() || null,
    lessonId: input.lessonId || null,
  });
  const withLesson = await mediaRepo.getAllMedia();
  return toAdminMedia(withLesson.find((m) => m.id === created.id) ?? { ...created, lesson: null });
}

export async function updateMedia(input: MediaInput & { id: string }): Promise<AdminMedia> {
  const existing = await mediaRepo.getMediaById(input.id);
  if (!existing) throw new Error("Media not found");
  await assertLessonExists(input.lessonId);
  await mediaRepo.updateMedia(input.id, {
    type: input.type,
    url: input.url.trim(),
    filename: input.filename.trim(),
    mimeType: input.mimeType?.trim() || null,
    sizeBytes: input.sizeBytes ?? null,
    altText: input.altText?.trim() || null,
    lessonId: input.lessonId || null,
  });
  const withLesson = await mediaRepo.getAllMedia();
  const found = withLesson.find((m) => m.id === input.id);
  if (!found) throw new Error("Media not found");
  return toAdminMedia(found);
}

export async function deleteMedia(id: string): Promise<void> {
  const existing = await mediaRepo.getMediaById(id);
  if (!existing) throw new Error("Media not found");
  await mediaRepo.deleteMedia(id);
}
