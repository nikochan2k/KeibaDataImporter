import { Link, useSearchParams } from "react-router";
import { type BashoOption, type RaceSummary, useApi } from "../api";
import { Async, raceCondition } from "../components";

/** 年と競馬場を選んで、そのレースの一覧から選ぶ。最初は何も選ばれていない */
export function RacesPage() {
  const [params, setParams] = useSearchParams();
  const years = useApi<number[]>("/api/race-years");
  const year = Number(params.get("year")) || undefined;
  const bashos = useApi<BashoOption[]>(year ? `/api/race-bashos?year=${year}` : null);
  // 年を変えたとき、その年に開催のない競馬場は選ばれていないことにする
  const requested = Number(params.get("basho"));
  const basho = bashos.data?.find((b) => b.basho === requested)?.basho;
  const races = useApi<RaceSummary[]>(
    year && basho !== undefined ? `/api/races?year=${year}&basho=${basho}` : null,
  );

  return (
    <>
      <h1>レース</h1>
      <Async state={years}>
        {(list) =>
          list.length === 0 ? (
            <p className="muted">レースのデータがありません。取り込みを行ってください</p>
          ) : (
            <p>
              <select
                value={year ?? ""}
                onChange={(e) => setParams(e.target.value ? { year: e.target.value } : {})}
              >
                <option value="">年を選択</option>
                {list.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>{" "}
              <select
                value={basho ?? ""}
                disabled={!bashos.data}
                onChange={(e) =>
                  setParams(
                    e.target.value ? { year: String(year), basho: e.target.value } : { year: String(year) },
                  )
                }
              >
                <option value="">競馬場を選択</option>
                {bashos.data?.map((b) => (
                  <option key={b.basho} value={b.basho}>
                    {b.bashoMei ?? b.basho}
                  </option>
                ))}
              </select>
            </p>
          )
        }
      </Async>
      {years.data && years.data.length > 0 && basho === undefined && (
        <p className="muted">
          {!year
            ? "年を選択してください"
            : bashos.data?.length === 0
              ? "この年のレースはありません"
              : bashos.data && "競馬場を選択してください"}
        </p>
      )}
      {bashos.error && <p className="error">{bashos.error.message}</p>}
      {races.data && (
        <Async state={races}>
          {(list) => (
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th className="num">R</th>
                  <th>レース</th>
                  <th>条件</th>
                  <th>格</th>
                  <th className="num">頭数</th>
                  <th>発走</th>
                </tr>
              </thead>
              <tbody>
                {list.map((race, i) => (
                  <tr key={race.id}>
                    <td>{race.date !== list[i - 1]?.date && race.date.slice(5).replace("-", "/")}</td>
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
          )}
        </Async>
      )}
    </>
  );
}
