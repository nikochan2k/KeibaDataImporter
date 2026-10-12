import { NavLink, Route, Routes } from "react-router";
import { useImportStatus } from "./ImportStatus";
import { Importing } from "./Importing";
import { canImport } from "./local";
import { ImportsPage } from "./pages/ImportsPage";
import { BanushiPage } from "./pages/BanushiPage";
import { BanushisPage } from "./pages/BanushisPage";
import { ChoukyoushiPage } from "./pages/ChoukyoushiPage";
import { ChoukyoushisPage } from "./pages/ChoukyoushisPage";
import { KishuPage } from "./pages/KishuPage";
import { KishusPage } from "./pages/KishusPage";
import { RacePage } from "./pages/RacePage";
import { RacesPage } from "./pages/RacesPage";
import { ShussoubaPage } from "./pages/ShussoubaPage";
import { UmaPage } from "./pages/UmaPage";
import { UmasPage } from "./pages/UmasPage";

export function App() {
  const { running } = useImportStatus();
  const locked = canImport && running !== undefined;
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
          <NavLink to="/kishus" className={running ? "busy" : undefined}>
            騎手
          </NavLink>
          <NavLink to="/choukyoushis" className={running ? "busy" : undefined}>
            調教師
          </NavLink>
          <NavLink to="/banushis" className={running ? "busy" : undefined}>
            馬主
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
          <Route path="/shussouba/:id" element={<ShussoubaPage />} />
          <Route path="/umas" element={<UmasPage />} />
          <Route path="/umas/:id" element={<UmaPage />} />
          <Route path="/kishus" element={<KishusPage />} />
          <Route path="/kishus/:id" element={<KishuPage />} />
          <Route path="/choukyoushis" element={<ChoukyoushisPage />} />
          <Route path="/choukyoushis/:id" element={<ChoukyoushiPage />} />
          <Route path="/banushis" element={<BanushisPage />} />
          <Route path="/banushis/:id" element={<BanushiPage />} />
          {canImport && <Route path="/imports" element={<ImportsPage />} />}
          <Route path="*" element={<p>ページが見つかりません</p>} />
        </Routes>
        )}
      </main>
    </>
  );
}
