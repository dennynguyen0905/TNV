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
