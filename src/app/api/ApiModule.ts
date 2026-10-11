import { Module } from "@nestjs/common";
import { ImporterModule } from "../ImporterModule";
import { ImportController } from "./ImportController";
import { ImportJobService } from "./ImportJobService";

@Module({
  imports: [ImporterModule],
  controllers: [ImportController],
  providers: [ImportJobService],
})
export class ApiModule {}
