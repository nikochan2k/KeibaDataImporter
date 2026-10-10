import "reflect-metadata";
import { afterAll, beforeAll, expect, test } from "bun:test";
import * as iconv from "iconv-lite";
import { Container } from "typedi";
import { dataSource } from "../src/app/DataSource";
import { Race } from "../src/app/entities/Race";
import { RaceSeiseki } from "../src/app/entities/RaceSeiseki";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { Kaisai } from "../src/app/entities/Kaisai";
import { Sed } from "../src/app/reader/JRDB/Sed";
import { Sec } from "../src/app/reader/JRDB/Sec";

beforeAll(async () => {
  dataSource.setOptions({ database: ":memory:" });
  await dataSource.initialize();
  await dataSource.synchronize();
});

afterAll(async () => {
  await dataSource.destroy();
});

/** 仕様書(1始まり)の位置に値を置いて SED の 1 レコードを作る */
function sedRecord(fields: [number, string][], length = 376) {
  const buf = Buffer.alloc(length, 0x20);
  for (const [pos, value] of fields) {
    iconv.encode(value, "Windows932").copy(buf, pos - 1);
  }
  buf.write("\r\n", length - 2);
  return buf;
}

const base: [number, string][] = [
  [1, "06"], [3, "24"], [5, "3"], [6, "4"], [7, "11"], [9, "05"],
  [11, "12345678"], [19, "20240407"], [27, "テストホース"],
  [63, "1600"], [67, "1"], [68, "1"], [69, "1"], [70, "10"], [72, "13"], [74, "16"],
  [131, "16"],
  [141, "01"], [143, "0"], [144, "1334"], [148, "560"],
  [175, "   2.3"], [181, " 1"],
  [256, " 12"], [265, "ダイオウ"],
  [317, "  5"], [320, " 10"],
  [333, "480"], [336, "+ 2"], [339, "1"], [340, "1"],
  [371, "1535"],
];

test("SED 1 レコードの取り込み", async () => {
  const sed = Container.get(Sed);
  await sed.save(sedRecord(base));

  const kaisai = await dataSource.manager.find(Kaisai);
  expect(kaisai.length).toBe(1);

  const race = await dataSource.manager.findOneByOrFail(Race, {});
  expect(race.Kyori).toBe(1600);
  expect(race.Tousuu).toBe(16);
  expect(race.HassouJikan).toBe("15:35");

  const rs = await dataSource.manager.findOneByOrFail(RaceSeiseki, { Id: race.Id });
  expect(rs.Baba).toBe(0);

  const seiseki = await dataSource.manager.findOneByOrFail(ShussoubaSeiseki, {});
  expect(seiseki.Time).toBeCloseTo(93.4);
  expect(seiseki.Chaku12TimeSa).toBeCloseTo(1.2);
  expect(seiseki.Ten3FSentouSa).toBeCloseTo(0.5);
  expect(seiseki.Agari3FSentouSa).toBeCloseTo(1.0);
  expect(seiseki.Bikou).toBe("ダイオウ");
  expect(seiseki.Zougen).toBe(2);
});

test("速報版(SEC)の空白項目で既存の値を消さない", async () => {
  const sec = Container.get(Sec);
  // 速報版は馬場状態・天候・コース・前3F先頭差などが空白
  const record = sedRecord(base.filter(([pos]) => ![70, 339, 340, 317, 320, 256, 265, 371].includes(pos)), 346);
  await sec.save(record);

  const race = await dataSource.manager.findOneByOrFail(Race, {});
  expect(race.Course).not.toBeUndefined();
  const rs = await dataSource.manager.findOneByOrFail(RaceSeiseki, { Id: race.Id });
  expect(rs.Baba).toBe(0);
  const seiseki = await dataSource.manager.findOneByOrFail(ShussoubaSeiseki, {});
  expect(seiseki.Ten3FSentouSa).toBeCloseTo(0.5);
  expect(seiseki.Bikou).toBe("ダイオウ");
});

test("地方レース(回・日が英字)は年月日から開催を決める", async () => {
  const sed = Container.get(Sed);
  const local = base.filter(([pos]) => ![1, 5, 6].includes(pos)).concat([[1, "35"], [5, "d"], [6, "g"]] as [number, string][]);
  await sed.save(sedRecord(local));

  const kaisai = await dataSource.manager.find(Kaisai);
  expect(kaisai.length).toBe(2);
  const races = await dataSource.manager.find(Race);
  expect(races.length).toBe(2);
});

test("ファイル名の日付と異なる日のレコード(ZED)でも、レコードの日付で保存される", async () => {
  const sed = Container.get(Sed);
  const old = base.filter(([pos]) => pos !== 19).concat([[19, "20230319"]] as [number, string][]);
  await sed.save(sedRecord(old));

  const kaisai = await dataSource.manager.find(Kaisai);
  expect(kaisai.length).toBe(3);
});
