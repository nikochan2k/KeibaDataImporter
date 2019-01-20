import { Inject } from "typedi";
import { JrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbShussoubaTool } from "./JrdbShussoubaTool";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { ChoukyoushiDao } from "../../daos/ChoukyoushiDao";
import { JinmeiDao } from "../../daos/JinmeiDao";
import { KishuDao } from "../../daos/KishuDao";
import { UmaDao } from "../../daos/UmaDao";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { DataToImport } from "../DataToImport";
import { readDouble, readInt, readPositiveInt } from "../Reader";
import { RaceShussoubaId } from "../ShussoubaTool";
import { Tool } from "../Tool";

export abstract class Se$ extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  @Inject()
  protected jrdbOddsHaitouTool: JrdbOddsHaitouTool;

  @Inject()
  protected kishuDao: KishuDao;

  @Inject()
  protected jinmeiDao: JinmeiDao;

  @Inject()
  protected umaDao: UmaDao;

  @Inject()
  protected choukyoushiDao: ChoukyoushiDao;

  public async save(buffer: Buffer) {
    const rsId = this.jrdbShussoubaTool.getRaceShussoubaId(buffer, 8);

    const raceSeiseki = await this.entityManager.findOne(RaceSeiseki, rsId.raceId);
    if (raceSeiseki && raceSeiseki.Jrdb) {
      // 既に成績データが格納されている場合
      return;
    }
    await this.saveRaceSeiseki(buffer, rsId.raceId, raceSeiseki);
    await this.saveShussoubaSeiseki(buffer, rsId.shussoubaId);
    await this.saveShussoubaHyouka(buffer, rsId.shussoubaId);
    await this.saveOddsHaitou(buffer, rsId);
    await this.saveShussoubaTsuukaJuni(buffer, rsId.shussoubaId);
  }

  protected async saveRaceSeiseki(buffer: Buffer, raceId: number, asIs: RaceSeiseki) {
    const toBe = new RaceSeiseki();
    toBe.Id = raceId;
    this.setRaceSeiseki(buffer, toBe);
    toBe.Jrdb = 1;

    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.Baba = $R.baba.toCodeFromJrdb(buffer, 69, 1);
    toBe.BabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 70, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 221, 1);
    toBe.PaceShisuu = readDouble(buffer, 238, 5);
    toBe.Tenki = $R.tenki.toCodeFromJrdb(buffer, 338, 1);
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, shussoubaId: number) {
    const toBe = new ShussoubaSeiseki();
    toBe.Id = shussoubaId;
    this.setShussoubaSeiseki(buffer, toBe);
    const asIs = await this.entityManager.findOne(ShussoubaSeiseki, toBe.Id);
    await this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }

  protected setShussoubaSeiseki(buffer: Buffer, toBe: ShussoubaSeiseki) {
    toBe.KakuteiChakujun = readPositiveInt(buffer, 140, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJrdb(buffer, 142, 1);
    toBe.Time = readDouble(buffer, 143, 4, 0.1);
    toBe.Kinryou = readDouble(buffer, 147, 3, 0.1);
    const kyori = readInt(buffer, 62, 4);
    if (1200 <= kyori) {
      toBe.Ten3F = readDouble(buffer, 258, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readDouble(buffer, 261, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.Bataijuu = readPositiveInt(buffer, 332, 3);
    toBe.Zougen = readInt(buffer, 335, 3);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussoubaId: number) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = shussoubaId;
    this.setShussoubaHyouka(buffer, toBe);

    const asIs = await this.entityManager.findOne(ShussoubaHyouka, shussoubaId);
    await this.tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected setShussoubaHyouka(buffer: Buffer, toBe: ShussoubaHyouka) {
    toBe.Idm = readInt(buffer, 182, 3);
    toBe.IdmSoten = readInt(buffer, 185, 3);
    toBe.IdmBabasa = readInt(buffer, 188, 3);
    toBe.IdmPace = readInt(buffer, 191, 3);
    toBe.IdmDeokure = readInt(buffer, 194, 3);
    toBe.IdmIchidori = readInt(buffer, 197, 3);
    toBe.IdmFuri = readInt(buffer, 200, 3);
    toBe.IdmTen3FFuri = readInt(buffer, 203, 3);
    toBe.IdmDouchuuFuri = readInt(buffer, 206, 3);
    toBe.IdmAgari3FFuri = readInt(buffer, 209, 3);
    toBe.IdmRace = readInt(buffer, 212, 3);
    toBe.CourseDori = $S.ichi.toCodeFromJrdb(buffer, 215, 1);
    toBe.JoushoudoCode = $S.joushoudo.toCodeFromJrdb(buffer, 216, 1);
    toBe.ClassCode = $S.classCode.toCodeFromJrdb(buffer, 217, 2);
    toBe.BataiCode = $S.bataiCode.toCodeFromJrdb(buffer, 219, 1);
    toBe.KehaiCode = $S.bataiCode.toCodeFromJrdb(buffer, 220, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 222, 1);
    toBe.Ten3FShisuu = readDouble(buffer, 223, 5);
    toBe.Agari3FShisuu = readDouble(buffer, 228, 5);
    toBe.PaceShisuu = readDouble(buffer, 233, 5);

    toBe.Kyakushitsu = $S.kyakushitsu.toCodeFromJrdb(buffer, 340, 1);
  }

  protected async saveOddsHaitou(buffer: Buffer, rsId: RaceShussoubaId) {
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 174,
      OddsLength: 6,
      NinkiOffset: 180
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 290,
      OddsLength: 6
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 296,
      OddsLength: 6
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, rsId, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 302,
      OddsLength: 6
    });
  }

  protected async saveShussoubaTsuukaJuni(buffer: Buffer, shussoubaId: number) {
    for (let bangou = 1, offset = 308; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null || 28 < juni) {
        continue;
      }
      shussoubaTsuukaJuni.Id = shussoubaId * (2 ** 3) + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussoubaId;
      shussoubaTsuukaJuni.Bangou = bangou;
      shussoubaTsuukaJuni.Juni = juni;
      await this.entityManager.save(shussoubaTsuukaJuni);
    }
  }
}