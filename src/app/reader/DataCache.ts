export class DataCache {

  private yosouTenkaiMap = new Map<number, number>();

  public addYosouTenkai(shussoubaId: number, tenkai: number) {
    this.yosouTenkaiMap.set(shussoubaId, tenkai);
  }

  public getYosouTenkai(shussoubaId: number) {
    return this.yosouTenkaiMap.get(shussoubaId);
  }
}