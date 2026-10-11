import { type FormEvent, useState } from "react";
import { type ImportJob, request, useApi } from "../api";
import { formatDateTime } from "../format";
import { useImportStatus } from "../ImportStatus";

const STATUS_LABEL = { running: "取り込み中", completed: "完了", failed: "失敗" } as const;

export function ImportsPage() {
  const { refresh } = useImportStatus();
  const [path, setPath] = useState("");
  const [message, setMessage] = useState<string>();
  // 取り込み中はこのページ自体が取り込み画面に替わる。終わると作り直されるので、そのとき読み直される
  const jobs = useApi<ImportJob[]>("/api/imports");

  const start = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(undefined);
    try {
      await request<ImportJob>("/api/imports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path }),
      });
      refresh();
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
          placeholder="取り込むファイル/ディレクトリの絶対パス"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />{" "}
        <button type="submit" disabled={!path.trim()}>
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
              <th className="num">取り込み済み</th>
              <th>備考</th>
              <th className="num">読み飛ばし</th>
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
                <td className="num">
                  {job.processedFiles}
                  {job.totalFiles !== undefined && ` / ${job.totalFiles}`}
                </td>
                <td>
                  {job.status === "completed" && job.filesDone === 0 && (
                    <span className="error">取り込めたファイルがありませんでした</span>
                  )}
                </td>
                <td className="num">
                  {job.skippedCount > 0 && (
                    <details>
                      <summary>{job.skippedCount}</summary>
                      <ul className="errors">
                        {job.skipped.map((skipped) => (
                          <li key={`${skipped.file}:${skipped.reason}`}>
                            {skipped.file}: {skipped.reason}
                          </li>
                        ))}
                        {job.skippedCount > job.skipped.length && (
                          <li>ほか {job.skippedCount - job.skipped.length} 件</li>
                        )}
                      </ul>
                    </details>
                  )}
                </td>
                <td className="num">
                  {job.errors.length > 0 && (
                    <details>
                      <summary>{job.errors.length}</summary>
                      <ul className="errors">
                        {job.errors.map((error) => (
                          <li key={`${error.file}:${error.message}`}>
                            {error.source ? `${error.source} ${error.kind}` : error.file}
                            {" ("}
                            {error.file}
                            {"): "}
                            {error.message}
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
