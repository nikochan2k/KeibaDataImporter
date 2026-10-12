import { Link, useParams, useSearchParams } from "react-router";
import { type PreviewChoukyou, type PreviewEntry, type RaceDetail, type RaceSummary, useApi } from "../api";
import { Async, raceCondition, raceTitle } from "../components";
import { formatChakujun, formatTime, formatZougen } from "../format";

const TABS = [
  { key: "shutuba", label: "出馬表" },
  { key: "preview", label: "評価" },
  { key: "result", label: "成績表" },
] as const;

/** 複数行セル。値のない行は出さない */
function Lines({ items }: { items: (string | null | undefined | false)[] }) {
  const shown = items.filter((v): v is string => !!v);
  return (
    <td className="lines">
      {shown.map((v, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 並びは固定
        <div key={i}>{v}</div>
      ))}
    </td>
  );
}

const labeled = (name: string, v: string | number | null | undefined) =>
  v != null && v !== "" && `${name} ${v}`;

function times(c: PreviewChoukyou) {
  return c.times
    .filter((t) => t.time != null)
    .map((t) => formatTime(t.time).replace(/^0:/, ""))
    .join(" - ");
}

type Preview = { race: RaceSummary; entries: PreviewEntry[] };

const filled = (o: object) =>
  Object.values(o).some((v) => (Array.isArray(v) ? v.length > 0 : v != null && v !== ""));

/** 状態・評価・予想・調教のどれかが1頭でもあるか */
const hasPreview = (entries: PreviewEntry[]) =>
  entries.some((e) => e.joutai.length > 0 || filled(e.hyouka) || filled(e.yosou) || filled(e.choukyou));

function PreviewTable({ entries }: { entries: PreviewEntry[] }) {
  return (
        <table>
          <thead>
            <tr>
              <th className="num">枠</th>
              <th className="num">馬番</th>
              <th>馬名</th>
              <th>状態</th>
              <th>評価</th>
              <th>予想</th>
              <th>調教</th>
              <th>追切</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.shussoubaId}>
                <td className={`num waku waku${e.wakuban}`}>{e.wakuban}</td>
                <td className="num">{e.umaban}</td>
                <td>{e.umaId ? <Link to={`/umas/${e.umaId}`}>{e.bamei}</Link> : e.bamei}</td>
                <Lines
                  items={["特記", "馬具", "脚元"].map((k) => {
                    const v = e.joutai
                      .filter((j) => j.kubun === k)
                      .map((j) => j.naiyou)
                      .join("、");
                    return labeled(k, v);
                  })}
                />
                <Lines
                  items={[
                    labeled("IDM", e.hyouka.idm),
                    labeled("馬体", e.hyouka.batai),
                    labeled("気配", e.hyouka.kehai),
                    labeled("厩舎評価", e.hyouka.kyuushaHyouka),
                    labeled("パドック", e.hyouka.paddock),
                    labeled("脚元", e.hyouka.ashimoto),
                    labeled("馬具", e.hyouka.bagu),
                  ]}
                />
                <Lines
                  items={[
                    ...e.yosou.shirushi.map((s) => labeled(`印 ${s.name}`, s.mark)),
                    labeled("総合", e.yosou.sougouShisuu),
                    labeled("騎手", e.yosou.kishuShisuu),
                    labeled("情報", e.yosou.jouhouShisuu),
                    labeled("調教", e.yosou.choukyouShisuu),
                    labeled("厩舎", e.yosou.kyuushaShisuu),
                    labeled("人気", e.yosou.ninkiShisuu),
                  ]}
                />
                <Lines
                  items={[
                    e.choukyou.yajirushi,
                    [e.choukyou.type, e.choukyou.ryou, e.choukyou.ryouHyouka].filter(Boolean).join(" "),
                    e.choukyou.tanpyou,
                    labeled("一週前", e.choukyou.isshuumaeShisuu),
                    labeled("追切", e.choukyou.oikiriShisuu),
                    labeled("仕上", e.choukyou.shiageShisuu),
                    e.choukyou.comment,
                  ]}
                />
                <Lines
                  items={e.choukyou.items.map((c) =>
                    [
                      c.date,
                      c.honOikiri && "本",
                      c.basho,
                      [c.type, c.course].filter(Boolean).join(""),
                      c.baba,
                      times(c),
                      [c.oikiri, c.ashiiro].filter(Boolean).join(" "),
                      c.awase,
                    ]
                      .filter(Boolean)
                      .join(" "),
                  )}
                />
              </tr>
            ))}
          </tbody>
        </table>
  );
}

export function RacePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const race = useApi<RaceDetail>(`/api/races/${id}`);
  const preview = useApi<Preview>(`/api/races/${id}/preview`);
  const showPreview = preview.data != null && hasPreview(preview.data.entries);
  return (
    <Async state={race}>
      {(r) => {
        const hasResult = r.entries.some((e) => e.chakujun != null);
        const requested = params.get("tab");
        const tabs = TABS.filter(
          (t) => (t.key !== "result" || hasResult) && (t.key !== "preview" || showPreview),
        );
        const tab = tabs.some((t) => t.key === requested) ? requested : hasResult ? "result" : "shutuba";
        return (
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
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={t.key === tab ? "active" : ""}
                onClick={() => setParams({ tab: t.key }, { replace: true })}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "shutuba" ? (
            <table>
              <thead>
                <tr>
                  <th className="num">枠</th>
                  <th className="num">馬番</th>
                  <th>馬名</th>
                  <th>性齢</th>
                  <th className="num">斤量</th>
                  <th>騎手</th>
                  <th>厩舎</th>
                  <th className="num">馬体重</th>
                  <th className="num">オッズ</th>
                  <th className="num">人気</th>
                </tr>
              </thead>
              <tbody>
                {r.entries.map((e) => (
                  <tr key={e.shussoubaId}>
                    <td className={`num waku waku${e.wakuban}`}>{e.wakuban}</td>
                    <td className="num">{e.umaban}</td>
                    <td>{e.umaId ? <Link to={`/umas/${e.umaId}`}>{e.bamei}</Link> : e.bamei}</td>
                    <td>
                      {e.seibetsu}
                      {e.nenrei}
                    </td>
                    <td className="num">{e.kinryou}</td>
                    <td>{e.kishuMei}</td>
                    <td>
                      {e.choukyoushiMei &&
                        `${e.choukyoushiShozoku ? `[${e.choukyoushiShozoku}] ` : ""}${e.choukyoushiMei}`}
                    </td>
                    <td className="num">
                      {e.bataijuu}
                      {e.zougen != null && ` (${formatZougen(e.zougen)})`}
                    </td>
                    <td className="num">{e.odds?.toFixed(1)}</td>
                    <td className="num">{e.ninki}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "preview" ? (
            <PreviewTable entries={preview.data?.entries ?? []} />
          ) : (
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
                </tr>
              </thead>
              <tbody>
                {r.entries.map((e) => (
                  <tr key={e.shussoubaId}>
                    <td className="num">{formatChakujun(e.chakujun, e.torikeshi)}</td>
                    <td className={`num waku waku${e.wakuban}`}>{e.wakuban}</td>
                    <td className="num">{e.umaban}</td>
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
