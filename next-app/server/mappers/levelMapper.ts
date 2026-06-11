import type { Level } from "@prisma/client";

type PrismaLevelWithCount = Level & {
  _count?: { lessons: number };
};

export type AdminLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  lessonCount: number;
};

export function toAdminLevel(level: PrismaLevelWithCount): AdminLevel {
  return {
    id: level.id,
    code: level.code,
    name: level.name,
    sortOrder: level.sortOrder,
    lessonCount: level._count?.lessons ?? 0,
  };
}
