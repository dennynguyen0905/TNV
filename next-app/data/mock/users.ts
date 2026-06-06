import type { User } from "@/data/types";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Minh Nguyen",    email: "minh@example.com",    role: "LEARNER", premium: false, status: "active",   joined: "2026-06-01", lessonsCompleted: 24 },
  { id: 2, name: "Anna Schmidt",   email: "anna@example.com",    role: "LEARNER", premium: true,  status: "active",   joined: "2026-05-28", lessonsCompleted: 11 },
  { id: 3, name: "John Editor",    email: "john@example.com",    role: "EDITOR",  premium: false, status: "active",   joined: "2026-05-15", lessonsCompleted: 3  },
  { id: 4, name: "Marie Dupont",   email: "marie@example.com",   role: "LEARNER", premium: true,  status: "active",   joined: "2026-05-10", lessonsCompleted: 37 },
  { id: 5, name: "Carlos Rivera",  email: "carlos@example.com",  role: "LEARNER", premium: false, status: "active",   joined: "2026-04-22", lessonsCompleted: 8  },
  { id: 6, name: "Yuki Tanaka",    email: "yuki@example.com",    role: "LEARNER", premium: true,  status: "active",   joined: "2026-04-18", lessonsCompleted: 52 },
  { id: 7, name: "Admin User",     email: "admin@langpath.dev",  role: "ADMIN",   premium: false, status: "active",   joined: "2026-01-01", lessonsCompleted: 0  },
  { id: 8, name: "Blocked User",   email: "blocked@example.com", role: "LEARNER", premium: false, status: "inactive", joined: "2026-03-10", lessonsCompleted: 1  },
];
