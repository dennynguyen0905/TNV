/**
 * Phase 5G integration tests — exercise DB-backed service behaviour.
 *
 *  - anonymous quiz submission is scored but NOT persisted
 *  - logged-in quiz submission IS persisted (attempt + progress)
 *  - admin-only preview: non-published lessons are hidden from the public
 *    detail query but visible to the admin-by-id query
 *  - worker job idempotency: publishing enqueues a fixed set without duplicates
 *
 * These require a reachable Postgres (DATABASE_URL). When the DB is unreachable
 * every test is skipped rather than failed, so the suite is safe to run in
 * environments without a database.
 *
 * Run via: npm run test:integration
 */
import "./loadEnv";
import { test, assert, assertEqual, runRegistered } from "./harness";
import { prisma } from "@/lib/prisma";
import { LessonStatus, QuestionType } from "@prisma/client";
import { gradeAndPersist } from "@/server/services/quizService";
import { enqueueLessonPublishJobs } from "@/server/services/adminJobService";
import { getLessonForDetail, getLessonByIdForAdmin } from "@/server/repositories/lessonRepository";

const TEST_SLUG = "phase5g-integration-temp";
let dbAvailable: boolean | null = null;

async function isDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  return dbAvailable;
}

const skipIfNoDb = () => (dbAvailable === false ? "no database reachable" : null);

type Fixture = {
  lessonId: string;
  userId: string;
  questionId: string;
  correctOptionId: string;
  wrongOptionId: string;
};

async function setupFixture(): Promise<Fixture> {
  // Reuse seeded reference rows (language/skill/level) so we don't duplicate them.
  const language = await prisma.language.findFirstOrThrow();
  const skill = await prisma.skill.findFirstOrThrow();
  const level = await prisma.level.findFirstOrThrow();

  await teardownFixture(); // ensure a clean slate

  const lesson = await prisma.lesson.create({
    data: {
      title: "Phase 5G Integration Lesson",
      slug: TEST_SLUG,
      summary: "Temporary lesson created by the integration test suite.",
      content: "Body content.",
      languageId: language.id,
      skillId: skill.id,
      levelId: level.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      publishedAt: new Date(),
      questions: {
        create: {
          type: QuestionType.SINGLE_CHOICE,
          prompt: "1 + 1 = ?",
          sortOrder: 0,
          options: {
            create: [
              { text: "2", isCorrect: true, sortOrder: 0 },
              { text: "3", isCorrect: false, sortOrder: 1 },
            ],
          },
        },
      },
    },
    include: { questions: { include: { options: true } } },
  });

  const question = lesson.questions[0];
  const correctOption = question.options.find((o) => o.isCorrect)!;
  const wrongOption = question.options.find((o) => !o.isCorrect)!;

  const user = await prisma.user.create({
    data: {
      email: `phase5g-test-${Date.now()}@example.com`,
      passwordHash: "x",
      name: "Phase 5G Test Learner",
    },
  });

  return {
    lessonId: lesson.id,
    userId: user.id,
    questionId: question.id,
    correctOptionId: correctOption.id,
    wrongOptionId: wrongOption.id,
  };
}

async function teardownFixture(): Promise<void> {
  const lesson = await prisma.lesson.findFirst({
    where: { slug: TEST_SLUG },
    select: { id: true },
  });
  if (lesson) {
    await prisma.attempt.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.progress.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.workerJob.deleteMany({
      where: { idempotencyKey: { startsWith: `publish:${lesson.id}:` } },
    });
    await prisma.lesson.delete({ where: { id: lesson.id } });
  }
  await prisma.user.deleteMany({ where: { email: { startsWith: "phase5g-test-" } } });
}

let fx: Fixture | null = null;

test(
  "setup: create temporary published lesson + learner",
  async () => {
    if (!(await isDbAvailable())) return;
    fx = await setupFixture();
    assert(!!fx.lessonId, "fixture lesson should exist");
  },
  skipIfNoDb
);

test(
  "anonymous quiz submission is scored but NOT saved",
  async () => {
    assert(fx, "fixture missing");
    const result = await gradeAndPersist(
      fx!.lessonId,
      [{ questionId: fx!.questionId, selectedOptionIds: [fx!.correctOptionId] }],
      null
    );
    assertEqual(result.saved, false, "anonymous submission must not be saved");
    assertEqual(result.percentage, 100, "score should still be computed");
    const attempts = await prisma.attempt.count({ where: { lessonId: fx!.lessonId } });
    assertEqual(attempts, 0, "no Attempt row should be written for anonymous user");
  },
  skipIfNoDb
);

test(
  "logged-in quiz submission IS saved (attempt + progress)",
  async () => {
    assert(fx, "fixture missing");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: fx!.userId } });
    const result = await gradeAndPersist(
      fx!.lessonId,
      [{ questionId: fx!.questionId, selectedOptionIds: [fx!.correctOptionId] }],
      user
    );
    assertEqual(result.saved, true, "logged-in submission must be saved");
    const attempts = await prisma.attempt.count({
      where: { lessonId: fx!.lessonId, userId: fx!.userId },
    });
    assertEqual(attempts, 1, "exactly one Attempt row should be written");
    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId: fx!.userId, lessonId: fx!.lessonId } },
    });
    assert(progress !== null, "Progress row should exist");
    assertEqual(progress!.status, "COMPLETED", "passing attempt completes the lesson");
  },
  skipIfNoDb
);

test(
  "admin-only preview: draft lessons hidden publicly, visible to admin query",
  async () => {
    assert(fx, "fixture missing");
    // Move the lesson to DRAFT to simulate unpublished content.
    await prisma.lesson.update({
      where: { id: fx!.lessonId },
      data: { status: LessonStatus.DRAFT },
    });

    const language = await prisma.language.findFirstOrThrow();
    const skill = await prisma.skill.findFirstOrThrow();

    const publicView = await getLessonForDetail({
      languageSlug: language.slug,
      skillSlug: skill.slug,
      lessonSlug: TEST_SLUG,
    });
    assertEqual(publicView, null, "public detail query must not return a draft lesson");

    const adminView = await getLessonByIdForAdmin(fx!.lessonId);
    assert(adminView !== null, "admin-by-id query must return the draft lesson for preview");
    assertEqual(adminView!.status, "DRAFT", "admin preview sees the real (draft) status");

    // restore published for the idempotency test
    await prisma.lesson.update({
      where: { id: fx!.lessonId },
      data: { status: LessonStatus.PUBLISHED },
    });
  },
  skipIfNoDb
);

test(
  "worker job idempotency: re-enqueue does not duplicate publish jobs",
  async () => {
    assert(fx, "fixture missing");
    await enqueueLessonPublishJobs(fx!.lessonId, TEST_SLUG);
    const firstCount = await prisma.workerJob.count({
      where: { idempotencyKey: { startsWith: `publish:${fx!.lessonId}:` } },
    });
    assertEqual(firstCount, 3, "publishing enqueues exactly 3 placeholder jobs");

    // Re-run twice — idempotencyKey upsert must keep the count stable.
    await enqueueLessonPublishJobs(fx!.lessonId, TEST_SLUG);
    await enqueueLessonPublishJobs(fx!.lessonId, TEST_SLUG);
    const afterCount = await prisma.workerJob.count({
      where: { idempotencyKey: { startsWith: `publish:${fx!.lessonId}:` } },
    });
    assertEqual(afterCount, 3, "re-enqueue is idempotent (still 3 jobs)");
  },
  skipIfNoDb
);

test(
  "teardown: remove temporary rows",
  async () => {
    if (!(await isDbAvailable())) return;
    await teardownFixture();
    const remaining = await prisma.lesson.count({ where: { slug: TEST_SLUG } });
    assertEqual(remaining, 0, "fixture lesson should be cleaned up");
  },
  skipIfNoDb
);

if (process.argv[1] && process.argv[1].includes("integration")) {
  (async () => {
    await isDbAvailable();
    const r = await runRegistered("Integration tests");
    await prisma.$disconnect().catch(() => {});
    if (r.failed > 0) process.exit(1);
  })();
}
