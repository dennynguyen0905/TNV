import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { LANGUAGES_DATA } from "@/data/constants/languages";

export const metadata: Metadata = { title: "Admin — Languages" };

export default function AdminLanguagesPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Languages</h1>
          <p className="text-sm text-n-500 mt-1">{LANGUAGES_DATA.length} languages</p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {LANGUAGES_DATA.map((lang) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
