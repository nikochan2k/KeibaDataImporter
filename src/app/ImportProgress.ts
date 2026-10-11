import { Injectable } from "@nestjs/common";

/** 取り込みの進捗を受け取る側 */
export interface ImportProgressSink {
  fileStarted(basename: string): void;
  fileFinished(basename: string): void;
  fileFailed(basename: string, message: string): void;
  /** 取り込み対象と判断できず、読まなかったファイル */
  fileSkipped(basename: string, reason: string): void;
}

/**
 * Importer から、いま走っている取り込みジョブへ進捗を伝える。
 * 取り込みは一度にひとつしか動かさないので、受け取る側はひとつだけ取り付ける。
 */
@Injectable()
export class ImportProgress implements ImportProgressSink {
  private sink?: ImportProgressSink;

  public attach(sink: ImportProgressSink) {
    this.sink = sink;
  }

  public detach() {
    this.sink = undefined;
  }

  public fileStarted(basename: string) {
    this.sink?.fileStarted(basename);
  }

  public fileFinished(basename: string) {
    this.sink?.fileFinished(basename);
  }

  public fileFailed(basename: string, message: string) {
    this.sink?.fileFailed(basename, message);
  }

  public fileSkipped(basename: string, reason: string) {
    this.sink?.fileSkipped(basename, reason);
  }
}
