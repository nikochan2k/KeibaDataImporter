import { Link, useSearchParams } from "react-router";
import { type RaceDay, type RaceMonth, type RaceSummary, useApi } from "../api";
import { Async, raceCondition } from "../components";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 月のカレンダー。開催のある日だけ、競馬場のリンクを出す */
function Calendar({
  year,
  month,
  days,
  selected,
}: {
  year: number;
  month: number;
  days: RaceDay[];
  selected?: { date: string; basho: number };
}) {
  const byDate = new Map(days.map((d) => [d.date, d.bashos]));
  const lastDay = new Date(year, month, 0).getDate();
  const blanks = new Date(year, month - 1, 1).getDay();
  const cells = [
    ...Array.from({ length: blanks }, () => 0),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  return (
    <div className="calendar">
      {WEEKDAYS.map((w) => (
        <div key={w} className="weekday">
          {w}
        </div>
      ))}
      {cells.map((day, i) => {
        const date = `${ym}-${String(day).padStart(2, "0")}`;
        const bashos = byDate.get(date);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは固定で、前の空白は日付を持たない
          <div key={i} className={bashos ? "day race-day" : "day"}>
            {day > 0 && <span className="day-number">{day}</span>}
            {bashos?.map((b) => (
              <Link
                key={b.basho}
                to={`/?month=${ym}&date=${date}&basho=${b.basho}`}
                className={selected?.date === date && selected.basho === b.basho ? "active" : undefined}
              >
                {b.bashoMei ?? b.basho}
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** 最初にカレンダーを出し、開催のある日の競馬場を選ぶと、そのレースの一覧を出す */
export function RacesPage() {
  const [params, setParams] = useSearchParams();
  const months = useApi<RaceMonth[]>("/api/race-months");
  // 開催のない月は選べない。指定がない、または開催のない月なら最新の月
  const keys = months.data?.map((m) => `${m.year}-${String(m.month).padStart(2, "0")}`);
  const requested = params.get("month");
  const ym = keys && (requested && keys.includes(requested) ? requested : keys[0]);
  const [year, month] = ym ? ym.split("-").map(Number) : [];
  const days = useApi<RaceDay[]>(ym ? `/api/race-days?year=${year}&month=${month}` : null);

  const date = params.get("date") ?? undefined;
  const basho = Number(params.get("basho"));
  const valid = days.data?.find((d) => d.date === date)?.bashos.some((b) => b.basho === basho);
  const races = useApi<RaceSummary[]>(
    valid ? `/api/races?date=${date}&basho=${basho}` : null,
  );

  return (
    <>
      <h1>レース</h1>
      <Async state={months}>
        {(list) =>
          list.length === 0 ? (
            <p className="muted">レースのデータがありません。取り込みを行ってください</p>
          ) : (
            <>
              <div className="filters">
                <select value={ym} onChange={(e) => setParams({ month: e.target.value })}>
                  {list.map((m, i) => (
                    <option key={keys?.[i]} value={keys?.[i]}>
                      {m.year}年{m.month}月
                    </option>
                  ))}
                </select>
              </div>
              {year !== undefined && month !== undefined && days.data && (
                <Calendar
                  year={year}
                  month={month}
                  days={days.data}
                  selected={valid && date ? { date, basho } : undefined}
                />
              )}
            </>
          )
        }
      </Async>
      {days.error && <p className="error">{days.error.message}</p>}
      {valid && date && (
        <h2>
          {date.replaceAll("-", "/")} {days.data?.find((d) => d.date === date)?.bashos.find((b) => b.basho === basho)?.bashoMei}
        </h2>
      )}
      {valid && (
        <Async state={races}>
          {(list) => (
            <table>
              <thead>
                <tr>
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
