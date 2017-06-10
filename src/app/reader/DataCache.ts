import { ShussoubaKeika } from "../entities/ShussoubaKeika";

export class DataCache {

  private keikaMap = new Map<number, ShussoubaKeika>();

  private yosouTenkaiMap = new Map<number, number>();

  public addKeika(shussoubaId: number, shussoubaKeika: ShussoubaKeika) {
    this.keikaMap.set(shussoubaId, shussoubaKeika);
  }

  public getKeika(shussoubaId: number) {
    return this.keikaMap.get(shussoubaId);
  }

  public addYosouTenkai(shussoubaId: number, tenkai: number) {
    this.yosouTenkaiMap.set(shussoubaId, tenkai);
  }

  public getYosouTenkai(shussoubaId: number) {
    return this.yosouTenkaiMap.get(shussoubaId);
  }
}