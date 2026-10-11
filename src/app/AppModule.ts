import { Module } from "@nestjs/common";
import { ApiModule } from "./api/ApiModule";
import { BrowseModule } from "./browse/BrowseModule";
import { ImporterModule } from "./ImporterModule";

@Module({ imports: [ImporterModule, ApiModule, BrowseModule] })
export class AppModule {}
