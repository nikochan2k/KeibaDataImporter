import { Link, useParams } from "react-router";
import { type RaceDetail, useApi } from "../api";
import { Async, raceCondition, raceTitle } from "../components";
import { formatChakujun, formatTime, formatZougen } from "../format";

export function RacePage() {
  const { id } = useParams();
  const race = useApi<RaceDetail>(`/api/races/${id}`);
  return (
    <Async state={race}>
      {(r) => (
        <>
          <p>
            <Link to={`/?date=${r.date}`}>← {r.date} のレース</Link>
          </p>
          <h1>{raceTitle(r)}</h1>
          <p className="muted">
            {r.date} {raceCondition(r)} {r.grade} {r.hassouJikan && `${r.hassouJikan} 発走`}
          </p>
          <table>
            <thead>
              <tr>
                <th className="num">着</th>
                <th className="num">枠</th>
                <th className="num">馬番</th>
                <th>馬名</th>
                <th>性齢</th>
                <th className="num">斤量</th>
                <th>騎手</th>
                <th className="num">タイム</th>
                <th className="num">上り3F</th>
                <th className="num">馬体重</th>
              </tr>
            </thead>
            <tbody>
              {r.entries.map((e) => (
                <tr key={e.shussoubaId}>
                  <td className="num">{formatChakujun(e.chakujun, e.torikeshi)}</td>
                  <td className="num">{e.wakuban}</td>
                  <td className="num">{e.umaban}</td>
                  <td>{e.umaId ? <Link to={`/umas/${e.umaId}`}>{e.bamei}</Link> : e.bamei}</td>
                  <td>
                    {e.seibetsu}
                    {e.nenrei}
                  </td>
                  <td className="num">{e.kinryou}</td>
                  <td>{e.kishuMei}</td>
                  <td className="num">{formatTime(e.time)}</td>
                  <td className="num">{e.agari3F?.toFixed(1)}</td>
                  <td className="num">
                    {e.bataijuu}
                    {e.zougen != null && ` (${formatZougen(e.zougen)})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Async>
  );
}
