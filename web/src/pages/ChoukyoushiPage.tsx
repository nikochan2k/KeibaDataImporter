import { Link, useParams, useSearchParams } from "react-router";
import { type ChoukyoushiDetail, useApi } from "../api";
import { Async, raceCondition } from "../components";
import { formatChakujun, formatTime } from "../format";

const TABS = [{ key: "shussou", label: "出走" }] as const;

export function ChoukyoushiPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.find((t) => t.key === requested)?.key ?? TABS[0].key;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const choukyoushi = useApi<ChoukyoushiDetail>(`/api/choukyoushis/${id}?page=${page}`);
  return (
    <Async state={choukyoushi}>
      {(k) => {
        const pageCount = Math.max(1, Math.ceil(k.startCount / k.perPage));
        const pager = pageCount > 1 && (
          <p>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setParams({ tab, page: String(page - 1) })}
            >
              ← 前
            </button>{" "}
            {page} / {pageCount} ページ{" "}
            <button
              type="button"
              disabled={pageCount <= page}
              onClick={() => setParams({ tab, page: String(page + 1) })}
            >
              次 →
            </button>
          </p>
        );
        return (
        <div className="fill">
          <p>
            <Link to="/choukyoushis">← 調教師の検索</Link>
          </p>
          <h1 className="title">
            {k.meishou}
            <small className="muted">
              {[k.seibetsu, k.shozoku, k.seinen && `${k.seinen}年生`].filter(Boolean).join(" / ")}
            </small>
          </h1>
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={t.key === tab ? "active" : ""}
                onClick={() => setParams({ tab: t.key }, { replace: true })}
              >
                {`${t.label} (${k.startCount})`}
              </button>
            ))}
          </div>
          {pager}
          {k.starts.length === 0 ? (
            <p className="muted">出走記録はありません</p>
          ) : (
            <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>レース</th>
                  <th>条件</th>
                  <th className="num">馬番</th>
                  <th>馬名</th>
                  <th>騎手</th>
                  <th className="num">着</th>
                  <th className="num">タイム</th>
                  <th className="num">上り3F</th>
                </tr>
              </thead>
              <tbody>
                {k.starts.map((s) => (
                  <tr key={`${s.id}-${s.umaban}`}>
                    <td>{s.date}</td>
                    <td>
                      <Link to={`/races/${s.id}`}>
                        {s.bashoMei}
                        {s.raceBangou}R {s.meishou}
                      </Link>
                    </td>
                    <td>{raceCondition(s)}</td>
                    <td className="num">{s.umaban}</td>
                    <td>{s.umaId ? <Link to={`/umas/${s.umaId}`}>{s.bamei}</Link> : s.bamei}</td>
                    <td>{s.kishuMei}</td>
                    <td className="num">{formatChakujun(s.chakujun)}</td>
                    <td className="num">{formatTime(s.time)}</td>
                    <td className="num">{s.agari3F?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
        );
      }}
    </Async>
  );
}
