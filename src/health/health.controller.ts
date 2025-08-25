import { Controller, Get } from "@nestjs/common";
import AppDataSource from "../config/typeorm/data-source";

@Controller("healthz")
export class HealthController {
  @Get()
  async check() {
    const res: any = { status: "ok" };
    try {
      // DataSource가 초기화되지 않았다면 초기화
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await AppDataSource.query("SELECT 1");
      res.db = "up";
    } catch {
      res.db = "down";
      res.status = "down";
    }
    return res;
  }
}
