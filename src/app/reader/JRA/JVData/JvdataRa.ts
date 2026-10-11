import { Inject, Service } from "typedi";
import * as $R from "../../../converters/Race";
import { Race } from "../../../entities/Race";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { readInt, readPositiveDouble, readPositiveInt, readRaw } from "../../Reader";
import { Tool } from "../../Tool";
import { getJraTrack } from "../JraTrack";
import {
  hasSeiseki,
  JvdataRaceTool,
  jvdataHonShoukinOffset,
  jvdataYoubiOffset,
} from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * レース詳細 (RA)。
 * 変更前の値(変更前グレード、距離、トラック、発走時刻など)、前 3・4 ハロン、コーナー通過順位、
 * レコード更新区分は取り込まない。
 */
@Service()
export class JvdataRa extends JvdataRecord {
  public readonly id = "RA";
  public readonly length = 1272;

  @Inject()
  private tool: Tool;

  @Inject()
  private jvdataRaceTool: JvdataRaceTool;

  public async save(buffer: Buffer) {
    if (!this.isActive(buffer)) {
      return;
    }
    const kaisai = await this.jvdataRaceTool.saveKaisai(buffer, jvdataYoubiOffset);
    if (!kaisai) {
      return;
    }
    const toBe = this.jvdataRaceTool.createRaceWith(buffer, kaisai.Id);
    if (!toBe) {
      return;
    }
    const asIs = await this.entityManager.findOneBy(Race, { Id: toBe.Id });
    // 出走馬名表のレース詳細は項目が空白なので、既存の値を消さないようにする
    const race = await this.jvdataRaceTool.saveOrUpdateRace(asIs, toBe, true);
    await this.jvdataRaceTool.saveRaceMeiOf(buffer, race);

    if (hasSeiseki(this.getKubun(buffer))) {
      await this.saveRaceSeiseki(buffer, race);
      await this.saveRaceLapTime(buffer, race);
    }
  }

  private async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = new RaceSeiseki();
    toBe.Id = race.Id;
    const shoukin = (i: number) => readPositiveInt(buffer, jvdataHonShoukinOffset + i * 8, 8, 100);
    toBe.Shoukin1Chaku = shoukin(0);
    toBe.Shoukin2Chaku = shoukin(1);
    toBe.Shoukin3Chaku = shoukin(2);
    toBe.Shoukin4Chaku = shoukin(3);
    toBe.Shoukin5Chaku = shoukin(4);
    toBe.Shoukin5ChakuDouchaku = shoukin(5);
    toBe.Shoukin5ChakuDouchaku2 = shoukin(6);
    const touroku = readInt(buffer, 881, 2);
    const shusso = readInt(buffer, 883, 2);
    if (touroku !== null && shusso !== null && 0 < shusso) {
      toBe.TorikeshiTousuu = touroku - shusso;
    }
    toBe.Tenki = $R.tenki.toCodeFromJvData(buffer, 887, 1);
    // 馬場状態は、芝とダートがある。障害の芝→ダートはダートの馬場状態を使う
    const track = readRaw(buffer, 705, 2);
    const dirt = getJraTrack(track)?.dirtShiba === $R.DirtShiba.Dirt || track === "52";
    const shiba = $R.baba.toCodeFromJvData(buffer, 888, 1);
    const dart = $R.baba.toCodeFromJvData(buffer, 889, 1);
    toBe.Baba = (dirt ? (dart ?? shiba) : (shiba ?? dart)) ?? undefined;
    const asIs = await this.entityManager.findOneBy(RaceSeiseki, { Id: race.Id });
    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe, true);
  }

  private async saveRaceLapTime(buffer: Buffer, race: Race) {
    if (race.HeichiShougai === $R.HeichiShougai.Shougai) {
      // 障害: 先頭馬の 1 マイル通過タイム (分 1 桁と秒 3 桁)、後 4 ハロン、後 3 ハロン
      await this.jvdataRaceTool.saveShougaiLapTime(
        race,
        readInt(buffer, 965, 1),
        readPositiveDouble(buffer, 966, 3, 0.1),
        readPositiveDouble(buffer, 978, 3, 0.1),
        readPositiveDouble(buffer, 975, 3, 0.1),
      );
      return;
    }
    await this.jvdataRaceTool.saveRaceLapTime(buffer, 890, race, 25);
  }
}
