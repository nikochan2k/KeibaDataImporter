import type { ImportTarget } from "./api/types";

/** 取り込みの進捗を受け取る側 */
export interface ImportProgressSink {
  fileStarted(basename: string, target: ImportTarget): void;
  fileFinished(basename: string, target: ImportTarget): void;
  /** target がないのは、データファイルを取り出す前 (zip / lzh を開けないなど) の失敗 */
  fileFailed(basename: string, message: string, target?: ImportTarget): void;
  /** 取り込み対象と判断できず、読まなかったファイル */
  fileSkipped(basename: string, reason: string): void;
  /** zip / lzh / 単独のデータファイルの処理を始めた */
  entryStarted(basename: string): void;
  /** zip / lzh / 単独のデータファイルをひとつ処理し終えた (中身の成否は問わない) */
  entryProcessed(basename: string): void;
}

/**
 * Importer から、いま走っている取り込みジョブへ進捗を伝える。
 * 取り込みは一度にひとつしか動かさないので、受け取る側はひとつだけ取り付ける。
 */
export class ImportProgress implements ImportProgressSink {
  private sink?: ImportProgressSink;

  /** 取り込みを止めるよう求められた理由。Importer と Traversal は、これがあれば次のファイルへ進まない */
  public stopReason?: string;

  public attach(sink: ImportProgressSink) {
    this.sink = sink;
    this.stopReason = undefined;
  }

  public detach() {
    this.sink = undefined;
  }

  /** 取り込みを止める。いま読んでいるファイルは最後まで読み、次のファイルから進まない */
  public stop(reason: string) {
    this.stopReason ??= reason;
  }

  public fileStarted(basename: string, target: ImportTarget) {
    this.sink?.fileStarted(basename, target);
  }

  public fileFinished(basename: string, target: ImportTarget) {
    this.sink?.fileFinished(basename, target);
  }

  public fileFailed(basename: string, message: string, target?: ImportTarget) {
    this.sink?.fileFailed(basename, message, target);
  }

  public fileSkipped(basename: string, reason: string) {
    this.sink?.fileSkipped(basename, reason);
  }

  public entryStarted(basename: string) {
    this.sink?.entryStarted(basename);
  }

  public entryProcessed(basename: string) {
    this.sink?.entryProcessed(basename);
  }
}

export const importProgress = new ImportProgress();
