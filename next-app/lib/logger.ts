/**
 * Minimal zero-dependency server-side logger.
 *
 * Phase 5H intentionally avoids an external logging vendor (Datadog, Sentry,
 * Logtail). This is a thin wrapper over `console` that:
 *
 *  - emits a consistent, greppable prefix (`[level] [scope]`),
 *  - attaches an ISO timestamp,
 *  - serialises structured context safely (never throws on circular data),
 *  - stays quiet at `debug` level outside development.
 *
 * Swap the `emit()` body for a real transport later without touching call sites.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// In production, suppress debug noise; everything else is always emitted.
const MIN_LEVEL: number = process.env.NODE_ENV === "production" ? LEVEL_RANK.info : LEVEL_RANK.debug;

type LogContext = Record<string, unknown>;

function safeSerialize(context: LogContext): string {
  try {
    return JSON.stringify(context);
  } catch {
    return "[unserialisable context]";
  }
}

function emit(level: LogLevel, scope: string, message: string, context?: LogContext): void {
  if (LEVEL_RANK[level] < MIN_LEVEL) return;

  const prefix = `${new Date().toISOString()} [${level}] [${scope}]`;
  const line = context && Object.keys(context).length > 0
    ? `${prefix} ${message} ${safeSerialize(context)}`
    : `${prefix} ${message}`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

/**
 * Create a scoped logger. The scope is usually a route or service name, e.g.
 * `createLogger("api/auth/login")`.
 */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) => emit("debug", scope, message, context),
    info: (message, context) => emit("info", scope, message, context),
    warn: (message, context) => emit("warn", scope, message, context),
    error: (message, context) => emit("error", scope, message, context),
  };
}

/**
 * Reduce an unknown thrown value to a safe, loggable shape. Never include this
 * in a client response — it can contain stack traces and internal detail.
 */
export function describeError(err: unknown): LogContext {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { error: String(err) };
}
