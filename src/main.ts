import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { RedisIoAdapter } from './app.adapter';
import {
  CONTEXT_PATH,
  NODE_ENV,
  PORT,
  SWAGGER_ENDPOINT,
} from './app.environment';
import { AppModule } from './app.module';
import { PagingResponse } from './common/common.component';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ErrorsInterceptor } from './common/interceptors/error.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

const swaggerOptions = new DocumentBuilder()
  .setTitle('Enso Finance')
  .setDescription('Enso Finance Web APIs')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.enableCors();
  app.useLogger(app.get(Logger));
  app.flushLogs();
  app.setGlobalPrefix(CONTEXT_PATH, {
    exclude: ['health'],
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(app.get(Reflector)),
    new ErrorsInterceptor(),
    new LoggerErrorInterceptor(),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableShutdownHooks();

  if (NODE_ENV != 'production') {
    const document = SwaggerModule.createDocument(app, swaggerOptions, {
      extraModels: [PagingResponse],
    });
    SwaggerModule.setup(SWAGGER_ENDPOINT, app, document);
  }

  await app.listen(PORT);
}

bootstrap().catch((e) => {
  console.log(`Server encounted exception ${e}`);
});
