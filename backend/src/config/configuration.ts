// Required environment variables - will throw on startup if missing
const requiredEnvVars = ['JWT_SECRET', 'COOKIE_SECRET', 'ENCRYPTION_SALT'];

// Validate required env vars (throw in prod, warn in dev)
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${envVar}`);
    } else {
      console.warn(`⚠️  Missing env: ${envVar} — using dev fallback (DO NOT use in production)`);
    }
  }
}

// Extra guard: JWT_SECRET must be at least 32 chars in production
if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  app: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionSalt:
      process.env.ENCRYPTION_SALT || 'olentia-default-salt-change-in-prod',
    cookieSecret: process.env.COOKIE_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:4000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10),
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== 'production'
        ? 'dev-jwt-secret-change-in-prod'
        : undefined),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackUrl: process.env.APPLE_CALLBACK_URL,
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9002', 10),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET || 'olentia-media',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'hello@olentia.com',
  },
  paytr: {
    merchantId: process.env.PAYTR_MERCHANT_ID,
    merchantKey: process.env.PAYTR_MERCHANT_KEY,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT,
    baseUrl: process.env.PAYTR_BASE_URL || 'https://www.paytr.com',
    testMode: process.env.PAYTR_TEST_MODE || 'false',
  },
  iyzico: {
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    baseUrl: process.env.IYZICO_BASE_URL,
  },
  googlePay: {
    merchantId: process.env.GOOGLE_PAY_MERCHANT_ID,
    environment: process.env.GOOGLE_PAY_ENVIRONMENT || 'TEST',
  },
  applePay: {
    merchantId: process.env.APPLE_PAY_MERCHANT_ID,
    domainVerification: process.env.APPLE_PAY_DOMAIN_VERIFICATION,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  onesignal: {
    appId: process.env.ONESIGNAL_APP_ID,
    apiKey: process.env.ONESIGNAL_API_KEY,
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    geocodingEnabled: process.env.GOOGLE_MAPS_GEOCODING === 'true',
  },
  order: {
    freeShippingThreshold: parseInt(
      process.env.ORDER_FREE_SHIPPING_THRESHOLD || '500',
      10,
    ),
    defaultShippingCost: parseFloat(
      process.env.ORDER_DEFAULT_SHIPPING_COST || '39.9',
    ),
    taxRate: parseFloat(process.env.ORDER_TAX_RATE || '0.20'),
  },
  identity: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES || '30', 10),
    attemptWindowMinutes: parseInt(
      process.env.ATTEMPT_WINDOW_MINUTES || '15',
      10,
    ),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    ttsModel: process.env.OPENAI_TTS_MODEL || 'tts-1',
    whisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  },
  onesignal: {
    appId: process.env.ONESIGNAL_APP_ID,
    apiKey: process.env.ONESIGNAL_API_KEY,
  },
});
