/**
 * Public runtime configuration.
 *
 * Only variables prefixed with VITE_PUBLIC_ reach the browser (see vite.config.ts).
 * Everything read here is PUBLIC and visible to every visitor — never put secrets here.
 */
export const publicEnv = {
  siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL ?? '',
  /** Future Supabase integration. Empty until configured. */
  supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
