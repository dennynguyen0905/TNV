import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { verifyPassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { createLogger, describeError } from "@/lib/logger";

const log = createLogger("api/auth/login");

// 10 attempts per IP per 5 minutes — generous for humans, costly for brute force.
const RATE_LIMIT = { limit: 10, windowMs: 5 * 60_000 };

export async function POST(req: NextRequest) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limit = rateLimit(`login:${ip}`, RATE_LIMIT);
    if (!limit.allowed) {
      log.warn("rate limit exceeded", { ip });
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    log.error("unhandled error", describeError(err));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
