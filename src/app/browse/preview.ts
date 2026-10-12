import * as $C from "../converters/Choukyou";
import * as $S from "../converters/Shussouba";
import * as $J from "../converters/ShussoubaJoutai";
import * as $Y from "../converters/ShussoubaYosou";
import type { Choukyou } from "../entities/Choukyou";
import type { ShussoubaHyouka } from "../entities/ShussoubaHyouka";
import { Kubun } from "../entities/ShussoubaJoutai";
import { NotFoundError } from "../http/errors";
import { groupTimes, toPreviewChoukyou } from "./choukyou";
import { JINMEI_SUBQUERY, label, select } from "./common";
import { getRace } from "./race";
import type { PreviewEntry, RaceSummary } from "./types";

/** 状態の区分ごとの見出しとコード表 */
function joutaiCodes(kubun: Kubun) {
  switch (kubun) {
    case Kubun.Tokki:
      return { name: "特記", codes: $J.tokki };
    case Kubun.Bagu:
      return { name: "馬具", codes: $J.bagu };
    case Kubun.AshimotoSougou:
    case Kubun.AshimotoHidariMae:
    case Kubun.AshimotoMigiMae:
    case Kubun.AshimotoHidariUshiro:
    case Kubun.AshimotoMigiUshiro:
      return { name: "脚元", codes: $J.ashimoto };
    default:
      return undefined;
  }
}

/** レースの出走馬ごとの、出走前の情報(状態・評価・予想・調教) */
export function racePreview(id: number): {
  race: RaceSummary;
  entries: PreviewEntry[];
} {
  const { entries: _, ...race } = getRace(id);
  const rows: (Partial<ShussoubaHyouka> & {
    ShussoubaId: number;
    Wakuban: number | null;
    Umaban: number;
    UmaId: number | null;
    KanaBamei: string | null;
    KishuMei: string | null;
    YosouIdm: number | null;
    KishuShisuu: number | null;
    JouhouShisuu: number | null;
    SougouShisuu: number | null;
    ChoukyouShisuu: number | null;
    KyuushaShisuu: number | null;
    NinkiShisuu: number | null;
    YosouKyakushitsu: number | null;
    YosouKyuushaHyouka: number | null;
    ChoukyouYajirushi: number | null;
    SougouShirushi: number | null;
    IdmShirushi: number | null;
    JouhouShirushi: number | null;
    KishuShirushi: number | null;
    KyuushaShirushi: number | null;
    ChoukyouShirushi: number | null;
    GekisouShirushi: number | null;
    OddsShirushi: number | null;
    PaddockShirushi: number | null;
  })[] = select(
    `SELECT H.*, S.Id AS ShussoubaId, S.Wakuban, S.Umaban, U.Id AS UmaId, U.KanaBamei,
        ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei, Y.Rating, Y.Idm AS YosouIdm, Y.KishuShisuu, Y.JouhouShisuu, Y.SougouShisuu,
        Y.ChoukyouShisuu, Y.KyuushaShisuu, Y.NinkiShisuu, Y.Kyakushitsu AS YosouKyakushitsu,
        Y.ChoukyouYajirushi, Y.KyuushaHyouka AS YosouKyuushaHyouka,
        Y.SougouShirushi, Y.IdmShirushi, Y.JouhouShirushi, Y.KishuShirushi, Y.KyuushaShirushi,
        Y.ChoukyouShirushi, Y.GekisouShirushi, Y.OddsShirushi, Y.PaddockShirushi
      FROM Shussouba S
      LEFT JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
      LEFT JOIN Uma U ON U.Id = KY.UmaId
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      LEFT JOIN ShussoubaHyouka H ON H.Id = S.Id
      LEFT JOIN ShussoubaYosou Y ON Y.Id = S.Id
      WHERE S.RaceId = ?
      ORDER BY S.Umaban`,
    [id],
  );
  const joutaiRows: { ShussoubaId: number; Kubun: Kubun; Code: number | null }[] = select(
    `SELECT J.ShussoubaId, J.Kubun, J.Code FROM ShussoubaJoutai J
      INNER JOIN Shussouba S ON S.Id = J.ShussoubaId WHERE S.RaceId = ? ORDER BY J.Id`,
    [id],
  );
  const choukyouRows: (Choukyou & {
    ShussoubaId: number;
    HonOikiri: number | null;
    Yajirushi: number | null;
    AwaseBamei: string | null;
  })[] = select(
    `SELECT SC.ShussoubaId, SC.Yajirushi, SC.HonOikiri, C.*, AU.KanaBamei AS AwaseBamei
      FROM ShussoubaChoukyou SC
      INNER JOIN Shussouba S ON S.Id = SC.ShussoubaId
      INNER JOIN Choukyou C ON C.Id = SC.ChoukyouId
      LEFT JOIN Uma AU ON AU.Id = C.AwaseUmaId
      WHERE S.RaceId = ? ORDER BY C.Nengappi, C.Renban`,
    [id],
  );
  const timeRows: { ChoukyouId: number; F: number; Time: number | null }[] = select(
    `SELECT T.ChoukyouId, T.F, T.Time FROM ChoukyouTime T
      WHERE T.ChoukyouId IN (
        SELECT SC.ChoukyouId FROM ShussoubaChoukyou SC
          INNER JOIN Shussouba S ON S.Id = SC.ShussoubaId WHERE S.RaceId = ?)
      ORDER BY T.ChoukyouId, T.F DESC`,
    [id],
  );
  const times = groupTimes(timeRows);
  const mark = (name: string, code: number | null) => {
    const m = label($Y.shirushi, code);
    return m ? [{ name, mark: m }] : [];
  };
  return {
    race,
    entries: rows.map((row) => ({
      shussoubaId: row.ShussoubaId,
      wakuban: row.Wakuban,
      umaban: row.Umaban,
      umaId: row.UmaId,
      bamei: row.KanaBamei,
      kishuMei: row.KishuMei,
      joutai: joutaiRows
        .filter((j) => j.ShussoubaId === row.ShussoubaId && j.Code != null)
        .flatMap((j) => {
          const found = joutaiCodes(j.Kubun);
          const naiyou = found && label(found.codes, j.Code);
          return found && naiyou ? [{ kubun: found.name, naiyou }] : [];
        }),
      hyouka: {
        idm: row.Idm,
        kehai: label($S.kehaiCode, row.KehaiCode),
        batai: label($S.bataiCode, row.BataiCode),
        paddock: row.PaddockComment,
        ashimoto: row.AshimotoComment,
        bagu: row.BaguSonotaComment,
        kyuushaHyouka: label($Y.kyuushaHyouka, row.YosouKyuushaHyouka),
      },
      yosou: {
        shirushi: [
          ...mark("総合", row.SougouShirushi),
          ...mark("IDM", row.IdmShirushi),
          ...mark("情報", row.JouhouShirushi),
          ...mark("騎手", row.KishuShirushi),
          ...mark("厩舎", row.KyuushaShirushi),
          ...mark("調教", row.ChoukyouShirushi),
          ...mark("激走", row.GekisouShirushi),
          ...mark("オッズ", row.OddsShirushi),
          ...mark("パドック", row.PaddockShirushi),
        ],
        sougouShisuu: row.SougouShisuu,
        idm: row.YosouIdm,
        kishuShisuu: row.KishuShisuu,
        jouhouShisuu: row.JouhouShisuu,
        choukyouShisuu: row.ChoukyouShisuu,
        kyuushaShisuu: row.KyuushaShisuu,
        ninkiShisuu: row.NinkiShisuu,
        kyakushitsu: row.YosouKyakushitsu,
      },
      choukyou: {
        tanpyou: row.ChoukyouTanpyou,
        type: label($C.choukyouType, row.ChoukyouType),
        ryou: label($C.choukyouryou, row.Choukyouryou),
        ryouHyouka: label($C.choukyouryouHyouka, row.ChoukyouryouHyouka),
        yajirushi: label($Y.choukyouYajirushi, row.ChoukyouYajirushi),
        isshuumaeShisuu: row.IsshuumaeOikiriShisuu,
        oikiriShisuu: row.OikiriShisuu,
        shiageShisuu: row.ShiageShisuu,
        shiageHenka: label($C.shiageShisuuHenka, row.ShiageShisuuHenka),
        comment: row.ChoukyouComment,
        items: choukyouRows
          .filter((c) => c.ShussoubaId === row.ShussoubaId)
          .map((c) =>
            toPreviewChoukyou(c, {
              honOikiri: c.HonOikiri === 1,
              yajirushi: label($C.yajirushi, c.Yajirushi),
              awase: c.AwaseBamei,
              times: times.get(c.Id) ?? [],
            }),
          ),
      },
    })),
  };
}

/** 出走馬1頭の、出走前の情報。レースの概要も付ける */
export function shussoubaPreview(shussoubaId: number): { race: RaceSummary; entry: PreviewEntry } {
  const found: { RaceId: number }[] = select("SELECT RaceId FROM Shussouba WHERE Id = ?", [
    shussoubaId,
  ]);
  if (found.length === 0) {
    throw new NotFoundError(`出走馬が見つかりません: ${shussoubaId}`);
  }
  const { race, entries } = racePreview(found[0].RaceId);
  const entry = entries.find((e) => e.shussoubaId === shussoubaId);
  if (!entry) {
    throw new NotFoundError(`出走馬が見つかりません: ${shussoubaId}`);
  }
  return { race, entry };
}
