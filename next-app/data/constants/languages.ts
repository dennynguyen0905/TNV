import type { Language } from "@/data/types";

export const LANGUAGES_DATA: Language[] = [
  { id: "english", name: "English", slug: "english", meta: "368 reading texts · 153 listening texts", skills: ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"], active: true },
  { id: "german",  name: "German",  slug: "german",  meta: "334 reading texts · 90 listening texts",  skills: ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"], active: true },
  { id: "french",  name: "French",  slug: "french",  meta: "272 reading texts · 114 listening texts", skills: ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"], active: true },
  { id: "spanish", name: "Spanish", slug: "spanish", meta: "276 reading texts · 116 listening texts", skills: ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"], active: true },
];
