import "reflect-metadata";
import type { Type } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app/AppModule";

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

/** テストからプロバイダーを取り出す */
export const Container = {
  get: <T>(type: Type<T>): T => app.get(type, { strict: false }),
};
