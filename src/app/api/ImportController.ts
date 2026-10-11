import { Body, Controller, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { ImportJobService } from "./ImportJobService";

@Controller("api/imports")
export class ImportController {
  @Inject()
  private jobs: ImportJobService;

  /** 取り込みジョブを開始する。IMPORT_ROOT からの相対パスか、その配下の絶対パスを渡す */
  @Post()
  @HttpCode(202)
  public start(@Body() body: { path?: unknown }) {
    return this.jobs.start(body?.path);
  }

  @Get()
  public list() {
    return this.jobs.list();
  }

  @Get(":id")
  public get(@Param("id") id: string) {
    return this.jobs.get(id);
  }
}
