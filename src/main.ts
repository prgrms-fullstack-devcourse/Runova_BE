import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from "node:process";
import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeTransactionalContext } from "typeorm-transactional";
import { ValidationPipe } from "@nestjs/common";
import { LoggingInterceptor } from "./common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  initializeTransactionalContext();

  const app
      = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set("trust_proxy", true);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  SwaggerModule.setup(
      "api-docs", app,
      SwaggerModule.createDocument(
          app,
          new DocumentBuilder()
              .setTitle('Runova API Docs')
              .setVersion('1.0.0')
              .build()
      )
  );

  await app.listen(
      process.env.PORT ?? 3000,
      process.env.HOST ?? "127.0.0.1"
  );
}
bootstrap();
