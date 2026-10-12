import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import * as $CH from "../src/app/converters/Choukyou";
import { Baken, Kakutei, TouzaiBetsu, touzaiBetsu } from "../src/app/converters/Common";
import * as $K from "../src/app/converters/Kishu";
import * as $R from "../src/app/converters/Race";
import * as $S from "../src/app/converters/Shussouba";
import * as $U from "../src/app/converters/Uma";
import { choukyouDao } from "../src/app/daos/ChoukyouDao";
import { umaDao } from "../src/app/daos/UmaDao";
import { Banushi } from "../src/app/entities/Banushi";
import { BanushiMei } from "../src/app/entities/BanushiMei";
import { Choukyou } from "../src/app/entities/Choukyou";
import { Choukyoushi } from "../src/app/entities/Choukyoushi";
import { ChoukyouTime } from "../src/app/entities/ChoukyouTime";
import { CourseSetsumei } from "../src/app/entities/CourseSetsumei";
import { Hanshokuba } from "../src/app/entities/Hanshokuba";
import { Kaisai } from "../src/app/entities/Kaisai";
import { Keitou } from "../src/app/entities/Keitou";
import { Kishu } from "../src/app/entities/Kishu";
import { Kyousouba } from "../src/app/entities/Kyousouba";
import { MeishouKubun } from "../src/app/entities/MeishouKubun";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { RaceHyousuu } from "../src/app/entities/RaceHyousuu";
import { RaceLapTime } from "../src/app/entities/RaceLapTime";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { Seisanba } from "../src/app/entities/Seisanba";
import { Seisansha } from "../src/app/entities/Seisansha";
import { SeisanshaMei } from "../src/app/entities/SeisanshaMei";
import { Shijou } from "../src/app/entities/Shijou";
import { ShijouTorihiki } from "../src/app/entities/ShijouTorihiki";
import { Shoyuu } from "../src/app/entities/Shoyuu";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { ShussoubaTsuukaJuni } from "../src/app/entities/ShussoubaTsuukaJuni";
import { ShussoubaYosou } from "../src/app/entities/ShussoubaYosou";
import { TokubetsuTourokuba } from "../src/app/entities/TokubetsuTourokuba";
import { TouhyouJogaiba } from "../src/app/entities/TouhyouJogaiba";
import { Uma } from "../src/app/entities/Uma";
import { UmaBanushi } from "../src/app/entities/UmaBanushi";
import { getJraTrack } from "../src/app/reader/JRA/JraTrack";
import { JvdataBn } from "../src/app/reader/JRA/JVData/JvdataBn";
import { JvdataBr } from "../src/app/reader/JRA/JVData/JvdataBr";
import { JvdataBt } from "../src/app/reader/JRA/JVData/JvdataBt";
import { JvdataCh } from "../src/app/reader/JRA/JVData/JvdataCh";
import { JvdataHc, JvdataWc } from "../src/app/reader/JRA/JVData/JvdataChoukyou";
import { JvdataCs } from "../src/app/reader/JRA/JVData/JvdataCs";
import { JvdataHn } from "../src/app/reader/JRA/JVData/JvdataHn";
import { JvdataHr } from "../src/app/reader/JRA/JVData/JvdataHr";
import { JvdataHs } from "../src/app/reader/JRA/JVData/JvdataHs";
import { JvdataHy } from "../src/app/reader/JRA/JVData/JvdataHy";
import { JvdataH1, JvdataH6 } from "../src/app/reader/JRA/JVData/JvdataHyousuu";
import { JvdataJg } from "../src/app/reader/JRA/JVData/JvdataJg";
import { JvdataKs } from "../src/app/reader/JRA/JVData/JvdataKs";
import { JvdataDm, JvdataTm } from "../src/app/reader/JRA/JVData/JvdataMining";
import {
  JvdataO1,
  JvdataO2,
  JvdataO3,
  JvdataO4,
  JvdataO5,
  JvdataO6,
} from "../src/app/reader/JRA/JVData/JvdataOdds";
import { JvdataRa } from "../src/app/reader/JRA/JVData/JvdataRa";
import { JvdataSe } from "../src/app/reader/JRA/JVData/JvdataSe";
import { JvdataSk } from "../src/app/reader/JRA/JVData/JvdataSk";
import { JvdataTk } from "../src/app/reader/JRA/JVData/JvdataTk";
import { JvdataUm } from "../src/app/reader/JRA/JVData/JvdataUm";
import { JvdataYs } from "../src/app/reader/JRA/JVData/JvdataYs";
import { tool } from "../src/app/reader/Tool";
import { repo } from "./helpers";
import { JvdataRecord, parseJvdataCodes, parseJvdataSpec } from "./spec/jvdata";
import { closeKolDb, emptyKolDb, importKolFiles } from "./spec/kol";

afterAll(closeKolDb);

setDefaultTimeout(60_000);

const handlers = [
  JvdataRa,
  JvdataSe,
  JvdataHr,
  JvdataH1,
  JvdataH6,
  JvdataO1,
  JvdataO2,
  JvdataO3,
  JvdataO4,
  JvdataO5,
  JvdataO6,
  JvdataUm,
  JvdataHn,
  JvdataSk,
  JvdataBr,
  JvdataKs,
  JvdataCh,
  JvdataYs,
  JvdataBt,
  JvdataHs,
  JvdataHy,
  JvdataCs,
  JvdataBn,
  JvdataHc,
  JvdataWc,
  JvdataDm,
  JvdataTm,
  JvdataTk,
  JvdataJg,
];

describe("JV-Data の仕様書", () => {
  for (const handler of handlers) {
    const record = new handler();
    test(`${record.id}: 取り込み処理のレコード長が仕様書と一致する`, () => {
      expect(record.length).toBe(parseJvdataSpec(record.id).size);
    });
  }

  test("仕様書のレコードは、どれも末尾が CR/LF で、位置が重ならない", () => {
    for (const id of [
      "TK",
      "RA",
      "SE",
      "HR",
      "H1",
      "H6",
      "UM",
      "HN",
      "SK",
      "KS",
      "CH",
      "BR",
      "BN",
      "RC",
      "BT",
      "HS",
      "HY",
      "CS",
    ]) {
      const spec = parseJvdataSpec(id);
      const last = spec.fields[spec.fields.length - 1];
      expect(last.name).toBe("レコード区切");
      expect(last.pos + 1).toBe(spec.size);
    }
  });

  test("コード表のコードは、取り込み処理で変換できる", () => {
    const codes = parseJvdataCodes();
    const list = (no: string) => (codes.get(no) ?? []).map((c) => c.code).filter((c) => c !== ".");
    const unknown = (no: string, convert: (code: string) => unknown, ignore: string[] = []) =>
      list(no).filter(
        (c) => !ignore.includes(c) && (convert(c) === null || convert(c) === undefined),
      );

    // 00 や 0 は「未設定」の初期値
    expect(unknown("2003", (c) => $R.grade.toCodeFromJvData(c), ["D", "E", "_"])).toEqual([]);
    expect(unknown("2008", (c) => $R.betteiBareiHandi.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2009", (c) => getJraTrack(c), ["00"])).toEqual([]);
    expect(unknown("2010", (c) => $R.baba.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2011", (c) => $R.tenki.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2101", (c) => $S.chakujunFuka.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2202", (c) => $U.seibetsu.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2203", (c) => $U.keiro.toCodeFromJvData(c), ["00"])).toEqual([]);
    expect(unknown("2204", (c) => $U.umaKigou.toCodeFromJvData(c), ["31"])).toEqual([]);
    expect(unknown("2301", (c) => touzaiBetsu.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2303", (c) => $K.minaraiKubun.toCodeFromJvData(c), ["0"])).toEqual([]);
    expect(unknown("2201", (c) => $U.kesshu.toCodeFromJvData(c), ["0"])).toEqual([]);
    // 競走記号 (国際競走の指定・特指) は、性別と指定の区分に分かれる
    expect($R.joukenMaruKokusai.toCodeFromJvData("N04")).toBe(1);
    expect($R.joukenMaruTokuShi.toCodeFromJvData("N04")).toBe(1);
    expect($R.joukenHinba.toCodeFromJvData("N24")).toBe(1);
    expect($R.joukenMaruTokuShi.toCodeFromJvData("N44")).toBe(1);
    expect($R.joukenBoba.toCodeFromJvData("N44")).toBe(1);
    expect($R.joukenHinba.toCodeFromJvData("N44")).toBe(1);
    expect($R.joukenKakuShi.toCodeFromJvData("N23")).toBe(1);
    expect($R.joukenMaruShi.toCodeFromJvData("N23")).toBeNull();
  });
});

/** 馬主の名前 (区分 → 名前) */
async function banushiMeishou(banushiId: number) {
  const mei = await repo(BanushiMei).findBy({ BanushiId: banushiId });
  return new Map(
    await Promise.all(
      mei.map(
        async (m) =>
          [m.Kubun, (await repo(Shoyuu).findOneByOrFail({ Id: m.ShoyuuId })).Meishou] as const,
      ),
    ),
  );
}

/** 2007-10-06 (土) 東京 4 回 1 日 11R */
function raceKey<T extends JvdataRecord>(record: T, race = 11) {
  return record.key(2007, "1006", "05", 4, 1, race);
}

function ra(kubun: string) {
  const r = raceKey(new JvdataRecord("RA"));
  r.set("データ区分", kubun)
    .set("曜日コード", "1")
    .set("競走名本題", "テストステークス")
    .set("競走名略称3文字", "テスト")
    .set("重賞回次[第N回]", 12)
    .set("グレードコード", "A")
    .set("競走種別コード", "13")
    .set("競走記号コード", "000")
    .set("重量種別コード", "2")
    .set("競走条件コード 最若年条件", "999")
    .set("距離", 1600)
    .set("トラックコード", "11")
    .set("本賞金", 10000, { index: 0 })
    .set("本賞金", 4000, { index: 1 })
    .set("付加賞金", 300, { index: 0 })
    .set("発走時刻", "1540")
    .set("登録頭数", "03");
  return r;
}

function se(umaban: number, touroku: string, bamei: string, kishu: string, kubun = "7") {
  const r = raceKey(new JvdataRecord("SE"));
  r.set("データ区分", kubun)
    .set("枠番", Math.min(8, Math.ceil(umaban / 2)))
    .set("馬番", umaban)
    .set("血統登録番号", touroku)
    .set("馬名", bamei)
    .set("性別コード", "1")
    .set("馬齢", "03")
    .set("東西所属コード", "1")
    .set("調教師コード", "01234")
    .set("調教師名略称", "藤沢和")
    .set("馬主コード", "123456")
    .set("馬主名(法人格無)", "株式会社テスト")
    .set("負担重量", 550)
    .set("ブリンカー使用区分", "1")
    .set("騎手コード", kishu)
    .set("騎手名略称", "武豊")
    .set("騎手見習コード", "0");
  return r;
}

describe("レース", () => {
  test("レース詳細・馬毎レース情報・払戻 (成績)", async () => {
    await emptyKolDb();
    const r = ra("7");
    r.set("出走頭数", "02")
      .set("天候コード", "1")
      .set("芝馬場状態コード", "2")
      .set("ダート馬場状態コード", "1")
      .set("ラップタイム", "123", { index: 0 })
      .set("ラップタイム", "115", { index: 1 })
      .set("ラップタイム", "118", { index: 2 });
    const s1 = se(1, "2004101234", "テストホース", "01088");
    s1.set("異常区分コード", "0")
      .set("馬体重", 480)
      .set("増減符号", "+")
      .set("増減差", "004")
      .set("入線順位", 1)
      .set("確定着順", 1)
      .set("走破タイム", "1321")
      .set("着差コード", "112")
      .set("1コーナーでの順位", "03")
      .set("2コーナーでの順位", "03")
      .set("3コーナーでの順位", "02")
      .set("4コーナーでの順位", "01")
      .set("単勝オッズ", "0035")
      .set("単勝人気順", "01")
      .set("獲得本賞金", 10000)
      .set("後3ハロンタイム", "345")
      .set("タイム差", "-012");
    const s2 = se(2, "2004101235", "ツギノウマ", "01089");
    s2.set("異常区分コード", "0")
      .set("馬体重", 999)
      .set("増減符号", "-")
      .set("増減差", "999")
      .set("入線順位", 2)
      .set("確定着順", 2)
      .set("走破タイム", "1325")
      .set("着差コード", "A  ")
      .set("後3ハロンタイム", "999")
      .set("タイム差", "+004");
    const hr = raceKey(new JvdataRecord("HR"));
    hr.set("データ区分", "2");
    const t = { parent: "<単勝払戻>", index: 0 };
    hr.set("馬番", "01", t).set("払戻金", 350, t).set("人気順", 1, t);
    const f = { parent: "<複勝払戻>", index: 1 };
    hr.set("馬番", "02", f).set("払戻金", 150, f).set("人気順", 2, f);
    const w = { parent: "<枠連払戻>", index: 0 };
    hr.set("組番", "12", w).set("払戻金", 840, w).set("人気順", 3, w);
    const u = { parent: "<馬連払戻>", index: 0 };
    hr.set("組番", "0102", u).set("払戻金", 1230, u).set("人気順", 5, u);
    const x = { parent: "<馬単払戻>", index: 0 };
    hr.set("組番", "0102", x).set("払戻金", 5600, x).set("人気順", 12, x);
    const sp = { parent: "<3連複払戻>", index: 0 };
    hr.set("組番", "010203", sp).set("払戻金", 12340, sp).set("人気順", 5, sp);
    const st = { parent: "<3連単払戻>", index: 1 };
    hr.set("組番", "020103", st).set("払戻金", 123450, st).set("人気順", 321, st);

    // 収録順序に決まりはないので、馬毎レース情報と払戻をレース詳細より先に置く
    const file = Buffer.concat([s1.buffer, s2.buffer, hr.buffer, r.buffer]);
    expect(await importKolFiles({ "RACE.jvd": file })).toEqual([]);

    const kaisai = await repo(Kaisai).findOneByOrFail({ Nen: 2007, Gatsu: 10, Nichi: 6 });
    expect(kaisai.Basho).toBe(4);
    expect(kaisai.Youbi).toBe(1);
    expect(kaisai.Kaiji).toBe(4);
    expect(kaisai.Nichiji).toBe(1);

    const races = await repo(Race).findBy({ KaisaiId: kaisai.Id });
    expect(races.length).toBe(1);
    const race = races[0];
    expect(race.RaceBangou).toBe(11);
    expect(race.Kyori).toBe(1600);
    expect(race.DirtShiba).toBe(1);
    expect(race.MigiHidari).toBe(1);
    expect(race.HeichiShougai).toBe($R.HeichiShougai.Heichi);
    expect(race.Grade).toBe(1);
    expect(race.IppanTokubetsu).toBe(3);
    expect(race.JuushouKaisuu).toBe(12);
    expect(race.BetteiBareiHandi).toBe(0);
    expect(race.YoteiHassouJikan).toBe("15:40");
    expect(race.Tousuu).toBe(3);
    // 本賞金・付加賞金は百円単位
    expect(race.Shoukin1Chaku).toBe(1_000_000);
    expect(race.Shoukin2Chaku).toBe(400_000);
    expect(race.FukaShou).toBe(30_000);

    const seiseki = await repo(RaceSeiseki).findOneByOrFail({ Id: race.Id });
    expect(seiseki.Baba).toBe(1);
    expect(seiseki.Tenki).toBe(0);
    expect(seiseki.TorikeshiTousuu).toBe(1);
    expect(seiseki.Shoukin1Chaku).toBe(1_000_000);

    const laps = await repo(RaceLapTime).findBy({ RaceId: race.Id });
    expect(laps.map((l) => [l.KaishiKyori, l.ShuuryouKyori, l.LapTime]).sort()).toEqual([
      [0, 200, 12.3],
      [200, 400, 11.5],
      [400, 600, 11.8],
    ]);

    const shussoubaList = await repo(Shussouba).findBy({ RaceId: race.Id });
    expect(shussoubaList.map((s) => s.Umaban).sort()).toEqual([1, 2]);
    const shussouba = shussoubaList.find((s) => s.Umaban === 1);
    expect(shussouba?.Wakuban).toBe(1);
    expect(shussouba?.Kinryou).toBe(55);
    expect(shussouba?.Nenrei).toBe(3);
    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.Seinen).toBe(2004);
    const kishu = await repo(Kishu).findOneByOrFail({ JvDataKishuCode: "01088" });
    expect(shussouba?.KishuId).toBe(kishu.Id);
    expect((await repo(Choukyoushi).findBy({ JvDataChoukyoushiCode: "01234" })).length).toBe(1);
    // 馬主は、レースの日の馬の馬主
    const umaBanushi = await repo(UmaBanushi).findOneByOrFail({ UmaId: uma.Id });
    expect(umaBanushi.Nengappi).toBe(20071006);
    const banushi = await repo(Banushi).findOneByOrFail({ Id: umaBanushi.BanushiId });
    expect(banushi.JvDataCode).toBe("123456");
    expect(await banushiMeishou(banushi.Id)).toEqual(new Map([[MeishouKubun.Meishou, "テスト"]]));

    const result = await repo(ShussoubaSeiseki).findOneByOrFail({ Id: shussouba?.Id });
    expect(result.Time).toBeCloseTo(92.1);
    expect(result.KakuteiChakujun).toBe(1);
    expect(result.NyuusenChakujun).toBe(1);
    expect(result.Agari3F).toBeCloseTo(34.5);
    expect(result.Agari3FIzen).toBeCloseTo(57.6);
    expect(result.Bataijuu).toBe(480);
    expect(result.Zougen).toBe(4);
    expect(result.Chakusa1).toBe(1);
    expect(result.Chakusa2).toBe(3);
    expect(result.HonShoukin).toBe(1_000_000);
    expect(result.Chaku12TimeSa).toBeCloseTo(1.2);
    const juni = await repo(ShussoubaTsuukaJuni).findBy({ ShussoubaId: shussouba?.Id });
    expect(juni.map((j) => j.Juni).sort()).toEqual([1, 2, 3, 3]);

    const shussouba2 = await repo(Shussouba).findOneByOrFail({ RaceId: race.Id, Umaban: 2 });
    const result2 = await repo(ShussoubaSeiseki).findOneByOrFail({ Id: shussouba2.Id });
    // 計量不能 (999) と、後 3 ハロンの 999 は値なし
    expect(result2.Bataijuu).toBeNull();
    expect(result2.Zougen).toBeNull();
    expect(result2.Agari3F).toBeNull();
    expect(result2.Chakusa2).toBe(1);
    expect(result2.Chaku12TimeSa).toBeCloseTo(0.4);

    const odds = await repo(OddsHaitou).findBy({ RaceId: race.Id });
    const find = (baken: Baken, b1: number, b2?: number, b3?: number) =>
      odds.find(
        (o) =>
          o.Baken === baken &&
          o.Bangou1 === b1 &&
          (o.Bangou2 ?? undefined) === b2 &&
          (o.Bangou3 ?? undefined) === b3,
      );
    const tanshou = find(Baken.Tanshou, 1);
    expect(tanshou?.Haitoukin).toBe(350);
    expect(tanshou?.Odds1).toBeCloseTo(3.5);
    expect(tanshou?.Ninki).toBe(1);
    expect(find(Baken.Fukushou, 2)?.Haitoukin).toBe(150);
    expect(find(Baken.Wakuren, 1, 2)?.Haitoukin).toBe(840);
    expect(find(Baken.Umaren, 1, 2)?.Haitoukin).toBe(1230);
    expect(find(Baken.Umatan, 1, 2)?.Haitoukin).toBe(5600);
    expect(find(Baken.Sanrenpuku, 1, 2, 3)?.Haitoukin).toBe(12340);
    const sanrentan = find(Baken.Sanrentan, 2, 1, 3);
    expect(sanrentan?.Haitoukin).toBe(123450);
    expect(sanrentan?.Ninki).toBe(321);
    expect(odds.every((o) => o.Kakutei === Kakutei.Kakutei)).toBe(true);
  });

  test("成績のないレコード (出走馬名表、削除、中止) と、取り込まないレコード種別", async () => {
    await emptyKolDb();
    const names = se(0, "2004101234", "テストホース", "01088", "1");
    const deleted = se(3, "2004101235", "ケサレタウマ", "01088", "0");
    const cancelled = se(4, "2004101236", "チュウシウマ", "01088", "9");
    const noId = new JvdataRecord("WH");
    const shussouba = se(5, "2004101237", "ホントウノウマ", "01089", "2");
    const r = ra("2");
    expect(
      await importKolFiles({
        "RACE.jvd": Buffer.concat([
          names.buffer,
          deleted.buffer,
          cancelled.buffer,
          noId.buffer,
          r.buffer,
          shussouba.buffer,
        ]),
      }),
    ).toEqual([]);
    const list = await repo(Shussouba).find();
    expect(list.map((s) => s.Umaban)).toEqual([5]);
    // 出馬表の時点では、成績はない
    expect(await repo(ShussoubaSeiseki).count()).toBe(0);
    expect(await repo(RaceSeiseki).count()).toBe(0);
    expect((await repo(Race).find()).length).toBe(1);
  });

  test("出馬表の RA は、空白の項目で既存の値を消さない", async () => {
    await emptyKolDb();
    const final = ra("7");
    final.set("出走頭数", "03");
    const before = ra("2");
    before.set("本賞金", "        ", { index: 0 }).set("距離", "    ");
    expect(
      await importKolFiles({ "RACE.jvd": Buffer.concat([final.buffer, before.buffer]) }),
    ).toEqual([]);
    const race = await repo(Race).findOneByOrFail({ RaceBangou: 11 });
    expect(race.Shoukin1Chaku).toBe(1_000_000);
    expect(race.Kyori).toBe(1600);
  });

  test("障害競走のラップタイムと、後 3 ハロンの扱い", async () => {
    await emptyKolDb();
    const r = ra("7");
    r.set("トラックコード", "51")
      .set("競走種別コード", "18")
      .set("グレードコード", "F")
      .set("距離", 3000)
      .set("障害マイルタイム", "1572")
      .set("後4ハロン", "540")
      .set("後3ハロン", "410");
    const s = se(1, "2004101234", "テストホース", "01088");
    s.set("異常区分コード", "0")
      .set("入線順位", 1)
      .set("確定着順", 1)
      .set("走破タイム", "3123")
      .set("後3ハロンタイム", "410");
    expect(await importKolFiles({ "RACE.jvd": Buffer.concat([r.buffer, s.buffer]) })).toEqual([]);
    const race = await repo(Race).findOneByOrFail({ RaceBangou: 11 });
    expect(race.HeichiShougai).toBe($R.HeichiShougai.Shougai);
    expect(race.Grade).toBe(1);
    const laps = await repo(RaceLapTime).findBy({ RaceId: race.Id });
    expect(laps.map((l) => [l.KaishiKyori, l.ShuuryouKyori, l.LapTime]).sort()).toEqual([
      [1400, 3000, 117.2],
      [2200, 3000, 54],
      [2400, 3000, 41],
    ]);
    const result = await repo(ShussoubaSeiseki).find();
    expect(result[0].Agari3F).toBeNull();
  });

  test("ダートと、JV-Data で増えたトラックコード・グレード・見習区分", async () => {
    await emptyKolDb();
    const r = ra("7");
    r.set("グレードコード", "L").set("トラックコード", "25").set("出走頭数", "01");
    r.set("ダート馬場状態コード", "3").set("芝馬場状態コード", "1");
    const s = se(1, "2004101234", "テストホース", "01088");
    s.set("騎手見習コード", "4").set("異常区分コード", "0");
    expect(await importKolFiles({ "RACE.jvd": Buffer.concat([r.buffer, s.buffer]) })).toEqual([]);
    const race = await repo(Race).findOneByOrFail({ RaceBangou: 11 });
    expect(race.DirtShiba).toBe($R.DirtShiba.Dirt);
    expect(race.MigiHidari).toBe(1);
    expect(race.UchiSoto).toBe(0);
    expect(race.Grade).toBe(4);
    expect(race.IppanTokubetsu).toBe(2);
    expect((await repo(RaceSeiseki).findOneByOrFail({ Id: race.Id })).Baba).toBe(2);
    const shussouba = await repo(Shussouba).findOneByOrFail({ RaceId: race.Id });
    expect(shussouba.MinaraiKubun).toBe(4);
  });
});

describe("オッズ", () => {
  test("オッズ1〜6", async () => {
    await emptyKolDb();
    const key = <T extends JvdataRecord>(r: T, kubun: string) =>
      raceKey(r).set("データ区分", kubun);
    const o1 = key(new JvdataRecord("O1"), "4");
    const tan = (index: number, bangou: string, odds: string, ninki: string) =>
      o1
        .set("馬番", bangou, { parent: "<単勝オッズ>", index })
        .set("オッズ", odds, { parent: "<単勝オッズ>", index })
        .set("人気順", ninki, { parent: "<単勝オッズ>", index });
    tan(0, "01", "0035", "01");
    tan(1, "02", "9999", "02");
    tan(2, "03", "----", "--");
    tan(3, "04", "0000", "04");
    const fuku = { parent: "<複勝オッズ>", index: 0 };
    o1.set("馬番", "01", fuku)
      .set("最低オッズ", "0120", fuku)
      .set("最高オッズ", "0250", fuku)
      .set("人気順", "01", fuku);
    const waku = { parent: "<枠連オッズ>", index: 1 };
    o1.set("組番", "12", waku).set("オッズ", "00123", waku).set("人気順", "01", waku);

    const o2 = key(new JvdataRecord("O2"), "4");
    const uma = { parent: "<馬連オッズ>", index: 0 };
    o2.set("組番", "0102", uma).set("オッズ", "000250", uma).set("人気順", "003", uma);
    o2.set("組番", "0103", { parent: "<馬連オッズ>", index: 1 })
      .set("オッズ", "******", { parent: "<馬連オッズ>", index: 1 })
      .set("人気順", "***", { parent: "<馬連オッズ>", index: 1 });

    const o3 = key(new JvdataRecord("O3"), "4");
    const wide = { parent: "<ワイドオッズ>", index: 0 };
    o3.set("組番", "0102", wide)
      .set("最低オッズ", "00120", wide)
      .set("最高オッズ", "00250", wide)
      .set("人気順", "002", wide);

    const o4 = key(new JvdataRecord("O4"), "4");
    const umatan = { parent: "<馬単オッズ>", index: 1 };
    o4.set("組番", "0103", umatan).set("オッズ", "000300", umatan).set("人気順", "010", umatan);

    const o5 = key(new JvdataRecord("O5"), "3");
    const sanrenpuku = { parent: "<3連複オッズ>", index: 0 };
    o5.set("組番", "010203", sanrenpuku)
      .set("オッズ", "000123", sanrenpuku)
      .set("人気順", "001", sanrenpuku);

    // 3 連単のレコードは 83285 バイトあり、読み込みのバッファ(64KB)に収まらない
    const o6 = key(new JvdataRecord("O6"), "2");
    const sanrentan = { parent: "<3連単オッズ>", index: 4895 };
    o6.set("組番", "181716", sanrentan)
      .set("オッズ", "1234567", sanrentan)
      .set("人気順", "4896", sanrentan);

    // 中間オッズ (データ区分 1) は取り込まない
    const midway = key(new JvdataRecord("O2"), "1");
    midway.set("組番", "0405", uma).set("オッズ", "000500", uma).set("人気順", "001", uma);

    expect(
      await importKolFiles({
        "ODDS.jvd": Buffer.concat([
          o1.buffer,
          o2.buffer,
          midway.buffer,
          o3.buffer,
          o4.buffer,
          o5.buffer,
          o6.buffer,
        ]),
      }),
    ).toEqual([]);

    const odds = await repo(OddsHaitou).find();
    const find = (baken: Baken, b1: number, b2?: number, b3?: number) =>
      odds.find(
        (o) =>
          o.Baken === baken &&
          o.Bangou1 === b1 &&
          (o.Bangou2 ?? undefined) === b2 &&
          (o.Bangou3 ?? undefined) === b3,
      );
    expect(find(Baken.Tanshou, 1)?.Odds1).toBeCloseTo(3.5);
    expect(find(Baken.Tanshou, 1)?.Ninki).toBe(1);
    expect(find(Baken.Tanshou, 1)?.Kakutei).toBe(Kakutei.Kakutei);
    expect(find(Baken.Tanshou, 2)?.Odds1).toBeCloseTo(999.9);
    expect(find(Baken.Tanshou, 3)).toBeUndefined();
    expect(find(Baken.Tanshou, 4)).toBeUndefined();
    const f = find(Baken.Fukushou, 1);
    expect(f?.Odds1).toBeCloseTo(12);
    expect(f?.Odds2).toBeCloseTo(25);
    expect(find(Baken.Wakuren, 1, 2)?.Odds1).toBeCloseTo(12.3);
    expect(find(Baken.Umaren, 1, 2)?.Odds1).toBeCloseTo(25);
    expect(find(Baken.Umaren, 1, 2)?.Ninki).toBe(3);
    expect(find(Baken.Umaren, 1, 3)).toBeUndefined();
    expect(find(Baken.Umaren, 4, 5)).toBeUndefined();
    const w = find(Baken.Wide, 1, 2);
    expect(w?.Odds1).toBeCloseTo(12);
    expect(w?.Odds2).toBeCloseTo(25);
    expect(find(Baken.Umatan, 1, 3)?.Odds1).toBeCloseTo(30);
    const s = find(Baken.Sanrenpuku, 1, 2, 3);
    expect(s?.Odds1).toBeCloseTo(12.3);
    expect(s?.Kakutei).toBe(Kakutei.Chokuzen);
    const t = find(Baken.Sanrentan, 18, 17, 16);
    expect(t?.Odds1).toBeCloseTo(123456.7);
    expect(t?.Ninki).toBe(4896);
    expect(t?.Kakutei).toBe(Kakutei.Zenjitsu);
  });
});

describe("票数", () => {
  test("票数1・6 は組み合わせごとの票数と合計票数、オッズの行にまとまる", async () => {
    await emptyKolDb();
    const key = <T extends JvdataRecord>(r: T, kubun: string) =>
      raceKey(r).set("データ区分", kubun);
    const h1 = key(new JvdataRecord("H1"), "4");
    const entry = (parent: string, index: number, bangou: string, hyousuu: string, ninki: string) =>
      h1
        .set(parent.includes("単勝") || parent.includes("複勝") ? "馬番" : "組番", bangou, {
          parent,
          index,
        })
        .set("票数", hyousuu, { parent, index })
        .set("人気順", ninki, { parent, index });
    entry("<単勝票数>", 0, "01", "00000012345", "01");
    entry("<単勝票数>", 1, "02", "00000000000", "--");
    entry("<単勝票数>", 27, "28", "00000000028", "02");
    entry("<複勝票数>", 0, "01", "00000000777", "01");
    entry("<枠連票数>", 1, "12", "00000000088", "01");
    entry("<馬連票数>", 0, "0102", "00000000003", "001");
    entry("<ワイド票数>", 0, "0102", "00000000004", "001");
    entry("<馬単票数>", 1, "0103", "00000000005", "001");
    entry("<3連複票数>", 0, "010203", "00000000006", "001");
    h1.set("単勝票数合計", "12345678901")
      .set("複勝票数合計", "00000022222")
      .set("3連複票数合計", "00000000666")
      .set("単勝返還票数合計", "00000000100")
      .set("複勝返還票数合計", "00000000000");

    const h6 = key(new JvdataRecord("H6"), "2");
    const sanrentan = { parent: "<3連単票数>", index: 4895 };
    h6.set("組番", "181716", sanrentan)
      .set("票数", "00000000007", sanrentan)
      .set("人気順", "4896", sanrentan)
      .set("3連単票数合計", "00000000777")
      .set("3連単返還票数合計", "00000000001");

    // 確定の単勝オッズは、票数と同じ行になる
    const o1 = key(new JvdataRecord("O1"), "4");
    o1.set("馬番", "01", { parent: "<単勝オッズ>", index: 0 })
      .set("オッズ", "0035", { parent: "<単勝オッズ>", index: 0 })
      .set("人気順", "01", { parent: "<単勝オッズ>", index: 0 });

    expect(
      await importKolFiles({
        "HYOUSUU.jvd": Buffer.concat([o1.buffer, h1.buffer, h6.buffer]),
      }),
    ).toEqual([]);

    const odds = await repo(OddsHaitou).find();
    const find = (baken: Baken, b1: number, b2?: number, b3?: number) =>
      odds.find(
        (o) =>
          o.Baken === baken &&
          o.Bangou1 === b1 &&
          (o.Bangou2 ?? undefined) === b2 &&
          (o.Bangou3 ?? undefined) === b3 &&
          o.Kakutei === (baken === Baken.Sanrentan ? Kakutei.Zenjitsu : Kakutei.Kakutei),
      );
    const tan1 = find(Baken.Tanshou, 1);
    expect(tan1?.Hyousuu).toBe(12345);
    expect(tan1?.Ninki).toBe(1);
    expect(tan1?.Odds1).toBeCloseTo(3.5);
    // 発売前取消は 0 票、人気順はない
    expect(find(Baken.Tanshou, 2)?.Hyousuu).toBe(0);
    expect(find(Baken.Tanshou, 2)?.Ninki).toBeNull();
    // 組番が空白 (登録なし) の組は保存しない
    expect(find(Baken.Tanshou, 3)).toBeUndefined();
    expect(find(Baken.Tanshou, 28)?.Hyousuu).toBe(28);
    expect(find(Baken.Fukushou, 1)?.Hyousuu).toBe(777);
    expect(find(Baken.Wakuren, 1, 2)?.Hyousuu).toBe(88);
    expect(find(Baken.Umaren, 1, 2)?.Hyousuu).toBe(3);
    expect(find(Baken.Wide, 1, 2)?.Hyousuu).toBe(4);
    expect(find(Baken.Umatan, 1, 3)?.Hyousuu).toBe(5);
    expect(find(Baken.Sanrenpuku, 1, 2, 3)?.Hyousuu).toBe(6);
    const t = find(Baken.Sanrentan, 18, 17, 16);
    expect(t?.Hyousuu).toBe(7);
    expect(t?.Ninki).toBe(4896);

    const goukei = await repo(RaceHyousuu).find();
    const g = (baken: Baken) => goukei.find((r) => r.Baken === baken);
    expect(g(Baken.Tanshou)?.GoukeiHyousuu).toBe(12345678901);
    expect(g(Baken.Tanshou)?.HenkanHyousuu).toBe(100);
    expect(g(Baken.Tanshou)?.Kakutei).toBe(Kakutei.Kakutei);
    expect(g(Baken.Fukushou)?.GoukeiHyousuu).toBe(22222);
    expect(g(Baken.Fukushou)?.HenkanHyousuu).toBe(0);
    expect(g(Baken.Sanrenpuku)?.GoukeiHyousuu).toBe(666);
    // 空白の合計は書かない
    expect(g(Baken.Umaren)?.GoukeiHyousuu).toBeNull();
    expect(g(Baken.Sanrentan)?.GoukeiHyousuu).toBe(777);
    expect(g(Baken.Sanrentan)?.HenkanHyousuu).toBe(1);
    expect(g(Baken.Sanrentan)?.Kakutei).toBe(Kakutei.Zenjitsu);
  });
});

describe("マスタ", () => {
  test("競走馬・騎手・調教師", async () => {
    await emptyKolDb();
    const um = new JvdataRecord("UM");
    um.set("データ区分", "1")
      .set("血統登録番号", "2004101234")
      .set("生年月日", "20040401")
      .set("馬名", "テストホース")
      .set("馬名欧字", "Test Horse")
      .set("品種コード", "1")
      .set("性別コード", "2")
      .set("毛色コード", "03")
      .set("馬記号コード", "04")
      .set("競走馬抹消区分", "0")
      .set("馬名", "チチウマ", { parent: "<3代血統情報>", index: 0 })
      .set("馬名", "ハハウマ", { parent: "<3代血統情報>", index: 1 })
      .set("馬名", "ハハノチチ", { parent: "<3代血統情報>", index: 4 })
      .set("馬名", "ハハノハハ", { parent: "<3代血統情報>", index: 5 })
      .set("馬名", "ハハノチチチチ", { parent: "<3代血統情報>", index: 10 })
      .set("産地名", "新冠")
      .set("調教師コード", "01234")
      .set("調教師名略称", "藤沢和")
      .set("生産者コード", "00012345")
      .set("生産者名(法人格無)", "有限会社テスト牧場");
    const ks = new JvdataRecord("KS");
    ks.set("データ区分", "1")
      .set("騎手コード", "01088")
      .set("騎手名", "武　豊")
      .set("騎手名半角ｶﾅ", "ﾀｹ            ﾕﾀｶ")
      .set("騎手名略称", "武豊")
      .set("生年月日", "19690315")
      .set("騎手免許交付年月日", "19870301")
      .set("騎手東西所属コード", "2")
      .set("所属調教師コード", "01234")
      .set("所属調教師名略称", "藤沢和")
      .set("騎手見習コード", "0");
    const ks2 = new JvdataRecord("KS");
    ks2
      .set("データ区分", "2")
      .set("騎手コード", "05001")
      .set("騎手名", "ルメール")
      .set("騎手名略称", "ルメール")
      .set("騎手東西所属コード", "4")
      .set("招待地域名", "フランス")
      .set("騎手抹消区分", "1")
      .set("騎手免許抹消年月日", "20240101");
    const ch = new JvdataRecord("CH");
    ch.set("データ区分", "1")
      .set("調教師コード", "01234")
      .set("調教師名", "藤沢　和雄")
      .set("調教師名半角ｶﾅ", "ﾌｼﾞｻﾜ         ｶｽﾞｵ")
      .set("調教師名略称", "藤沢和")
      .set("生年月日", "19510501")
      .set("調教師免許交付年月日", "19870301")
      .set("調教師東西所属コード", "1");
    const ch2 = new JvdataRecord("CH");
    ch2
      .set("データ区分", "2")
      .set("調教師コード", "09999")
      .set("調教師名", "ガイコク")
      .set("調教師名略称", "ガイコク")
      .set("調教師東西所属コード", "3")
      .set("招待地域名", "大井");

    expect(
      await importKolFiles({
        "UM.jvd": um.buffer,
        "KS.jvd": Buffer.concat([ks.buffer, ks2.buffer]),
        "CH.jvd": Buffer.concat([ch.buffer, ch2.buffer]),
      }),
    ).toEqual([]);

    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.EigoBamei).toBe("Test Horse");
    expect(uma.Seinengappi).toBe(20040401);
    expect(uma.Seinen).toBe(2004);
    expect(uma.Seibetsu).toBe(1);
    expect(uma.Kesshu).toBe(1);
    expect(uma.Keiro).toBe(3);
    expect(uma.SanchiMei).toBe("新冠");
    const chichi = await repo(Uma).findOneByOrFail({ Id: uma.ChichiUmaId });
    expect(chichi.KanaBamei).toBe("チチウマ");
    expect(chichi.Seibetsu).toBe(0);
    const haha = await repo(Uma).findOneByOrFail({ Id: uma.HahaUmaId });
    expect(haha.KanaBamei).toBe("ハハウマ");
    expect(haha.Seibetsu).toBe(1);
    // 母の父、母の母は、母につながる
    const hahaChichi = await repo(Uma).findOneByOrFail({ Id: haha.ChichiUmaId });
    expect(hahaChichi.KanaBamei).toBe("ハハノチチ");
    const hahaChichiChichi = await repo(Uma).findOneByOrFail({ Id: hahaChichi.ChichiUmaId });
    expect(hahaChichiChichi.KanaBamei).toBe("ハハノチチチチ");
    const seisansha = await repo(Seisansha).findOneByOrFail({ JvDataCode: "00012345" });
    const shoyuu = await repo(Shoyuu).findOneByOrFail({ Meishou: "テスト牧場" });
    expect(await repo(SeisanshaMei).find()).toEqual([
      expect.objectContaining({
        SeisanshaId: seisansha.Id,
        ShoyuuId: shoyuu.Id,
        Kubun: MeishouKubun.Meishou,
      }),
    ]);
    expect(await repo(Seisanba).find()).toEqual([
      expect.objectContaining({ UmaId: uma.Id, SeisanshaId: seisansha.Id }),
    ]);

    const kishu = await repo(Kishu).findOneByOrFail({ JvDataKishuCode: "01088" });
    expect(kishu.Seinengappi).toBe(19690315);
    expect(kishu.MenkyoKoufuNengappi).toBe(19870301);
    expect(kishu.Shozoku).toBe(2);
    expect(kishu.ShoutaiKubun).toBeNull();
    const choukyoushi = await repo(Choukyoushi).findOneByOrFail({ JvDataChoukyoushiCode: "01234" });
    expect(kishu.ShozokuChoukyoushiId).toBe(choukyoushi.Id);
    expect(choukyoushi.Seinengappi).toBe(19510501);
    expect(choukyoushi.HatsuMenkyoNen).toBe(1987);
    expect(choukyoushi.TouzaiBetsu).toBe(TouzaiBetsu.Higashi);
    expect(uma.Id).toBeGreaterThan(0);

    const gaikoku = await repo(Kishu).findOneByOrFail({ JvDataKishuCode: "05001" });
    expect(gaikoku.Shozoku).toBe(3);
    expect(gaikoku.ShoutaiKubun).toBe(2);
    expect(gaikoku.ShozokuBashoMei).toBe("フランス");
    expect(gaikoku.MenkyoMasshouNengappi).toBe(20240101);
    const chihou = await repo(Choukyoushi).findOneByOrFail({ JvDataChoukyoushiCode: "09999" });
    expect(chihou.TouzaiBetsu).toBe(TouzaiBetsu.Chihou);
    expect(chihou.ShoutaiKubun).toBe(1);
    expect(chihou.ShozokuBashoMei).toBe("大井");
  });

  test("繁殖馬・産駒: 祖先を繁殖登録番号でつなぐ", async () => {
    await emptyKolDb();
    // 先に馬名だけで母をつないでおく (KOL・JRA-VAN の血統のように)
    const um = new JvdataRecord("UM");
    um.set("データ区分", "1")
      .set("血統登録番号", "2004101234")
      .set("馬名", "テストホース")
      .set("性別コード", "1")
      .set("馬名", "ハハウマ", { parent: "<3代血統情報>", index: 1 });
    expect(await importKolFiles({ "UM.jvd": um.buffer })).toEqual([]);
    const hahaByName = await repo(Uma).findOneByOrFail({ KanaBamei: "ハハウマ" });

    const sk = new JvdataRecord("SK");
    sk.set("データ区分", "1")
      .set("血統登録番号", "2004101234")
      .set("生年月日", "20040401")
      .set("性別コード", "1")
      .set("品種コード", "1")
      .set("毛色コード", "03")
      .set("産駒持込区分", "1")
      .set("輸入年", 2005)
      .set("生産者コード", "00054321")
      .set("産地名", "新冠")
      .set("3代血統 繁殖登録番号", "0000100001", { index: 0 })
      .set("3代血統 繁殖登録番号", "0000200002", { index: 1 })
      .set("3代血統 繁殖登録番号", "0000100003", { index: 2 });
    const chichi = new JvdataRecord("HN");
    chichi
      .set("データ区分", "1")
      .set("繁殖登録番号", "0000100001")
      .set("血統登録番号", "1995101111")
      .set("馬名", "チチウマ")
      .set("馬名欧字", "Chichi Uma")
      .set("生年", 1995)
      .set("性別コード", "1")
      .set("品種コード", "1")
      .set("毛色コード", "01")
      .set("繁殖馬持込区分", "0")
      .set("父馬繁殖登録番号", "0000100003");
    // 外国の繁殖馬: 血統登録番号がなく、馬名は欧字
    const chichiChichi = new JvdataRecord("HN");
    chichiChichi
      .set("データ区分", "1")
      .set("繁殖登録番号", "0000100003")
      .set("馬名", "Foreign Sire")
      .set("馬名欧字", "Foreign Sire")
      .set("生年", 1985)
      .set("性別コード", "1")
      .set("繁殖馬持込区分", "3")
      .set("輸入年", 1990);
    // 馬名が同じでも、繁殖登録番号が違えば別の馬
    const douMei = new JvdataRecord("HN");
    douMei
      .set("データ区分", "1")
      .set("繁殖登録番号", "0000100009")
      .set("馬名", "チチウマ")
      .set("生年", 1970)
      .set("性別コード", "1");
    expect(
      await importKolFiles({
        "SK.jvd": sk.buffer,
        "HN.jvd": Buffer.concat([chichi.buffer, chichiChichi.buffer, douMei.buffer]),
      }),
    ).toEqual([]);

    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.Seinengappi).toBe(20040401);
    expect(uma.YunyuubaFlag).toBe(2);
    expect(uma.YunyuuNen).toBe(2005);
    // 生産者マスタがまだないので、生産者はなく、馬がコードを持つだけ
    expect(uma.JvDataSeisanshaCode).toBe("00054321");
    expect(await repo(Seisansha).find()).toEqual([]);
    expect(uma.SanchiMei).toBe("新冠");
    // 馬名でつないでいた母に、繁殖登録番号が付く
    expect(uma.HahaUmaId).toBe(hahaByName.Id);
    const link = await repo(Hanshokuba).findOneByOrFail({ HanshokuTourokuBangou: "0000200002" });
    expect(link.UmaId).toBe(hahaByName.Id);

    const chichiUma = await repo(Uma).findOneByOrFail({ Id: uma.ChichiUmaId });
    expect(chichiUma.KanaBamei).toBe("チチウマ");
    expect(chichiUma.EigoBamei).toBe("Chichi Uma");
    expect(chichiUma.KettouTourokuBangou).toBe("95101111");
    expect(chichiUma.Seinen).toBe(1995);
    expect(chichiUma.Keiro).toBe(1);
    expect(chichiUma.YunyuubaFlag).toBe(1);
    const chichiChichiUma = await repo(Uma).findOneByOrFail({ Id: chichiUma.ChichiUmaId });
    expect(chichiChichiUma.KanaBamei).toBeNull();
    expect(chichiChichiUma.EigoBamei).toBe("Foreign Sire");
    expect(chichiChichiUma.YunyuubaFlag).toBe(3);
    expect(chichiChichiUma.YunyuuNen).toBe(1990);
    expect(chichiUma.YunyuuNen).toBeNull();

    const douMeiUma = await repo(Uma).findBy({ KanaBamei: "チチウマ" });
    expect(douMeiUma.length).toBe(2);
    expect((await repo(Hanshokuba).find()).length).toBe(4);

    // 名前だけの生産者 (KOL・JRDB・JRA-VAN のような)
    const um2 = new JvdataRecord("UM");
    um2
      .set("データ区分", "1")
      .set("血統登録番号", "2007107777")
      .set("馬名", "ナマエダケ")
      .set("生産者名(法人格無)", "テスト牧場");
    expect(await importKolFiles({ "UM.jvd": um2.buffer })).toEqual([]);
    const uma3 = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "07107777" });
    const nameOnly = await repo(Seisansha).findOneByOrFail({});
    expect(nameOnly.JvDataCode).toBeNull();

    // 生産者マスタが来ると、名前だけの生産者にコードが付き、コードを持つ馬がつながる
    const br = new JvdataRecord("BR");
    br.set("データ区分", "1")
      .set("生産者コード", "00054321")
      .set("生産者名(法人格有)", "有限会社テスト牧場")
      .set("生産者名(法人格無)", "テスト牧場")
      .set("生産者名半角ｶﾅ", "ﾃｽﾄﾎﾞｸｼﾞｮｳ")
      .set("生産者名欧字", "Test Farm")
      .set("生産者住所自治省名", "新冠町");
    expect(await importKolFiles({ "BR.jvd": br.buffer })).toEqual([]);
    const seisansha = await repo(Seisansha).findOneByOrFail({ JvDataCode: "00054321" });
    expect(seisansha.Id).toBe(nameOnly.Id);
    expect(seisansha.Juusho).toBe("新冠町");
    // 正式名・フリガナ・欧字が、区分ごとに生産者の名前になる (欧字は空白を残す)
    const mei = await repo(SeisanshaMei).findBy({ SeisanshaId: seisansha.Id });
    const names = new Map(
      await Promise.all(
        mei.map(
          async (m) =>
            [m.Kubun, (await repo(Shoyuu).findOneByOrFail({ Id: m.ShoyuuId })).Meishou] as const,
        ),
      ),
    );
    expect(names).toEqual(
      new Map([
        [MeishouKubun.Meishou, "テスト牧場"],
        [MeishouKubun.Furigana, "テストボクジョウ"],
        [MeishouKubun.Eigo, "Test Farm"],
      ]),
    );

    for (const umaId of [uma.Id, uma3.Id]) {
      expect(await repo(Seisanba).findBy({ UmaId: umaId })).toEqual([
        expect.objectContaining({ SeisanshaId: seisansha.Id }),
      ]);
    }

    // 生産者マスタのあとに来た産駒マスタも、同じ生産者につながる
    const sk2 = new JvdataRecord("SK");
    sk2.set("データ区分", "1").set("血統登録番号", "2006105555").set("生産者コード", "00054321");
    expect(await importKolFiles({ "SK.jvd": sk2.buffer })).toEqual([]);
    const uma2 = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "06105555" });
    expect((await repo(Seisanba).findOneByOrFail({ UmaId: uma2.Id })).SeisanshaId).toBe(
      seisansha.Id,
    );
    expect((await repo(Seisansha).find()).length).toBe(1);
  });

  test("系統情報・馬名の意味由来・市場取引価格", async () => {
    await emptyKolDb();
    // 系統情報が繁殖馬マスタより先に来ても、同じ馬になる
    const bt = new JvdataRecord("BT");
    bt.set("データ区分", "1")
      .set("繁殖登録番号", "0000100001")
      .set("系統ID", "0102")
      .set("系統名", "テスト系")
      .set("系統説明", "テストの系統の説明");
    const deleted = new JvdataRecord("BT");
    deleted.set("データ区分", "0").set("繁殖登録番号", "0000100002").set("系統ID", "0103");
    expect(await importKolFiles({ "BT.jvd": Buffer.concat([bt.buffer, deleted.buffer]) })).toEqual(
      [],
    );
    expect(await repo(Keitou).find()).toEqual([
      { Id: "0102", Meishou: "テスト系", Setsumei: "テストの系統の説明" },
    ]);
    const hn = new JvdataRecord("HN");
    hn.set("データ区分", "1")
      .set("繁殖登録番号", "0000100001")
      .set("馬名", "チチウマ")
      .set("生年", 1995)
      .set("性別コード", "1");
    expect(await importKolFiles({ "HN.jvd": hn.buffer })).toEqual([]);
    const chichi = await repo(Uma).findOneByOrFail({ KanaBamei: "チチウマ" });
    expect(chichi.KeitouId).toBe("0102");
    expect(await repo(Uma).count()).toBe(1);

    const hy = new JvdataRecord("HY");
    hy.set("データ区分", "1")
      .set("血統登録番号", "2004101234")
      .set("馬名", "テストホース")
      .set("馬名の意味由来", "試すこと");
    const hs = (kaishi: string, kakaku: number) =>
      new JvdataRecord("HS")
        .set("データ区分", "1")
        .set("血統登録番号", "2004101234")
        .set("父馬 繁殖登録番号", "0000100001")
        .set("生年", 2004)
        .set("主催者・市場コード", "000123")
        .set("主催者名称", "テスト協会")
        .set("市場の名称", "テストセール")
        .set("市場の開催期間(開始日)", kaishi)
        .set("市場の開催期間(終了日)", "20050712")
        .set("取引時の競走馬の年齢", 1)
        .set("取引価格", kakaku);
    expect(
      await importKolFiles({
        "HOYU.jvd": hy.buffer,
        "HOSE.jvd": Buffer.concat([
          hs("20050711", 21000000).buffer,
          // 同じ馬が同じ市場で再び取引されたもの
          hs("20060710", 30000000).buffer,
        ]),
      }),
    ).toEqual([]);
    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.BameiYurai).toBe("試すこと");
    expect(uma.Seinen).toBe(2004);
    expect(await repo(Shijou).find()).toEqual([
      { Code: "000123", ShusaishaMei: "テスト協会", Meishou: "テストセール" },
    ]);
    const torihiki = await repo(ShijouTorihiki).find();
    expect(torihiki.map((t) => [t.UmaId, t.KaishiNengappi, t.Kakaku])).toEqual([
      [uma.Id, 20050711, 21000000],
      [uma.Id, 20060710, 30000000],
    ]);
    expect(torihiki[0].ShuuryouNengappi).toBe(20050712);
    expect(torihiki[0].Nenrei).toBe(1);
  });

  test("コース情報", async () => {
    await emptyKolDb();
    const cs = (kaishuu: string, setsumei: string) =>
      new JvdataRecord("CS")
        .set("データ区分", "1")
        .set("競馬場コード", "05")
        .set("距離", 1600)
        .set("トラックコード", "11")
        .set("コース改修年月日", kaishuu)
        .set("コース説明", setsumei);
    expect(
      await importKolFiles({
        "COMM.jvd": Buffer.concat([
          cs("20030101", "改修前").buffer,
          cs("20030101", "改修前 (更新)").buffer,
          cs("20031101", "改修後").buffer,
        ]),
      }),
    ).toEqual([]);
    const list = await repo(CourseSetsumei).find();
    expect(list.map((c) => [c.KaishuuNengappi, c.Setsumei])).toEqual([
      [20030101, "改修前 (更新)"],
      [20031101, "改修後"],
    ]);
    expect(list[0]).toEqual(
      expect.objectContaining({
        Basho: 4,
        Kyori: 1600,
        TrackCode: 11,
        DirtShiba: $R.DirtShiba.Shiba,
        MigiHidari: 1,
        UchiSoto: 0,
      }),
    );
  });

  test("馬主マスタ: 馬主は日付ごとに馬につながり、馬主が変わってもよい", async () => {
    await emptyKolDb();
    // 名前だけの馬主 (KOL・JRDB のような) を、出走馬で先に作っておく
    const r1 = ra("7");
    const s1 = se(1, "2004101234", "テストホース", "01088");
    s1.set("馬主コード", "000000").set("馬主名(法人格無)", "テスト".padEnd(61));
    // 2 走目 (翌週) は、馬主が変わっている
    const r2 = raceKey(new JvdataRecord("RA"), 10).set("開催月日", "1013").set("データ区分", "7");
    const s2 = raceKey(se(1, "2004101234", "テストホース", "01088"), 10)
      .set("開催月日", "1013")
      .set("馬主コード", "654321")
      .set("馬主名(法人格無)", "アタラシイ".padEnd(59));
    // 競走馬マスタは、データ作成年月日の時点の馬主 (元の馬主に戻っている)
    const um = new JvdataRecord("UM");
    um.set("データ区分", "2")
      .set("データ作成年月日", "20071101")
      .set("血統登録番号", "2004101234")
      .set("馬名", "テストホース")
      .set("馬主コード", "123456")
      .set("馬主名(法人格無)", "テスト");
    expect(
      await importKolFiles({
        // 取り込む順序は、日付の順でなくてよい
        "UM.jvd": um.buffer,
        "RACE.jvd": Buffer.concat([r2.buffer, s2.buffer, r1.buffer, s1.buffer]),
      }),
    ).toEqual([]);
    const bn = new JvdataRecord("BN");
    bn.set("データ区分", "1")
      .set("馬主コード", "123456")
      .set("馬主名(法人格有)", "株式会社テスト")
      .set("馬主名(法人格無)", "テスト")
      .set("馬主名半角ｶﾅ", "ﾃｽﾄ")
      .set("馬主名欧字", "Test Co.")
      .set("服色標示", "水色，赤山形一本輪，水色袖");
    expect(await importKolFiles({ "BN.jvd": bn.buffer })).toEqual([]);

    // 名前だけの馬主に、コードが付いて同じ馬主になる
    const banushi = await repo(Banushi).find();
    expect(banushi.map((b) => b.JvDataCode).sort()).toEqual(["123456", "654321"]);
    const test = banushi.find((b) => b.JvDataCode === "123456");
    expect(test?.Fukushoku).toBe("水色,赤山形一本輪,水色袖");
    expect(await banushiMeishou(test?.Id ?? 0)).toEqual(
      new Map([
        [MeishouKubun.Meishou, "テスト"],
        [MeishouKubun.Furigana, "テスト"],
        [MeishouKubun.Eigo, "Test Co."],
      ]),
    );
    const atarashii = banushi.find((b) => b.JvDataCode === "654321");
    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    const history = await repo(UmaBanushi).findBy({ UmaId: uma.Id });
    expect(history.map((h) => [h.Nengappi, h.BanushiId])).toEqual([
      [20071006, test?.Id],
      [20071013, atarashii?.Id],
      [20071101, test?.Id],
    ]);
  });

  test("開催スケジュール", async () => {
    await emptyKolDb();
    const ys = new JvdataRecord("YS");
    ys.set("データ区分", "1")
      .set("開催年", 2008)
      .set("開催月日", "0105")
      .set("競馬場コード", "06")
      .set("開催回[第N回]", 1)
      .set("開催日目[N日目]", 1)
      .set("曜日コード", "1");
    const cancelled = new JvdataRecord("YS");
    cancelled
      .set("データ区分", "9")
      .set("開催年", 2008)
      .set("開催月日", "0106")
      .set("競馬場コード", "06")
      .set("開催回[第N回]", 1)
      .set("開催日目[N日目]", 2);
    expect(
      await importKolFiles({ "YS.jvd": Buffer.concat([ys.buffer, cancelled.buffer]) }),
    ).toEqual([]);
    const kaisai = await repo(Kaisai).find();
    expect(kaisai.length).toBe(1);
    expect(kaisai[0].Basho).toBe(5);
    expect(kaisai[0].Gatsu).toBe(1);
    expect(kaisai[0].Nichi).toBe(5);
  });
});

describe("特別登録馬・競走馬除外情報", () => {
  const P = "<登録馬毎情報>";

  function tk(kubun: string, kinryou?: number) {
    const r = raceKey(new JvdataRecord("TK"));
    r.set("データ区分", kubun)
      .set("曜日コード", "1")
      .set("競走名本題", "テストハンデキャップ")
      .set("競走名略称3文字", "テスト")
      .set("グレードコード", "C")
      .set("競走種別コード", "13")
      .set("競走記号コード", "000")
      .set("重量種別コード", "1")
      .set("競走条件コード 最若年条件", "999")
      .set("距離", 1600)
      .set("トラックコード", "11")
      .set("ハンデ発表日", "20071001")
      .set("登録頭数", 2);
    const horse = (index: number, touroku: string, bamei: string, kouryuu: string) => {
      const o = { parent: P, index };
      r.set("連番", index + 1, o)
        .set("血統登録番号", touroku, o)
        .set("馬名", bamei, o)
        .set("性別コード", "1", o)
        .set("調教師コード", "01234", o)
        .set("調教師名略称", "藤沢和", o)
        .set("交流区分", kouryuu, o);
      if (kinryou) {
        r.set("負担重量", kinryou, o);
      }
    };
    horse(0, "2004101234", "テストホース", "0");
    horse(1, "2004101235", "チホウバ", "1");
    return r;
  }

  test("特別登録馬: レースと登録馬を保存し、ハンデ発表後に負担重量が入る", async () => {
    await emptyKolDb();
    expect(
      await importKolFiles({
        // ハンデ発表後のあとにハンデ発表前が来ても、負担重量は消えない
        "TOKU.jvd": Buffer.concat([tk("2", 560).buffer, tk("1").buffer]),
      }),
    ).toEqual([]);
    const race = await repo(Race).findOneByOrFail({});
    expect(race).toEqual(
      expect.objectContaining({ RaceBangou: 11, Kyori: 1600, HandiHappyoubi: 20071001 }),
    );
    const list = await repo(TokubetsuTourokuba).find();
    expect(list.map((t) => [t.Renban, t.Kinryou, t.KouryuuKubun])).toEqual([
      [1, 56, null],
      [2, 56, 1],
    ]);
    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(list[0].UmaId).toBe(uma.Id);
    const choukyoushi = await repo(Choukyoushi).findOneByOrFail({ JvDataChoukyoushiCode: "01234" });
    const kyousouba = await repo(Kyousouba).findOneByOrFail({ Id: list[0].KyousoubaId ?? 0 });
    expect(kyousouba.ChoukyoushiId).toBe(choukyoushi.Id);
    // 特別登録馬は出走馬ではない
    expect(await repo(Shussouba).count()).toBe(0);
  });

  test("競走馬除外情報: 受付の順番ごとに除外馬を保存する", async () => {
    await emptyKolDb();
    const jg = (jun: number, shussou: string, jogai: string) =>
      raceKey(new JvdataRecord("JG"))
        .set("データ区分", "1")
        .set("血統登録番号", "2004101234")
        .set("馬名", "テストホース")
        .set("出馬投票受付順番", jun)
        .set("出走区分", shussou)
        .set("除外状態区分", jogai);
    expect(
      await importKolFiles({
        "RACE.jvd": Buffer.concat([jg(1, "2", "2").buffer, jg(2, "5", "1").buffer]),
      }),
    ).toEqual([]);
    const race = await repo(Race).findOneByOrFail({});
    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(await repo(TouhyouJogaiba).find()).toEqual([
      { RaceId: race.Id, UmaId: uma.Id, UketsukeJun: 1, ShussouKubun: 2, JogaiJoutai: 2 },
      { RaceId: race.Id, UmaId: uma.Id, UketsukeJun: 2, ShussouKubun: 5, JogaiJoutai: 1 },
    ]);
  });
});

describe("データマイニング予想", () => {
  function dm(kubun: string, umaban: number, time: string, plus: string, minus: string) {
    return raceKey(new JvdataRecord("DM"))
      .set("データ区分", kubun)
      .set("馬番", umaban, { parent: "<マイニング予想>" })
      .set("予想走破タイム", time, { parent: "<マイニング予想>" })
      .set("予想誤差(信頼度)＋", plus, { parent: "<マイニング予想>" })
      .set("予想誤差(信頼度)－", minus, { parent: "<マイニング予想>" });
  }

  test("タイム型・対戦型: あとの時点の予想を残し、出走馬がなければ作る", async () => {
    await emptyKolDb();
    const tm = raceKey(new JvdataRecord("TM"))
      .set("データ区分", "1")
      .set("馬番", 1, { parent: "<マイニング予想>" })
      .set("予測スコア", "0725", { parent: "<マイニング予想>" })
      .set("馬番", 2, { parent: "<マイニング予想>", index: 1 })
      .set("予測スコア", "1000", { parent: "<マイニング予想>", index: 1 });
    expect(
      await importKolFiles({
        "MING.jvd": Buffer.concat([
          // 直前予想のあとに前日予想が来ても、直前予想が残る
          dm("3", 1, "13456", "0050", "0120").buffer,
          dm("1", 1, "13500", "0100", "0200").buffer,
          tm.buffer,
        ]),
      }),
    ).toEqual([]);
    const race = await repo(Race).findOneByOrFail({});
    const shussouba = await repo(Shussouba).findBy({ RaceId: race.Id });
    expect(shussouba.map((s) => s.Umaban).sort()).toEqual([1, 2]);
    const yosou = await repo(ShussoubaYosou).find();
    const first = yosou.find((y) => y.Id === shussouba.find((s) => s.Umaban === 1)?.Id);
    expect(first).toEqual(
      expect.objectContaining({ DmKubun: 3, TmKubun: 1, TmScore: 72.5, DmGosaPlus: 0.5 }),
    );
    expect(first?.DmTime).toBeCloseTo(94.56);
    expect(first?.DmGosaMinus).toBeCloseTo(1.2);
    const second = yosou.find((y) => y.Id === shussouba.find((s) => s.Umaban === 2)?.Id);
    expect(second?.TmScore).toBe(100);
    expect(second?.DmTime).toBeNull();

    // あとから馬毎レース情報が来ても、同じ出走馬になる
    expect(
      await importKolFiles({ "RACE.jvd": se(1, "2004101234", "テストホース", "01088").buffer }),
    ).toEqual([]);
    expect((await repo(Shussouba).findBy({ RaceId: race.Id })).length).toBe(2);
    expect((await repo(ShussoubaYosou).findOneByOrFail({ Id: first?.Id ?? 0 })).DmKubun).toBe(3);
  });
});

describe("調教", () => {
  /** 坂路調教。時計は 0.1 秒単位 (4 ハロン合計、3 ハロン合計、2 ハロン合計、最後の 1 ハロン) */
  function hc(jikoku: string, f4: number, f3: number, f2: number, f1: number) {
    return new JvdataRecord("HC")
      .set("データ区分", "1")
      .set("トレセン区分", "0")
      .set("調教年月日", "20071003")
      .set("調教時刻", jikoku)
      .set("血統登録番号", "2004101234")
      .set("4ハロンタイム合計(800M～0M)", f4)
      .set("ラップタイム(800M～600M)", f4 - f3)
      .set("3ハロンタイム合計(600M～0M)", f3)
      .set("ラップタイム(600M～400M)", f3 - f2)
      .set("2ハロンタイム合計(400M～0M)", f2)
      .set("ラップタイム(400M～200M)", f2 - f1)
      .set("ラップタイム(200M～0M)", f1);
  }

  async function timesOf(choukyouId: number) {
    const times = await repo(ChoukyouTime).findBy({ ChoukyouId: choukyouId });
    return times.map((t) => [t.F, t.Time]).sort((a, b) => (b[0] ?? 0) - (a[0] ?? 0));
  }

  test("坂路調教: KOL から入った同じ調教の行に足し、違う調教は別の行にする", async () => {
    await emptyKolDb();
    // KOL から入った調教 (美浦の坂路は美浦南)
    const uma = await umaDao.saveUma({
      KettouTourokuBangou: "04101234",
      KanaBamei: "テストホース",
    } as Uma);
    const days = tool.getDaysFrom1970With(2007, 10, 3);
    const kol = {
      UmaId: uma.Id,
      Nengappi: 20071003,
      Basho: 51,
      Type: $CH.ChoukyouType.Hanro,
      Oikiri: 3,
    } as Choukyou;
    choukyouDao.saveChoukyou(kol, days, [
      { F: 4, Time: 52.3 },
      { F: 3, Time: 38.1 },
      { F: 1, Time: 12.4 },
    ] as ChoukyouTime[]);

    expect(
      await importKolFiles({
        "SLOP.jvd": Buffer.concat([
          hc("0712", 523, 381, 250, 124).buffer,
          // 同じ日の 2 本目
          hc("0805", 550, 400, 262, 128).buffer,
        ]),
      }),
    ).toEqual([]);
    const list = await repo(Choukyou).find();
    expect(list.map((c) => [c.Renban, c.Jikoku, c.Oikiri])).toEqual([
      [1, "07:12", 3],
      [2, "08:05", null],
    ]);
    expect(list[0].Id).toBe(kol.Id);
    expect(list.every((c) => c.Basho === 51 && c.UmaId === uma.Id)).toBe(true);
    expect(await timesOf(list[0].Id)).toEqual([
      [4, 52.3],
      [3, 38.1],
      [2, 25],
      [1, 12.4],
    ]);
  });

  test("ウッドチップ調教: コース・馬場周りと、測定不良を除いた時計", async () => {
    await emptyKolDb();
    const wc = new JvdataRecord("WC")
      .set("データ区分", "1")
      .set("トレセン区分", "1")
      .set("調教年月日", "20071003")
      .set("調教時刻", "0630")
      .set("血統登録番号", "2004101234")
      .set("コース", "2")
      .set("馬場周り", "0")
      // 10・9 ハロンは測定不良、8 ハロンは上限
      .set("10ハロンタイム合計(2000M～0M)", "0000")
      .set("9ハロンタイム合計(1800M～0M)", "0000")
      .set("8ロンタイム合計(1600M～0M)", "9999")
      .set("6ハロンタイム合計(1200M～0M)", 834)
      .set("5ハロンタイム合計(1000M～0M)", 680)
      .set("4ハロンタイム合計(800M～0M)", 528)
      .set("3ハロンタイム合計(600M～0M)", 385)
      .set("2ハロンタイム合計(400M～0M)", 252)
      .set("ラップタイム(200M～0M)", 121);
    expect(await importKolFiles({ "WOOD.jvd": wc.buffer })).toEqual([]);
    const choukyou = await repo(Choukyou).findOneByOrFail({});
    expect(choukyou).toEqual(
      expect.objectContaining({
        Basho: 50,
        Type: $CH.ChoukyouType.WoodChip,
        Course: 3,
        MigiHidari: 0,
        Jikoku: "06:30",
        Nengappi: 20071003,
      }),
    );
    expect(await timesOf(choukyou.Id)).toEqual([
      [6, 83.4],
      [5, 68],
      [4, 52.8],
      [3, 38.5],
      [2, 25.2],
      [1, 12.1],
    ]);
  });
});

describe("ファイルの読み方", () => {
  test("末尾に改行がなくても読み、複数のファイルを続けて読む", async () => {
    await emptyKolDb();
    const r1 = ra("7");
    const r2 = raceKey(new JvdataRecord("RA"), 12).set("データ区分", "7").set("距離", 1200);
    r2.set("トラックコード", "17").set("競走種別コード", "13");
    const noEol = r2.buffer.subarray(0, r2.buffer.length - 2);
    const r3 = raceKey(new JvdataRecord("RA"), 10).set("データ区分", "7").set("距離", 1400);
    r3.set("トラックコード", "17").set("競走種別コード", "13");
    // 壊れたレコード (長さが違う) は読み飛ばす
    const broken = Buffer.concat([r1.buffer.subarray(0, 100), Buffer.from("\r\n")]);
    expect(
      await importKolFiles({
        "a.jvd": Buffer.concat([r1.buffer, broken, noEol]),
        "b.jvd": r3.buffer,
      }),
    ).toEqual([]);
    const races = await repo(Race).find();
    expect(races.map((x) => [x.RaceBangou, x.Kyori]).sort()).toEqual([
      [10, 1400],
      [11, 1600],
      [12, 1200],
    ]);
  });
});
