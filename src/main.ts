import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import process from "node:process";
import { NestExpressApplication } from "@nestjs/platform-express";
import { initializeTransactionalContext } from "typeorm-transactional";
import { ValidationPipe } from "@nestjs/common";
import { LoggingInterceptor } from "./common/interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import "./common/geo/converter";

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

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
    origin: "*",
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? "0.0.0.0");
}
bootstrap();
