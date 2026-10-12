import { useEffect, useState } from "react";
import type { ImportJob } from "../../src/app/api/types";
import type {
  BashoOption,
  PedigreeAncestor,
  PreviewChoukyou,
  PreviewEntry,
  RaceDay,
  RaceMonth,
  RaceEntry,
  RaceSummary,
  UmaStart,
  UmaSummary,
} from "../../src/app/browse/types";

export type { BashoOption, PedigreeAncestor, PreviewChoukyou, PreviewEntry, ImportJob, RaceDay, RaceMonth, RaceEntry, RaceSummary, UmaStart, UmaSummary };

export type ShussoubaPreview = { race: RaceSummary; entry: PreviewEntry };
export type RaceDetail = RaceSummary & { entries: RaceEntry[] };
export type UmaDetail = UmaSummary & {
  chichi: { id: number; bamei: string | null } | null;
  haha: { id: number; bamei: string | null } | null;
  /** 5代までの祖先。父, 母, 父父, 父母, 母父, 母母, 父父父, ... の二分木順。不明は null */
  pedigree: (PedigreeAncestor | null)[];
  starts: UmaStart[];
};

/** サーバーが返したエラー ({ message } 形式) */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new ApiError(response.status, message ?? `${response.status} ${response.statusText}`);
  }
  return body as T;
}

export interface Loaded<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

/** path (null なら読まない) の JSON を読む。path が変わったら読み直す */
export function useApi<T>(path: string | null): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ loading: path !== null });
  useEffect(() => {
    if (path === null) {
      setState({ loading: false });
      return;
    }
    let cancelled = false;
    setState((previous) => ({ data: previous.data, loading: true }));
    request<T>(path).then(
      (data) => !cancelled && setState({ data, loading: false }),
      (error) => !cancelled && setState({ error, loading: false }),
    );
    return () => {
      cancelled = true;
    };
  }, [path]);
  return state;
}
