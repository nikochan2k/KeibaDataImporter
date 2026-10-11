import "reflect-metadata";
import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { Container } from "typedi";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { dataSource } from "../src/app/DataSource";
import { ChoukyoushiDao } from "../src/app/daos/ChoukyoushiDao";
import { JinmeiDao } from "../src/app/daos/JinmeiDao";
import { KishuDao } from "../src/app/daos/KishuDao";
import { MeishouDao } from "../src/app/daos/MeishouDao";
import { Choukyoushi } from "../src/app/entities/Choukyoushi";
import { JinmeiKubun } from "../src/app/entities/Jinmei";
import { Kaisai } from "../src/app/entities/Kaisai";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { RaceLapTime } from "../src/app/entities/RaceLapTime";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { MeishouKubun } from "../src/app/entities/Shoyuu";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { ShussoubaTsuukaJuni } from "../src/app/entities/ShussoubaTsuukaJuni";
import { Uma } from "../src/app/entities/Uma";
import { JravanChok } from "../src/app/reader/JRA/JRAVAN/JravanChok";
import { JravanDelc, JravanDelk, JravanDelu } from "../src/app/reader/JRA/JRAVAN/JravanDel";
import { JravanDen1 } from "../src/app/reader/JRA/JRAVAN/JravanDen1";
import { JravanDen2 } from "../src/app/reader/JRA/JRAVAN/JravanDen2";
import { JravanKisi } from "../src/app/reader/JRA/JRAVAN/JravanKisi";
import {
  JravanOds1,
  JravanOds3,
  JravanOds4,
  JravanOds5,
  JravanOds6,
} from "../src/app/reader/JRA/JRAVAN/JravanOds";
import { JravanSch1 } from "../src/app/reader/JRA/JRAVAN/JravanSch1";
import { JravanSei1 } from "../src/app/reader/JRA/JRAVAN/JravanSei1";
import { JravanSei2 } from "../src/app/reader/JRA/JRAVAN/JravanSei2";
import { JravanSeih } from "../src/app/reader/JRA/JRAVAN/JravanSeih";
import { JravanUmaj } from "../src/app/reader/JRA/JRAVAN/JravanUmaj";
import { JravanRecord, parseJravanSpec } from "./spec/jravan";
import { closeKolDb, emptyKolDb, importKolFiles } from "./spec/kol";

afterAll(closeKolDb);

setDefaultTimeout(60_000);

const readers = {
  出馬表１: JravanDen1,
  出馬表２: JravanDen2,
  成績１: JravanSei1,
  成績２: JravanSei2,
  成績Ｈ: JravanSeih,
  オッズ１: JravanOds1,
  オッズ３: JravanOds3,
  オッズ４: JravanOds4,
  オッズ５: JravanOds5,
  オッズ６: JravanOds6,
  競走馬: JravanUmaj,
  騎手: JravanKisi,
  調教師: JravanChok,
  抹消競走馬: JravanDelu,
  抹消騎手: JravanDelk,
  抹消調教師: JravanDelc,
  年間スケジュール: JravanSch1,
};

describe("JRA-VAN の仕様書", () => {
  for (const [title, reader] of Object.entries(readers)) {
    test(`${title}: 取り込み処理のレコード長が仕様書と一致する`, () => {
      const instance = Container.get(reader) as unknown as { getBufferLength(): number };
      expect(instance.getBufferLength()).toBe(parseJravanSpec(title).size);
    });
  }
});

const repo = <T extends object>(e: new () => T) => dataSource.getRepository(e);

/** 2007-10-06 (土) 東京 4 回 1 日 11R */
const KEY = "20071006050401";
const RACE_KEY = `${KEY}11`;

/** 先頭の年月日場回日Ｒ */
function withKey(record: JravanRecord, key = RACE_KEY) {
  return record.set("年月日場回日Ｒ", key);
}

function den1() {
  const r = withKey(new JravanRecord("出馬表１"));
  r.set("曜日コード", "1")
    .set("特別競走名本題３０字", "テストステークス")
    .set("特別競走名略称３字", "テスト")
    .set("重賞回次[第ｎ回]", 12)
    .set("グレードコード", "A")
    .set("競走種別コード", "13")
    .set("競走記号コード", "000")
    .set("重量種別コード", "2")
    .set("最若年条件", "999")
    .set("距離", 1600)
    .set("トラックコード", "11")
    .set("本賞金", 10000, { index: 0 })
    .set("本賞金", 4000, { index: 1 })
    .set("付加賞金", 300, { index: 0 })
    .set("発走時刻", "1540")
    .set("競走要項コード", "1")
    .set("登録頭数", "03");
  return r;
}

const P = "<馬番毎情報>";

function horse(
  r: JravanRecord,
  index: number,
  umaban: number,
  touroku: string,
  bamei: string,
  kishu: string,
) {
  const o = { parent: P, index };
  r.set("馬番", umaban, o)
    .set("枠番", Math.min(8, Math.ceil(umaban / 2)), o)
    .set("血統登録番号", touroku, o)
    .set("馬名", bamei, o)
    .set("性別", "1", o)
    .set("負担重量", 550, o)
    .set("ブリンカー", "1", o)
    .set("騎手コード", kishu, o)
    .set("騎手名略称", "武豊", o)
    .set("見習区分コード", "0", o)
    .set("調教師コード", "01234", o)
    .set("調教師名略称", "藤沢和", o);
}

describe("出馬表", () => {
  test("出馬表１と出馬表２", async () => {
    await emptyKolDb();
    const d1 = den1();
    horse(d1, 0, 1, "2004101234", "テストホース", "01088");
    horse(d1, 1, 2, "2004101235", "ツギノウマ", "01089");
    const d2 = withKey(new JravanRecord("出馬表２"));
    horse(d2, 0, 19, "2004101240", "ジュウキュウ", "01088");

    expect(await importKolFiles({ "JracDen1.dat": d1.buffer, "JracDen2.dat": d2.buffer })).toEqual(
      [],
    );

    const kaisai = await repo(Kaisai).findOneByOrFail({ Nen: 2007, Gatsu: 10, Nichi: 6 });
    expect(kaisai.Basho).toBe(4);
    expect(kaisai.Youbi).toBe(1);
    expect(kaisai.Kaiji).toBe(4);
    expect(kaisai.Nichiji).toBe(1);

    const race = await repo(Race).findOneByOrFail({ KaisaiId: kaisai.Id, RaceBangou: 11 });
    expect(race.Kyori).toBe(1600);
    expect(race.DirtShiba).toBe(1);
    expect(race.MigiHidari).toBe(1);
    expect(race.Grade).toBe(1);
    expect(race.IppanTokubetsu).toBe(3);
    expect(race.JuushouKaisuu).toBe(12);
    expect(race.BetteiBareiHandi).toBe(0);
    expect(race.YoteiHassouJikan).toBe("15:40");
    expect(race.Tousuu).toBe(3);
    expect(race.Shoukin1Chaku).toBe(10_000_000);
    expect(race.Shoukin2Chaku).toBe(4_000_000);
    expect(race.FukaShou).toBe(300_000);

    const shussoubaList = await repo(Shussouba).findBy({ RaceId: race.Id });
    expect(shussoubaList.map((s) => s.Umaban).sort((a, b) => a - b)).toEqual([1, 2, 19]);
    const s1 = shussoubaList.find((s) => s.Umaban === 1);
    expect(s1?.Wakuban).toBe(1);
    expect(s1?.Kinryou).toBe(55);
    expect(s1?.Nenrei).toBe(3);

    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.Seinen).toBe(2004);
    const kishu = await repo(Kishu).findOneByOrFail({ JvDataKishuCode: "01088" });
    expect(s1?.KishuId).toBe(kishu.Id);
    const choukyoushi = await repo(Choukyoushi).findOneByOrFail({ JvDataChoukyoushiCode: "01234" });
    expect(choukyoushi.Id).toBeGreaterThan(0);
  });
});

function seiRace(key: string, agari3F: string, track = "11") {
  const r = withKey(new JravanRecord("成績１"), key);
  r.set("特別競走名本題３０字", "テストステークス")
    .set("グレードコード", "A")
    .set("競走種別コード", "13")
    .set("距離", 1600)
    .set("トラックコード", track)
    .set("登録頭数", "02")
    .set("出走頭数", "02")
    .set("入線頭数", "02")
    .set("馬場状態コード", "2", { nth: 1 })
    .set("天候コード", "1", { nth: 1 });
  const o = { parent: P, index: 0 };
  horse(r, 0, 1, "2004101234", "テストホース", "01088");
  r.set("異常区分コード", "0", o)
    .set("馬体重", 480, o)
    .set("増減差", "+04", o)
    .set("コーナー通過順", "03", { ...o, sub: 0 })
    .set("コーナー通過順", "03", { ...o, sub: 1 })
    .set("コーナー通過順", "02", { ...o, sub: 2 })
    .set("コーナー通過順", "01", { ...o, sub: 3 })
    .set("後３ハロンタイム", agari3F, o)
    .set("走破タイム", "1321", o)
    .set("着差コード", "112", o)
    .set("入線順位", 1, o)
    .set("確定着順", 1, o)
    .set("単勝人気順", 1, o)
    .set("単勝オッズ", "0035", o)
    .set("獲得本賞金", 10000, o);
  return r;
}

describe("成績", () => {
  test("成績１ (払戻金・ラップタイム・着順) と成績Ｈ", async () => {
    await emptyKolDb();
    const s1 = seiRace(RACE_KEY, "345");
    s1.set("本賞金", 10000, { index: 0 })
      .set("ラップタイム", "123", { index: 0 })
      .set("ラップタイム", "115", { index: 1 })
      .set("ラップタイム", "118", { index: 2 });
    const t = { parent: "<単勝払戻金>", index: 0 };
    s1.set("馬番", 1, t).set("払戻金", 350, t).set("人気順", 1, t);
    const u = { parent: "<馬連払戻金>", index: 0 };
    s1.set("馬番１・２", "0102", u).set("払戻金", 1230, u).set("人気順", 5, u);
    const h = withKey(new JravanRecord("成績Ｈ"));
    const m = { parent: "<馬単払戻金>", index: 0 };
    h.set("馬番１・２", "0102", m).set("払戻金", 5600, m).set("人気順", 12, m);
    const sr = { parent: "<３連複払戻金>", index: 0 };
    h.set("馬番１・２・３", "010203", sr).set("払戻金", 12340, sr).set("人気順", 5, sr);

    expect(await importKolFiles({ "JracSei1.dat": s1.buffer, "JracSeih.dat": h.buffer })).toEqual(
      [],
    );

    const kaisai = await repo(Kaisai).findOneByOrFail({ Nen: 2007, Gatsu: 10, Nichi: 6 });
    const race = await repo(Race).findOneByOrFail({ KaisaiId: kaisai.Id, RaceBangou: 11 });
    const seiseki = await repo(RaceSeiseki).findOneByOrFail({ Id: race.Id });
    expect(seiseki.Baba).toBe(1);
    expect(seiseki.Tenki).toBe(0);
    expect(seiseki.Shoukin1Chaku).toBe(10_000_000);

    const laps = await repo(RaceLapTime).findBy({ RaceId: race.Id });
    expect(laps.map((l) => [l.KaishiKyori, l.ShuuryouKyori, l.LapTime])).toEqual([
      [0, 200, 12.3],
      [200, 400, 11.5],
      [400, 600, 11.8],
    ]);

    const shussouba = await repo(Shussouba).findOneByOrFail({ RaceId: race.Id, Umaban: 1 });
    const result = await repo(ShussoubaSeiseki).findOneByOrFail({ Id: shussouba.Id });
    expect(result.Time).toBeCloseTo(92.1);
    expect(result.KakuteiChakujun).toBe(1);
    expect(result.NyuusenChakujun).toBe(1);
    expect(result.Agari3F).toBeCloseTo(34.5);
    expect(result.Bataijuu).toBe(480);
    expect(result.Zougen).toBe(4);
    expect(result.Chakusa1).toBe(1);
    expect(result.Chakusa2).toBe(3);
    const tsuuka = await repo(ShussoubaTsuukaJuni).findBy({ ShussoubaId: shussouba.Id });
    expect(tsuuka.map((x) => x.Juni).sort()).toEqual([1, 2, 3, 3]);

    const odds = await repo(OddsHaitou).findBy({ RaceId: race.Id });
    const find = (baken: Baken, b1: number, b2?: number, b3?: number) =>
      odds.find(
        (o) =>
          o.Baken === baken &&
          o.Bangou1 === b1 &&
          (o.Bangou2 ?? undefined) === b2 &&
          (o.Bangou3 ?? undefined) === b3,
      );
    const tan = find(Baken.Tanshou, 1);
    expect(tan?.Haitoukin).toBe(350);
    expect(tan?.Ninki).toBe(1);
    expect(tan?.Odds1).toBeCloseTo(3.5);
    expect(tan?.Kakutei).toBe(Kakutei.Kakutei);
    expect(find(Baken.Umaren, 1, 2)).toMatchObject({ Haitoukin: 1230, Ninki: 5 });
    expect(find(Baken.Umatan, 1, 2)).toMatchObject({ Haitoukin: 5600, Ninki: 12 });
    expect(find(Baken.Sanrenpuku, 1, 2, 3)).toMatchObject({ Haitoukin: 12340, Ninki: 5 });
  });

  test("後 3 ハロンのタイムは、1994 年 7 月 16 日より後は 60 秒を超えた分だけが入っている", async () => {
    await emptyKolDb();
    const before = seiRace("19940702090101" + "01", "669");
    const after = seiRace("19941001090201" + "01", "069");
    expect(
      await importKolFiles({ "JracSei1.dat": Buffer.concat([before.buffer, after.buffer]) }),
    ).toEqual([]);
    const results = await repo(ShussoubaSeiseki).find();
    expect(results.map((r) => r.Agari3F?.toFixed(1))).toEqual(["66.9", "66.9"]);
  });

  test("障害競走のラップタイムは、1 マイル通過と後 4・3 ハロン", async () => {
    await emptyKolDb();
    const r = seiRace(RACE_KEY, "120", "54")
      .set("距離", 3000)
      .set("ラップタイム", "001", { index: 0 })
      .set("ラップタイム", "572", { index: 1 })
      .set("ラップタイム", "540", { index: 2 })
      .set("ラップタイム", "410", { index: 3 });
    expect(await importKolFiles({ "JracSei1.dat": r.buffer })).toEqual([]);
    const race = await repo(Race).findOneByOrFail({ RaceBangou: 11 });
    expect(race.HeichiShougai).toBe(1);
    const laps = await repo(RaceLapTime).findBy({ RaceId: race.Id });
    expect(laps.map((l) => [l.KaishiKyori, l.ShuuryouKyori, l.LapTime]).sort()).toEqual([
      [1400, 3000, 117.2],
      [2200, 3000, 54],
      [2400, 3000, 41],
    ]);
    // 障害競走の後 3 ハロンは、実際には後 1 ハロンなので取り込まない
    const result = await repo(ShussoubaSeiseki).find();
    expect(result[0].Agari3F).toBeNull();
  });

  test("成績２は、成績１のあとに取り込まれる馬番 19〜28", async () => {
    await emptyKolDb();
    const s1 = seiRace(RACE_KEY, "345");
    const s2 = withKey(new JravanRecord("成績２"));
    const o = { parent: P, index: 0 };
    horse(s2, 0, 19, "2004101240", "ジュウキュウ", "01088");
    s2.set("異常区分コード", "4", o).set("馬体重", 500, o);
    expect(await importKolFiles({ "JracSei1.dat": s1.buffer, "JracSei2.dat": s2.buffer })).toEqual(
      [],
    );
    const shussouba = await repo(Shussouba).findOneByOrFail({ Umaban: 19 });
    const result = await repo(ShussoubaSeiseki).findOneByOrFail({ Id: shussouba.Id });
    expect(result.ChakujunFuka).toBe(3);
    expect(result.TorikeshiShubetsu).toBe(4);
    expect(result.Bataijuu).toBe(500);
  });
});

describe("オッズ", () => {
  test("オッズ１・３・４・５・６", async () => {
    await emptyKolDb();
    const o1 = withKey(new JravanRecord("オッズ１"));
    o1.set("単勝オッズ(馬番01～18)", "0035", { index: 0 })
      .set("単勝オッズ(馬番01～18)", "9999", { index: 1 })
      .set("単勝オッズ(馬番01～18)", "----", { index: 2 })
      .set("複勝オッズ(馬番01～18)", "012025", { index: 0 })
      .set("枠連オッズ(枠連1-1～8-8)", "0123", { index: 1 });
    const o3 = withKey(new JravanRecord("オッズ３"));
    o3.set("馬連ｵｯｽﾞ(01-02～17-18)", "00250", { index: 0 }).set("馬連ｵｯｽﾞ(01-02～17-18)", "*****", {
      index: 1,
    });
    const o4 = withKey(new JravanRecord("オッズ４"));
    o4.set("ﾜｲﾄﾞｵｯｽﾞ(01-02～17-18)", "0001200025", { index: 0 });
    const o5 = withKey(new JravanRecord("オッズ５"));
    // 馬単は 01-02, 01-03, … の順 (1 着馬ごとに 2 着馬が並ぶ)。2 番目は 01-03
    o5.set("馬単ｵｯｽﾞ(01-02～18-17)", "00300", { index: 1 });
    const o6 = withKey(new JravanRecord("オッズ６"));
    o6.set("３連複ｵｯｽﾞ(01-02-03～16-17-18)", "00123", { index: 0 });

    expect(
      await importKolFiles({
        "JracOds1.dat": o1.buffer,
        "JracOds3.dat": o3.buffer,
        "JracOds4.dat": o4.buffer,
        "JracOds5.dat": o5.buffer,
        "JracOds6.dat": o6.buffer,
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
    expect(find(Baken.Tanshou, 2)?.Odds1).toBeCloseTo(999.9);
    expect(find(Baken.Tanshou, 3)).toBeUndefined();
    expect(find(Baken.Tanshou, 1)?.Kakutei).toBe(Kakutei.Kakutei);
    const fuku = find(Baken.Fukushou, 1);
    expect(fuku?.Odds1).toBeCloseTo(1.2);
    expect(fuku?.Odds2).toBeCloseTo(2.5);
    expect(find(Baken.Wakuren, 1, 2)?.Odds1).toBeCloseTo(12.3);
    expect(find(Baken.Umaren, 1, 2)?.Odds1).toBeCloseTo(25);
    expect(find(Baken.Umaren, 1, 3)).toBeUndefined();
    const wide = find(Baken.Wide, 1, 2);
    expect(wide?.Odds1).toBeCloseTo(1.2);
    expect(wide?.Odds2).toBeCloseTo(2.5);
    expect(find(Baken.Umatan, 1, 3)?.Odds1).toBeCloseTo(30);
    expect(find(Baken.Sanrenpuku, 1, 2, 3)?.Odds1).toBeCloseTo(12.3);
  });
});

describe("マスタ", () => {
  test("競走馬・騎手・調教師・抹消", async () => {
    await emptyKolDb();
    const umaj = new JravanRecord("競走馬");
    umaj
      .set("血統登録番号", "2004101234")
      .set("馬名", "テストホース")
      .set("生年月日", "20040401")
      .set("品種コード", "1")
      .set("性別コード", "2")
      .set("毛色コード", "03")
      .set("馬記号コード", "04")
      .set("馬名", "チチウマ", { nth: 1 })
      .set("馬名", "ハハウマ", { nth: 2 })
      .set("馬名", "ハハノチチ", { nth: 3 })
      .set("馬名", "ハハノハハ", { nth: 4 })
      .set("産地名", "新冠")
      .set("調教師コード", "01234")
      .set("調教師名略称", "藤沢和");
    const kisi = new JravanRecord("騎手");
    kisi
      .set("騎手コード", "01088")
      .set("騎手名漢字", "武　豊")
      .set("騎手名カタカナ", "ﾀｹ ﾕﾀｶ")
      .set("騎手名略称", "武豊")
      .set("生年月日", "19690315")
      .set("東西区分コード", "2")
      .set("見習区分コード", "0")
      .set("初免許年", "1987");
    const chok = new JravanRecord("調教師");
    chok
      .set("調教師コード", "01234")
      .set("調教師名漢字", "藤沢　和雄")
      .set("調教師名略称", "藤沢和")
      .set("生年月日", "19510829")
      .set("東西区分コード", "1");
    const delk = new JravanRecord("抹消騎手");
    delk.set("騎手コード", "01088").set("抹消年月日", "20260228");
    const delu = new JravanRecord("抹消競走馬");
    delu
      .set("血統登録番号", "2004101234")
      .set("馬名", "テストホース")
      .set("データ作成年月日", "20080101");

    expect(
      await importKolFiles({
        "JracUmaj.dat": umaj.buffer,
        "JracKisi.dat": kisi.buffer,
        "JracChok.dat": chok.buffer,
        "JracDelk.dat": delk.buffer,
        "JracDelu.dat": delu.buffer,
      }),
    ).toEqual([]);

    const uma = await repo(Uma).findOneByOrFail({ KettouTourokuBangou: "04101234" });
    expect(uma.KanaBamei).toBe("テストホース");
    expect(uma.Seinengappi).toBe(20040401);
    expect(uma.Seinen).toBe(2004);
    expect(uma.Keiro).toBe(3);
    expect(uma.Seibetsu).toBe(1);
    expect(uma.Kesshu).toBe(1);
    expect(uma.SanchiMei).toBe("新冠");
    // 抹消競走馬データで抹消された
    expect(uma.MasshouFlag).toBe(1);
    expect(uma.MasshouNengappi).toBe(20080101);
    const chichi = await repo(Uma).findOneByOrFail({ Id: uma.ChichiUmaId });
    expect(chichi.KanaBamei).toBe("チチウマ");
    const haha = await repo(Uma).findOneByOrFail({ Id: uma.HahaUmaId });
    expect(haha.KanaBamei).toBe("ハハウマ");
    expect((await repo(Uma).findOneByOrFail({ Id: haha.ChichiUmaId })).KanaBamei).toBe(
      "ハハノチチ",
    );
    expect((await repo(Uma).findOneByOrFail({ Id: haha.HahaUmaId })).KanaBamei).toBe("ハハノハハ");

    const kishu = await repo(Kishu).findOneByOrFail({ JvDataKishuCode: "01088" });
    expect(kishu.Seinengappi).toBe(19690315);
    expect(kishu.Shozoku).toBe(2);
    expect(kishu.MenkyoKoufuNengappi).toBe(1987);
    expect(kishu.MenkyoMasshouNengappi).toBe(20260228);

    const choukyoushi = await repo(Choukyoushi).findOneByOrFail({ JvDataChoukyoushiCode: "01234" });
    expect(choukyoushi.Seinengappi).toBe(19510829);
    // 東西区分 1:東 → 調教師の東西別 2:東
    expect(choukyoushi.TouzaiBetsu).toBe(2);
  });

  test("年間スケジュール", async () => {
    await emptyKolDb();
    const sch = new JravanRecord("年間スケジュール");
    sch.set("年月日場回日", KEY).set("曜日コード", "3");
    expect(await importKolFiles({ "JracSch1.dat": sch.buffer })).toEqual([]);
    const kaisai = await repo(Kaisai).findOneByOrFail({ Nen: 2007, Gatsu: 10, Nichi: 6 });
    expect(kaisai.Basho).toBe(4);
    expect(kaisai.Youbi).toBe(1);
    expect(kaisai.Kyuujitsu).toBe(1);
  });
});

describe("他の情報源との突き合わせ", () => {
  const kisi = () =>
    new JravanRecord("騎手")
      .set("騎手コード", "01088")
      .set("騎手名漢字", "武　豊")
      .set("騎手名略称", "武豊")
      .set("生年月日", "19690315")
      .set("東西区分コード", "2");

  test("名前と生年月日が同じ騎手は、コードが違っても同じ行にまとめる", async () => {
    await emptyKolDb();
    const kishu = new Kishu();
    kishu.KolKishuCode = 1088;
    kishu.Seinengappi = 19690315;
    await Container.get(KishuDao).saveKishu(kishu, "武豊", "武豊", "タケユタカ");

    expect(await importKolFiles({ "JracKisi.dat": kisi().buffer })).toEqual([]);

    const list = await repo(Kishu).find();
    expect(list.length).toBe(1);
    expect(list[0].KolKishuCode).toBe(1088);
    expect(list[0].JvDataKishuCode).toBe("01088");
    expect(list[0].Shozoku).toBe(2);
  });

  test("出走馬データの騎手は、略称が 1 人だけに一致すればその騎手", async () => {
    await emptyKolDb();
    const d1 = den1();
    horse(d1, 0, 1, "2004101234", "テストホース", "01088");
    expect(
      await importKolFiles({ "JracKisi.dat": kisi().buffer, "JracDen1.dat": d1.buffer }),
    ).toEqual([]);
    expect((await repo(Kishu).find()).length).toBe(1);
  });

  test("コードが違う同名の騎手は別人", async () => {
    await emptyKolDb();
    const other = new Kishu();
    other.JvDataKishuCode = "09999";
    other.Seinengappi = 19690315;
    await Container.get(KishuDao).saveKishu(other, "武豊", "武豊", "タケユタカ");

    expect(await importKolFiles({ "JracKisi.dat": kisi().buffer })).toEqual([]);
    expect((await repo(Kishu).find()).length).toBe(2);
  });

  test("調教師も、名前が同じなら同じ行にまとめる", async () => {
    await emptyKolDb();
    const choukyoushi = new Choukyoushi();
    choukyoushi.KolKyuushaCode = 10001;
    await Container.get(ChoukyoushiDao).saveChoukyoushi(
      choukyoushi,
      "藤沢和雄",
      "藤沢和",
      "フジサワカズオ",
    );
    const chok = new JravanRecord("調教師")
      .set("調教師コード", "01234")
      .set("調教師名漢字", "藤沢　和雄")
      .set("調教師名略称", "藤沢和")
      .set("東西区分コード", "1");
    expect(await importKolFiles({ "JracChok.dat": chok.buffer })).toEqual([]);
    const list = await repo(Choukyoushi).find();
    expect(list.length).toBe(1);
    expect(list[0].KolKyuushaCode).toBe(10001);
    expect(list[0].JvDataChoukyoushiCode).toBe("01234");
  });

  test("空白や異体字が違う名前も同じ人として扱う", async () => {
    await emptyKolDb();
    const kishu = new Kishu();
    kishu.KolKishuCode = 2001;
    await Container.get(KishuDao).saveKishu(kishu, "髙 橋　一", "髙橋一", "タカハシハジメ");
    const jra = new JravanRecord("騎手")
      .set("騎手コード", "02001")
      .set("騎手名漢字", "高橋　一")
      .set("騎手名略称", "高橋一");
    expect(await importKolFiles({ "JracKisi.dat": jra.buffer })).toEqual([]);
    const list = await repo(Kishu).find();
    expect(list.length).toBe(1);
    expect(list[0].JvDataKishuCode).toBe("02001");
  });

  test("馬主・生産者の名前も、空白や異体字が違えば同じ行にまとめる", async () => {
    await emptyKolDb();
    const dao = Container.get(MeishouDao);
    const a = await dao.save(MeishouKubun.Full, "髙橋牧場");
    const b = await dao.save(MeishouKubun.Full, "高橋 牧場");
    const c = await dao.save(MeishouKubun.Tanshuku, "高橋牧場");
    expect(b.Id).toBe(a.Id);
    expect(b.Meishou).toBe("髙橋牧場");
    // 区分が違えば別の行
    expect(c.Id).not.toBe(a.Id);
  });

  test("異体字を揃えるのは突き合わせ用のキーだけで、名前は変えない", async () => {
    await emptyKolDb();
    const dao = Container.get(JinmeiDao);
    const a = await dao.save(JinmeiKubun.Seimei, "髙 橋");
    const b = await dao.save(JinmeiKubun.Seimei, "高橋");
    expect(a.Meishou).toBe("髙橋");
    expect(b.Meishou).toBe("高橋");
    expect(a.MatchingKey).toBe(b.MatchingKey);
  });
});
