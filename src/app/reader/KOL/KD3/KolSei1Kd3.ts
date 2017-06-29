import { Inject, Service } from "typedi";
import * as $R from "../../../converters/Race";
import { Baken } from "../../../converters/RaceHaitou";
import * as $RK from "../../../converters/RaceKeika";
import { RaceDao } from "../../../daos/RaceDao";
import { Race } from "../../../entities/Race";
import { RaceClass } from "../../../entities/RaceClass";
import { RaceKeika } from "../../../entities/RaceKeika";
import { RaceLapTime } from "../../../entities/RaceLapTime";
import { DataCache } from "../../DataCache";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import { KeikaTool } from "../../KeikaTool";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolSei1Kd3 extends DataToImport {

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private keikaTool: KeikaTool;

  @Inject()
  private raceDao: RaceDao;

  protected getBufferLength() {
    return 3200;
  }

  protected async save(buffer: Buffer, cache: DataCache) {
    const race = await this.kolRaceTool.getRace(buffer);
    const dataSakuseiNengappi = readDate(buffer, 2910, 8);
    if (race.KolSeisekiSakuseiNengappi) {
      if (dataSakuseiNengappi <= race.KolSeisekiSakuseiNengappi) {
        this.logger.debug("既に最新のレース成績データが格納されています: " + race.Id);
        return;
      } else {
        await this.kolRaceTool.deleteOldSeiseki(race);
      }
    }
    race.KolSeisekiSakuseiNengappi = dataSakuseiNengappi;

    const raceClass = await this.saveRaceClass(buffer);
    await this.saveRace(buffer, race, raceClass);
    await this.saveRaceShoukin(buffer, race);
    await this.saveRaceLapTime(buffer, race, raceClass);
    await this.saveRaceKeika(buffer, race, cache);
    await this.saveRaceHaitou(buffer, race);
  }

  protected async saveRace(buffer: Buffer, race: Race, raceClass: RaceClass) {
    race.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    race.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
    race.RaceClassId = raceClass.Id;
    race.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 75, 2);
    const betteiBareiHandiShousai = readStr(buffer, 77, 18);
    if (race.BetteiBareiHandi === null) {
      race.BetteiBareiHandi = $R.betteiBareiHandi2.toCodeFromKol(betteiBareiHandiShousai);
    }
    if (race.BetteiBareiHandi === null) {
      race.BetteiBareiHandiReigai = betteiBareiHandiShousai;
    }
    const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 95, 2);
    const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 97, 2);
    race.JoukenFuka = this.tool.getJoukenFuka(joukenFuka1, joukenFuka2);
    race.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 100, 1);
    if (race.JoukenNenreiSeigen === null) {
      race.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 99, 1);
    }
    race.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    race.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 116, 1);
    race.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 117, 1);
    race.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 118, 1);
    race.Course = $R.course.toCodeFromKol(buffer, 119, 1);
    race.Kyori = readPositiveInt(buffer, 120, 4);
    race.CourseRecord = await this.kolRaceTool.getRecord(buffer, 125, 0);
    race.KyoriRecord = await this.kolRaceTool.getRecord(buffer, 178, 231);
    race.RaceRecord = await this.kolRaceTool.getRecord(buffer, 233, 286);
    race.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 360, 1);
    race.YoteiHassouJikan = readStr(buffer, 361, 5);
    race.Tousuu = readPositiveInt(buffer, 366, 2);
    race.TorikeshiTousuu = readInt(buffer, 368, 2);
    race.Pace = $R.pace.toCodeFromKol(buffer, 378, 1);
    race.Tenki = $R.tenki.toCodeFromKol(buffer, 379, 1);
    race.Baba = $R.baba.toCodeFromKol(buffer, 380, 1);
    race.Seed = $R.seed.toCodeFromKol(buffer, 381, 1);
    if (raceClass.HeichiShougai === 1) { // 障害
      race.ShougaiHeikin1F = readDouble(buffer, 398, 4, 0.1);
    }

    const hassouJoukyouArray: string[] = [];
    let hassouJoukyou: string;
    for (let i = 0, offset = 1473; i < 6; i++ , offset += 80) {
      hassouJoukyou = readStr(buffer, offset, 80);
      if (hassouJoukyou) {
        hassouJoukyouArray.push(hassouJoukyou);
      }
    }
    hassouJoukyou = hassouJoukyouArray.join("\n");
    if (hassouJoukyou) {
      race.HassouJoukyou = hassouJoukyou;
    }

    if (!race.KolShutsubahyouSakuseiNengappi) {
      race.SuiteiTimeRyou = readTime(buffer, 370, 4);
      race.SuiteiTimeOmoFuryou = readTime(buffer, 374, 4);
    }

    await this.entityManager.save(race);
  }

  protected saveRaceClass(buffer: Buffer) {
    const raceClass = new RaceClass();
    raceClass.KouryuuFlag = $R.kouryuuFlag.toCodeFromKol(buffer, 22, 1);
    raceClass.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    raceClass.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    raceClass.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    raceClass.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 29, 30);
    raceClass.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 59, 14);
    raceClass.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    raceClass.JoukenKei = $R.joukenKei.toCodeFromKol(buffer, 99, 1);
    raceClass.Jouken1 = $R.jouken.toCodeFromKol(buffer, 101, 5);
    if (raceClass.ChuuouChihouGaikoku !== 0) {
      raceClass.Kumi1 = readPositiveInt(buffer, 106, 2);
      raceClass.IjouIkaMiman = $R.ijouIkaMiman.toCodeFromKol(buffer, 108, 1);
      raceClass.Jouken2 = $R.jouken.toCodeFromKol(buffer, 109, 5);
      raceClass.Kumi2 = readPositiveInt(buffer, 114, 2);
    }
    return this.raceDao.saveRaceClass(raceClass);
  }

  protected async saveRaceShoukin(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceShoukin(buffer, race, [
      { chakujun: 1, offset: 288, length: 9, fukashou: 0 },
      { chakujun: 2, offset: 297, length: 9, fukashou: 0 },
      { chakujun: 3, offset: 306, length: 9, fukashou: 0 },
      { chakujun: 4, offset: 315, length: 9, fukashou: 0 },
      { chakujun: 5, offset: 324, length: 9, fukashou: 0 },
      { chakujun: 5, offset: 333, length: 9, fukashou: 0 },
      { chakujun: 5, offset: 342, length: 9, fukashou: 0 },
      { chakujun: 1, offset: 351, length: 9, fukashou: 1 },
    ], 1);
  }

  protected async saveRaceLapTime(buffer: Buffer, race: Race, raceClass: RaceClass) {
    const lapTime1 = readDouble(buffer, 402, 3, 0.1);
    if (lapTime1) {
      await this.saveNormalRaceLapTime(buffer, race);
    } else {
      if (raceClass.HeichiShougai === 1) {
        await this.saveShougaiRaceLapTime(buffer, race);
      } else {
        const chuuouChihouGaikoku = raceClass.ChuuouChihouGaikoku;
        if (chuuouChihouGaikoku === 2 || chuuouChihouGaikoku === 3) {
          await this.saveChihouRaceLapTime(buffer, race);
        }
      }
    }
  }

  protected async saveNormalRaceLapTime(buffer: Buffer, race: Race) {
    const end = Math.ceil(race.Kyori / 200.0);
    const odd = (race.Kyori % 200 !== 0);
    let shuuryouKyori = 0;
    let index = 402;
    for (let i = 0; i < end; i++ , index += 3) {
      const lapTime = readDouble(buffer, index, 3, 0.1);
      if (!lapTime) {
        continue;
      }
      const raceLapTime = new RaceLapTime();
      raceLapTime.Id = race.Id * 100 + i;
      raceLapTime.Race = race;
      raceLapTime.KaishiKyori = shuuryouKyori;
      shuuryouKyori = (i === 0 && odd) ? 100 : (shuuryouKyori + 200);
      raceLapTime.ShuuryouKyori = shuuryouKyori;
      raceLapTime.LapTime = lapTime;
      await this.entityManager.save(raceLapTime);
    }
  }

  protected async saveShougaiRaceLapTime(buffer: Buffer, race: Race) {
    const raceLapTime = new RaceLapTime();

    raceLapTime.Race = race;
    raceLapTime.ShuuryouKyori = race.Kyori;

    let lapTime: number;

    lapTime = readDouble(buffer, 382, 5, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 1;
      raceLapTime.KaishiKyori = race.Kyori - 1600;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 388, 4, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 2;
      raceLapTime.KaishiKyori = race.Kyori - 800;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 393, 4, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 3;
      raceLapTime.KaishiKyori = race.Kyori - 600;
      await this.entityManager.save(raceLapTime);
    }
  }

  protected async saveChihouRaceLapTime(buffer: Buffer, race: Race) {
    const raceLapTime = new RaceLapTime();

    raceLapTime.Race = race;

    let lapTime: number;

    lapTime = readDouble(buffer, 441, 3, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 1;
      raceLapTime.KaishiKyori = 0;
      raceLapTime.ShuuryouKyori = 600;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 444, 3, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 2;
      raceLapTime.KaishiKyori = 0;
      raceLapTime.ShuuryouKyori = 800;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 447, 3, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 3;
      raceLapTime.KaishiKyori = 0;
      raceLapTime.ShuuryouKyori = 600;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 450, 3, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 4;
      raceLapTime.KaishiKyori = race.Kyori - 800;
      raceLapTime.ShuuryouKyori = race.Kyori;
      await this.entityManager.save(raceLapTime);
    }

    lapTime = readDouble(buffer, 453, 3, 0.1);
    if (lapTime) {
      raceLapTime.Id = race.Id * 100 + 5;
      raceLapTime.KaishiKyori = race.Kyori - 600;
      raceLapTime.ShuuryouKyori = race.Kyori;
      await this.entityManager.save(raceLapTime);
    }
  }

  protected async saveRaceKeika(buffer: Buffer, race: Race, cache: DataCache) {
    for (let bangou = 1, offset = 456; bangou <= 9; bangou++ , offset += 113) {
      const keika = readStr(buffer, offset + 3, 110);
      if (!keika) {
        continue;
      }
      const raceKeika = new RaceKeika();
      raceKeika.Id = race.Id * 10 + bangou;
      raceKeika.Race = race;
      raceKeika.Midashi1 = $RK.midashi1.toCodeFromKol(buffer, offset, 1);
      raceKeika.Midashi2 = $RK.midashi2.toCodeFromKol(buffer, offset + 1, 2);
      raceKeika.Keika = keika;
      await this.entityManager.save(raceKeika);

      const shussoubaKeikaList = this.keikaTool.parseRaceKeika(raceKeika);
      shussoubaKeikaList.forEach((shussoubaKeika) => {
        cache.addKeika(shussoubaKeika.Shussouba.Id, shussoubaKeika);
      });
    }
  }

  protected async saveRaceHaitou(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceHaitou(
      buffer, race,
      [
        { baken: Baken.Tanshou, bangou1: 2100, bangou1Len: 2, haitou: 2102, haitouLen: 6 },
        { baken: Baken.Tanshou, bangou1: 2108, bangou1Len: 2, haitou: 2110, haitouLen: 6 },
        { baken: Baken.Tanshou, bangou1: 2116, bangou1Len: 2, haitou: 2118, haitouLen: 6 },
        { baken: Baken.Fukushou, bangou1: 2124, bangou1Len: 2, haitou: 2126, haitouLen: 6 },
        { baken: Baken.Fukushou, bangou1: 2132, bangou1Len: 2, haitou: 2134, haitouLen: 6 },
        { baken: Baken.Fukushou, bangou1: 2140, bangou1Len: 2, haitou: 2142, haitouLen: 6 },
        { baken: Baken.Fukushou, bangou1: 2148, bangou1Len: 2, haitou: 2150, haitouLen: 6 },
        { baken: Baken.Fukushou, bangou1: 2156, bangou1Len: 2, haitou: 2158, haitouLen: 6 },
        {
          baken: Baken.Wakuren, bangou1: 2164, bangou1Len: 1, bangou2: 2165,
          bangou2Len: 1, haitou: 2166, haitouLen: 6, ninki: 2172, ninkiLen: 2
        },
        {
          baken: Baken.Wakuren, bangou1: 2174, bangou1Len: 1, bangou2: 2175,
          bangou2Len: 1, haitou: 2176, haitouLen: 6, ninki: 2182, ninkiLen: 2
        },
        {
          baken: Baken.Wakuren, bangou1: 2184, bangou1Len: 1, bangou2: 2185,
          bangou2Len: 1, haitou: 2186, haitouLen: 6, ninki: 2192, ninkiLen: 2
        },
        {
          baken: Baken.Umaren, bangou1: 2194, bangou1Len: 2, bangou2: 2196,
          bangou2Len: 2, haitou: 2198, haitouLen: 7, ninki: 2205, ninkiLen: 3
        },
        {
          baken: Baken.Umaren, bangou1: 2208, bangou1Len: 2, bangou2: 2210,
          bangou2Len: 2, haitou: 2212, haitouLen: 7, ninki: 2219, ninkiLen: 3
        },
        {
          baken: Baken.Umaren, bangou1: 2222, bangou1Len: 2, bangou2: 2224,
          bangou2Len: 2, haitou: 2226, haitouLen: 7, ninki: 2233, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2236, bangou1Len: 2, bangou2: 2238,
          bangou2Len: 2, haitou: 2240, haitouLen: 7, ninki: 2247, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2250, bangou1Len: 2, bangou2: 2252,
          bangou2Len: 2, haitou: 2254, haitouLen: 7, ninki: 2261, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2264, bangou1Len: 2, bangou2: 2266,
          bangou2Len: 2, haitou: 2268, haitouLen: 7, ninki: 2275, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2278, bangou1Len: 2, bangou2: 2280,
          bangou2Len: 2, haitou: 2282, haitouLen: 7, ninki: 2289, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2292, bangou1Len: 2, bangou2: 2294,
          bangou2Len: 2, haitou: 2296, haitouLen: 7, ninki: 2303, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2306, bangou1Len: 2, bangou2: 2308,
          bangou2Len: 2, haitou: 2310, haitouLen: 7, ninki: 2317, ninkiLen: 3
        },
        {
          baken: Baken.Wide, bangou1: 2320, bangou1Len: 2, bangou2: 2322,
          bangou2Len: 2, haitou: 2324, haitouLen: 7, ninki: 2331, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2334, bangou1Len: 2, bangou2: 2336,
          bangou2Len: 2, haitou: 2338, haitouLen: 7, ninki: 2345, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2348, bangou1Len: 2, bangou2: 2350,
          bangou2Len: 2, haitou: 2352, haitouLen: 7, ninki: 2359, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2362, bangou1Len: 2, bangou2: 2364,
          bangou2Len: 2, haitou: 2366, haitouLen: 7, ninki: 2373, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2376, bangou1Len: 2, bangou2: 2378,
          bangou2Len: 2, haitou: 2380, haitouLen: 7, ninki: 2345, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2390, bangou1Len: 2, bangou2: 2392,
          bangou2Len: 2, haitou: 2394, haitouLen: 7, ninki: 2401, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, bangou1: 2404, bangou1Len: 2, bangou2: 2406,
          bangou2Len: 2, haitou: 2408, haitouLen: 7, ninki: 2415, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, bangou1: 2418, bangou1Len: 2, bangou2: 2420, bangou2Len: 2, bangou3: 2422,
          bangou3Len: 2, haitou: 2424, haitouLen: 7, ninki: 2431, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, bangou1: 2434, bangou1Len: 2, bangou2: 2436, bangou2Len: 2, bangou3: 2438,
          bangou3Len: 2, haitou: 2440, haitouLen: 7, ninki: 2447, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, bangou1: 2450, bangou1Len: 2, bangou2: 2452, bangou2Len: 2, bangou3: 2454,
          bangou3Len: 2, haitou: 2456, haitouLen: 7, ninki: 2463, ninkiLen: 3
        },
        {
          baken: Baken.Sanrentan, bangou1: 2466, bangou1Len: 2, bangou2: 2468, bangou2Len: 2, bangou3: 2470,
          bangou3Len: 2, haitou: 2472, haitouLen: 9, ninki: 2481, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, bangou1: 2485, bangou1Len: 2, bangou2: 2487, bangou2Len: 2, bangou3: 2489,
          bangou3Len: 2, haitou: 2491, haitouLen: 9, ninki: 2500, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, bangou1: 2504, bangou1Len: 2, bangou2: 2506, bangou2Len: 2, bangou3: 2508,
          bangou3Len: 2, haitou: 2510, haitouLen: 9, ninki: 2519, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, bangou1: 2523, bangou1Len: 2, bangou2: 2525, bangou2Len: 2, bangou3: 2527,
          bangou3Len: 2, haitou: 2529, haitouLen: 9, ninki: 2538, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, bangou1: 2542, bangou1Len: 2, bangou2: 2544, bangou2Len: 2, bangou3: 2546,
          bangou3Len: 2, haitou: 2548, haitouLen: 9, ninki: 2557, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, bangou1: 2561, bangou1Len: 2, bangou2: 2563, bangou2Len: 2, bangou3: 2565,
          bangou3Len: 2, haitou: 2567, haitouLen: 9, ninki: 2576, ninkiLen: 4
        },
      ]
    );
  }
}