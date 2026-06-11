/**
 * Application feature flags.
 *
 * PAYMENT_ENABLED is intentionally false. Phase 5D ships a premium *placeholder*
 * only: admins can toggle `User.isPremium` and `Lesson.isPremium`, and premium
 * lessons are gated for non-premium learners. Real checkout / subscriptions /
 * payment providers (Stripe, PayPal, MoMo, VNPay, ZaloPay) and webhooks remain
 * deferred to a later phase. Do not wire payment behaviour to this flag yet.
 */
export const PAYMENT_ENABLED = false;

/**
 * Canonical public site origin, used for SEO (sitemap, robots, canonical URLs,
 * JSON-LD). Falls back to localhost in development. Set NEXT_PUBLIC_APP_URL (or
 * NEXT_PUBLIC_SITE_URL) in production to the deployed origin, e.g.
 * https://thang-nv.vercel.app — no trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

/** Build an absolute URL from a site-relative path for canonical/sitemap use. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
