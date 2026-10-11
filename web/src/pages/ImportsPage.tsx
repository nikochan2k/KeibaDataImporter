import { type FormEvent, useEffect, useState } from "react";
import { type ImportJob, request, useApi } from "../api";
import { formatDateTime } from "../format";

const STATUS_LABEL = { running: "取り込み中", completed: "完了", failed: "失敗" } as const;

export function ImportsPage() {
  const [path, setPath] = useState("");
  const [message, setMessage] = useState<string>();
  const [tick, setTick] = useState(0);
  const jobs = useApi<ImportJob[]>(`/api/imports?t=${tick}`);
  const running = jobs.data?.some((job) => job.status === "running");

  // 取り込み中だけ、2 秒ごとに状態を読み直す
  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(timer);
  }, [running]);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(undefined);
    try {
      await request<ImportJob>("/api/imports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path }),
      });
      setTick((t) => t + 1);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <>
      <h1>取り込み</h1>
      <form onSubmit={start}>
        <input
          type="text"
          className="wide"
          placeholder="取り込むファイル/ディレクトリ (サーバーの IMPORT_ROOT からの相対パス)"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />{" "}
        <button type="submit" disabled={!path.trim() || running}>
          開始
        </button>
      </form>
      {message && <p className="error">{message}</p>}
      {jobs.error && <p className="error">{jobs.error.message}</p>}
      {jobs.data && jobs.data.length === 0 && <p className="muted">取り込みの履歴はありません</p>}
      {jobs.data && jobs.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>状態</th>
              <th>対象</th>
              <th>開始</th>
              <th>終了</th>
              <th className="num">完了ファイル</th>
              <th>現在のファイル</th>
              <th className="num">エラー</th>
            </tr>
          </thead>
          <tbody>
            {jobs.data.map((job) => (
              <tr key={job.id}>
                <td>{STATUS_LABEL[job.status]}</td>
                <td>{job.path}</td>
                <td>{formatDateTime(job.startedAt)}</td>
                <td>{formatDateTime(job.finishedAt)}</td>
                <td className="num">{job.filesDone}</td>
                <td>{job.currentFile}</td>
                <td className="num">
                  {job.errors.length > 0 && (
                    <details>
                      <summary>{job.errors.length}</summary>
                      <ul className="errors">
                        {job.errors.map((error) => (
                          <li key={`${error.file}:${error.message}`}>
                            {error.file}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {job.error && <span className="error">{job.error}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
