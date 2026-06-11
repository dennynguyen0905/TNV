"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelForm, type LevelFormValues } from "@/components/admin/LevelForm";
import type { AdminLevel } from "@/server/mappers/levelMapper";
import { createLevelAction, updateLevelAction } from "./actions";

interface LevelsClientProps {
  initialLevels: AdminLevel[];
}

export function LevelsClient({ initialLevels }: LevelsClientProps) {
  const router = useRouter();
  const [levels, setLevels] = useState<AdminLevel[]>(initialLevels);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminLevel | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLevels(initialLevels);
  }, [initialLevels]);

  function openNew() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(level: AdminLevel) {
    setEditing(level);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSubmit(values: LevelFormValues) {
    setFormError(null);
    startTransition(async () => {
      const res = editing
        ? await updateLevelAction({ id: editing.id, ...values })
        : await createLevelAction(values);
      if (res.ok) {
        setFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Levels</h1>
          <p className="text-sm text-n-500 mt-1">
            {levels.length} CEFR levels
          </p>
        </div>
        <Button onClick={openNew}>
          <Icon name="plus" size={16} />
          New Level
        </Button>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">Code</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Name</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Lessons</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Order</th>
              <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {levels.map((level) => (
              <tr key={level.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3">
                  <Badge color="blue">{level.code}</Badge>
                </td>
                <td className="px-5 py-3 font-medium text-n-800">{level.name}</td>
                <td className="px-5 py-3 text-n-600">{level.lessonCount}</td>
                <td className="px-5 py-3 text-n-400">{level.sortOrder}</td>
                <td className="px-5 py-3 text-right">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(level)}>
                    <Icon name="edit" size={14} />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LevelForm
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
