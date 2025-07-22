const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';
const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

export const FEATURES = {
  // API Integration Flags
  USE_REAL_API: process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
  USE_POOLBRAIN_API: process.env.NEXT_PUBLIC_USE_POOLBRAIN === 'true',
  
  // Feature Toggles
  ENABLE_ROUTE_INTELLIGENCE: process.env.NEXT_PUBLIC_ENABLE_ROUTES === 'true',
  ENABLE_AI_SUGGESTIONS: process.env.NEXT_PUBLIC_ENABLE_AI === 'true',
  ENABLE_BULK_OPERATIONS: process.env.NEXT_PUBLIC_ENABLE_BULK === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  
  // WebSocket Features
  ENABLE_REALTIME: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  
  // Development Features
  ENABLE_DEBUG_PANEL: isDevelopment,
  ENABLE_API_MOCKING: isDevelopment || isStaging,
  SHOW_FEATURE_FLAGS: isDevelopment,
  
  // Security Features
  ENFORCE_2FA: isProduction,
  ENABLE_AUDIT_LOGS: !isDevelopment,
  
  // Performance Features
  ENABLE_LAZY_LOADING: true,
  ENABLE_PREFETCHING: isProduction,
  CACHE_DURATION: isProduction ? 300 : 0, // 5 minutes in prod, no cache in dev
} as const;

// Runtime feature flag updates
export const updateFeatureFlag = (flag: keyof typeof FEATURES, value: boolean) => {
  if (isDevelopment) {
    (FEATURES as any)[flag] = value;
    window.localStorage.setItem(`feature_${flag}`, String(value));
  }
};

// Load dev overrides
if (isDevelopment && typeof window !== 'undefined') {
  Object.keys(FEATURES).forEach(flag => {
    const override = window.localStorage.getItem(`feature_${flag}`);
    if (override !== null) {
      (FEATURES as any)[flag] = override === 'true';
    }
  });
}