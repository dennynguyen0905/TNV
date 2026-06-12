import { NextRequest, NextResponse } from "next/server";
import { quizSubmissionSchema } from "@/lib/validators";
import { gradeAndPersist, QuizError } from "@/server/services/quizService";
import { getCurrentUser } from "@/lib/auth";
import { createLogger, describeError } from "@/lib/logger";

const log = createLogger("api/attempts");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = quizSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const result = await gradeAndPersist(
      parsed.data.lessonId,
      parsed.data.answers,
      user
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuizError) {
      const status = err.code === "NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ error: err.message }, { status });
    }
    log.error("unhandled error", describeError(err));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
