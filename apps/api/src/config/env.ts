// Validates environment variables once at startup so the app fails fast
// with a clear message instead of breaking later at runtime.

export interface AppConfig {
  databaseUrl: string;
  firebaseServiceAccountBase64: string;
  ownerEmails: string[];
  corsOrigins: string[];
  port: number;
  /** Image hosting. Optional so the API still starts before it is configured. */
  cloudinary: { cloudName: string; apiKey: string; apiSecret: string } | null;
}

const splitList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => {
  const missing = ['DATABASE_URL', 'FIREBASE_SERVICE_ACCOUNT_BASE64', 'OWNER_EMAILS'].filter(
    (key) => !env[key]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')} (see .env.example)`);
  }

  return {
    databaseUrl: env.DATABASE_URL!,
    firebaseServiceAccountBase64: env.FIREBASE_SERVICE_ACCOUNT_BASE64!,
    ownerEmails: splitList(env.OWNER_EMAILS).map((email) => email.toLowerCase()),
    corsOrigins: splitList(env.CORS_ORIGINS),
    port: Number(env.PORT) || 4000,
    cloudinary:
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
        ? {
            cloudName: env.CLOUDINARY_CLOUD_NAME.trim(),
            apiKey: env.CLOUDINARY_API_KEY.trim(),
            apiSecret: env.CLOUDINARY_API_SECRET.trim(),
          }
        : null,
  };
};

export const APP_CONFIG = Symbol('APP_CONFIG');
