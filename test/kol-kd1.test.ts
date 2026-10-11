import "reflect-metadata";
import { afterAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { Container } from "typedi";
import { Baken, Kakutei } from "../src/app/converters/Common";
import { dataSource } from "../src/app/DataSource";
import { Choukyoushi } from "../src/app/entities/Choukyoushi";
import { Kaisai } from "../src/app/entities/Kaisai";
import { Kishu } from "../src/app/entities/Kishu";
import { OddsHaitou } from "../src/app/entities/OddsHaitou";
import { Race } from "../src/app/entities/Race";
import { Shussouba } from "../src/app/entities/Shussouba";
import { ShussoubaSeiseki } from "../src/app/entities/ShussoubaSeiseki";
import { Uma } from "../src/app/entities/Uma";
import { setHeichiShougai, setYoubi } from "../src/app/reader/KOL/KD1/Kd1Convert";
import {
  type Kd1Map,
  kd1DenHorseFrom,
  kd1DenHorseMap,
  kd1DenRaceMap,
  kd1KetMap,
  kd1KisMap,
  kd1KyuMap,
  kd1Length,
  kd1Sei2HorseFrom,
  kd1SeiHorseFrom,
  kd1SeiHorseMap,
  kd1SeiRaceMap,
  kd1SyuMap,
  kd1UmaMap,
  kd1UmaRunFrom,
  kd1UmaRunMap,
  kd2Length,
  kd2UmaRunFrom,
} from "../src/app/reader/KOL/KD1/Kd1Layout";
import { KolRaceTool } from "../src/app/reader/KOL/KolRaceTool";
import { encodeSjis } from "../src/app/util/Sjis";
import { type Kd1Kind, kd1Sections, parseKd1Spec } from "./spec/kd1";
import { closeKolDb, emptyKolDb, importKolFiles, type KolField, parseKolSpec } from "./spec/kol";

afterAll(closeKolDb);

setDefaultTimeout(60_000);

describe("KD1 の仕様書", () => {
  for (const kind of Object.keys(kd1Sections) as Kd1Kind[]) {
    test(`${kind}: 項目表の長さが、見出しのバイト数と取り込み処理のレコード長に一致する`, () => {
      const spec = parseKd1Spec(kind);
      expect(spec.fields.length).toBeGreaterThan(0);
      expect(spec.tableLength).toBe(spec.headerLength);
      expect(spec.tableLength).toBe(kd1Length[kind]);
    });
  }

  test("組み替え先 (KD2) のレコード長が、KD2 の仕様書と一致する", () => {
    for (const [kind, length] of Object.entries(kd2Length)) {
      expect(parseKolSpec(kind, "KD2").tableLength).toBe(length);
    }
  });
});

const circled = "①②③④⑤⑥⑦⑧⑨";
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/[①-⑨]/g, (c) => String(circled.indexOf(c) + 1))
    .replace(/[〜～]/g, "~");

/** 名前は違うが、同じ意味の項目 (KD1 の名前, KD2 の名前) */
const aliases: [string, string][] = [
  ["縮小騎手表現", "短縮騎手名"],
  ["短縮厩舎表現", "短縮厩舎名"],
  ["縮小馬主名", "短縮馬主名"],
  ["縮小生産者名", "短縮生産者名"],
  ["距離的性", "距離適性"],
  ["種牡馬コード", "父馬コード"],
  ["確定順位", "確定着順"],
  ["着順付加", "着順附加"],
  ["予想", "出馬表の予想印"],
  ["スピード指数", "レコード指数"],
  ["騎手名", "短縮騎手名"],
  ["厩舎名", "短縮厩舎名"],
  ["厩舎名", "厩舎名"],
  ["レコードタイム", "タイム"],
  ["上がり1哩", "上り1哩"],
  ["データ制作年月日", "データ作成年月日"],
  ["条件年齢条件", "条件年齢制限"],
  ["乗り替わり", "乗り替り"],
];

/** 項目名が同じか。KD2 の名前は、KD1 の名前の前後に言葉が付くことがある (例: 厩舎東西別, 賞金１着) */
const sameName = (kd1: string, kd2: string) => {
  const x = norm(kd1);
  const y = norm(kd2);
  return (
    x === y ||
    y.startsWith(x) ||
    y.endsWith(x) ||
    aliases.some(([p, q]) => norm(p) === x && y.endsWith(norm(q)))
  );
};

/** [start, start+length) を隙間なくちょうど覆う項目の並び。ちょうど覆えなければ null */
const cover = (fields: KolField[], start: number, length: number) => {
  const found = fields.filter((f) => f.address < start + length && start < f.address + f.bytes);
  const first = found[0];
  const last = found[found.length - 1];
  if (!first || first.address !== start || last.address + last.bytes !== start + length) {
    return null;
  }
  return found;
};

interface MapCase {
  name: string;
  kd1: Kd1Kind;
  kd2: string;
  map: Kd1Map;
  /** 繰り返しの 1 つめの先頭 (仕様書には先頭の 1 組しか載っていない) */
  from1: number;
  from2: number;
  /** 組み替えない KD1 の項目 (from1 から to1 の範囲のうち) */
  to1: number;
  unmapped: string[];
}

const cases: MapCase[] = [
  {
    name: "騎手",
    kd1: "kis",
    kd2: "kis",
    map: kd1KisMap,
    from1: 0,
    from2: 0,
    to1: 202,
    unmapped: [
      "本賞金@118",
      "付加賞金@125",
      "本賞金@131",
      "付加賞金@138",
      "1着@144",
      "2着@147",
      "3着@150",
      "着外@153",
      "1着@156",
      "2着@159",
      "3着@162",
      "着外@165",
      "1着@168",
      "2着@172",
      "3着@176",
      "着外@180",
      "1着@184",
      "2着@188",
      "3着@192",
      "着外@196",
    ],
  },
  {
    name: "厩舎",
    kd1: "kyu",
    kd2: "kyu",
    map: kd1KyuMap,
    from1: 0,
    from2: 0,
    to1: 196,
    unmapped: [
      "本賞金@112",
      "付加賞金@119",
      "本賞金@125",
      "付加賞金@132",
      "1着@138",
      "2着@141",
      "3着@144",
      "着外@147",
      "1着@150",
      "2着@153",
      "3着@156",
      "着外@159",
      "1着@162",
      "2着@166",
      "3着@170",
      "着外@174",
      "1着@178",
      "2着@182",
      "3着@186",
      "着外@190",
    ],
  },
  {
    name: "種牡馬",
    kd1: "syu",
    kd2: "syu",
    map: kd1SyuMap,
    from1: 0,
    from2: 0,
    to1: 102,
    unmapped: ["予約@48"],
  },
  {
    name: "3代血統図",
    kd1: "ket",
    kd2: "ket",
    map: kd1KetMap,
    from1: 0,
    from2: 0,
    to1: 621,
    unmapped: [],
  },
  {
    name: "競走馬",
    kd1: "uma",
    kd2: "uma",
    map: kd1UmaMap,
    from1: 0,
    from2: 0,
    to1: 432,
    unmapped: [],
  },
  {
    name: "競走馬の過去走",
    kd1: "uma",
    kd2: "uma",
    map: kd1UmaRunMap,
    from1: kd1UmaRunFrom,
    from2: kd2UmaRunFrom,
    to1: kd1UmaRunFrom + 235,
    unmapped: [],
  },
  {
    name: "競走成績のレース",
    kd1: "sei",
    kd2: "sei1",
    map: kd1SeiRaceMap,
    from1: 0,
    from2: 0,
    to1: 792,
    unmapped: ["推定タイム@24"],
  },
  {
    name: "競走成績の出走馬",
    kd1: "sei",
    kd2: "sei2",
    map: kd1SeiHorseMap,
    from1: kd1SeiHorseFrom,
    from2: 0,
    to1: kd1SeiHorseFrom + 132,
    unmapped: ["中央・地方・外国@37", "一・特@38", "平・障@39", "交流フラグ@40"],
  },
  {
    name: "競走成績２の出走馬",
    kd1: "sei2",
    kd2: "sei2",
    map: kd1SeiHorseMap,
    from1: kd1Sei2HorseFrom,
    from2: 0,
    to1: kd1Sei2HorseFrom + 132,
    unmapped: ["中央・地方・外国@37", "一・特@38", "平・障@39", "交流フラグ@40"],
  },
  {
    name: "出馬表のレース",
    kd1: "den",
    kd2: "den1",
    map: kd1DenRaceMap,
    from1: 0,
    from2: 0,
    to1: 159,
    unmapped: [],
  },
  {
    name: "出馬表の出走馬",
    kd1: "den",
    kd2: "den2",
    map: kd1DenHorseMap,
    from1: kd1DenHorseFrom,
    from2: 0,
    to1: kd1DenHorseFrom + 76,
    unmapped: [],
  },
];

describe("KD1 から KD2 への組み替えの表", () => {
  for (const c of cases) {
    test(c.name, () => {
      const a = parseKd1Spec(c.kd1).fields;
      const b = parseKolSpec(c.kd2, "KD2").fields;
      const problems: string[] = [];
      const used = new Set<number>();
      for (const [from, length, to] of c.map) {
        const fa = cover(a, from + c.from1, length);
        // KD2 の項目の方が長いことがある (配当金は 7 桁、厩舎名は 32 桁。KD1 の値はその末尾・先頭に収める)
        const fb =
          cover(b, to + c.from2, length) ||
          b
            .filter(
              (f) => f.address <= to + c.from2 && to + c.from2 + length <= f.address + f.bytes,
            )
            .slice(0, 1);
        if (fb.length === 0) {
          problems.push(`KD2 ${to}+${length}: 項目に収まらない`);
          continue;
        }
        if (!fa) {
          problems.push(`KD1 ${from}+${length}: 項目の境界に合わない`);
          continue;
        }
        for (const f of fa) {
          used.add(f.address);
        }
        if (fa.length === fb.length) {
          fa.forEach((f, i) => {
            if (!sameName(f.name, fb[i].name)) {
              problems.push(`${from}→${to}: ${f.name} と ${fb[i].name} の名前が違う`);
            }
          });
        }
      }
      expect(problems).toEqual([]);
      const unmapped = a
        .filter((f) => c.from1 <= f.address && f.address < c.to1 && !used.has(f.address))
        .filter((f) => f.name !== "データ区切り")
        .map((f) => `${f.name}@${f.address - c.from1}`);
      expect(unmapped).toEqual(c.unmapped);
    });

    test(`${c.name}: 同じ場所に別の項目を写さない`, () => {
      const owner = new Map<number, number>();
      for (const [from, length, to] of c.map) {
        for (let i = 0; i < length; i++) {
          // 同じ項目を 2 か所に写すのは良い (厩舎名)。違う項目が同じ場所に来るのが問題
          const prev = owner.get(to + i);
          expect(prev === undefined || prev === from + i).toBe(true);
          owner.set(to + i, from + i);
        }
      }
    });
  }
});

/** KD1 のレコード。空白で埋めて、末尾を CR LF にする。値は Windows-932 で書く */
function kd1Record(length: number, puts: [number, string][]) {
  const record = Buffer.alloc(length, 0x20);
  record[length - 2] = 0x0d;
  record[length - 1] = 0x0a;
  for (const [at, text] of puts) {
    const bytes = encodeSjis(text);
    expect(at + bytes.length).toBeLessThanOrEqual(length - 2);
    bytes.copy(record, at);
  }
  return record;
}

/** 全角の名前を、桁数に収まるよう右に空白を足す (全角の空白は 2 バイト) */
const name = (text: string, bytes: number) =>
  text + "　".repeat((bytes - encodeSjis(text).length) / 2);

/** 2007-10-09 (火) の東京 4 回 2 日 11R */
const RACE = "042007040211";

const repo = <T extends object>(e: new () => T) => dataSource.getRepository(e);

const raceId = () => Container.get(KolRaceTool).getRaceId(Buffer.from(`${RACE}20071009`));

/** 出走馬 1 頭分 (KD1 の出馬表の 76 バイト) */
function denHorse(umaban: number, code: number, bamei: string): [number, string][] {
  const base = kd1DenHorseFrom + 76 * (umaban - 1);
  const p = (at: number, text: string): [number, string] => [base + at, text];
  return [
    p(0, String(code)),
    p(7, "0"),
    p(8, "04"),
    p(10, String(umaban)),
    p(11, String(umaban).padStart(2, "0")),
    p(13, "570"),
    p(17, String(umaban).padStart(5, "0")),
    p(23, String(10000 + umaban)),
    p(28, "0"),
    p(30, name(bamei, 30)),
    p(60, name(umaban === 1 ? "横山典" : "武豊", 8)),
    p(68, name(umaban === 1 ? "藤沢和" : "角居", 8)),
  ];
}

const denRecord = () =>
  kd1Record(kd1Length.den, [
    [0, RACE],
    [12, "20071009"],
    [20, "0"],
    [21, "0"],
    [22, "012"],
    [25, name("毎日王冠", 30)],
    [55, "1"],
    [56, "1"],
    [57, "0"],
    [58, "0"],
    [59, "1800"],
    [63, "02"],
    [65, "4"],
    [67, "00004"],
    [99, "15:35"],
    [104, "1"],
    [105, "000090000"],
    [1527, "19971031"],
    ...denHorse(1, 1000001, "サクラバクシンオー"),
    ...denHorse(2, 1000002, "タイキシャトル"),
  ]);

/** 出走馬 1 頭分 (KD1 の競走成績の 132 バイト)。base は出走馬の先頭 */
function seiHorse(base: number, umaban: number, code: number, bamei: string): [number, string][] {
  const p = (at: number, text: string): [number, string] => [base + at, text];
  const chakujun = String(umaban).padStart(2, "0");
  return [
    p(0, String(code)),
    p(7, name(bamei, 30)),
    p(41, "0"),
    p(42, "04"),
    p(44, chakujun),
    p(48, chakujun),
    p(50, String(Math.ceil(umaban / 2))),
    p(51, chakujun),
    p(53, chakujun),
    p(55, "570"),
    p(59, "00001"),
    p(65, chakujun),
    p(67, "00015"),
    p(72, "480"),
    p(75, "+04"),
    p(78, "10001"),
    p(86, "1465"),
    p(96, "340"),
    p(99, "345"),
    p(102, "01010101"),
    p(110, "1"),
    p(115, name("横山典", 8)),
    p(123, name("藤沢和", 8)),
  ];
}

const seiRecord = () =>
  kd1Record(kd1Length.sei, [
    [0, RACE],
    [12, "20071009"],
    [20, "0"],
    [21, "0"],
    [22, "0"],
    [53, "012"],
    [56, name("毎日王冠", 30)],
    [86, "0"],
    [87, "1"],
    [88, "1"],
    [89, "0"],
    [90, "0"],
    [91, "1800"],
    [95, "02"],
    [97, "00"],
    [99, "0"],
    [100, "0"],
    [101, "1"],
    [103, "4"],
    [105, "00004"],
    [142, "000090000"],
    [151, "000036000"],
    [196, "00037800"],
    [204, "12"],
    [206, "000530"],
    [212, "03"],
    [224, "0102"],
    [228, "001230"],
    [234, "005"],
    [250, "01"],
    [252, "000350"],
    [266, "01"],
    [268, "000150"],
    [274, "02"],
    [276, "000210"],
    [298, "125"],
    [301, "110"],
    [3168, "19971031"],
    ...seiHorse(kd1SeiHorseFrom, 1, 1000001, "サクラバクシンオー"),
    ...seiHorse(kd1SeiHorseFrom + 132, 2, 1000002, "タイキシャトル"),
  ]);

const sei2Record = () =>
  kd1Record(kd1Length.sei2, [
    [0, RACE],
    ...seiHorse(kd1Sei2HorseFrom, 19, 1000019, "ダンスインザムード"),
    [1332, "19971031"],
  ]);

describe("KD1 のレコードの組み替え", () => {
  test("曜日コードは、年月日から作る (01=土 02=日 03=月 ... 07=金)", () => {
    const days: [string, string][] = [
      ["20071006", "01"],
      ["20071007", "02"],
      ["20071008", "03"],
      ["20071009", "04"],
      ["20071010", "05"],
      ["20071011", "06"],
      ["20071012", "07"],
    ];
    for (const [date, youbi] of days) {
      const record = Buffer.from(`${RACE}${date}  `);
      setYoubi(record);
      expect(record.toString("latin1", 20, 22)).toBe(youbi);
    }
  });

  test("年月日が空なら、曜日コードは空のまま", () => {
    const record = Buffer.from(`${RACE}          `);
    setYoubi(record);
    expect(record.toString("latin1", 20, 22)).toBe("  ");
  });

  test("出馬表の平・障は、条件カットの 0 (サラ障害) のときだけ障害にする", () => {
    for (const [cut, expected] of [
      ["0", "1"],
      ["1", "0"],
      ["4", "0"],
      [" ", " "],
    ]) {
      const record = Buffer.alloc(30, 0x20);
      record.write(cut, 4, "latin1");
      setHeichiShougai(record, 4, 9);
      expect(record.toString("latin1", 9, 10)).toBe(expected);
    }
  });
});

describe("KD1 形式のファイルの取り込み", () => {
  test("騎手", async () => {
    await emptyKolDb();
    const record = kd1Record(kd1Length.kis, [
      [0, "0"],
      [1, name("横山典弘", 32)],
      [33, name("ヨコヤマノリヒロ", 48)],
      [81, "19680218"],
      [89, "00001"],
      [94, name("横山典", 8)],
    ]);
    expect(await importKolFiles({ "kol_kis.dat": record })).toEqual([]);
    const kishu = await repo(Kishu).findOneBy({ KolKishuCode: 1 });
    expect(kishu?.Seinengappi).toBe(19680218);
  });

  test("厩舎", async () => {
    await emptyKolDb();
    const record = kd1Record(kd1Length.kyu, [
      [0, "0"],
      [1, name("藤沢和雄", 32)],
      [33, name("フジサワカズオ", 48)],
      [81, "19510829"],
      [89, "10001"],
      [94, name("藤沢和", 8)],
      [102, "2"],
      [103, "2"],
    ]);
    expect(await importKolFiles({ "kol_kyu.dat": record })).toEqual([]);
    const choukyoushi = await repo(Choukyoushi).findOneBy({ KolKyuushaCode: 10001 });
    expect(choukyoushi?.Seinengappi).toBe(19510829);
    expect(choukyoushi?.TouzaiBetsu).toBe(2);
    expect(choukyoushi?.RitsuHokuNanBetsu).toBe(2);
  });

  test("種牡馬", async () => {
    await emptyKolDb();
    const record = kd1Record(kd1Length.syu, [
      [0, "1000100"],
      [7, name("サクラバクシンオー", 34)],
      [41, "1989"],
      [45, "1"],
      [46, "2"],
      [47, "3"],
    ]);
    expect(await importKolFiles({ "kol_syu.dat": record })).toEqual([]);
    const uma = await repo(Uma).findOneBy({ KolUmaCode: 1000100 });
    expect(uma?.KanaBamei).toBe("サクラバクシンオー");
    expect(uma?.Seinen).toBe(1989);
    expect(uma?.KyoriTekisei).toBe(1);
    expect(uma?.OmoKousetsu).toBe(2);
    expect(uma?.DirtKousetsu).toBe(3);
  });

  test("3代血統図", async () => {
    await emptyKolDb();
    const record = kd1Record(kd1Length.ket, [
      [0, "1000001"],
      [7, name("サクラバクシンオー", 30)],
      [37, "1"],
      [38, name("サクラユタカオー", 34)],
      [106, "1982"],
      [114, "1"],
      [115, name("サクラハゴロモ", 34)],
      [183, "1983"],
      [191, "1"],
      [192, name("テスコボーイ", 34)],
    ]);
    expect(await importKolFiles({ "kol_ket.dat": record })).toEqual([]);
    const chichi = await repo(Uma).findOneBy({ KanaBamei: "サクラユタカオー" });
    expect(chichi?.Seinen).toBe(1982);
    const haha = await repo(Uma).findOneBy({ KanaBamei: "サクラハゴロモ" });
    expect(haha?.Seinen).toBe(1983);
    const uma = await repo(Uma).findOneBy({ KolUmaCode: 1000001 });
    expect(uma?.ChichiUmaId).toBe(chichi?.Id);
    expect(uma?.HahaUmaId).toBe(haha?.Id);
    const chichichi = await repo(Uma).findOneBy({ KanaBamei: "テスコボーイ" });
    expect(chichi?.ChichiUmaId).toBe(chichichi?.Id);
  });

  test("競走馬 (過去走を含む)", async () => {
    await emptyKolDb();
    const runRace = "062007030603";
    const run = (at: number, text: string): [number, string] => [kd1UmaRunFrom + at, text];
    const record = kd1Record(kd1Length.uma, [
      [0, "1000001"],
      [7, name("サクラバクシンオー", 30)],
      [37, "2003"],
      [41, "0415"],
      [45, "03"],
      [49, "01"],
      [54, "0"],
      [55, "04"],
      [57, "10001"],
      [62, name("さくら商事", 40)],
      [182, "1000100"],
      [296, name("サクラユタカオー", 34)],
      [330, name("サクラハゴロモ", 34)],
      [2237, "19971031"],
      run(0, runRace),
      run(12, "20070922"),
      run(20, "0"),
      run(21, "0"),
      run(22, "0"),
      run(24, "0"),
      run(25, "04"),
      run(27, "03"),
      run(33, "3"),
      run(34, "05"),
      run(38, "570"),
      run(42, "00001"),
      run(61, "10001"),
      run(69, "1334"),
      run(98, name("横山典", 8)),
      run(106, name("藤沢和", 8)),
      run(130, "1"),
      run(134, "1600"),
      run(138, "16"),
    ]);
    expect(await importKolFiles({ "kol_uma.dat": record })).toEqual([]);
    const uma = await repo(Uma).findOneBy({ KolUmaCode: 1000001 });
    expect(uma?.KanaBamei).toBe("サクラバクシンオー");
    expect(uma?.Seinengappi).toBe(20030415);
    const chichi = await repo(Uma).findOneBy({ KolUmaCode: 1000100 });
    expect(uma?.ChichiUmaId).toBe(chichi?.Id);

    const id = Container.get(KolRaceTool).getRaceId(Buffer.from(`${runRace}20070922`));
    expect((await repo(Race).findOneBy({ Id: id }))?.Kyori).toBe(1600);
    const seiseki = await repo(ShussoubaSeiseki).findOneBy({ Id: id * 64 + 5 });
    expect(seiseki?.KakuteiChakujun).toBe(3);
    expect((await repo(Shussouba).findOneBy({ Id: id * 64 + 5 }))?.Wakuban).toBe(3);
  });

  describe("出馬表・競走成績・競走成績２", () => {
    test("出馬表は、レースと出走馬に分けて取り込まれる", async () => {
      await emptyKolDb();
      expect(await importKolFiles({ "kol_den.dat": denRecord() })).toEqual([]);

      const kaisai = await repo(Kaisai).findOneBy({ Nen: 2007, Gatsu: 10, Nichi: 9 });
      expect(kaisai?.Youbi).toBe(4);
      const race = await repo(Race).findOneBy({ Id: raceId() });
      expect(race?.Kyori).toBe(1800);
      expect(race?.Tousuu).toBe(2);
      expect(race?.Shoukin1Chaku).toBe(90000);
      expect(race?.HeichiShougai).not.toBeNull();

      const shussouba = await repo(Shussouba).find();
      expect(shussouba.map((s) => s.Id % 64).sort()).toEqual([1, 2]);
      expect(shussouba.map((s) => s.Wakuban).sort()).toEqual([1, 2]);
      const uma = await repo(Uma).findOneBy({ KolUmaCode: 1000002 });
      expect(uma?.KanaBamei).toBe("タイキシャトル");
      expect(await repo(Choukyoushi).findOneBy({ KolKyuushaCode: 10002 })).not.toBeNull();
      expect(await repo(Kishu).findOneBy({ KolKishuCode: 2 })).not.toBeNull();
    });

    test("競走成績は、レース・払戻・出走馬の成績に分けて取り込まれる", async () => {
      await emptyKolDb();
      expect(
        await importKolFiles({
          // 取り込む順番は、ファイル名の並びではなく、取り込み処理の並びで決まる
          "kol_sei2.dat": sei2Record(),
          "kol_sei.dat": seiRecord(),
          "kol_den.dat": denRecord(),
        }),
      ).toEqual([]);

      const id = raceId();
      const race = await repo(Race).findOneBy({ Id: id });
      expect(race?.Kyori).toBe(1800);

      const tansho = await repo(OddsHaitou).findOneBy({
        RaceId: id,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Tanshou,
        Bangou1: 1,
      });
      expect(tansho?.Haitoukin).toBe(350);
      const fukusho = await repo(OddsHaitou).findBy({
        RaceId: id,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Fukushou,
      });
      expect(fukusho.map((f) => f.Haitoukin).sort()).toEqual([150, 210]);
      const wakuren = await repo(OddsHaitou).findOneBy({
        RaceId: id,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Wakuren,
      });
      expect(wakuren?.Haitoukin).toBe(530);
      const umaren = await repo(OddsHaitou).findOneBy({
        RaceId: id,
        Kakutei: Kakutei.Kakutei,
        Baken: Baken.Umaren,
      });
      expect(umaren?.Haitoukin).toBe(1230);

      const first = await repo(ShussoubaSeiseki).findOneBy({ Id: id * 64 + 1 });
      expect(first?.KakuteiChakujun).toBe(1);
      expect(first?.Bataijuu).toBe(480);
      expect(first?.Zougen).toBe(4);
      expect(first?.Time).toBeCloseTo(106.5, 5);
      expect(first?.Agari3F).toBeCloseTo(34.5, 5);
      const second = await repo(ShussoubaSeiseki).findOneBy({ Id: id * 64 + 2 });
      expect(second?.KakuteiChakujun).toBe(2);

      // 競走成績２ (19 番)
      const nineteenth = await repo(ShussoubaSeiseki).findOneBy({ Id: id * 64 + 19 });
      expect(nineteenth?.KakuteiChakujun).toBe(19);
      const uma = await repo(Uma).findOneBy({ KolUmaCode: 1000019 });
      expect(uma?.KanaBamei).toBe("ダンスインザムード");
      expect((await repo(Shussouba).find()).length).toBe(3);
    });

    test("競走成績２は、開催が取り込まれていなければ読み飛ばす", async () => {
      await emptyKolDb();
      expect(await importKolFiles({ "kol_sei2.dat": sei2Record() })).toEqual([]);
      expect(await repo(Shussouba).find()).toEqual([]);
    });

    test("出走頭数が 18 頭に満たなければ、空の出走馬は取り込まない", async () => {
      await emptyKolDb();
      expect(await importKolFiles({ "kol_sei.dat": seiRecord() })).toEqual([]);
      expect((await repo(Shussouba).find()).length).toBe(2);
    });
  });
});
