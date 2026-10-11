import { Module } from "@nestjs/common";
import { ApiModule } from "./api/ApiModule";
import { ImporterModule } from "./ImporterModule";

@Module({ imports: [ImporterModule, ApiModule] })
export class AppModule {}
