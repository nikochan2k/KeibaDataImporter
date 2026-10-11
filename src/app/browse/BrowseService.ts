import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { basho } from "../converters/Common";
import * as $R from "../converters/Race";
import { seibetsu } from "../converters/Uma";
import { dataSource } from "../DataSource";
import type { RaceDay, RaceEntry, RaceMonth, RaceSummary, UmaStart, UmaSummary } from "./types";

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
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** 取り込み済みのデータを読む。書き込みはしない */
@Injectable()
export class BrowseService {
  /** レースのある年月。新しい月が先 */
  public async raceMonths(): Promise<RaceMonth[]> {
    const rows: { Nen: number; Gatsu: number }[] = await dataSource.query(
      `SELECT DISTINCT K.Nen, K.Gatsu FROM Kaisai K
        WHERE EXISTS (SELECT 1 FROM Race R WHERE R.KaisaiId = K.Id) ORDER BY K.Nen DESC, K.Gatsu DESC`,
    );
    return rows.map((row) => ({ year: row.Nen, month: row.Gatsu }));
  }

  /** 指定した月の、開催のある日と、その日に開催のある競馬場 */
  public async raceDays(year: number, month: number): Promise<RaceDay[]> {
    const rows: { Nichi: number; Basho: number }[] = await dataSource.query(
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
    const rows: RaceRow[] = await dataSource.query(
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
    const races: RaceRow[] = await dataSource.query(
      `SELECT ${RACE_COLUMNS} FROM Race R INNER JOIN Kaisai K ON K.Id = R.KaisaiId WHERE R.Id = ?`,
      [id],
    );
    if (races.length === 0) {
      throw new NotFoundException(`レースが見つかりません: ${id}`);
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
    }[] = await dataSource.query(
      `SELECT S.Id, S.Wakuban, S.Umaban, U.Id AS UmaId, U.KanaBamei, KY.Seibetsu, S.Nenrei,
          COALESCE(SS.Kinryou, S.Kinryou) AS Kinryou,
          ${JINMEI_SUBQUERY("COALESCE(SS.KishuId, S.KishuId)")} AS KishuMei,
          SS.KakuteiChakujun, SS.TorikeshiShubetsu, SS.Time, SS.Agari3F, SS.Bataijuu, SS.Zougen
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
      })),
    };
  }

  /** 馬名(カナ)の部分一致で探す */
  public async searchUma(query: string, limit = 50): Promise<UmaSummary[]> {
    const rows: {
      Id: number;
      KanaBamei: string | null;
      EigoBamei: string | null;
      Seinen: number | null;
      Seibetsu: number | null;
    }[] = await dataSource.query(
      `SELECT Id, KanaBamei, EigoBamei, COALESCE(Seinen, Seinengappi / 10000) AS Seinen, Seibetsu FROM Uma
        WHERE KanaBamei LIKE ? ESCAPE '\\' OR EigoBamei LIKE ? ESCAPE '\\'
        ORDER BY KanaBamei LIMIT ?`,
      [`%${escapeLike(query)}%`, `%${escapeLike(query)}%`, limit],
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
    }[] = await dataSource.query(
      `SELECT U.Id, U.KanaBamei, U.EigoBamei, COALESCE(U.Seinen, U.Seinengappi / 10000) AS Seinen, U.Seibetsu,
          C.Id AS ChichiId, C.KanaBamei AS ChichiBamei, H.Id AS HahaId, H.KanaBamei AS HahaBamei
        FROM Uma U
        LEFT JOIN Uma C ON C.Id = U.ChichiUmaId
        LEFT JOIN Uma H ON H.Id = U.HahaUmaId
        WHERE U.Id = ?`,
      [id],
    );
    if (found.length === 0) {
      throw new NotFoundException(`馬が見つかりません: ${id}`);
    }
    const uma = found[0];

    const rows: (RaceRow & {
      Umaban: number;
      KakuteiChakujun: number | null;
      Time: number | null;
      Agari3F: number | null;
      KishuMei: string | null;
    })[] = await dataSource.query(
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

  /** 日付の文字列 (YYYY-MM-DD) を年月日にする。不正なら 400 */
  public static parseDate(text: unknown): [number, number, number] {
    const matched = typeof text === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
    if (!matched) {
      throw new BadRequestException("date は YYYY-MM-DD で指定してください");
    }
    return [Number(matched[1]), Number(matched[2]), Number(matched[3])];
  }
}
