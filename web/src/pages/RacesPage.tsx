import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { type RaceDay, type RaceMonth, type RaceSummary, useApi } from "../api";
import { Async, raceCondition } from "../components";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 場コードが中央競馬(京都 0 〜 函館 9)かどうか。それ以外は地方・外国 */
const isChuou = (basho: number) => 0 <= basho && basho <= 9;

/** 月のカレンダー。開催のある日だけ、競馬場のリンクを出す */
function Calendar({
  year,
  month,
  days,
  selected,
  onPick,
}: {
  year: number;
  month: number;
  days: RaceDay[];
  selected?: { date: string; basho: number };
  onPick: () => void;
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
          <div key={i} className={bashos?.some((b) => isChuou(b.basho)) ? "day race-day" : "day"}>
            {day > 0 && <span className="day-number">{day}</span>}
            {bashos?.map((b) => (
              <Link
                key={b.basho}
                to={`/?month=${ym}&date=${date}&basho=${b.basho}`}
                onClick={onPick}
                className={
                  [
                    selected?.date === date && selected.basho === b.basho && "active",
                    !isChuou(b.basho) && "local",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
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

  // 前後の開催へ移るため、隣の開催月も読む(月をまたぐ移動用)
  const monthIndex = keys?.indexOf(ym ?? "") ?? -1;
  const neighborUrl = (i: number) => {
    const key = keys?.[i];
    return key ? `/api/race-days?year=${key.slice(0, 4)}&month=${Number(key.slice(5))}` : null;
  };
  const prevDays = useApi<RaceDay[]>(monthIndex >= 0 ? neighborUrl(monthIndex + 1) : null);
  const nextDays = useApi<RaceDay[]>(monthIndex >= 0 ? neighborUrl(monthIndex - 1) : null);

  const date = params.get("date") ?? undefined;
  // 京都は場コード 0 なので、指定がないときを Number(null) の 0 にしない
  const bashoParam = params.get("basho");
  const basho = bashoParam === null ? Number.NaN : Number(bashoParam);
  const valid = days.data?.find((d) => d.date === date)?.bashos.some((b) => b.basho === basho);
  // 中央競馬の開催(日付と場)を古い順に並べ、選んでいる開催の前後を求める
  const chuou = [prevDays.data, days.data, nextDays.data]
    .flatMap((list) => list ?? [])
    .flatMap((d) => d.bashos.filter((b) => isChuou(b.basho)).map((b) => ({ date: d.date, basho: b.basho })))
    .sort((a, b) => a.date.localeCompare(b.date));
  const at = valid && date ? chuou.findIndex((e) => e.date === date && e.basho === basho) : -1;
  // 選んでいるのが地方などで一覧にないときは、日付で前後を決める
  const prevRace = valid && date ? (at >= 0 ? chuou[at - 1] : chuou.findLast((e) => e.date < date)) : undefined;
  const nextRace = valid && date ? (at >= 0 ? chuou[at + 1] : chuou.find((e) => e.date > date)) : undefined;
  const goRace = (e: { date: string; basho: number }) => {
    setParams({ month: e.date.slice(0, 7), date: e.date, basho: String(e.basho) });
    setOpened(false);
  };
  const races = useApi<RaceSummary[]>(valid ? `/api/races?date=${date}&basho=${basho}` : null);
  const selectedMei = days.data?.find((d) => d.date === date)?.bashos.find((b) => b.basho === basho)?.bashoMei;

  // カレンダーは、月を選ぶと開き、開催を選ぶと閉じる。まだ何も選んでいなければ最初は開いている
  const [opened, setOpened] = useState<boolean>();
  const open = opened ?? !valid;
  const picker = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !picker.current?.contains(e.target as Node)) {
        setOpened(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="fill">
      <h1>レース</h1>
      <Async state={months}>
        {(list) => {
          const index = monthIndex;
          const move = (i: number) => keys?.[i] && setParams({ month: keys[i] });
          return list.length === 0 ? (
            <p className="muted">レースのデータがありません。取り込みを行ってください</p>
          ) : (
            <div className="picker" ref={picker}>
              <div className="filters">
                <button type="button" aria-label="前の開催" disabled={!prevRace} onClick={() => prevRace && goRace(prevRace)}>
                  ◀
                </button>
                <button type="button" onClick={() => setOpened(!open)} aria-expanded={open}>
                  {valid && date ? `${date.replaceAll("-", "/")} ${selectedMei ?? basho}` : "開催日を選択"}
                </button>
                <button type="button" aria-label="次の開催" disabled={!nextRace} onClick={() => nextRace && goRace(nextRace)}>
                  ▶
                </button>
              </div>
              {open && year !== undefined && month !== undefined && days.data && (
                <div className="popover">
                  <div className="month-nav">
                    <button type="button" aria-label="前の月" disabled={index + 1 >= list.length} onClick={() => move(index + 1)}>
                      ◀
                    </button>
                    <select
                      aria-label="年"
                      value={year}
                      onChange={(e) => {
                        // 年を変えたら、その年にある月のうち今の月に最も近いものへ
                        const near = list
                          .filter((m) => m.year === Number(e.target.value))
                          .sort((x, y) => Math.abs(x.month - month) - Math.abs(y.month - month))[0];
                        if (near) {
                          setParams({ month: `${near.year}-${String(near.month).padStart(2, "0")}` });
                        }
                      }}
                    >
                      {[...new Set(list.map((m) => m.year))].map((y) => (
                        <option key={y} value={y}>
                          {y}年
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="月"
                      value={month}
                      onChange={(e) => setParams({ month: `${year}-${e.target.value.padStart(2, "0")}` })}
                    >
                      {list
                        .filter((m) => m.year === year)
                        .map((m) => (
                          <option key={m.month} value={m.month}>
                            {m.month}月
                          </option>
                        ))}
                    </select>
                    <button type="button" aria-label="次の月" disabled={index <= 0} onClick={() => move(index - 1)}>
                      ▶
                    </button>
                  </div>
                  <Calendar
                    year={year}
                    month={month}
                    days={days.data}
                    selected={valid && date ? { date, basho } : undefined}
                    onPick={() => setOpened(false)}
                  />
                </div>
              )}
            </div>
          );
        }}
      </Async>
      {days.error && <p className="error">{days.error.message}</p>}
      {valid && (
        <Async state={races}>
          {(list) => (
            <div className="scroll">
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
            </div>
          )}
        </Async>
      )}
    </div>
  );
}
