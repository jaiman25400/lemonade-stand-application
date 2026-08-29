import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './common/setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lemonade Stand API')
    .setDescription('Beverage catalog and order processing')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const config = app.get(ConfigService);
  const port = config.get<string>('PORT') ?? '3000';
  const prefix = config.get<string>('API_PREFIX') ?? 'api';

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${port}/${prefix}`);
  logger.log(`Swagger UI at http://localhost:${port}/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
