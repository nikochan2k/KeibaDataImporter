import type { ReactNode } from "react";
import type { Loaded } from "./api";

/** 読み込み中、失敗、読み込み済みを出し分ける */
export function Async<T>({
  state,
  children,
}: {
  state: Loaded<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.error) {
    return <p className="error">{state.error.message}</p>;
  }
  if (!state.data) {
    return <p className="muted">読み込み中…</p>;
  }
  return <div className={state.loading ? "async stale" : "async"}>{children(state.data)}</div>;
}

export function raceTitle(race: {
  bashoMei: string | null;
  raceBangou: number;
  meishou: string | null;
}) {
  return `${race.bashoMei ?? ""}${race.raceBangou}R${race.meishou ? ` ${race.meishou}` : ""}`;
}

export function raceCondition(race: {
  heichiShougai: string | null;
  dirtShiba: string | null;
  kyori: number | null;
}) {
  const course = race.heichiShougai === "障害" ? "障害" : (race.dirtShiba ?? "");
  return `${course}${race.kyori ?? ""}${race.kyori ? "m" : ""}`;
}
