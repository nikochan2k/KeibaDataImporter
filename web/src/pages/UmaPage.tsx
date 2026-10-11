import { Link, useParams } from "react-router";
import { type UmaDetail, useApi } from "../api";
import { Async, raceCondition } from "../components";
import { formatChakujun, formatTime } from "../format";

export function UmaPage() {
  const { id } = useParams();
  const uma = useApi<UmaDetail>(`/api/umas/${id}`);
  return (
    <Async state={uma}>
      {(u) => (
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
          <h2>出走レース ({u.starts.length})</h2>
          {u.starts.length === 0 ? (
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
      )}
    </Async>
  );
}
