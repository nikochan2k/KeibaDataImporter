import "reflect-metadata";
import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { Container } from "typedi";
import { Baken, Kakutei, TouzaiBetsu, touzaiBetsu } from "../src/app/converters/Common";
import * as $K from "../src/app/converters/Kishu";
import * as $R from "../src/app/converters/Race";
import * as $S from "../src/app/converters/Shussouba";
import * as $U from "../src/app/converters/Uma";
import { dataSource } from "../src/app/DataSource";
import { Banushi } from "../src/app/entities/Banushi";
import { Choukyoushi } from "../src/app/entities/Choukyoushi";
import { Kaisai } from "../src/app/entities/Kaisai";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { RaceLapTime } from "../src/app/entities/RaceLapTime";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { Seisansha } from "../src/app/entities/Seisansha";
import { Shoyuu } from "../src/app/entities/Shoyuu";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { ShussoubaTsuukaJuni } from "../src/app/entities/ShussoubaTsuukaJuni";
import { Uma } from "../src/app/entities/Uma";
import { getJraTrack } from "../src/app/reader/JRA/JraTrack";
import { JvdataCh } from "../src/app/reader/JRA/JVData/JvdataCh";
import { JvdataHr } from "../src/app/reader/JRA/JVData/JvdataHr";
import { JvdataKs } from "../src/app/reader/JRA/JVData/JvdataKs";
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
import { JvdataUm } from "../src/app/reader/JRA/JVData/JvdataUm";
import { JvdataYs } from "../src/app/reader/JRA/JVData/JvdataYs";
import { JvdataRecord, parseJvdataCodes, parseJvdataSpec } from "./spec/jvdata";
import { closeKolDb, emptyKolDb, importKolFiles } from "./spec/kol";

afterAll(closeKolDb);

setDefaultTimeout(60_000);

const repo = <T extends object>(e: new () => T) => dataSource.getRepository(e);

const handlers = [
  JvdataRa,
  JvdataSe,
  JvdataHr,
  JvdataO1,
  JvdataO2,
  JvdataO3,
  JvdataO4,
  JvdataO5,
  JvdataO6,
  JvdataUm,
  JvdataKs,
  JvdataCh,
  JvdataYs,
];

describe("JV-Data の仕様書", () => {
  for (const handler of handlers) {
    const record = Container.get(handler);
    test(`${record.id}: 取り込み処理のレコード長が仕様書と一致する`, () => {
      expect(record.length).toBe(parseJvdataSpec(record.id).size);
    });
  }

  test("仕様書のレコードは、どれも末尾が CR/LF で、位置が重ならない", () => {
    for (const id of ["TK", "RA", "SE", "HR", "H1", "H6", "UM", "KS", "CH", "BR", "BN", "RC"]) {
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
    const banushi = await repo(Banushi).findOneByOrFail({ ShussoubaId: shussouba?.Id });
    const shoyuu = await repo(Shoyuu).findOneByOrFail({ Id: banushi.MeishouId });
    expect(shoyuu.Meishou).toBe("テスト");

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
    const noId = new JvdataRecord("TK").set("競走名本題", "とくべつ");
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
    expect((await repo(Seisansha).find()).length).toBe(1);
    expect((await repo(Shoyuu).findOneByOrFail({ Meishou: "テスト牧場" })).Id).toBeGreaterThan(0);

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
