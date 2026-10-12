import * as $C from "../converters/Choukyou";
import type { Choukyou } from "../entities/Choukyou";
import { fromNengappi, label } from "./common";
import type { PreviewChoukyou } from "./types";

/** ChoukyouTime の行を調教Idごとの時計にまとめる(F の長い順に並んだ行を渡す) */
export function groupTimes(rows: { ChoukyouId: number; F: number; Time: number | null }[]) {
  const times = new Map<number, PreviewChoukyou["times"]>();
  for (const t of rows) {
    const list = times.get(t.ChoukyouId) ?? [];
    list.push({ f: t.F, time: t.Time });
    times.set(t.ChoukyouId, list);
  }
  return times;
}

export function toPreviewChoukyou(
  c: Choukyou,
  extra: Pick<PreviewChoukyou, "honOikiri" | "yajirushi" | "awase" | "times">,
): PreviewChoukyou {
  return {
    date: fromNengappi(c.Nengappi),
    basho: label($C.basho, c.Basho),
    type: label($C.type, c.Type),
    course: c.BashoCourse || label($C.course, c.Course),
    baba: label($C.baba, c.Baba),
    oikiri: label($C.oikiri, c.Oikiri),
    ashiiro: label($C.ashiiro, c.Ashiiro),
    ...extra,
  };
}
