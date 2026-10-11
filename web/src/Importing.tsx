import { useImportStatus } from "./ImportStatus";

/** 取り込み中は、DB を書き換えているので、どの画面も使わせずにこれを出す */
export function Importing() {
  const { running } = useImportStatus();
  const total = running?.totalFiles;
  const processed = running?.processedFiles ?? 0;
  const errors = running?.errors ?? [];
  return (
    <div className="importing" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <h1>取り込み中です</h1>
      <p className="muted">取り込みが終わるまで、他の画面は使えません。</p>
      {total === undefined ? (
        <p className="muted">取り込むファイルを数えています</p>
      ) : (
        <>
          <progress value={processed} max={Math.max(total, 1)} aria-label="取り込みの進み具合" />
          <p className="num">
            {processed} / {total} ファイル
          </p>
        </>
      )}
      {running?.currentEntry && (
        <p>
          {running.current && (
            <>
              <strong>{running.current.source}</strong> {running.current.kind}
              <br />
            </>
          )}
          <span className="muted">{running.currentEntry} を取り込んでいます</span>
        </p>
      )}
      {errors.length > 0 && (
        <section className="error-history">
          <h2>エラー {errors.length} 件</h2>
          <ul className="errors">
            {[...errors].reverse().map((error) => (
              <li key={`${error.file}:${error.message}`}>
                <strong>{error.source ? `${error.source} ${error.kind}` : error.file}</strong>
                {error.entry && <span className="muted"> {error.entry}</span>}
                <br />
                <span className="error">{error.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
