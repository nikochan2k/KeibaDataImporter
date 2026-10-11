import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ImportLogPage } from "../../src/app/api/types";
import { type ImportJob, request } from "./api";
import { canImport } from "./local";

const RUNNING_INTERVAL = 2000;
const IDLE_INTERVAL = 10000;

interface ImportStatus {
  /** いま走っている取り込み。なければ undefined */
  running?: ImportJob;
  /** 状態をすぐ読み直す (取り込みを始めた直後に呼ぶ) */
  refresh(): void;
}

const Context = createContext<ImportStatus>({ refresh() {} });

export function useImportStatus() {
  return useContext(Context);
}

/**
 * 取り込みの状態を見張る。
 * - 走っている間は、サーバーの取り込みログをブラウザのコンソールにも出す。
 * - 走っている間は running を返すので、画面側で他の操作を止められる。
 */
export function ImportStatusProvider({ children }: { children: ReactNode }) {
  const [running, setRunning] = useState<ImportJob>();
  const [tick, setTick] = useState(0);
  // コンソールに出し終えた位置。ジョブが終わったあとの最後のログまで出すため、終わっても少し覚えておく
  const tracked = useRef<{ id: string; next: number } | undefined>(undefined);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick は読み直しの合図
  useEffect(() => {
    if (!canImport) {
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      let next = IDLE_INTERVAL;
      try {
        const jobs = await request<ImportJob[]>("/api/imports");
        const current = jobs.find((job) => job.status === "running");
        if (current && tracked.current?.id !== current.id) {
          tracked.current = { id: current.id, next: 0 };
        }
        if (tracked.current) {
          const job = jobs.find((j) => j.id === tracked.current?.id);
          await forwardLogs(tracked.current);
          if (job?.status !== "running") {
            tracked.current = undefined;
          }
        }
        if (!cancelled) {
          setRunning(current);
        }
        if (current) {
          next = RUNNING_INTERVAL;
        }
      } catch (error) {
        console.warn("[取り込み] 状態を読めませんでした", error);
      }
      if (!cancelled) {
        timer = setTimeout(poll, next);
      }
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tick]);

  return <Context.Provider value={{ running, refresh }}>{children}</Context.Provider>;
}

/** 新しいログをコンソールに出す */
async function forwardLogs(tracked: { id: string; next: number }) {
  const page = await request<ImportLogPage>(`/api/imports/${tracked.id}/logs?from=${tracked.next}`);
  for (const entry of page.entries) {
    const time = new Date(entry.at).toLocaleTimeString();
    const method = entry.level === "info" ? "log" : entry.level;
    console[method](`[取り込み ${time}] ${entry.message}`);
  }
  tracked.next = page.next;
}
