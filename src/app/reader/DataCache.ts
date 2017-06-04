import { ShussoubaKeika } from "../entities/ShussoubaKeika";

export class DataCache {

  private shussoubaKeikaMap = new Map<number, ShussoubaKeika>();

  public addShussoubaKeika(shussoubaId: number, shussoubaKeika: ShussoubaKeika) {
    this.shussoubaKeikaMap.set(shussoubaId, shussoubaKeika);
  }

  public getShussoubaKeika(shussoubaId: number) {
    return this.shussoubaKeikaMap.get(shussoubaId);
  }

}