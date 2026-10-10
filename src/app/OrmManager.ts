import { AsyncLocalStorage } from "node:async_hooks";
import type { EntityManager, EntityTarget, ObjectLiteral } from "typeorm";
import { dataSource } from "./DataSource";

/**
 * トランザクション中の EntityManager。
 * トランザクションの中で実行された処理(非同期の続きも含む)は、DAO や Tool を変更しなくても
 * 自動的にこの EntityManager を使う。
 */
const transactionStorage = new AsyncLocalStorage<EntityManager>();

export function currentManager(): EntityManager {
  return transactionStorage.getStore() || dataSource.manager;
}

/**
 * fn をひとつのトランザクションで実行します。fn が失敗するとロールバックされます。
 * 入れ子で呼ばれたときは、外側のトランザクションに加わります。
 */
export function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  if (transactionStorage.getStore()) {
    return fn();
  }
  return dataSource.transaction((manager) => transactionStorage.run(manager, fn));
}

/**
 * プロパティに DataSource の EntityManager を差し込むデコレーター。
 */
export function OrmManager() {
  return (target: object, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: (): EntityManager => currentManager(),
      configurable: true,
    });
  };
}

/**
 * プロパティに指定エンティティの Repository を差し込むデコレーター。
 */
export function OrmRepository(entity: EntityTarget<ObjectLiteral>) {
  return (target: object, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: () => currentManager().getRepository(entity),
      configurable: true,
    });
  };
}
