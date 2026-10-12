import * as $C from "../converters/Choukyou";
import { Baken, basho, Kakutei, touzaiBetsu } from "../converters/Common";
import * as $R from "../converters/Race";
import * as $S from "../converters/Shussouba";
import * as $J from "../converters/ShussoubaJoutai";
import * as $Y from "../converters/ShussoubaYosou";
import { seibetsu } from "../converters/Uma";
import { readDb } from "../db/db";
import type { Choukyou } from "../entities/Choukyou";
import type { ShussoubaHyouka } from "../entities/ShussoubaHyouka";
import { Kubun } from "../entities/ShussoubaJoutai";
import { BadRequestError, NotFoundError } from "../http/errors";
import type {
  PedigreeAncestor,
  PreviewChoukyou,
  PreviewEntry,
  RaceDay,
  RaceEntry,
  RaceMonth,
  RaceSummary,
  UmaStart,
  UmaSummary,
} from "./types";

/** 血統表に出す祖先の代数 */
const PEDIGREE_GENERATIONS = 5;

/** 数値コードを表示用の名前にする。値がなければ null */
function label(codes: { toNaiyou(code: number): string }, code: number | null) {
  return code == null ? null : codes.toNaiyou(code) || null;
}

/** 開催の日付を YYYY-MM-DD にする */
function toDate(nen: number, gatsu: number, nichi: number) {
  return `${nen}-${String(gatsu).padStart(2, "0")}-${String(nichi).padStart(2, "0")}`;
}

/** 人名は区分によって表記が違うので、正式な氏名(Seimei)を優先する */
const JINMEI_SUBQUERY = (kishuId: string) => `
  (SELECT J.Meishou FROM KishuMei KM INNER JOIN Jinmei J ON J.Id = KM.JinmeiId
    WHERE KM.KishuId = ${kishuId} ORDER BY KM.Kubun LIMIT 1)`;

const RACE_MEI_SUBQUERY = `
  (SELECT T.Meishou FROM RaceMei M INNER JOIN TokubetsuMei T ON T.Id = M.TokubetsuMeiId
    WHERE M.RaceId = R.Id ORDER BY M.Id LIMIT 1)`;

interface RaceRow {
  Id: number;
  Nen: number;
  Gatsu: number;
  Nichi: number;
  Basho: number;
  RaceBangou: number;
  Meishou: string | null;
  Grade: number | null;
  HeichiShougai: number | null;
  DirtShiba: number | null;
  Kyori: number | null;
  Tousuu: number | null;
  HassouJikan: string | null;
}

const RACE_COLUMNS = `
  R.Id, K.Nen, K.Gatsu, K.Nichi, K.Basho, R.RaceBangou, R.Grade, R.HeichiShougai, R.DirtShiba,
  R.Kyori, R.Tousuu, COALESCE(R.HassouJikan, R.YoteiHassouJikan) AS HassouJikan,
  ${RACE_MEI_SUBQUERY} AS Meishou`;

function toRaceSummary(row: RaceRow): RaceSummary {
  return {
    id: row.Id,
    date: toDate(row.Nen, row.Gatsu, row.Nichi),
    basho: row.Basho,
    bashoMei: label(basho, row.Basho),
    raceBangou: row.RaceBangou,
    meishou: row.Meishou,
    grade: label($R.grade, row.Grade),
    heichiShougai: label($R.heichiShougai, row.HeichiShougai),
    dirtShiba: label($R.dirtShiba, row.DirtShiba),
    kyori: row.Kyori,
    tousuu: row.Tousuu,
    hassouJikan: row.HassouJikan,
  };
}

/** LIKE のワイルドカードを文字として扱うためのエスケープ */
/** 前方一致を IxUma3 / IxUma4 の範囲検索にするための上端。UTF-8 で最大の文字を足す */
function prefixUpperBound(prefix: string) {
  return `${prefix}\u{10ffff}`;
}

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

/** YYYYMMDD の数値を YYYY-MM-DD にする */
function fromNengappi(n: number) {
  return toDate(Math.floor(n / 10000), Math.floor(n / 100) % 100, n % 100);
}

/** 閲覧用の接続で読む。? に params を順に当てる */
function select<T>(sql: string, params: (string | number | null)[] = []): T[] {
  return readDb()
    .query(sql)
    .all(...params) as T[];
}

/** 取り込み済みのデータを読む。書き込みはしない */
export class BrowseService {
  /** レースのある年月。新しい月が先 */
  public async raceMonths(): Promise<RaceMonth[]> {
    const rows: { Nen: number; Gatsu: number }[] = select(
      `SELECT DISTINCT K.Nen, K.Gatsu FROM Kaisai K
        WHERE EXISTS (SELECT 1 FROM Race R WHERE R.KaisaiId = K.Id) ORDER BY K.Nen DESC, K.Gatsu DESC`,
    );
    return rows.map((row) => ({ year: row.Nen, month: row.Gatsu }));
  }

  /** 指定した月の、開催のある日と、その日に開催のある競馬場 */
  public async raceDays(year: number, month: number): Promise<RaceDay[]> {
    const rows: { Nichi: number; Basho: number }[] = select(
      `SELECT DISTINCT K.Nichi, K.Basho FROM Kaisai K
        WHERE K.Nen = ? AND K.Gatsu = ? AND EXISTS (SELECT 1 FROM Race R WHERE R.KaisaiId = K.Id)
        ORDER BY K.Nichi, K.Basho`,
      [year, month],
    );
    const days: RaceDay[] = [];
    for (const row of rows) {
      const date = toDate(year, month, row.Nichi);
      if (days.at(-1)?.date !== date) {
        days.push({ date, bashos: [] });
      }
      days.at(-1)?.bashos.push({ basho: row.Basho, bashoMei: label(basho, row.Basho) });
    }
    return days;
  }

  /** 指定した日のレース一覧。競馬場を指定すればその競馬場だけ */
  public async racesOn(
    year: number,
    month: number,
    day: number,
    bashoCode?: number,
  ): Promise<RaceSummary[]> {
    const rows: RaceRow[] = select(
      `SELECT ${RACE_COLUMNS} FROM Race R
        INNER JOIN Kaisai K ON K.Id = R.KaisaiId
        WHERE K.Nen = ? AND K.Gatsu = ? AND K.Nichi = ? AND (? IS NULL OR K.Basho = ?)
        ORDER BY K.Basho, R.RaceBangou`,
      [year, month, day, bashoCode ?? null, bashoCode ?? null],
    );
    return rows.map(toRaceSummary);
  }

  /** レースと、その出走馬(着順の順。着順のない馬は馬番順で最後) */
  public async race(id: number): Promise<RaceSummary & { entries: RaceEntry[] }> {
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

  /** レースの出走馬ごとの、出走前の情報(状態・評価・予想・調教) */
  public async racePreview(id: number): Promise<{
    race: RaceSummary;
    entries: PreviewEntry[];
  }> {
    const { entries: _, ...race } = await this.race(id);
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
    const times = new Map<number, PreviewChoukyou["times"]>();
    for (const t of timeRows) {
      const list = times.get(t.ChoukyouId) ?? [];
      list.push({ f: t.F, time: t.Time });
      times.set(t.ChoukyouId, list);
    }
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
            .map((c) => ({
              date: fromNengappi(c.Nengappi),
              basho: label($C.basho, c.Basho),
              type: label($C.type, c.Type),
              course: c.BashoCourse || label($C.course, c.Course),
              baba: label($C.baba, c.Baba),
              oikiri: label($C.oikiri, c.Oikiri),
              ashiiro: label($C.ashiiro, c.Ashiiro),
              honOikiri: c.HonOikiri === 1,
              yajirushi: label($C.yajirushi, c.Yajirushi),
              awase: c.AwaseBamei,
              times: times.get(c.Id) ?? [],
            })),
        },
      })),
    };
  }

  /** 出走馬1頭の、出走前の情報。レースの概要も付ける */
  public async shussoubaPreview(
    shussoubaId: number,
  ): Promise<{ race: RaceSummary; entry: PreviewEntry }> {
    const found: { RaceId: number }[] = select("SELECT RaceId FROM Shussouba WHERE Id = ?", [
      shussoubaId,
    ]);
    if (found.length === 0) {
      throw new NotFoundError(`出走馬が見つかりません: ${shussoubaId}`);
    }
    const { race, entries } = await this.racePreview(found[0].RaceId);
    const entry = entries.find((e) => e.shussoubaId === shussoubaId);
    if (!entry) {
      throw new NotFoundError(`出走馬が見つかりません: ${shussoubaId}`);
    }
    return { race, entry };
  }

  /** 馬名(カナ・英字)の前方一致で探す。LIKE は大文字小文字を区別せずインデックスが効かないので範囲で比較する */
  public async searchUma(query: string, limit = 50): Promise<UmaSummary[]> {
    const rows: {
      Id: number;
      KanaBamei: string | null;
      EigoBamei: string | null;
      Seinen: number | null;
      Seibetsu: number | null;
    }[] = select(
      `SELECT Id, KanaBamei, EigoBamei, COALESCE(Seinen, Seinengappi / 10000) AS Seinen, Seibetsu FROM Uma
        WHERE (KanaBamei >= ? AND KanaBamei < ?) OR (EigoBamei >= ? AND EigoBamei < ?)
        ORDER BY KanaBamei LIMIT ?`,
      [query, prefixUpperBound(query), query, prefixUpperBound(query), limit],
    );
    return rows.map((row) => ({
      id: row.Id,
      bamei: row.KanaBamei,
      eigoBamei: row.EigoBamei,
      seinen: row.Seinen,
      seibetsu: label(seibetsu, row.Seibetsu),
    }));
  }

  /** 馬の基本情報と、出走した全レース(新しい順) */
  public async uma(id: number): Promise<
    UmaSummary & {
      chichi: { id: number; bamei: string | null } | null;
      haha: { id: number; bamei: string | null } | null;
      pedigree: (PedigreeAncestor | null)[];
      starts: UmaStart[];
    }
  > {
    const found: {
      Id: number;
      KanaBamei: string | null;
      EigoBamei: string | null;
      Seinen: number | null;
      Seibetsu: number | null;
      ChichiId: number | null;
      ChichiBamei: string | null;
      HahaId: number | null;
      HahaBamei: string | null;
    }[] = select(
      `SELECT U.Id, U.KanaBamei, U.EigoBamei, COALESCE(U.Seinen, U.Seinengappi / 10000) AS Seinen, U.Seibetsu,
          C.Id AS ChichiId, C.KanaBamei AS ChichiBamei, H.Id AS HahaId, H.KanaBamei AS HahaBamei
        FROM Uma U
        LEFT JOIN Uma C ON C.Id = U.ChichiUmaId
        LEFT JOIN Uma H ON H.Id = U.HahaUmaId
        WHERE U.Id = ?`,
      [id],
    );
    if (found.length === 0) {
      throw new NotFoundError(`馬が見つかりません: ${id}`);
    }
    const uma = found[0];

    const rows: (RaceRow & {
      Umaban: number;
      KakuteiChakujun: number | null;
      Time: number | null;
      Agari3F: number | null;
      KishuMei: string | null;
    })[] = select(
      `SELECT ${RACE_COLUMNS}, S.Umaban, SS.KakuteiChakujun, SS.Time, SS.Agari3F,
          ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei
        FROM Kyousouba KY
        INNER JOIN Shussouba S ON S.KyousoubaId = KY.Id
        INNER JOIN Race R ON R.Id = S.RaceId
        INNER JOIN Kaisai K ON K.Id = R.KaisaiId
        LEFT JOIN ShussoubaSeiseki SS ON SS.Id = S.Id
        WHERE KY.UmaId = ?
        ORDER BY K.Nen DESC, K.Gatsu DESC, K.Nichi DESC, R.RaceBangou DESC`,
      [id],
    );
    return {
      id: uma.Id,
      bamei: uma.KanaBamei,
      eigoBamei: uma.EigoBamei,
      seinen: uma.Seinen,
      seibetsu: label(seibetsu, uma.Seibetsu),
      chichi: uma.ChichiId == null ? null : { id: uma.ChichiId, bamei: uma.ChichiBamei },
      haha: uma.HahaId == null ? null : { id: uma.HahaId, bamei: uma.HahaBamei },
      pedigree: this.pedigree(uma.Id),
      starts: rows.map((row) => ({
        ...toRaceSummary(row),
        umaban: row.Umaban,
        chakujun: row.KakuteiChakujun,
        time: row.Time,
        agari3F: row.Agari3F,
        kishuMei: row.KishuMei,
      })),
    };
  }

  /**
   * 5代までの祖先。二分木を配列にした並びで、位置 k は父=2n・母=2n+1 の n=k+2 番目 (父, 母, 父父, 父母, 母父, 母母, 父父父, ...)。
   * 分かっていない祖先とその先は null
   */
  private pedigree(id: number): (PedigreeAncestor | null)[] {
    type Row = {
      Id: number;
      KanaBamei: string | null;
      ChichiUmaId: number | null;
      HahaUmaId: number | null;
    };
    const fetch = (ids: number[]): Map<number, Row> => {
      if (ids.length === 0) {
        return new Map();
      }
      const rows: Row[] = select(
        `SELECT Id, KanaBamei, ChichiUmaId, HahaUmaId FROM Uma WHERE Id IN (${ids.map(() => "?").join(",")})`,
        ids,
      );
      return new Map(rows.map((row) => [row.Id, row]));
    };
    const result: (PedigreeAncestor | null)[] = [];
    let slots: (Row | null)[] = [fetch([id]).get(id) ?? null];
    for (let depth = 1; depth <= PEDIGREE_GENERATIONS; depth++) {
      const parentIds = slots.flatMap((child) => [child?.ChichiUmaId, child?.HahaUmaId]);
      const rows = fetch(parentIds.filter((value): value is number => value != null));
      slots = parentIds.map((parentId) => (parentId == null ? null : (rows.get(parentId) ?? null)));
      for (const parent of slots) {
        result.push(parent == null ? null : { id: parent.Id, bamei: parent.KanaBamei });
      }
    }
    return result;
  }

  /** 日付の文字列 (YYYY-MM-DD) を年月日にする。不正なら 400 */
  public static parseDate(text: unknown): [number, number, number] {
    const matched = typeof text === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
    if (!matched) {
      throw new BadRequestError("date は YYYY-MM-DD で指定してください");
    }
    return [Number(matched[1]), Number(matched[2]), Number(matched[3])];
  }
}

export const browseService = new BrowseService();
