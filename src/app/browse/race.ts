import { Baken, Kakutei, touzaiBetsu } from "../converters/Common";
import * as $S from "../converters/Shussouba";
import { seibetsu } from "../converters/Uma";
import { NotFoundError } from "../http/errors";
import {
  JINMEI_SUBQUERY,
  label,
  RACE_COLUMNS,
  type RaceRow,
  select,
  toRaceSummary,
} from "./common";
import type { RaceEntry, RaceSummary } from "./types";

/** 着差(馬身の整数部と、ハナ・クビ・1/2 などの端数)を表示用の文字列にする */
function formatChakusa(whole: number | null, rest: number | null) {
  const part = label($S.chakura2, rest);
  // ハナ・アタマ・クビ・大差・同着は馬身の整数部と組み合わせない
  if (rest != null && (rest <= 2 || rest >= 7)) {
    return part;
  }
  if (whole && part) {
    return `${whole}.${part}`;
  }
  return part ?? (whole ? String(whole) : null);
}

/** レースと、その出走馬(着順の順。着順のない馬は馬番順で最後) */
export function getRace(id: number): RaceSummary & { entries: RaceEntry[] } {
  const races: RaceRow[] = select(
    `SELECT ${RACE_COLUMNS} FROM Race R INNER JOIN Kaisai K ON K.Id = R.KaisaiId WHERE R.Id = ?`,
    [id],
  );
  if (races.length === 0) {
    throw new NotFoundError(`レースが見つかりません: ${id}`);
  }
  const rows: {
    Id: number;
    Wakuban: number | null;
    Umaban: number;
    UmaId: number | null;
    KanaBamei: string | null;
    Seibetsu: number | null;
    Nenrei: number | null;
    Kinryou: number | null;
    KishuMei: string | null;
    KakuteiChakujun: number | null;
    TorikeshiShubetsu: number | null;
    Time: number | null;
    Agari3F: number | null;
    Bataijuu: number | null;
    Zougen: number | null;
    Chakusa1: number | null;
    Chakusa2: number | null;
    Ninki: number | null;
    Odds: number | null;
    Tsuuka: string | null;
    ChoukyoushiMei: string | null;
    ChoukyoushiTouzai: number | null;
  }[] = select(
    `SELECT S.Id, S.Wakuban, S.Umaban, U.Id AS UmaId, U.KanaBamei, KY.Seibetsu, S.Nenrei,
        COALESCE(SS.Kinryou, S.Kinryou) AS Kinryou,
        ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei,
        SS.KakuteiChakujun, SS.TorikeshiShubetsu, SS.Time, SS.Agari3F, SS.Bataijuu, SS.Zougen,
        SS.Chakusa1, SS.Chakusa2,
        (SELECT O.Ninki FROM OddsHaitou O WHERE O.RaceId = S.RaceId AND O.Baken = ${Baken.Tanshou}
          AND O.Kakutei = ${Kakutei.Kakutei} AND O.Bangou1 = S.Umaban LIMIT 1) AS Ninki,
        (SELECT O.Odds1 FROM OddsHaitou O WHERE O.RaceId = S.RaceId AND O.Baken = ${Baken.Tanshou}
          AND O.Kakutei = ${Kakutei.Kakutei} AND O.Bangou1 = S.Umaban LIMIT 1) AS Odds,
        (SELECT GROUP_CONCAT(COALESCE(T.Juni, '-'), '-') FROM
          (SELECT Juni FROM ShussoubaTsuukaJuni WHERE ShussoubaId = S.Id ORDER BY Bangou) T) AS Tsuuka,
        (SELECT J.Meishou FROM ChoukyoushiMei CM INNER JOIN Jinmei J ON J.Id = CM.JinmeiId
          WHERE CM.ChoukyoushiId = KY.ChoukyoushiId ORDER BY CM.Kubun LIMIT 1) AS ChoukyoushiMei,
        (SELECT C.TouzaiBetsu FROM Choukyoushi C WHERE C.Id = KY.ChoukyoushiId) AS ChoukyoushiTouzai
      FROM Shussouba S
      LEFT JOIN Kyousouba KY ON KY.Id = S.KyousoubaId
      LEFT JOIN Uma U ON U.Id = KY.UmaId
      LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
      WHERE S.RaceId = ?
      ORDER BY (SS.KakuteiChakujun IS NULL), SS.KakuteiChakujun, S.Umaban`,
    [id],
  );
  return {
    ...toRaceSummary(races[0]),
    entries: rows.map((row) => ({
      shussoubaId: row.Id,
      wakuban: row.Wakuban,
      umaban: row.Umaban,
      umaId: row.UmaId,
      bamei: row.KanaBamei,
      seibetsu: label(seibetsu, row.Seibetsu),
      nenrei: row.Nenrei,
      kinryou: row.Kinryou,
      kishuMei: row.KishuMei,
      chakujun: row.KakuteiChakujun,
      torikeshi: row.TorikeshiShubetsu,
      time: row.Time,
      agari3F: row.Agari3F,
      bataijuu: row.Bataijuu,
      zougen: row.Zougen,
      chakusa: formatChakusa(row.Chakusa1, row.Chakusa2),
      ninki: row.Ninki,
      odds: row.Odds,
      tsuuka: row.Tsuuka,
      choukyoushiMei: row.ChoukyoushiMei,
      choukyoushiShozoku:
        row.ChoukyoushiTouzai == null
          ? null
          : (touzaiBetsu.toTanshuku(row.ChoukyoushiTouzai) ?? null),
    })),
  };
}
