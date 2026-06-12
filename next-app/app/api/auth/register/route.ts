import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { hashPassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { createLogger, describeError } from "@/lib/logger";

const log = createLogger("api/auth/register");

// 5 new accounts per IP per hour — blunts automated signup abuse.
const RATE_LIMIT = { limit: 5, windowMs: 60 * 60_000 };

export async function POST(req: NextRequest) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limit = rateLimit(`register:${ip}`, RATE_LIMIT);
    if (!limit.allowed) {
      log.warn("rate limit exceeded", { ip });
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    log.error("unhandled error", describeError(err));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
