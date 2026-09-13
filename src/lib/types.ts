export type BloomUser = {
  id: string;
  email?: string;
};

export type BloomProfile = {
  id?: string;
  user_id?: string;
  display_name?: string | null;
  gender?: string | null;
  onboarding_completed?: boolean | null;
  average_cycle_length?: number | null;
  average_period_length?: number | null;
  last_period_start?: string | null;
  [key: string]: unknown;
};

export type BloomPreferences = Record<string, unknown>;

export type BloomState = {
  user: BloomUser | null;
  profile: BloomProfile | null;
  cycles: unknown[];
  todayLog: unknown;
  preferences: BloomPreferences | null;
  isLoading: boolean;
  error: string | null;
};
