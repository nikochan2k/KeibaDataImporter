import { NavLink, Route, Routes } from "react-router";
import { ImportsPage } from "./pages/ImportsPage";
import { RacePage } from "./pages/RacePage";
import { RacesPage } from "./pages/RacesPage";
import { UmaPage } from "./pages/UmaPage";
import { UmasPage } from "./pages/UmasPage";

export function App() {
  return (
    <>
      <header className="topbar">
        <strong className="brand">Keiba</strong>
        <nav>
          <NavLink to="/" end>
            レース
          </NavLink>
          <NavLink to="/umas">馬</NavLink>
          <NavLink to="/imports">取り込み</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<RacesPage />} />
          <Route path="/races/:id" element={<RacePage />} />
          <Route path="/umas" element={<UmasPage />} />
          <Route path="/umas/:id" element={<UmaPage />} />
          <Route path="/imports" element={<ImportsPage />} />
          <Route path="*" element={<p>ページが見つかりません</p>} />
        </Routes>
      </main>
    </>
  );
}
