"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import type { Language } from "@/data/types";

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>(LANGUAGES_DATA);

  const toggleActive = (id: string) =>
    setLanguages((prev) =>
      prev.map((l) => l.id === id ? { ...l, active: !l.active } : l)
    );

  const activeCount = languages.filter((l) => l.active).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Languages</h1>
          <p className="text-sm text-n-500 mt-1">
            {activeCount} active · {languages.length - activeCount} inactive
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">Language</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Skills</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Content</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
              <th className="px-5 py-3 text-right font-medium text-n-500">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {languages.map((lang) => (
              <tr key={lang.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <FlagIcon lang={lang.slug} size={28} />
                    <span className="font-medium text-n-800">{lang.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {lang.skills.map((s) => (
                      <Badge key={s} color="blue">{s}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-n-500 text-xs">{lang.meta}</td>
                <td className="px-5 py-3">
                  <Badge color={lang.active ? "green" : "gray"}>
                    {lang.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant={lang.active ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => toggleActive(lang.id)}
                  >
                    {lang.active ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
