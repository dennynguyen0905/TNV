import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — New Lesson" };

export default function AdminNewLessonPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-n-900 mb-6">New Lesson</h1>
      <div className="bg-white rounded-card shadow-card p-6 text-center text-n-400">
        <p className="text-sm">Lesson creation form — migration in progress.</p>
        <p className="text-xs mt-1">Reference: AdminLessonForm in admin-pages.jsx</p>
      </div>
    </div>
  );
}
