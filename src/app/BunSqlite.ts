import { Database as BunDatabase } from "bun:sqlite";

/**
 * TypeORM の better-sqlite3 ドライバーに渡す、bun:sqlite の互換ラッパー。
 */
class Statement {
  constructor(private stmt: any) {}

  get reader(): boolean {
    return 0 < this.stmt.columnNames.length;
  }

  public all(...params: any[]) {
    return this.stmt.all(...params);
  }

  public run(...params: any[]) {
    return this.stmt.run(...params);
  }
}

export class BunSqliteDatabase {
  private db: BunDatabase;

  constructor(path: string, options: { readonly?: boolean } = {}) {
    this.db = new BunDatabase(
      path,
      options.readonly ? { readonly: true } : { create: true, readwrite: true },
    );
  }

  public prepare(query: string) {
    return new Statement(this.db.prepare(query));
  }

  public pragma(source: string) {
    return this.db.prepare(`PRAGMA ${source}`).all();
  }

  public exec(query: string) {
    this.db.exec(query);
  }

  public close() {
    this.db.close();
  }
}
