import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("healthz")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const result: { status: "ok" | "degraded" | "down"; db?: "up" | "down" } = {
      status: "ok",
    };

    try {
      // 가장 가벼운 쿼리로 DB 연결성 확인
      await this.prisma.$queryRaw`SELECT 1`;
      result.db = "up";
    } catch {
      result.db = "down";
      result.status = "down";
    }

    return result;
  }
}
