"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: string;
  free: boolean;
  estimatedMin: number;
  questionCount: number;
  hasPdf: boolean;
};

export function LessonListClient({
  lessons,
  languageSlug,
  skillSlug,
}: {
  lessons: Lesson[];
  languageSlug: string;
  skillSlug: string;
}) {
  const [levelFilter, setLevelFilter] = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = lessons.filter((l) => {
    if (levelFilter !== "All" && l.level !== levelFilter) return false;
    if (accessFilter === "Free" && !l.free) return false;
    if (accessFilter === "Premium" && l.free) return false;
    if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 md:items-center">
        {/* Levels */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["All", "A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                levelFilter === lvl
                  ? "bg-n-800 text-white"
                  : "bg-white border border-n-200 text-n-600 hover:border-n-300"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex flex-1 gap-3 md:justify-end flex-wrap">
          {/* Access */}
          <div className="flex gap-1 p-1 bg-n-100 rounded-[12px]">
            {["All", "Free", "Premium"].map((f) => (
              <button
                key={f}
                onClick={() => setAccessFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
                  accessFilter === f
                    ? "bg-white text-n-900 shadow-sm"
                    : "text-n-500 hover:text-n-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-n-400">
              <Icon name="search" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-n-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-n-50 text-n-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="search" size={32} />
          </div>
          <h3 className="text-lg font-bold text-n-900 mb-2">No lessons found</h3>
          <p className="text-sm text-n-500 mb-6">Try changing your filters or search keyword.</p>
          <button
            onClick={() => {
              setLevelFilter("All");
              setAccessFilter("All");
              setSearchQuery("");
            }}
            className="text-sm font-semibold text-n-700 bg-white border border-n-200 hover:bg-n-50 px-4 py-2 rounded-xl transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/${languageSlug}/${skillSlug}/${lesson.slug}`}
              className="block transition-transform hover:-translate-y-1"
            >
              <Card hover className="p-5 flex flex-col gap-3 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="blue">{lesson.level}</Badge>
                  {lesson.free ? (
                    <Badge color="green">Free</Badge>
                  ) : (
                    <Badge color="amber">Premium</Badge>
                  )}
                  <span className="text-xs font-medium text-n-400 ml-auto flex items-center gap-1">
                    <Icon name="clock" size={12} />~{lesson.estimatedMin} min
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-n-900 mb-1.5">{lesson.title}</h3>
                  <p className="text-sm text-n-500 line-clamp-2 leading-relaxed">{lesson.summary}</p>
                </div>
                <div className="mt-auto text-[13px] font-medium text-n-400 pt-3 border-t border-n-100 flex justify-between">
                  <span>{lesson.questionCount} questions</span>
                  {lesson.hasPdf && (
                    <span className="flex items-center gap-1">
                      <Icon name="download" size={14} /> PDF
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
