import { Inject } from "typedi";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { Baken, Kakutei } from "../../converters/Common";
import { OddsHaitou } from "../../entities/OddsHaitou";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readPositiveInt } from "../Reader";

export abstract class Hj$ extends DataToImport {

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    await this.saveTanshou(buffer, raceId);
    await this.saveFukushou(buffer, raceId);
    await this.saveWakuren(buffer, raceId);
    await this.saveUmaren(buffer, raceId);
    await this.saveWide(buffer, raceId);
    await this.saveUmatan(buffer, raceId);
    await this.saveSanrenpuku(buffer, raceId);
    await this.saveSanrentan(buffer, raceId);
  }

  protected async saveTanshou(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 8; i < 3; i++ , offset += 9) {
      const umaban = readPositiveInt(buffer, offset, 2);
      if (!umaban) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Tanshou;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban;
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 2, 7);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveFukushou(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 35; i < 5; i++ , offset += 9) {
      const umaban = readPositiveInt(buffer, offset, 2);
      if (!umaban) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Fukushou;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban;
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 2, 7);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveWakuren(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 80; i < 3; i++ , offset += 9) {
      const wakuban1 = readPositiveInt(buffer, offset, 1);
      if (!wakuban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Wakuren;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = wakuban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 1, 1);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 2, 7);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveUmaren(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 107; i < 3; i++ , offset += 12) {
      const umaban1 = readPositiveInt(buffer, offset, 2);
      if (!umaban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Umaren;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 2, 2);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 4, 8);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveWide(buffer: Buffer, raceId: number) {
    for (let i = 0, offset = 143; i < 7; i++ , offset += 12) {
      const umaban1 = readPositiveInt(buffer, offset, 2);
      if (!umaban1) {
        continue;
      }
      const oddsHaitou = new OddsHaitou();
      oddsHaitou.RaceId = raceId;
      oddsHaitou.Baken = Baken.Wide;
      oddsHaitou.Kakutei = Kakutei.Kakutei;
      oddsHaitou.Bangou1 = umaban1;
      oddsHaitou.Bangou2 = readPositiveInt(buffer, offset + 2, 2);
      oddsHaitou.Haitoukin = readPositiveInt(buffer, offset + 4, 8);
      await this.jrdbOddsHaitouTool.saveOddsHaitou(oddsHaitou);
    }
  }

  protected async saveUmatan(buffer: Buffer, raceId: number) {
  }

  protected async saveSanrenpuku(buffer: Buffer, raceId: number) {
  }

  protected async saveSanrentan(buffer: Buffer, raceId: number) {
  }
}