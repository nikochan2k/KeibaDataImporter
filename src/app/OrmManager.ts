import { EntityManager } from "typeorm";
import { dataSource } from "./DataSource";

/**
 * プロパティに DataSource の EntityManager を差し込むデコレーター。
 */
export function OrmManager() {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: (): EntityManager => dataSource.manager,
      configurable: true
    });
  };
}

/**
 * プロパティに指定エンティティの Repository を差し込むデコレーター。
 */
export function OrmRepository(entity: Function) {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: () => dataSource.getRepository(entity),
      configurable: true
    });
  };
}
