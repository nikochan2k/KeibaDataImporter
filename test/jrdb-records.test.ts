import type { EntityTarget, ObjectLiteral } from "typeorm";
import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { dataSource } from "../src/app/DataSource";
import { Choukyou } from "../src/app/entities/Choukyou";
import { Kishu } from "../src/app/entities/Kishu";
import { Kyousouba } from "../src/app/entities/Kyousouba";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaChoukyou } from "../src/app/entities/ShussoubaChoukyou";
import { ShussoubaHyouka } from "../src/app/entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../src/app/entities/ShussoubaYosou";
import { Cha } from "../src/app/reader/JRDB/Cha";
import { Cyb } from "../src/app/reader/JRDB/Cyb";
import { Hjc } from "../src/app/reader/JRDB/Hjc";
import { K$a } from "../src/app/reader/JRDB/K$a";
import { Sed } from "../src/app/reader/JRDB/Sed";
import { Tyb } from "../src/app/reader/JRDB/Tyb";
import { kolChoukyouTool } from "../src/app/reader/KOL/KolChoukyouTool";
import { base, Field, record, setFileDate } from "./helpers";

/** レースキー(中山 2024年 3回4日 11R)と馬番5 */
const raceKey: Field[] = [
  [1, "06"],
  [3, "24"],
  [5, "3"],
  [6, "4"],
  [7, "11"],
  [9, "05"],
];

beforeAll(async () => {
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  await dataSource.synchronize();
  setFileDate(2024, 4, 7);
  // 出走馬を用意する(レースキーに年月日がない TYB や CYB は、出走馬が先にいる前提)
  await new Sed().save(record(base, 376));
});

afterAll(async () => {
  await dataSource.destroy();
});

const find = async <T>(entity: new () => T, where: object) =>
  (await dataSource.manager.findOneBy(entity as EntityTarget<ObjectLiteral>, where)) as T;

describe("TYB 直前情報", () => {
  const tyb = [
    ...raceKey,
    [11, " 55.5"],
    [16, " 60.0"],
    [46, "1"],
    [47, "2"], // 馬具変更情報 1:通常、脚元情報 2:疑問
    [49, "10500"],
    [54, "マツオカ"],
    [66, "535"],
    [69, "4"],
    [70, "21"],
    [72, "4"], // 負担重量 53.5、見習い区分 4、馬場 21(稍重・速い)、天候 4(雨)
    [73, "   3.4"],
    [79, "   1.5"],
    [85, "0925"],
    [89, "484"],
    [92, "- 4"],
    [98, "3"],
    [99, "5"],
    [100, "1540"],
  ] as Field[];

  test("レース、出走馬、オッズ、状態コードに反映される", async () => {
    await new Tyb().save(record(tyb, 128));

    const race = await find(Race, {});
    expect(race.HassouJikan).toBe("15:40");

    const rs = await find(RaceSeiseki, { Id: race.Id });
    expect(rs.Baba).toBe(1);
    expect(rs.BabaSokudo).toBe(1);
    expect(rs.Tenki).toBe(2);

    const shussouba = await find(Shussouba, { RaceId: race.Id });
    const yosou = await find(ShussoubaYosou, { Id: shussouba.Id });
    expect(yosou.BaguHenkouJouhou).toBe(1);
    expect(yosou.Ashimoto).toBe(2);
    expect(yosou.Idm).toBeCloseTo(55.5);

    const seiseki = await find(ShussoubaSeiseki, { Id: shussouba.Id });
    expect(seiseki.Kinryou).toBeCloseTo(53.5);
    expect(seiseki.MinaraiKubun).toBe(4);
    expect(seiseki.Bataijuu).toBe(484);
    expect(seiseki.Zougen).toBe(-4);

    const hyouka = await find(ShussoubaHyouka, { Id: shussouba.Id });
    expect(hyouka.BataiCode).toBe(3);
    expect(hyouka.KehaiCode).toBe(5);

    const tan = await find(OddsHaitou, {
      RaceId: race.Id,
      Kakutei: Kakutei.Chokuzen,
      Baken: Baken.Tanshou,
      Bangou1: 5,
    });
    expect(tan.Odds1).toBeCloseTo(3.4);
    expect(tan.ShutokuJikan).toBe("09:25");
    const fuku = await find(OddsHaitou, {
      RaceId: race.Id,
      Kakutei: Kakutei.Chokuzen,
      Baken: Baken.Fukushou,
      Bangou1: 5,
    });
    expect(fuku.Odds1).toBeCloseTo(1.5);
  });

  test("出走馬がいないレコードは読み飛ばす", async () => {
    const before = await dataSource.manager.count(OddsHaitou);
    const unknown = tyb.map(([p, v]) => (p === 9 ? [9, "12"] : [p, v])) as Field[];
    await new Tyb().save(record(unknown, 128));
    expect(await dataSource.manager.count(OddsHaitou)).toBe(before);
  });
});

describe("HJC 払戻", () => {
  const hjc = [
    [1, "06"],
    [3, "24"],
    [5, "3"],
    [6, "4"],
    [7, "11"],
    [9, "05"],
    [11, "0000230"], // 単勝 5番 230円
    [36, "05"],
    [38, "0000120"],
    [45, "08"],
    [47, "0000150"], // 複勝
    [81, "34"],
    [83, "0000560"], // 枠連 3-4
    [108, "0508"],
    [112, "00001230"], // 馬連
    [144, "0508"],
    [148, "00000450"], // ワイド
    [228, "0805"],
    [232, "00002560"], // 馬単
    [300, "030507"],
    [306, "00012340"], // 3連複
    [342, "070503"],
    [348, "000123450"], // 3連単
  ] as Field[];

  test("すべての馬券種の払戻が保存される", async () => {
    await new Hjc().save(record(hjc, 444));
    const race = await find(Race, {});
    const get = async (baken: Baken, b1: number, b2?: number, b3?: number) => {
      const where: Record<string, unknown> = {
        RaceId: race.Id,
        Kakutei: Kakutei.Kakutei,
        Baken: baken,
        Bangou1: b1,
      };
      if (b2) where.Bangou2 = b2;
      if (b3) where.Bangou3 = b3;
      return (await find(OddsHaitou, where))?.Haitoukin;
    };
    expect(await get(Baken.Tanshou, 5)).toBe(230);
    expect(await get(Baken.Fukushou, 5)).toBe(120);
    expect(await get(Baken.Fukushou, 8)).toBe(150);
    expect(await get(Baken.Wakuren, 3, 4)).toBe(560);
    expect(await get(Baken.Umaren, 5, 8)).toBe(1230);
    expect(await get(Baken.Wide, 5, 8)).toBe(450);
    expect(await get(Baken.Umatan, 8, 5)).toBe(2560);
    expect(await get(Baken.Sanrenpuku, 3, 5, 7)).toBe(12340);
    expect(await get(Baken.Sanrentan, 7, 5, 3)).toBe(123450);
  });

  test("再取り込みで払戻が更新される", async () => {
    const changed = hjc.map(([p, v]) => (p === 11 ? [11, "0000310"] : [p, v])) as Field[];
    await new Hjc().save(record(changed, 444));
    const race = await find(Race, {});
    const tan = await find(OddsHaitou, {
      RaceId: race.Id,
      Kakutei: Kakutei.Kakutei,
      Baken: Baken.Tanshou,
      Bangou1: 5,
    });
    expect(tan.Haitoukin).toBe(310);
  });
});

describe("CYB 調教分析", () => {
  test("一週前追切の指数とコースを読む", async () => {
    const cyb = [
      ...raceKey,
      [11, "11"], // 調教タイプ
      [28, "2"],
      [29, "3"],
      [30, " 95"],
      [33, " 88"],
      [36, "B"],
      [37, "2"],
      [86, "2"],
      [87, "100"],
      [90, "36"],
    ] as Field[];
    await new Cyb().save(record(cyb, 96));

    const race = await find(Race, {});
    const shussouba = await find(Shussouba, { RaceId: race.Id });
    const sc = await find(ShussoubaHyouka, { Id: shussouba.Id });
    expect(sc.OikiriShisuu).toBe(95);
    expect(sc.ShiageShisuu).toBe(88);
    expect(sc.IsshuumaeOikiriShisuu).toBe(100);
    expect(sc.IsshuumaeOikiriBasho).toBe(0);
  });
});

describe("CHA 調教本追切", () => {
  const cha = [
    ...raceKey,
    [11, "水"],
    [13, "20240403"],
    [21, "2"], // 回数
    [22, "11"], // 栗東坂路
    [24, "1"], // 一杯
    [25, "01"],
    [27, "1"], // 助手
    [28, "4"],
    [29, "523"],
    [32, "381"],
    [35, "124"],
    [47, " 98"],
    [50, "1"], // 先着
  ] as Field[];

  test("KOL の調教に本追切の項目を足し、出走馬と本追切として結びつける", async () => {
    const race = await find(Race, {});
    const shussouba = await find(Shussouba, { RaceId: race.Id });
    // 出走馬に競走馬を結びつける(本来は KYI などで入る)
    const kyousouba = await dataSource.manager.save(
      Object.assign(new Kyousouba(), { UmaId: 9001 }),
    );
    await dataSource.manager.update(Shussouba, { Id: shussouba.Id }, { KyousoubaId: kyousouba.Id });
    shussouba.KyousoubaId = kyousouba.Id;
    // 先に KOL の出馬表から同じ調教(同じ馬・同じ日・栗東坂路)が入っている
    const kol = record(
      [
        [1, "1"],
        [2, "助手"],
        [10, "20240403"],
        [18, "栗東  坂"],
        [26, "良"],
        [40, "  2回"],
        [46, "  52.3"],
        [64, "  12.4"],
        [71, "一　杯"],
        [77, "2"],
      ],
      120,
    );
    await kolChoukyouTool.saveChoukyou(kol, 0, shussouba.Id, kyousouba.UmaId, "テスト");
    await new Cha().save(record(cha, 64));

    const choukyou = await dataSource.manager.findBy(Choukyou, { UmaId: kyousouba.UmaId });
    expect(choukyou.length).toBe(1);
    expect(choukyou[0].Baba).toBe(0); // KOL の項目は残る
    expect(choukyou[0].TenF).toBeCloseTo(52.3);
    expect(choukyou[0].OikiriShisuu).toBe(98);

    const links = await dataSource.manager.findBy(ShussoubaChoukyou, { ShussoubaId: shussouba.Id });
    expect(links.length).toBe(1);
    expect(links[0].ChoukyouId).toBe(choukyou[0].Id);
    expect(links[0].ChoukyouFlag).toBe(1);
    expect(links[0].Yajirushi).toBe(2);
    expect(links[0].HonOikiri).toBe(1);
  });
});

describe("KSA 騎手マスタ", () => {
  const ksa = (code: string, shozoku: string, minarai: string) =>
    record(
      [
        [1, code],
        [6, "0"],
        [15, "マツオカマサミ"],
        [57, "松岡"],
        [63, shozoku],
        [68, "19840211"],
        [76, "2003"],
        [80, minarai],
      ] as Field[],
      272,
    );

  test("所属と見習い区分が保存される", async () => {
    await new K$a().save(ksa("10500", "2", "4"));
    const kishu = await find(Kishu, { JrdbKishuCode: 10500 });
    expect(kishu.Shozoku).toBe(2);
    expect(kishu.MinaraiKubun).toBe(4);
    expect(kishu.Seinengappi).toBe(19840211);
    expect(kishu.MenkyoKoufuNengappi).toBe(2003);
  });

  test("見習いでなくなると見習い区分が更新される", async () => {
    await new K$a().save(ksa("10500", "2", " "));
    const kishu = await find(Kishu, { JrdbKishuCode: 10500 });
    expect(kishu.MinaraiKubun).toBe(0);
    expect(await dataSource.manager.countBy(Kishu, { JrdbKishuCode: 10500 })).toBe(1);
  });
});
