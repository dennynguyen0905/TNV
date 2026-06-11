import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { requireAdmin } from "@/lib/auth";
import * as lessonRepo from "@/server/repositories/lessonRepository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Lesson Preview" };

interface Props {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  FILL_BLANK: "Fill in the Blank",
  DICTATION: "Dictation",
};

export default async function AdminLessonPreviewPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const lesson = await lessonRepo.getLessonByIdForAdmin(id);
  if (!lesson) notFound();

  const isPublished = lesson.status === "PUBLISHED";
  const publicUrl = `/${lesson.language.slug}/${lesson.skill.slug}/${lesson.slug}`;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Admin preview banner */}
      <div className="rounded-card border border-amber-200 bg-amber-50 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <Icon name="search" size={16} />
          <span>
            <strong>Admin preview</strong> — this view is admin-only and shows the lesson
            regardless of status. It is {isPublished ? "" : "not "}publicly visible.
          </span>
        </div>
        <Badge
          color={
            lesson.status === "PUBLISHED"
              ? "green"
              : lesson.status === "REVIEW"
              ? "blue"
              : lesson.status === "ARCHIVED"
              ? "gray"
              : "amber"
          }
        >
          {lesson.status}
        </Badge>
      </div>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge color="blue">{lesson.level.code}</Badge>
          <Badge color="gray">{lesson.skill.name}</Badge>
          {lesson.isPremium ? (
            <Badge color="amber">Premium</Badge>
          ) : (
            <Badge color="green">Free</Badge>
          )}
          <span className="text-xs text-n-400">{lesson.language.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-n-900 mb-2">{lesson.title}</h1>
        {lesson.summary && <p className="text-n-600">{lesson.summary}</p>}
      </Card>

      {/* Content / transcript */}
      {(lesson.content || lesson.transcript) && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-n-800 mb-3">
            {lesson.skill.name === "Listening" ? "Transcript" : "Content"}
          </h2>
          <div className="prose prose-sm max-w-none text-n-700 leading-relaxed whitespace-pre-line">
            {lesson.content || lesson.transcript}
          </div>
        </Card>
      )}

      {lesson.audioUrl && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-n-800 mb-2">Audio</h2>
          <p className="text-xs text-n-500 font-mono">{lesson.audioUrl}</p>
        </Card>
      )}

      {/* Questions with answer key (admin-only) */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-n-800 mb-1">
          Questions &amp; answer key
        </h2>
        <p className="text-xs text-n-400 mb-4">
          Answer keys are shown here for review only and are never exposed on public pages.
        </p>
        {lesson.questions.length === 0 ? (
          <p className="text-sm text-n-400 italic">No questions added yet.</p>
        ) : (
          <div className="space-y-5">
            {lesson.questions.map((q, i) => (
              <div key={q.id} className="border-b border-n-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-n-400">#{i + 1}</span>
                  <Badge color="blue">{TYPE_LABELS[q.type] ?? q.type}</Badge>
                </div>
                <p className="text-sm font-medium text-n-800 mb-2">{q.prompt}</p>
                {q.options.length > 0 ? (
                  <ul className="space-y-1">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={`text-sm flex items-center gap-2 ${
                          o.isCorrect ? "text-green-700 font-medium" : "text-n-600"
                        }`}
                      >
                        <span className="shrink-0">{o.isCorrect ? "✓" : "•"}</span>
                        {o.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-700">
                    Expected answer: &ldquo;{q.answerText ?? ""}&rdquo;
                  </p>
                )}
                {q.explanation && (
                  <p className="text-xs text-n-500 mt-2">
                    <span className="font-medium text-n-700">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/lessons">
          <Button variant="ghost">← Back to Lessons</Button>
        </Link>
        <div className="flex items-center gap-2">
          {isPublished && (
            <Link href={publicUrl} target="_blank">
              <Button variant="secondary">View public page ↗</Button>
            </Link>
          )}
          <Link href={`/admin/lessons/${lesson.id}/edit`}>
            <Button>
              <Icon name="edit" size={14} />
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
