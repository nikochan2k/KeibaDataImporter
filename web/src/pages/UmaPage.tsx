import { Link, useParams, useSearchParams } from "react-router";
import { type PedigreeAncestor, type PreviewChoukyou, type UmaDetail, useApi } from "../api";
import { Async, raceCondition } from "../components";
import { formatChakujun, formatTime } from "../format";

const TABS = [
  { key: "senreki", label: "戦歴" },
  { key: "choukyou", label: "調教" },
  { key: "ketto", label: "血統" },
] as const;

const GENERATIONS = 5;

function times(c: PreviewChoukyou) {
  return c.times
    .filter((t) => t.time != null)
    .map((t) => formatTime(t.time).replace(/^0:/, ""))
    .join(" - ");
}

function ChoukyouTable({ items }: { items: PreviewChoukyou[] }) {
  if (items.length === 0) {
    return <p className="muted">調教記録はありません</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>日付</th>
          <th>場所</th>
          <th>コース</th>
          <th>馬場</th>
          <th>時計</th>
          <th>追い方</th>
          <th>併せ</th>
        </tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={`${c.date}${c.basho}${c.type}${times(c)}${c.awase}`}>
            <td>
              {c.date}
              {c.honOikiri && " (本追切)"}
            </td>
            <td>{c.basho}</td>
            <td>{[c.type, c.course].filter(Boolean).join(" ")}</td>
            <td>{c.baba}</td>
            <td>{times(c)}</td>
            <td>{[c.oikiri, c.ashiiro].filter(Boolean).join(" ")}</td>
            <td>{c.awase}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 血統表。祖先は二分木順 (父, 母, 父父, ...) で、n 代目は 2^n 頭。左の列ほど行をまたぐ */
function Pedigree({ pedigree }: { pedigree: (PedigreeAncestor | null)[] }) {
  const rows = 2 ** GENERATIONS;
  return (
    <table className="pedigree">
      <tbody>
        {Array.from({ length: rows }, (_, row) => {
          const cells = [];
          for (let generation = 1; generation <= GENERATIONS; generation++) {
            const span = rows / 2 ** generation;
            if (row % span !== 0) {
              continue;
            }
            const ancestor = pedigree[2 ** generation - 2 + row / span] ?? null;
            // 偶数番目 (0 始まり) が父系、奇数番目が母系
            const sire = (row / span) % 2 === 0;
            cells.push(
              <td key={generation} rowSpan={span} className={sire ? "sire" : "dam"}>
                {ancestor ? <Link to={`/umas/${ancestor.id}`}>{ancestor.bamei}</Link> : "-"}
              </td>,
            );
          }
          return <tr key={row}>{cells}</tr>;
        })}
      </tbody>
    </table>
  );
}

export function UmaPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const uma = useApi<UmaDetail>(`/api/umas/${id}`);
  return (
    <Async state={uma}>
      {(u) => {
        const requested = params.get("tab");
        const tab = TABS.find((t) => t.key === requested)?.key ?? TABS[0].key;
        return (
        <>
          <p>
            <Link to="/umas">← 馬の検索</Link>
          </p>
          <h1>{u.bamei}</h1>
          <p className="muted">
            {[u.eigoBamei, u.seibetsu, u.seinen && `${u.seinen}年生`].filter(Boolean).join(" / ")}
          </p>
          <p>
            父:{" "}
            {u.chichi ? <Link to={`/umas/${u.chichi.id}`}>{u.chichi.bamei}</Link> : <span>-</span>}
            {" / "}母:{" "}
            {u.haha ? <Link to={`/umas/${u.haha.id}`}>{u.haha.bamei}</Link> : <span>-</span>}
          </p>
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={t.key === tab ? "active" : ""}
                onClick={() => setParams({ tab: t.key }, { replace: true })}
              >
                {t.key === "senreki"
                  ? `${t.label} (${u.starts.length})`
                  : t.key === "choukyou"
                    ? `${t.label} (${u.choukyou.length})`
                    : t.label}
              </button>
            ))}
          </div>
          {tab === "ketto" ? (
            <Pedigree pedigree={u.pedigree} />
          ) : tab === "choukyou" ? (
            <ChoukyouTable items={u.choukyou} />
          ) : u.starts.length === 0 ? (
            <p className="muted">出走記録はありません</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>レース</th>
                  <th>条件</th>
                  <th className="num">馬番</th>
                  <th className="num">着</th>
                  <th>騎手</th>
                  <th className="num">タイム</th>
                  <th className="num">上り3F</th>
                </tr>
              </thead>
              <tbody>
                {u.starts.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>
                      <Link to={`/races/${s.id}`}>
                        {s.bashoMei}
                        {s.raceBangou}R {s.meishou}
                      </Link>
                    </td>
                    <td>{raceCondition(s)}</td>
                    <td className="num">{s.umaban}</td>
                    <td className="num">{formatChakujun(s.chakujun)}</td>
                    <td>{s.kishuMei}</td>
                    <td className="num">{formatTime(s.time)}</td>
                    <td className="num">{s.agari3F?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
        );
      }}
    </Async>
  );
}
