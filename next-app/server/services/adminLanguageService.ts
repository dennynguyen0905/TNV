import { slugify } from "@/lib/utils";
import * as languageRepo from "@/server/repositories/languageRepository";
import { toAdminLanguage, type AdminLanguage } from "@/server/mappers/languageMapper";

export async function getAllLanguagesForAdmin(): Promise<AdminLanguage[]> {
  const languages = await languageRepo.getAllLanguagesForAdmin();
  return languages.map(toAdminLanguage);
}

export async function createLanguage(input: {
  name: string;
  slug: string;
  code: string;
  description?: string;
  flagEmoji?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<AdminLanguage> {
  const slug = slugify(input.slug || input.name);
  const code = input.code.trim().toLowerCase();

  const clash = await languageRepo.findLanguageBySlugOrCode(slug, code);
  if (clash) {
    throw new Error(
      clash.slug === slug
        ? `A language with slug "${slug}" already exists`
        : `A language with code "${code}" already exists`
    );
  }

  const created = await languageRepo.createLanguage({
    name: input.name.trim(),
    slug,
    code,
    description: input.description?.trim() || undefined,
    flagEmoji: input.flagEmoji?.trim() || undefined,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  return toAdminLanguage(created);
}

export async function updateLanguage(input: {
  id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  flagEmoji?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<AdminLanguage> {
  const existing = await languageRepo.getLanguageById(input.id);
  if (!existing) throw new Error("Language not found");

  const slug = slugify(input.slug || input.name);
  const code = input.code.trim().toLowerCase();

  const clash = await languageRepo.findLanguageBySlugOrCode(slug, code);
  if (clash && clash.id !== input.id) {
    throw new Error(
      clash.slug === slug
        ? `A language with slug "${slug}" already exists`
        : `A language with code "${code}" already exists`
    );
  }

  const updated = await languageRepo.updateLanguage(input.id, {
    name: input.name.trim(),
    slug,
    code,
    description: input.description?.trim() || null,
    flagEmoji: input.flagEmoji?.trim() || null,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  return toAdminLanguage(updated);
}

export async function setLanguageActive(
  id: string,
  isActive: boolean
): Promise<AdminLanguage> {
  const existing = await languageRepo.getLanguageById(id);
  if (!existing) throw new Error("Language not found");
  const updated = await languageRepo.updateLanguage(id, { isActive });
  return toAdminLanguage(updated);
}
