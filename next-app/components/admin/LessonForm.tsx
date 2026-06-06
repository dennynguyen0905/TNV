"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Input, Textarea, SelectInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { slugify } from "@/lib/utils";
import type { AdminLesson, Question, QuestionType, SkillName, CefrLevel, LessonStatus } from "@/data/types";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { LEVELS } from "@/data/constants/levels";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditableQuestion {
  id: number;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIdx: number;
  correctIndices: number[];
  answer: string;
  explanation: string;
  sortOrder: number;
}

interface LessonFormProps {
  lesson?: AdminLesson;
  initialQuestions?: Question[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_OPTIONS: SkillName[] = ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"];

const STATUS_OPTIONS: LessonStatus[] = ["Published", "Draft", "Review", "Archived"];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "SINGLE_CHOICE",   label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "FILL_BLANK",      label: "Fill in the Blank" },
  { value: "DICTATION",       label: "Dictation" },
];

const TYPE_COLOR: Record<QuestionType, "blue" | "green" | "amber" | "purple"> = {
  SINGLE_CHOICE:   "blue",
  MULTIPLE_CHOICE: "green",
  FILL_BLANK:      "amber",
  DICTATION:       "purple",
};

let nextTempId = -1;

// ─── Question Editor Modal ────────────────────────────────────────────────────

interface QuestionEditorProps {
  question: EditableQuestion;
  onSave: (q: EditableQuestion) => void;
  onClose: () => void;
}

function QuestionEditor({ question, onSave, onClose }: QuestionEditorProps) {
  const [q, setQ] = useState<EditableQuestion>({ ...question, options: [...question.options] });

  const updateField = <K extends keyof EditableQuestion>(key: K, value: EditableQuestion[K]) =>
    setQ((prev) => ({ ...prev, [key]: value }));

  const updateOption = (i: number, value: string) =>
    setQ((prev) => {
      const opts = [...prev.options];
      opts[i] = value;
      return { ...prev, options: opts };
    });

  const addOption = () => setQ((prev) => ({ ...prev, options: [...prev.options, ""] }));

  const removeOption = (i: number) =>
    setQ((prev) => {
      const opts = prev.options.filter((_, idx) => idx !== i);
      const correctIdx = prev.correctIdx >= i && prev.correctIdx > 0 ? prev.correctIdx - 1 : prev.correctIdx;
      const correctIndices = prev.correctIndices
        .filter((ci) => ci !== i)
        .map((ci) => (ci > i ? ci - 1 : ci));
      return { ...prev, options: opts, correctIdx, correctIndices };
    });

  const toggleCorrectIndex = (i: number) =>
    setQ((prev) => {
      const already = prev.correctIndices.includes(i);
      return {
        ...prev,
        correctIndices: already
          ? prev.correctIndices.filter((ci) => ci !== i)
          : [...prev.correctIndices, i],
      };
    });

  const needsOptions = q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE";

  const canSave =
    q.prompt.trim() !== "" &&
    (needsOptions
      ? q.options.length >= 2 && q.options.every((o) => o.trim() !== "")
      : q.answer.trim() !== "");

  return (
    <Modal open onClose={onClose} title={q.id < 0 ? "Add Question" : "Edit Question"} className="max-w-xl">
      <div className="space-y-4">
        <SelectInput
          id="q-type"
          label="Type"
          value={q.type}
          onChange={(e) => {
            const t = e.target.value as QuestionType;
            setQ((prev) => ({
              ...prev,
              type: t,
              options: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(t) ? (prev.options.length ? prev.options : ["", ""]) : [],
              correctIdx: 0,
              correctIndices: [],
              answer: "",
            }));
          }}
          options={TYPE_OPTIONS}
        />

        <Textarea
          id="q-prompt"
          label="Prompt"
          value={q.prompt}
          onChange={(e) => updateField("prompt", e.target.value)}
          placeholder="Question text…"
          rows={2}
        />

        {needsOptions && (
          <div>
            <p className="text-sm font-medium text-n-700 mb-2">Answer Options</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  {q.type === "SINGLE_CHOICE" ? (
                    <input
                      type="radio"
                      name="correct-single"
                      checked={q.correctIdx === i}
                      onChange={() => updateField("correctIdx", i)}
                      className="accent-blue-500 shrink-0"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={q.correctIndices.includes(i)}
                      onChange={() => toggleCorrectIndex(i)}
                      className="accent-blue-500 shrink-0"
                    />
                  )}
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-3 py-1.5 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-1 text-n-400 hover:text-red-500 transition-colors">
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addOption}
              className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Icon name="plus" size={12} /> Add option
            </button>
            <p className="text-xs text-n-400 mt-1">
              {q.type === "SINGLE_CHOICE" ? "Select the radio for the correct answer." : "Check all correct answers."}
            </p>
          </div>
        )}

        {!needsOptions && (
          <Input
            id="q-answer"
            label={q.type === "DICTATION" ? "Expected sentence (correct answer)" : "Correct answer"}
            value={q.answer}
            onChange={(e) => updateField("answer", e.target.value)}
            placeholder={q.type === "DICTATION" ? "We are going to the park on Saturday." : "The answer…"}
          />
        )}

        <Textarea
          id="q-explanation"
          label="Explanation (optional)"
          value={q.explanation}
          onChange={(e) => updateField("explanation", e.target.value)}
          placeholder="Shown after answer is submitted…"
          rows={2}
        />

        <Input
          id="q-sort"
          label="Sort order"
          type="number"
          value={q.sortOrder}
          onChange={(e) => updateField("sortOrder", Number(e.target.value))}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSave} onClick={() => canSave && onSave(q)}>Save Question</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main LessonForm ──────────────────────────────────────────────────────────

export function LessonForm({ lesson, initialQuestions = [] }: LessonFormProps) {
  const isNew = !lesson;

  // Form fields
  const [title, setTitle]       = useState(lesson?.title ?? "");
  const [slug, setSlug]         = useState(lesson?.slug ?? "");
  const [summary, setSummary]   = useState(lesson?.summary ?? "");
  const [content, setContent]   = useState("");
  const [lang, setLang]         = useState(lesson?.lang ?? "English");
  const [skill, setSkill]       = useState<SkillName>(lesson?.skill ?? "Reading");
  const [level, setLevel]       = useState<CefrLevel>(lesson?.level ?? "A1");
  const [status, setStatus]     = useState<LessonStatus>(lesson?.status ?? "Draft");
  const [premium, setPremium]   = useState(lesson?.premium ?? false);
  const [seoTitle, setSeoTitle] = useState(lesson?.seoTitle ?? "");
  const [seoDesc, setSeoDesc]   = useState(lesson?.seoDesc ?? "");

  // Slug auto-generation
  const [slugEdited, setSlugEdited] = useState(false);
  const handleTitleChange = useCallback((v: string) => {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  }, [slugEdited]);

  // Questions
  const [questions, setQuestions] = useState<EditableQuestion[]>(() =>
    initialQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: [...q.options],
      correctIdx: q.correctIdx,
      correctIndices: [...q.correctIndices],
      answer: q.answer,
      explanation: q.explanation,
      sortOrder: q.sortOrder,
    }))
  );
  const [qOpen, setQOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<EditableQuestion | null>(null);
  const [deletingQId, setDeletingQId] = useState<number | null>(null);

  // UI state
  const [saved, setSaved] = useState<"draft" | "published" | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);

  const handleSaveQuestion = (q: EditableQuestion) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((p) => p.id === q.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = q;
        return next;
      }
      return [...prev, q];
    });
    setEditingQ(null);
  };

  const handleAddQuestion = () => {
    setEditingQ({
      id: nextTempId--,
      type: "SINGLE_CHOICE",
      prompt: "",
      options: ["", ""],
      correctIdx: 0,
      correctIndices: [],
      answer: "",
      explanation: "",
      sortOrder: questions.length + 1,
    });
  };

  const confirmDelete = () => {
    if (deletingQId === null) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deletingQId));
    setDeletingQId(null);
  };

  const handleSaveDraft = () => {
    setStatus("Draft");
    setSaved("draft");
    setTimeout(() => setSaved(null), 3000);
  };

  const handlePublish = () => {
    setStatus("Published");
    setSaved("published");
    setTimeout(() => setSaved(null), 3000);
  };

  const handleUnpublish = () => {
    setStatus("Draft");
    setSaved("draft");
    setTimeout(() => setSaved(null), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-n-900">{isNew ? "New Lesson" : "Edit Lesson"}</h1>
          {lesson && <p className="text-sm text-n-500 mt-0.5">{lesson.title}</p>}
        </div>
        <div className="flex items-center gap-2">
          {saved === "draft"     && <span className="text-xs text-n-500 bg-n-100 px-2 py-1 rounded-badge">Saved as Draft</span>}
          {saved === "published" && <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-badge">Published</span>}
          <Badge color={status === "Published" ? "green" : status === "Review" ? "blue" : status === "Archived" ? "gray" : "amber"}>
            {status}
          </Badge>
        </div>
      </div>

      {/* Core metadata */}
      <div className="bg-white rounded-card shadow-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide">Lesson Details</h2>

        <Input
          id="title"
          label="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="My First Day at School"
        />

        <Input
          id="slug"
          label="Slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          placeholder="my-first-day-at-school"
        />

        <Textarea
          id="summary"
          label="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A short description shown on lesson cards…"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SelectInput
            id="lang"
            label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={LANGUAGES_DATA.map((l) => ({ value: l.name, label: l.name }))}
          />
          <SelectInput
            id="skill"
            label="Skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value as SkillName)}
            options={SKILL_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
          <SelectInput
            id="level"
            label="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value as CefrLevel)}
            options={LEVELS.map((l) => ({ value: l, label: l }))}
          />
          <SelectInput
            id="status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LessonStatus)}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPremium((p) => !p)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${premium ? "bg-amber-400" : "bg-n-200"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${premium ? "translate-x-4" : "translate-x-1"}`} />
          </button>
          <span className="text-sm text-n-700">
            {premium ? <><Badge color="amber">Premium</Badge> — only visible to paid users</> : "Free lesson"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-card shadow-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide">Content</h2>
        <Textarea
          id="content"
          label="Lesson text / transcript"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type the lesson content here…"
          rows={10}
          className="font-mono text-xs"
        />
      </div>

      {/* SEO */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-n-700 hover:bg-n-50 transition-colors"
        >
          <span>SEO</span>
          <Icon name="chevron-right" size={16} className={`transition-transform ${seoOpen ? "rotate-90" : ""}`} />
        </button>
        {seoOpen && (
          <div className="px-6 pb-6 space-y-4 border-t border-n-100">
            <div className="pt-4">
              <Input
                id="seo-title"
                label="SEO Title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="My First Day at School - English Reading A1"
              />
            </div>
            <Textarea
              id="seo-desc"
              label="SEO Description"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="A 155-character description for search engines…"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Questions & Answers */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setQOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-n-700 hover:bg-n-50 transition-colors"
        >
          <span>
            Questions &amp; Answers
            {questions.length > 0 && (
              <span className="ml-2 text-xs font-normal text-n-400">({questions.length})</span>
            )}
          </span>
          <Icon name="chevron-right" size={16} className={`transition-transform ${qOpen ? "rotate-90" : ""}`} />
        </button>

        {qOpen && (
          <div className="border-t border-n-100">
            {isNew && !lesson && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700">
                  Questions will be linked to this lesson after you save it for the first time.
                </p>
              </div>
            )}

            {questions.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-n-400 text-sm">No questions yet.</p>
                <p className="text-n-300 text-xs mt-1">Add your first question below.</p>
              </div>
            ) : (
              <div className="divide-y divide-n-100">
                {[...questions].sort((a, b) => a.sortOrder - b.sortOrder).map((q) => (
                  <div key={q.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-n-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-n-400">#{q.sortOrder}</span>
                        <Badge color={TYPE_COLOR[q.type]}>{q.type.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-n-800 truncate">{q.prompt}</p>
                      {q.options.length > 0 && (
                        <p className="text-xs text-n-400 mt-0.5">{q.options.length} options</p>
                      )}
                      {q.answer && (
                        <p className="text-xs text-n-400 mt-0.5">Answer: &ldquo;{q.answer.slice(0, 40)}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setEditingQ(q)}>
                        <Icon name="edit" size={13} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingQId(q.id)}
                        className="hover:text-red-500">
                        <Icon name="trash" size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-6 py-4 border-t border-n-100">
              <Button variant="secondary" size="sm" onClick={handleAddQuestion}>
                <Icon name="plus" size={14} />
                Add Question
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="bg-white rounded-card shadow-card px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/lessons">
          <Button variant="ghost">
            ← Back to Lessons
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {status === "Published" && (
            <Button variant="secondary" onClick={handleUnpublish}>Unpublish</Button>
          )}
          <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
          {status !== "Published" && (
            <Button onClick={handlePublish}>
              <Icon name="check" size={14} />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Question editor modal */}
      {editingQ && (
        <QuestionEditor
          question={editingQ}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQ(null)}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal open={deletingQId !== null} onClose={() => setDeletingQId(null)} title="Delete Question">
        <p className="text-sm text-n-700 mb-6">
          Are you sure you want to delete this question? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingQId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
