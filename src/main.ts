import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from '@auth/passport/jwt-auth.guard';
import { TransformInterceptor } from 'core/transform.interceptor';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET ,HEAD,PUT ,PATCH,POST ,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS Swagger')
    .setDescription('All module')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
