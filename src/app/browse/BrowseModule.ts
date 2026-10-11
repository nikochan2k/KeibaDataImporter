import { Module } from "@nestjs/common";
import { BrowseController } from "./BrowseController";
import { BrowseService } from "./BrowseService";

@Module({
  controllers: [BrowseController],
  providers: [BrowseService],
})
export class BrowseModule {}
