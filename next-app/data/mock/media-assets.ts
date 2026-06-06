import type { MediaAsset } from "@/data/types";

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [
  { id: 1, fileName: "morning-routine-audio.mp3",  type: "audio/mpeg",       url: "/media/audio/morning-routine.mp3",    lessonId: 5,  lessonTitle: "Morning Routine",                size: "2.4 MB", uploadedAt: "2026-05-25" },
  { id: 2, fileName: "at-the-market-audio.mp3",    type: "audio/mpeg",       url: "/media/audio/at-the-market.mp3",      lessonId: 10, lessonTitle: "At the Market",                  size: "3.1 MB", uploadedAt: "2026-05-22" },
  { id: 3, fileName: "first-day-school.pdf",       type: "application/pdf",  url: "/media/pdf/first-day-school.pdf",     lessonId: 1,  lessonTitle: "My First Day at School",         size: "180 KB", uploadedAt: "2026-06-01" },
  { id: 4, fileName: "city-tour-london.pdf",       type: "application/pdf",  url: "/media/pdf/city-tour-london.pdf",     lessonId: 3,  lessonTitle: "A City Tour in London",          size: "210 KB", uploadedAt: "2026-05-28" },
  { id: 5, fileName: "business-emails-audio.mp3",  type: "audio/mpeg",       url: "/media/audio/business-emails.mp3",    lessonId: 4,  lessonTitle: "Business English: Writing Emails", size: "4.2 MB", uploadedAt: "2026-06-04" },
  { id: 6, fileName: "les-saisons-audio.mp3",      type: "audio/mpeg",       url: "/media/audio/les-saisons.mp3",        lessonId: 7,  lessonTitle: "Les Saisons",                    size: "1.8 MB", uploadedAt: "2026-05-20" },
];
