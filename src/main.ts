import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import process from "node:process";
import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeTransactionalContext } from "typeorm-transactional";
import { ValidationPipe } from "@nestjs/common";
import { LoggingInterceptor } from "./common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set("trust_proxy", true);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Runova API")
    .setDescription("러닝 기반 플랫폼 Runova API 문서")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? "127.0.0.1");
}
bootstrap();
