import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ImportJobService } from "./ImportJobService";
import { LocalOnlyGuard } from "./LocalOnlyGuard";

@Controller("api/imports")
@UseGuards(LocalOnlyGuard)
export class ImportController {
  @Inject()
  private jobs: ImportJobService;

  /** 取り込みジョブを開始する。IMPORT_ROOT 配下の絶対パスを渡す */
  @Post()
  @HttpCode(202)
  public start(@Body() body: { path?: unknown }) {
    return this.jobs.start(body?.path);
  }

  @Get()
  public list() {
    return this.jobs.list();
  }

  /** 取り込みログを from 番目から返す */
  @Get(":id/logs")
  public logs(@Param("id") id: string, @Query("from") from?: string) {
    const start = Number(from ?? 0);
    return this.jobs.logsOf(id, Number.isInteger(start) && start > 0 ? start : 0);
  }

  @Get(":id")
  public get(@Param("id") id: string) {
    return this.jobs.get(id);
  }
}
