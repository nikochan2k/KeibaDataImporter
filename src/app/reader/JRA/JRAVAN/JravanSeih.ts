import { Inject, Injectable } from "@nestjs/common";
import { Baken, Kakutei } from "../../../converters/Common";
import { DataToImport } from "../../DataToImport";
import { HaitouInfo } from "../../OddsHaitouTool";
import { JravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { JravanRaceTool } from "./JravanRaceTool";

/** 成績Ｈ (JracSeih.dat): 馬単・3連複の払戻金 */
@Injectable()
export class JravanSeih extends DataToImport {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  @Inject()
  private jravanOddsHaitouTool: JravanOddsHaitouTool;

  protected getBufferLength() {
    return 159;
  }

  public async save(buffer: Buffer) {
    const raceId = this.jravanRaceTool.getRaceId(buffer);
    if (!raceId) {
      return;
    }
    await this.jravanOddsHaitouTool.saveRaceHaitou(
      buffer,
      raceId,
      Kakutei.Kakutei,
      JravanSeih.haitouInfos(),
    );
  }

  public static haitouInfos(): HaitouInfo[] {
    const infos: HaitouInfo[] = [];
    // 馬番1・2 (2+2) 払戻金(8) 人気順(3)
    for (let i = 0; i < 6; i++) {
      const o = 16 + i * 15;
      infos.push({
        baken: Baken.Umatan,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        bangou2: o + 2,
        bangou2Len: 2,
        haitou: o + 4,
        haitouLen: 8,
        ninki: o + 12,
        ninkiLen: 3,
      });
    }
    // 馬番1・2・3 (2+2+2) 払戻金(8) 人気順(3)
    for (let i = 0; i < 3; i++) {
      const o = 106 + i * 17;
      infos.push({
        baken: Baken.Sanrenpuku,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        bangou2: o + 2,
        bangou2Len: 2,
        bangou3: o + 4,
        bangou3Len: 2,
        haitou: o + 6,
        haitouLen: 8,
        ninki: o + 14,
        ninkiLen: 3,
      });
    }
    return infos;
  }
}
