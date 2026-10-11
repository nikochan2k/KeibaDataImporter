import { Link, useSearchParams } from "react-router";
import { type RaceSummary, useApi } from "../api";
import { Async, raceCondition } from "../components";
import { today } from "../format";

/** 日付ごとのレース一覧。同じ月の開催日から選べる */
export function RacesPage() {
  const [params, setParams] = useSearchParams();
  const date = params.get("date") ?? today();
  const [year, month] = date.split("-");
  const dates = useApi<string[]>(`/api/race-dates?year=${Number(year)}&month=${Number(month)}`);
  const races = useApi<RaceSummary[]>(`/api/races?date=${date}`);

  return (
    <>
      <h1>レース</h1>
      <p>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setParams({ date: e.target.value })}
        />
      </p>
      {dates.data && (
        <p className="chips">
          {dates.data.length === 0 && <span className="muted">この月の開催はありません</span>}
          {dates.data.map((d) => (
            <button
              key={d}
              type="button"
              className={d === date ? "chip active" : "chip"}
              onClick={() => setParams({ date: d })}
            >
              {Number(d.slice(8))}日
            </button>
          ))}
        </p>
      )}
      <Async state={races}>
        {(list) =>
          list.length === 0 ? (
            <p className="muted">この日のレースはありません</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>場所</th>
                  <th className="num">R</th>
                  <th>レース</th>
                  <th>条件</th>
                  <th>格</th>
                  <th className="num">頭数</th>
                  <th>発走</th>
                </tr>
              </thead>
              <tbody>
                {list.map((race) => (
                  <tr key={race.id}>
                    <td>{race.bashoMei}</td>
                    <td className="num">{race.raceBangou}</td>
                    <td>
                      <Link to={`/races/${race.id}`}>{race.meishou ?? `${race.raceBangou}R`}</Link>
                    </td>
                    <td>{raceCondition(race)}</td>
                    <td>{race.grade}</td>
                    <td className="num">{race.tousuu}</td>
                    <td>{race.hassouJikan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Async>
    </>
  );
}
