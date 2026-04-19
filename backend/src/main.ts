import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api', {
    exclude: ['uploads/*path'],
  });

  // Static file serving for uploads
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // ═══════════════════════════════════════
  // SECURITY MIDDLEWARE
  // ═══════════════════════════════════════

  // Helmet.js - HTTP Security Headers
  app.use(
    helmet.default({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // API için gerekli
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // CORS - Whitelist configuration
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Wildcard — allow all origins
      if (allowedOrigins.includes('*')) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-CSRF-Token', 'X-Session-Id', 'x-session-id'],
  });

  // Request size limits
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser (JWT HttpOnly cookies + CSRF)
  const cookieSecret = process.env.COOKIE_SECRET;
  if (process.env.NODE_ENV === 'production' && !cookieSecret) {
    throw new Error(
      'COOKIE_SECRET environment variable is required in production',
    );
  }
  app.use(cookieParser(cookieSecret || 'dev-cookie-secret-change-in-prod'));

  // CSRF Protection — Double Submit Cookie Pattern
  // API JWT Bearer token zaten CSRF'e karşı koruma sağlar (cookie değil header'da)
  // Ama HttpOnly cookie kullanan endpointler için ek koruma:
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Safe methods skip
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    // API key veya Bearer token varsa CSRF gerekmez
    if (req.headers['authorization'] || req.headers['x-api-key']) return next();

    // Webhook endpoint'leri skip (dış servislerden gelir)
    if (req.path.startsWith('/api/webhooks/')) return next();

    // Public endpoint'ler skip
    if (req.path.startsWith('/api/auth/')) return next();

    // Cookie tabanlı isteklerde CSRF token kontrolü
    if (req.cookies?.['jwt'] || req.cookies?.['refresh_token']) {
      const csrfHeader = req.headers['x-csrf-token'];
      const csrfCookie = req.cookies?.['csrf-token'];

      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        return res.status(403).json({
          success: false,
          message: 'CSRF token geçersiz',
          error: 'Forbidden',
        });
      }
    }

    next();
  });

  // Global pipes
  app.useGlobalPipes(
    // XSS sanitization — tüm string input'lardan tehlikeli tagları temizler
    new SanitizePipe(),
    // Validation — whitelist + transform
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger — disabled in production unless SWAGGER_ENABLED=true
  const enableSwagger =
    process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';
  if (enableSwagger) {
  const config = new DocumentBuilder()
    .setTitle('Olentia Pure API')
    .setDescription(
      'Premium Coffee E-Commerce Platform — Backend API\n\n' +
        'Modules: Identity, Catalog, Cart, Order, Payment, Subscription, B2B, CMS, Chatbot, Notification',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Google/Apple OAuth + JWT + MFA')
    .addTag('Users', 'User management')
    .addTag('Catalog', 'Products, categories, collections')
    .addTag('Cart', 'Shopping cart (guest + auth)')
    .addTag('Orders', 'Order management')
    .addTag('Payments', 'Payment processing + QR')
    .addTag('Subscriptions', 'Coffee subscription plans')
    .addTag('B2B', 'Corporate solutions & CRM')
    .addTag('CMS', 'Blog, FAQ, SEO')
    .addTag('Chatbot', 'AI chatbot')
    .addTag('Notifications', 'Email & push notifications')
    .addTag('Admin', 'Admin-only endpoints')
    .addTag('Health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Olentia Pure API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #0F0E0D; }
      .swagger-ui .topbar .link { color: #C8A27A; }
    `,
  });
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Olentia API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
