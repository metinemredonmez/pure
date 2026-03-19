import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
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

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Olentia API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
