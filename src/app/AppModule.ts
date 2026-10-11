import { Module } from "@nestjs/common";
import { ImporterModule } from "./ImporterModule";

@Module({ imports: [ImporterModule] })
export class AppModule {}
