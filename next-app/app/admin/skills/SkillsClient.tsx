"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SkillForm, type SkillFormValues } from "@/components/admin/SkillForm";
import type { AdminSkill } from "@/server/mappers/skillMapper";
import {
  createSkillAction,
  updateSkillAction,
  toggleSkillActiveAction,
} from "./actions";

interface SkillsClientProps {
  initialSkills: AdminSkill[];
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<AdminSkill[]>(initialSkills);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSkill | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const activeCount = skills.filter((s) => s.isActive).length;

  function openNew() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(skill: AdminSkill) {
    setEditing(skill);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSubmit(values: SkillFormValues) {
    setFormError(null);
    startTransition(async () => {
      const res = editing
        ? await updateSkillAction({ id: editing.id, ...values })
        : await createSkillAction(values);
      if (res.ok) {
        setFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  function handleToggleActive(skill: AdminSkill) {
    const next = !skill.isActive;
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, isActive: next } : s))
    );
    setError(null);
    startTransition(async () => {
      const res = await toggleSkillActiveAction({ id: skill.id, isActive: next });
      if (res.ok) {
        router.refresh();
      } else {
        setSkills((prev) =>
          prev.map((s) => (s.id === skill.id ? { ...s, isActive: !next } : s))
        );
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Skills</h1>
          <p className="text-sm text-n-500 mt-1">
            {activeCount} active · {skills.length - activeCount} inactive
          </p>
        </div>
        <Button onClick={openNew}>
          <Icon name="plus" size={16} />
          New Skill
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
              <th className="px-5 py-3 text-left font-medium text-n-500">Skill</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Lessons</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Order</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
              <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-n-800">{skill.name}</span>
                    <span className="text-xs text-n-400">/{skill.slug}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-n-600">{skill.lessonCount}</td>
                <td className="px-5 py-3 text-n-400">{skill.sortOrder}</td>
                <td className="px-5 py-3">
                  <Badge color={skill.isActive ? "green" : "gray"}>
                    {skill.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(skill)}>
                      <Icon name="edit" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(skill)}
                      disabled={isPending}
                    >
                      {skill.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SkillForm
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
