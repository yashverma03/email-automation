import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(`api/v1`);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('TenantPay API')
    .setDescription('TenantPay API Docs')
    .setVersion('2')
    .addBearerAuth();
  const document = SwaggerModule.createDocument(app, config.build());
  app.use(
    '/api/docs',
    apiReference({
      content: document,
      persistAuth: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
