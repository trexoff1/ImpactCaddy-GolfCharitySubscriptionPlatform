/* ===== Domain Types ===== */

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  handicap: number | null;
  home_course: string | null;
  charity_id: string | null;
  charity_percentage: number;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  draw_entries: number;
  charity_total: number;
  is_admin: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  total_raised: number;
  supporter_count: number;
  is_active: boolean;
  created_at: string;
}

export type SubscriptionTier = "birdie" | "eagle" | "albatross";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  stableford_points: number;
  course_name: string;
  date_played: string;
  notes: string | null;
  verified: boolean;
  created_at: string;
}

export type DrawType = "random" | "algorithmic";
export type DrawStatus = "active" | "completed" | "canceled";

export interface Draw {
  id: string;
  draw_date: string;
  draw_type: DrawType;
  total_pool: number;
  status: DrawStatus;
  winner_id: string | null;
  winner_name?: string;
  charity_name?: string;
  charity_amount: number;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  tickets: number;
  locked_scores?: number[];
  user_name?: string;
}

export type TransactionType = "subscription" | "draw_winnings" | "charity_donation";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  stripe_payment_id: string | null;
  created_at: string;
}

/* ===== Subscription Tiers ===== */

export interface TierConfig {
  name: string;
  price: number;
  drawEntries: number;
  description: string;
  features: string[];
  color: string;
}

export const TIERS: Record<SubscriptionTier, TierConfig> = {
  birdie: {
    name: "Birdie",
    price: 999,
    drawEntries: 1,
    description: "Get started with a single entry",
    features: [
      "1 Monthly draw entry",
      "Score tracking",
      "Charity selection",
      "Community leaderboard",
    ],
    color: "var(--color-success-400)",
  },
  eagle: {
    name: "Eagle",
    price: 2499,
    drawEntries: 3,
    description: "More chances to win & give",
    features: [
      "3 Monthly draw entries",
      "Score tracking",
      "Charity selection",
      "Community leaderboard",
      "Priority support",
    ],
    color: "var(--color-primary-400)",
  },
  albatross: {
    name: "Albatross",
    price: 4999,
    drawEntries: 7,
    description: "Maximum impact",
    features: [
      "7 Monthly draw entries",
      "Score tracking",
      "Charity selection",
      "Community leaderboard",
      "Priority support",
      "Exclusive events",
      "Charity spotlight",
    ],
    color: "var(--color-accent-400)",
  },
};
