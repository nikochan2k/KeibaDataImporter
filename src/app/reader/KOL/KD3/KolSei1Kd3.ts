import { Inject, Service } from "typedi";
import { Baken } from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import * as $RK from "../../../converters/RaceKeika";
import { Race } from "../../../entities/Race";
import { RaceKeika } from "../../../entities/RaceKeika";
import { RaceLapTime } from "../../../entities/RaceLapTime";
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

  protected getBufferLength() {
    return 3200;
  }

  protected async save(buffer: Buffer) {
    const asIs = await this.kolRaceTool.getRace(buffer);
    if (asIs) {
      const dataSakuseiNengappi = readDate(buffer, 2910, 8);
      if (dataSakuseiNengappi <= asIs.KolSeisekiSakuseiNengappi) {
        this.logger.info("既に最新のレース成績データが格納されています: " + asIs.Id);
        return;
      }
    }

    const race = await this.saveRace(buffer, asIs);
    if (!race) {
      return;
    }
    await this.saveRaceLapTime(buffer, race);
    await this.saveRaceKeika(buffer, race);
    await this.saveRaceHassouJoukyou(buffer, race);
    await this.saveRaceHaitou(buffer, race);
  }

  protected async saveRace(buffer: Buffer, asIs: Race) {
    let toBe = this.kolRaceTool.createRace(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    toBe.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KouryuuFlag = $R.kouryuuFlag.toCodeFromKol(buffer, 22, 1);
    toBe.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    toBe.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 29, 30);
    toBe.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 59, 14);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 75, 2);
    const betteiBareiHandiShousai = readStr(buffer, 77, 18);
    if (toBe.BetteiBareiHandi === null) {
      toBe.BetteiBareiHandi = $R.betteiBareiHandi2.toCodeFromKol(betteiBareiHandiShousai);
    }
    if (toBe.BetteiBareiHandi === null) {
      toBe.BetteiBareiHandiReigai = betteiBareiHandiShousai;
    }
    const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 95, 2);
    const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 97, 2);
    toBe.JoukenFuka = this.tool.getJoukenFuka(joukenFuka1, joukenFuka2);
    toBe.JoukenKei = $R.joukenKei.toCodeFromKol(buffer, 99, 1);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 100, 1);
    if (toBe.JoukenNenreiSeigen === null) {
      toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 99, 1);
    }
    toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, 101, 5);
    if (toBe.ChuuouChihouGaikoku !== 0) { // 中央
      toBe.Kumi1 = readPositiveInt(buffer, 106, 2);
      toBe.IjouIkaMiman = $R.ijouIkaMiman.toCodeFromKol(buffer, 108, 1);
      toBe.Jouken2 = $R.jouken.toCodeFromKol(buffer, 109, 5);
      toBe.Kumi2 = readPositiveInt(buffer, 114, 2);
    }
    toBe.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 116, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 117, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 118, 1);
    toBe.Course = $R.course.toCodeFromKol(buffer, 119, 1);
    toBe.Kyori = readPositiveInt(buffer, 120, 4);
    const courceRecord = await this.kolRaceTool.getRecord(buffer, 125, 0);
    toBe.CourseRecordId = courceRecord && courceRecord.Id;
    const kyoriRecord = await this.kolRaceTool.getRecord(buffer, 178, 231);
    toBe.KyoriRecordId = kyoriRecord && kyoriRecord.Id;
    const raceRecord = await this.kolRaceTool.getRecord(buffer, 233, 286);
    toBe.RaceRecordId = raceRecord && raceRecord.Id;
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 288, 9);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 297, 9);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 306, 9);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 315, 9);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 324, 9);
    toBe.Shoukin5ChakuDouchaku = readPositiveInt(buffer, 333, 9);
    toBe.Shoukin5ChakuDouchaku2 = readPositiveInt(buffer, 342, 9);
    toBe.FukaShou = readPositiveInt(buffer, 351, 9);
    toBe.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 360, 1);
    toBe.YoteiHassouJikan = readStr(buffer, 361, 5);
    toBe.Tousuu = readPositiveInt(buffer, 366, 2);
    toBe.TorikeshiTousuu = readInt(buffer, 368, 2);
    toBe.SuiteiTimeRyou = readTime(buffer, 370, 4);
    toBe.SuiteiTimeOmoFuryou = readTime(buffer, 374, 4);
    toBe.Pace = $R.pace.toCodeFromKol(buffer, 378, 1);
    toBe.Tenki = $R.tenki.toCodeFromKol(buffer, 379, 1);
    toBe.Baba = $R.baba.toCodeFromKol(buffer, 380, 1);
    toBe.Seed = $R.seed.toCodeFromKol(buffer, 381, 1);
    if (toBe.HeichiShougai === 1) { // 障害
      toBe.ShougaiHeikin1F = readDouble(buffer, 398, 4, 0.1);
    }
    toBe.KolSeisekiSakuseiNengappi = readDate(buffer, 2910, 8);

    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Race, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }

    return toBe;
  }

  protected async saveRaceLapTime(buffer: Buffer, race: Race) {
    const lapTime1 = readDouble(buffer, 402, 3, 0.1);
    if (lapTime1) {
      await this.saveNormalRaceLapTime(buffer, race);
    } else {
      const heichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
      if (heichiShougai === 1) {
        await this.saveShougaiRaceLapTime(buffer, race);
      } else {
        const chuuouChihouGaikoku = race.ChuuouChihouGaikoku;
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
      raceLapTime.RaceId = race.Id;
      raceLapTime.KaishiKyori = shuuryouKyori;
      shuuryouKyori = (i === 0 && odd) ? 100 : (shuuryouKyori + 200);
      raceLapTime.ShuuryouKyori = shuuryouKyori;
      raceLapTime.LapTime = lapTime;
      await this.entityManager.save(raceLapTime);
    }
  }

  protected async saveShougaiRaceLapTime(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceLapTime(buffer, race,
      [
        { Offset: 382, Length: 5, KaishiKyori: race.Kyori - 1600, ShuuryouKyori: race.Kyori },
        { Offset: 388, Length: 4, KaishiKyori: race.Kyori - 800, ShuuryouKyori: race.Kyori },
        { Offset: 393, Length: 4, KaishiKyori: race.Kyori - 600, ShuuryouKyori: race.Kyori },
      ]
    );
  }

  protected async saveChihouRaceLapTime(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceLapTime(buffer, race,
      [
        { Offset: 441, Length: 3, KaishiKyori: 0, ShuuryouKyori: 600 },
        { Offset: 444, Length: 3, KaishiKyori: 0, ShuuryouKyori: 800 },
        { Offset: 447, Length: 3, KaishiKyori: 0, ShuuryouKyori: 1000 },
        { Offset: 450, Length: 3, KaishiKyori: race.Kyori - 800, ShuuryouKyori: race.Kyori },
        { Offset: 453, Length: 3, KaishiKyori: race.Kyori - 600, ShuuryouKyori: race.Kyori }
      ]
    );
  }

  protected async saveRaceKeika(buffer: Buffer, race: Race) {
    for (let bangou = 1, offset = 456; bangou <= 9; bangou++ , offset += 113) {
      const keika = readStr(buffer, offset + 3, 110);
      if (!keika) {
        continue;
      }
      const raceKeika = new RaceKeika();
      raceKeika.Id = race.Id * 10 + bangou;
      raceKeika.RaceId = race.Id;
      raceKeika.Midashi1 = $RK.midashi1.toCodeFromKol(buffer, offset, 1);
      raceKeika.Midashi2 = $RK.midashi2.toCodeFromKol(buffer, offset + 1, 2);
      raceKeika.Keika = keika;
      await this.entityManager.save(raceKeika);

      await this.keikaTool.parseRaceKeika(raceKeika);
    }
  }

  protected async saveRaceHassouJoukyou(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceHassouJoukyou(buffer, 1473, race);
  }

  protected async saveRaceHaitou(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceHaitou(
      buffer, race,
      [
        { baken: Baken.Tanshou, index: 1, bangou1: 2100, bangou1Len: 2, haitou: 2102, haitouLen: 6 },
        { baken: Baken.Tanshou, index: 2, bangou1: 2108, bangou1Len: 2, haitou: 2110, haitouLen: 6 },
        { baken: Baken.Tanshou, index: 3, bangou1: 2116, bangou1Len: 2, haitou: 2118, haitouLen: 6 },
        { baken: Baken.Fukushou, index: 1, bangou1: 2124, bangou1Len: 2, haitou: 2126, haitouLen: 6 },
        { baken: Baken.Fukushou, index: 2, bangou1: 2132, bangou1Len: 2, haitou: 2134, haitouLen: 6 },
        { baken: Baken.Fukushou, index: 3, bangou1: 2140, bangou1Len: 2, haitou: 2142, haitouLen: 6 },
        { baken: Baken.Fukushou, index: 4, bangou1: 2148, bangou1Len: 2, haitou: 2150, haitouLen: 6 },
        { baken: Baken.Fukushou, index: 5, bangou1: 2156, bangou1Len: 2, haitou: 2158, haitouLen: 6 },
        {
          baken: Baken.Wakuren, index: 1, bangou1: 2164, bangou1Len: 1, bangou2: 2165,
          bangou2Len: 1, haitou: 2166, haitouLen: 6, ninki: 2172, ninkiLen: 2
        },
        {
          baken: Baken.Wakuren, index: 2, bangou1: 2174, bangou1Len: 1, bangou2: 2175,
          bangou2Len: 1, haitou: 2176, haitouLen: 6, ninki: 2182, ninkiLen: 2
        },
        {
          baken: Baken.Wakuren, index: 3, bangou1: 2184, bangou1Len: 1, bangou2: 2185,
          bangou2Len: 1, haitou: 2186, haitouLen: 6, ninki: 2192, ninkiLen: 2
        },
        {
          baken: Baken.Umaren, index: 1, bangou1: 2194, bangou1Len: 2, bangou2: 2196,
          bangou2Len: 2, haitou: 2198, haitouLen: 7, ninki: 2205, ninkiLen: 3
        },
        {
          baken: Baken.Umaren, index: 2, bangou1: 2208, bangou1Len: 2, bangou2: 2210,
          bangou2Len: 2, haitou: 2212, haitouLen: 7, ninki: 2219, ninkiLen: 3
        },
        {
          baken: Baken.Umaren, index: 3, bangou1: 2222, bangou1Len: 2, bangou2: 2224,
          bangou2Len: 2, haitou: 2226, haitouLen: 7, ninki: 2233, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 1, bangou1: 2236, bangou1Len: 2, bangou2: 2238,
          bangou2Len: 2, haitou: 2240, haitouLen: 7, ninki: 2247, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 2, bangou1: 2250, bangou1Len: 2, bangou2: 2252,
          bangou2Len: 2, haitou: 2254, haitouLen: 7, ninki: 2261, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 3, bangou1: 2264, bangou1Len: 2, bangou2: 2266,
          bangou2Len: 2, haitou: 2268, haitouLen: 7, ninki: 2275, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 4, bangou1: 2278, bangou1Len: 2, bangou2: 2280,
          bangou2Len: 2, haitou: 2282, haitouLen: 7, ninki: 2289, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 5, bangou1: 2292, bangou1Len: 2, bangou2: 2294,
          bangou2Len: 2, haitou: 2296, haitouLen: 7, ninki: 2303, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 6, bangou1: 2306, bangou1Len: 2, bangou2: 2308,
          bangou2Len: 2, haitou: 2310, haitouLen: 7, ninki: 2317, ninkiLen: 3
        },
        {
          baken: Baken.Wide, index: 7, bangou1: 2320, bangou1Len: 2, bangou2: 2322,
          bangou2Len: 2, haitou: 2324, haitouLen: 7, ninki: 2331, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 1, bangou1: 2334, bangou1Len: 2, bangou2: 2336,
          bangou2Len: 2, haitou: 2338, haitouLen: 7, ninki: 2345, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 2, bangou1: 2348, bangou1Len: 2, bangou2: 2350,
          bangou2Len: 2, haitou: 2352, haitouLen: 7, ninki: 2359, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 3, bangou1: 2362, bangou1Len: 2, bangou2: 2364,
          bangou2Len: 2, haitou: 2366, haitouLen: 7, ninki: 2373, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 4, bangou1: 2376, bangou1Len: 2, bangou2: 2378,
          bangou2Len: 2, haitou: 2380, haitouLen: 7, ninki: 2345, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 5, bangou1: 2390, bangou1Len: 2, bangou2: 2392,
          bangou2Len: 2, haitou: 2394, haitouLen: 7, ninki: 2401, ninkiLen: 3
        },
        {
          baken: Baken.Umatan, index: 6, bangou1: 2404, bangou1Len: 2, bangou2: 2406,
          bangou2Len: 2, haitou: 2408, haitouLen: 7, ninki: 2415, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, index: 1, bangou1: 2418, bangou1Len: 2, bangou2: 2420, bangou2Len: 2, bangou3: 2422,
          bangou3Len: 2, haitou: 2424, haitouLen: 7, ninki: 2431, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, index: 2, bangou1: 2434, bangou1Len: 2, bangou2: 2436, bangou2Len: 2, bangou3: 2438,
          bangou3Len: 2, haitou: 2440, haitouLen: 7, ninki: 2447, ninkiLen: 3
        },
        {
          baken: Baken.Sanrenpuku, index: 3, bangou1: 2450, bangou1Len: 2, bangou2: 2452, bangou2Len: 2, bangou3: 2454,
          bangou3Len: 2, haitou: 2456, haitouLen: 7, ninki: 2463, ninkiLen: 3
        },
        {
          baken: Baken.Sanrentan, index: 1, bangou1: 2466, bangou1Len: 2, bangou2: 2468, bangou2Len: 2, bangou3: 2470,
          bangou3Len: 2, haitou: 2472, haitouLen: 9, ninki: 2481, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, index: 2, bangou1: 2485, bangou1Len: 2, bangou2: 2487, bangou2Len: 2, bangou3: 2489,
          bangou3Len: 2, haitou: 2491, haitouLen: 9, ninki: 2500, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, index: 3, bangou1: 2504, bangou1Len: 2, bangou2: 2506, bangou2Len: 2, bangou3: 2508,
          bangou3Len: 2, haitou: 2510, haitouLen: 9, ninki: 2519, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, index: 4, bangou1: 2523, bangou1Len: 2, bangou2: 2525, bangou2Len: 2, bangou3: 2527,
          bangou3Len: 2, haitou: 2529, haitouLen: 9, ninki: 2538, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, index: 5, bangou1: 2542, bangou1Len: 2, bangou2: 2544, bangou2Len: 2, bangou3: 2546,
          bangou3Len: 2, haitou: 2548, haitouLen: 9, ninki: 2557, ninkiLen: 4
        },
        {
          baken: Baken.Sanrentan, index: 6, bangou1: 2561, bangou1Len: 2, bangou2: 2563, bangou2Len: 2, bangou3: 2565,
          bangou3Len: 2, haitou: 2567, haitouLen: 9, ninki: 2576, ninkiLen: 4
        },
      ]
    );
  }
}