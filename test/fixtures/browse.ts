import { save } from "../../src/app/db/helpers";
import { Jinmei, JinmeiKubun } from "../../src/app/entities/Jinmei";
import { Kaisai } from "../../src/app/entities/Kaisai";
import { KishuMei } from "../../src/app/entities/KishuMei";
import { Kyousouba } from "../../src/app/entities/Kyousouba";
import { Race } from "../../src/app/entities/Race";
import { RaceMei } from "../../src/app/entities/RaceMei";
import { Shussouba } from "../../src/app/entities/Shussouba";
import { ShussoubaSeiseki } from "../../src/app/entities/ShussoubaSeiseki";
import { TokubetsuMei } from "../../src/app/entities/TokubetsuMei";
import { Uma } from "../../src/app/entities/Uma";

/** Race の NOT NULL 列を 0 で埋めて作る */
function race(overrides: Partial<Race>) {
  const r = {} as Race;
  for (const key of [
    "IppanTokubetsu",
    "HeichiShougai",
    "JoukenSarakei",
    "JoukenAraKei",
    "JoukenBoba",
    "JoukenHinba",
    "JoukenSenba",
    "JoukenMaruKon",
    "JoukenMaruChichi",
    "JoukenMaruIchi",
    "JoukenMaruChuu",
    "JoukenKakuChuu",
    "JoukenMaruKokusai",
    "JoukenMaruShou",
    "JoukenMaruShi",
    "JoukenMaruTokuShi",
  ]) {
    r[key] = 0;
  }
  return Object.assign(r, overrides);
}

/**
 * 閲覧 API の確認用データ。
 * 2024-04-07 は東京と阪神の開催で、東京 11R (id=11) に 3 頭が出走する。
 */
export async function seedBrowseFixture() {
  await save(
    Kaisai,
    Object.assign({} as Kaisai, { Id: 1, Key: 1, Basho: 4, Nen: 2024, Gatsu: 4, Nichi: 7 }),
  );
  await save(
    Kaisai,
    Object.assign({} as Kaisai, { Id: 2, Key: 2, Basho: 1, Nen: 2024, Gatsu: 4, Nichi: 7 }),
  );
  await save(
    Kaisai,
    Object.assign({} as Kaisai, { Id: 3, Key: 3, Basho: 4, Nen: 2024, Gatsu: 4, Nichi: 14 }),
  );
  for (const r of [
    race({
      Id: 11,
      KaisaiId: 1,
      RaceBangou: 11,
      Grade: 1,
      Kyori: 1600,
      DirtShiba: 1,
      Tousuu: 3,
      YoteiHassouJikan: "15:40",
    }),
    race({ Id: 12, KaisaiId: 1, RaceBangou: 1, Kyori: 1200, DirtShiba: 0 }),
    race({ Id: 21, KaisaiId: 2, RaceBangou: 5, Kyori: 1800, DirtShiba: 0, HassouJikan: "12:30" }),
    race({ Id: 31, KaisaiId: 3, RaceBangou: 2, Kyori: 2000, DirtShiba: 1 }),
  ]) {
    save(Race, r);
  }
  const meishou = await save(
    TokubetsuMei,
    Object.assign({} as TokubetsuMei, { Meishou: "テストステークス" }),
  );
  await save(RaceMei, Object.assign({} as RaceMei, { RaceId: 11, TokubetsuMeiId: meishou.Id }));

  const chichi = await save(
    Uma,
    Object.assign({} as Uma, { KanaBamei: "チチウマ", KyuuBamei: "" }),
  );
  const haha = await save(Uma, Object.assign({} as Uma, { KanaBamei: "ハハウマ", KyuuBamei: "" }));
  const horses: Uma[] = [];
  for (const [kana, extra] of [
    ["アルファ", { Seinen: 2020, Seibetsu: 0, ChichiUmaId: chichi.Id, HahaUmaId: haha.Id }],
    ["ブラボー", { Seinengappi: 20210301, Seibetsu: 1 }],
    ["チャーリー", { Seinen: 2019 }],
    ["100%ウマ_", { Seinen: 2018 }],
  ] as const) {
    horses.push(
      await save(Uma, Object.assign({} as Uma, { KanaBamei: kana, KyuuBamei: "", ...extra })),
    );
  }
  const kyousouba: Kyousouba[] = [];
  for (const uma of horses) {
    kyousouba.push(await save(Kyousouba, Object.assign({} as Kyousouba, { UmaId: uma.Id })));
  }

  const jinmei = await save(
    Jinmei,
    Object.assign({} as Jinmei, { Meishou: "武 豊", MatchingKey: "武豊" }),
  );
  const tanshuku = await save(
    Jinmei,
    Object.assign({} as Jinmei, { Meishou: "武豊", MatchingKey: "x" }),
  );
  await save(
    KishuMei,
    Object.assign({} as KishuMei, {
      KishuId: 7,
      JinmeiId: tanshuku.Id,
      Kubun: JinmeiKubun.Tanshuku,
    }),
  );
  await save(
    KishuMei,
    Object.assign({} as KishuMei, { KishuId: 7, JinmeiId: jinmei.Id, Kubun: JinmeiKubun.Seimei }),
  );

  // 11R: アルファが 2 着、ブラボーが 1 着、チャーリーは取消(着順なし)
  const entries: [number, number, number, Kyousouba, Partial<ShussoubaSeiseki> | null][] = [
    [101, 1, 1, kyousouba[0], { KakuteiChakujun: 2, Time: 96.5, Agari3F: 34.1, KishuId: 7 }],
    [
      102,
      2,
      2,
      kyousouba[1],
      { KakuteiChakujun: 1, Time: 96.2, Agari3F: 33.9, Bataijuu: 480, Zougen: -2 },
    ],
    [103, 3, 3, kyousouba[2], { TorikeshiShubetsu: 1 }],
  ];
  for (const [id, waku, umaban, ky, seiseki] of entries) {
    await save(
      Shussouba,
      Object.assign({} as Shussouba, {
        Id: id,
        RaceId: 11,
        Wakuban: waku,
        Umaban: umaban,
        KyousoubaId: ky.Id,
      }),
    );
    if (seiseki) {
      await save(ShussoubaSeiseki, Object.assign({} as ShussoubaSeiseki, { Id: id, ...seiseki }));
    }
  }
  // アルファはもう 1 戦(別の日)
  await save(
    Shussouba,
    Object.assign({} as Shussouba, {
      Id: 301,
      RaceId: 31,
      Umaban: 5,
      KyousoubaId: kyousouba[0].Id,
    }),
  );
}
