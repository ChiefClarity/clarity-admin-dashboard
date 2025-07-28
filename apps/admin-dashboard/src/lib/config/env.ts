import { z } from 'zod';

const envSchema = z.object({
  // Required
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Optional with defaults
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Feature flags
  NEXT_PUBLIC_USE_REAL_API: z.string().default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('true').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_REALTIME: z.string().default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_ROUTES: z.string().default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_AI: z.string().default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_BULK: z.string().default('false').transform(v => v === 'true'),
  NEXT_PUBLIC_USE_POOLBRAIN: z.string().default('false').transform(v => v === 'true'),
  
  // Third-party services
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
});

// Validate env vars at build time
export const env = envSchema.parse(process.env);