import { Inject, Service } from "typedi";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { readDouble, readPositiveInt } from "../Reader";
import { ShussoubaInfo, ShussoubaTool } from "../ShussoubaTool";
import { KolRaceTool } from "./KolRaceTool";

@Service()
export class KolShussoubaTool extends ShussoubaTool {

  @Inject()
  private kolRaceTool: KolRaceTool;

  public getTimeSa(buffer: Buffer, offset: number) {
    const timeSa = readDouble(buffer, offset, 3, 0.1);
    if (99.8 <= timeSa) {
      return 0.0;
    }
    return timeSa;
  }

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number): Promise<ShussoubaInfo> {
    const race = await this.kolRaceTool.getRace(buffer);
    return super.getShussoubaInfo(buffer, umabanOffset, race);
  }

  public createShussouba(buffer: Buffer, umabanOffset: number) {
    const raceId = this.kolRaceTool.getRaceId(buffer);
    return super.createShussouba(buffer, umabanOffset, raceId);
  }

  public async saveShussoubaTsuukaJuni(buffer: Buffer, offset: number, shussouba: Shussouba) {
    for (let bangou = 1; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null) {
        continue;
      }
      if (1 <= juni && juni <= 28) {
        shussoubaTsuukaJuni.Juni = juni;
      } else if (juni === 31 || juni === 32) {
        shussoubaTsuukaJuni.Joukyou = juni;
      } else if (41 <= juni && juni <= 68) {
        shussoubaTsuukaJuni.Juni = juni - 40;
        shussoubaTsuukaJuni.Joukyou = 40;
      } else {
        this.logger.warn("不正な順位: " + juni);
        continue;
      }

      shussoubaTsuukaJuni.Id = shussouba.Id * (2 ** 3) + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussouba.Id;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.save(shussoubaTsuukaJuni);
    }
  }

}