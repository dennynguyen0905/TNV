import { NextRequest, NextResponse } from "next/server";
import { quizSubmissionSchema } from "@/lib/validators";
import { gradeAndPersist } from "@/server/services/quizService";
import { getCurrentUser } from "@/lib/auth";

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
      user?.id ?? null
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/attempts] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
