import { Link, NavLink, Route, Routes, useLocation } from "react-router";
import { useImportStatus } from "./ImportStatus";
import { canImport } from "./local";
import { ImportsPage } from "./pages/ImportsPage";
import { RacePage } from "./pages/RacePage";
import { RacesPage } from "./pages/RacesPage";
import { UmaPage } from "./pages/UmaPage";
import { UmasPage } from "./pages/UmasPage";

/** 取り込み中は、DB を書き換えているので、閲覧の画面は使わせない */
function Importing() {
  const { running } = useImportStatus();
  return (
    <div className="importing">
      <h1>取り込み中です</h1>
      <p>取り込みが終わるまで、レースと馬は見られません。</p>
      {running && (
        <p className="muted">
          {running.path}
          <br />
          完了 {running.filesDone} ファイル{running.currentFile && ` / 現在: ${running.currentFile}`}
        </p>
      )}
      <p>
        <Link to="/imports">取り込みの状況を見る</Link>
      </p>
    </div>
  );
}

export function App() {
  const { running } = useImportStatus();
  const { pathname } = useLocation();
  const locked = canImport && running !== undefined && !pathname.startsWith("/imports");
  return (
    <>
      <header className="topbar">
        <strong className="brand">Keiba</strong>
        <nav>
          <NavLink to="/" end className={running ? "busy" : undefined}>
            レース
          </NavLink>
          <NavLink to="/umas" className={running ? "busy" : undefined}>
            馬
          </NavLink>
          {canImport && <NavLink to="/imports">取り込み</NavLink>}
        </nav>
      </header>
      <main>
        {locked ? (
          <Importing />
        ) : (
        <Routes>
          <Route path="/" element={<RacesPage />} />
          <Route path="/races/:id" element={<RacePage />} />
          <Route path="/umas" element={<UmasPage />} />
          <Route path="/umas/:id" element={<UmaPage />} />
          {canImport && <Route path="/imports" element={<ImportsPage />} />}
          <Route path="*" element={<p>ページが見つかりません</p>} />
        </Routes>
        )}
      </main>
    </>
  );
}
