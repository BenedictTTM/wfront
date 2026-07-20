// features/billing — subscription plans, entitlement checks, paywall upsell
// TODO: implement
export type Entitlement = "fullAnalytics" | /* TODO: confirm full entitlement list */ string;
export type SubscriptionPlan = { id: string; name: string; entitlements: Entitlement[]; /* TODO */ };
