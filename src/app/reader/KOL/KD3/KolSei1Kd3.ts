import { Inject, Service } from "typedi";
import { Baken, Kakutei } from "../../../converters/Common";
import * as $K from "../../../converters/Kaisai";
import * as $R from "../../../converters/Race";
import * as $RK from "../../../converters/RaceKeika";
import { Kaisai } from "../../../entities/Kaisai";
import { Race } from "../../../entities/Race";
import { RaceKeika } from "../../../entities/RaceKeika";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { DataToImport } from "../../DataToImport";
import { KeikaTool } from "../../KeikaTool";
import {
  readDouble,
  readInt,
  readPositiveInt,
  readRaw,
  readStr,
  readTime
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolKaisaiTool } from "../KolKaisaiTool";
import { KolOddsHaitouTool } from "../KolOddsHaitouTool";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolSei1Kd3 extends DataToImport {

  @Inject()
  private tool: Tool;

  @Inject()
  private keikaTool: KeikaTool;

  @Inject()
  private kolKaisaiTool: KolKaisaiTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private kolOddsHaitouTool: KolOddsHaitouTool;

  protected getBufferLength() {
    return 3200;
  }

  public async save(buffer: Buffer) {
    const id = this.kolRaceTool.getRaceId(buffer);
    const dataNengappi = readInt(buffer, 2910, 8);

    const raceSeisei = await this.entityManager.findOneById(RaceSeiseki, id);
    if (raceSeisei && raceSeisei.KolNengappi && raceSeisei.KolNengappi <= dataNengappi) {
      return;
    }

    let race = await this.entityManager.findOneById(Race, id);
    if (!race) {
      const kaisai = await this.saveKaisai(buffer);
      if (!kaisai) {
        return;
      }
      race = await this.saveRace(buffer, kaisai, race);
      await this.saveRaceMei(buffer, race);
    }

    await this.saveRaceSeiseki(buffer, race, raceSeisei, dataNengappi);
    await this.saveRaceLapTime(buffer, race);
    await this.saveRaceKeika(buffer, race);
    await this.saveRaceHassouJoukyou(buffer, race);
    await this.saveRaceHaitou(buffer, race);
  }

  protected async saveKaisai(buffer: Buffer) {
    const kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);

    const asIs = await this.kolKaisaiTool.getKaisaiWithId(buffer);
    if (asIs && asIs.Kyuujitsu === kyuujitsu) {
      return asIs;
    }

    let toBe = this.kolKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = kyuujitsu;
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KaisaiKubun = this.kolKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    toBe = await this.entityManager.save(toBe);
    return toBe;
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai, asIs: Race) {
    const toBe = this.kolRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }

    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    toBe.JpnFlag = $R.jpnFlag.toCodeFromKol(buffer, 74, 1);
    const betteiBareiHandiReigai = readStr(buffer, 77, 18);
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 75, 2) || $R.betteiBareiHandi.toCodeFromKol(betteiBareiHandiReigai);
    if (!toBe.BetteiBareiHandi) {
      toBe.BetteiBareiHandiReigai = betteiBareiHandiReigai;
    }

    const joukenFuka = readRaw(buffer, 95, 2);
    toBe.JoukenBoba = $R.joukenBoba.toCodeFromKol(joukenFuka);
    toBe.JoukenHinba = $R.joukenHinba.toCodeFromKol(joukenFuka);
    toBe.JoukenSenba = $R.joukenSenba.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruKon = $R.joukenMaruKon.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruChichi = $R.joukenMaruChichi.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruIchi = $R.joukenMaruIchi.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruChuu = $R.joukenMaruChuu.toCodeFromKol(joukenFuka);
    toBe.JoukenKakuChuu = $R.joukenKakuChuu.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruKokusai = $R.joukenMaruKokusai.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruShou = $R.joukenMaruShou.toCodeFromKol(joukenFuka);
    const joukenFuka2 = readRaw(buffer, 97, 2);
    toBe.JoukenMaruShi = $R.joukenMaruShi.toCodeFromKol(joukenFuka) || $R.joukenMaruShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenMaruTokuShi = $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka) || $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenKakuShi = $R.joukenKakuShi.toCodeFromKol(joukenFuka) || $R.joukenKakuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenShounyuu = $R.joukenShounyuu.toCodeFromKol(joukenFuka);
    toBe.JoukenNaikokusan = $R.joukenNaikokusan.toCodeFromKol(joukenFuka);
    toBe.JoukenKouryuu = $R.joukenKouryuu.toCodeFromKol(joukenFuka) || $R.joukenKouryuu.toCodeFromKol(buffer, 22, 1);
    toBe.JoukenKyuushuusan = $R.joukenKyuushuusan.toCodeFromKol(joukenFuka);
    toBe.JoukenChibasan = $R.joukenChibasan.toCodeFromKol(joukenFuka);
    toBe.JoukenKansaiHaifuba = $R.joukenKansaiHaifuba.toCodeFromKol(joukenFuka);
    toBe.JoukenKantouHaifuba = $R.joukenKantouHaifuba.toCodeFromKol(joukenFuka);
    toBe.JoukenJraNintei = $R.joukenJraNintei.toCodeFromKol(joukenFuka);
    toBe.JoukenJraShitei = $R.joukenJraShitei.toCodeFromKol(joukenFuka);
    toBe.JoukenAshige = $R.joukenAshige.toCodeFromKol(joukenFuka);
    toBe.JoukenKurige = $R.joukenKurige.toCodeFromKol(joukenFuka);
    toBe.JoukenAshigeShiroge = $R.joukenAshigeShiroge.toCodeFromKol(joukenFuka);
    toBe.JoukenKurokage = $R.joukenKurokage.toCodeFromKol(joukenFuka);
    const joukenCut = readRaw(buffer, 99, 1);
    toBe.JoukenSarakei = $R.joukenSaraKei.toCodeFromKol(joukenCut);
    toBe.JoukenAraKei = $R.joukenAraKei.toCodeFromKol(joukenCut);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 100, 1) || $R.joukenNenreiSeigenFromJoukenCut.toCodeFromKol(joukenCut);
    toBe.JoukenSeed = $R.joukenSeed.toCodeFromKol(buffer, 381, 1);

    toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, 101, 5);
    if (kaisai.ChuuouChihouGaikoku !== 0) { // 中央
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

    toBe.FukaShou = readPositiveInt(buffer, 351, 9);
    toBe.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 360, 1);
    toBe.YoteiHassouJikan = readStr(buffer, 361, 5);
    toBe.Tousuu = readPositiveInt(buffer, 366, 2);
    toBe.SuiteiTimeRyou = readTime(buffer, 370, 4);
    toBe.SuiteiTimeOmoFuryou = readTime(buffer, 374, 4);

    return await this.tool.saveOrUpdate(Race, asIs, toBe);
  }

  protected async saveRaceMei(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceMei(buffer, 29, 30, race);
    await this.kolRaceTool.saveRaceMei(buffer, 59, 14, race);
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race, asIs: RaceSeiseki, dataNengappi: number) {
    const toBe = new RaceSeiseki();
    toBe.Id = race.Id;
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 288, 9);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 297, 9);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 306, 9);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 315, 9);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 324, 9);
    toBe.Shoukin5ChakuDouchaku = readPositiveInt(buffer, 333, 9);
    toBe.Shoukin5ChakuDouchaku2 = readPositiveInt(buffer, 342, 9);
    toBe.TorikeshiTousuu = readInt(buffer, 368, 2);
    toBe.Pace = $R.pace.toCodeFromKol(buffer, 378, 1);
    toBe.Tenki = $R.tenki.toCodeFromKol(buffer, 379, 1);
    toBe.Baba = $R.baba.toCodeFromKol(buffer, 380, 1);
    if (race.HeichiShougai === 1) { // 障害
      toBe.ShougaiHeikin1F = readDouble(buffer, 398, 4, 0.1);
    }
    toBe.KolNengappi = dataNengappi;

    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe);
  }

  protected async saveRaceLapTime(buffer: Buffer, race: Race) {
    const lapTime1 = readDouble(buffer, 402, 3, 0.1);
    if (lapTime1) {
      await this.kolRaceTool.saveRaceLapTime(buffer, 402, race);
    } else {
      const heichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
      if (heichiShougai === 1) {
        await this.saveShougaiRaceLapTime(buffer, race);
      } else {
        const chuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
        if (chuuouChihouGaikoku === 2 || chuuouChihouGaikoku === 3) {
          await this.saveChihouRaceLapTime(buffer, race);
        }
      }
    }
  }

  protected async saveShougaiRaceLapTime(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveSpecialRaceLapTime(buffer, race,
      [
        { Offset: 382, Length: 5, KaishiKyori: race.Kyori - 1600, ShuuryouKyori: race.Kyori },
        { Offset: 388, Length: 4, KaishiKyori: race.Kyori - 800, ShuuryouKyori: race.Kyori },
        { Offset: 393, Length: 4, KaishiKyori: race.Kyori - 600, ShuuryouKyori: race.Kyori },
      ]
    );
  }

  protected async saveChihouRaceLapTime(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveSpecialRaceLapTime(buffer, race,
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
      raceKeika.Id = race.Id * (2 ** 4) + bangou;
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
    await this.kolOddsHaitouTool.saveRaceHaitou(
      buffer, race.Id, Kakutei.Kakutei,
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