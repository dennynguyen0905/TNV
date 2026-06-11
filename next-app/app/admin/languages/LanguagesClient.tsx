"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LanguageForm, type LanguageFormValues } from "@/components/admin/LanguageForm";
import type { AdminLanguage } from "@/server/mappers/languageMapper";
import {
  createLanguageAction,
  updateLanguageAction,
  toggleLanguageActiveAction,
} from "./actions";

interface LanguagesClientProps {
  initialLanguages: AdminLanguage[];
}

export function LanguagesClient({ initialLanguages }: LanguagesClientProps) {
  const router = useRouter();
  const [languages, setLanguages] = useState<AdminLanguage[]>(initialLanguages);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminLanguage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLanguages(initialLanguages);
  }, [initialLanguages]);

  const activeCount = languages.filter((l) => l.isActive).length;

  function openNew() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(language: AdminLanguage) {
    setEditing(language);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSubmit(values: LanguageFormValues) {
    setFormError(null);
    startTransition(async () => {
      const res = editing
        ? await updateLanguageAction({ id: editing.id, ...values })
        : await createLanguageAction(values);
      if (res.ok) {
        setFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  function handleToggleActive(language: AdminLanguage) {
    const next = !language.isActive;
    setLanguages((prev) =>
      prev.map((l) => (l.id === language.id ? { ...l, isActive: next } : l))
    );
    setError(null);
    startTransition(async () => {
      const res = await toggleLanguageActiveAction({ id: language.id, isActive: next });
      if (res.ok) {
        router.refresh();
      } else {
        setLanguages((prev) =>
          prev.map((l) => (l.id === language.id ? { ...l, isActive: !next } : l))
        );
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Languages</h1>
          <p className="text-sm text-n-500 mt-1">
            {activeCount} active · {languages.length - activeCount} inactive
          </p>
        </div>
        <Button onClick={openNew}>
          <Icon name="plus" size={16} />
          New Language
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">Language</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Code</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Lessons</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Order</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
              <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {languages.map((lang) => (
              <tr key={lang.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {lang.flagEmoji && <span className="text-lg">{lang.flagEmoji}</span>}
                    <span className="font-medium text-n-800">{lang.name}</span>
                    <span className="text-xs text-n-400">/{lang.slug}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-n-600 uppercase">{lang.code}</td>
                <td className="px-5 py-3 text-n-600">{lang.lessonCount}</td>
                <td className="px-5 py-3 text-n-400">{lang.sortOrder}</td>
                <td className="px-5 py-3">
                  <Badge color={lang.isActive ? "green" : "gray"}>
                    {lang.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(lang)}>
                      <Icon name="edit" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(lang)}
                      disabled={isPending}
                    >
                      {lang.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LanguageForm
        open={formOpen}
        initial={editing}
        pending={isPending}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
