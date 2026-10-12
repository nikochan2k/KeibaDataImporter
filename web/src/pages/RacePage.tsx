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
            <Link to={`/?year=${r.date.slice(0, 4)}&basho=${r.basho}`}>
              ← {r.date.slice(0, 4)}年 {r.bashoMei} のレース
            </Link>
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
                <th>着差</th>
                <th className="num">人気</th>
                <th className="num">単勝</th>
                <th className="num">後3F</th>
                <th>通過</th>
                <th>厩舎</th>
                <th className="num">馬体重</th>
                <th>出走前情報</th>
              </tr>
            </thead>
            <tbody>
              {r.entries.map((e) => (
                <tr key={e.shussoubaId}>
                  <td className="num">{formatChakujun(e.chakujun, e.torikeshi)}</td>
                  <td className={`num waku waku${e.wakuban}`}>{e.wakuban}</td>
                  <td className={`num waku waku${e.wakuban}`}>{e.umaban}</td>
                  <td>{e.umaId ? <Link to={`/umas/${e.umaId}`}>{e.bamei}</Link> : e.bamei}</td>
                  <td>
                    {e.seibetsu}
                    {e.nenrei}
                  </td>
                  <td className="num">{e.kinryou}</td>
                  <td>{e.kishuMei}</td>
                  <td className="num">{formatTime(e.time)}</td>
                  <td>{e.chakusa}</td>
                  <td className="num">{e.ninki}</td>
                  <td className="num">{e.odds?.toFixed(1)}</td>
                  <td className="num">{e.agari3F?.toFixed(1)}</td>
                  <td>{e.tsuuka}</td>
                  <td>
                    {e.choukyoushiMei &&
                      `${e.choukyoushiShozoku ? `[${e.choukyoushiShozoku}] ` : ""}${e.choukyoushiMei}`}
                  </td>
                  <td className="num">
                    {e.bataijuu}
                    {e.zougen != null && ` (${formatZougen(e.zougen)})`}
                  </td>
                  <td>
                    <Link to={`/shussouba/${e.shussoubaId}`}>詳細</Link>
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
