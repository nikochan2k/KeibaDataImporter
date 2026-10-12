import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { type PreviewChoukyou, type ShussoubaPreview, useApi } from "../api";
import { Async, raceCondition, raceTitle } from "../components";
import { formatTime } from "../format";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** 値のある項目だけ「名前 値」の表にする */
function Facts({ items }: { items: [string, string | number | null | undefined][] }) {
  const shown = items.filter(([, v]) => v != null && v !== "");
  if (shown.length === 0) {
    return <p className="muted">データなし</p>;
  }
  return (
    <table>
      <tbody>
        {shown.map(([name, value]) => (
          <tr key={name}>
            <th>{name}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function times(c: PreviewChoukyou) {
  return c.times
    .filter((t) => t.time != null)
    .map((t) => formatTime(t.time).replace(/^0:/, ""))
    .join(" - ");
}

export function ShussoubaPage() {
  const { id } = useParams();
  const data = useApi<ShussoubaPreview>(`/api/shussouba/${id}/preview`);
  return (
    <Async state={data}>
      {({ race: r, entry: e }) => (
        <>
          <p>
            <Link to={`/races/${r.id}`}>← {raceTitle(r)}</Link>
          </p>
          <h1>
            {e.umaban}番 {e.umaId ? <Link to={`/umas/${e.umaId}`}>{e.bamei}</Link> : e.bamei}
          </h1>
          <p className="muted">
            {r.date} {raceTitle(r)} {raceCondition(r)} 騎手 {e.kishuMei}
          </p>

          <Section title="状態">
            <Facts
              items={["特記", "馬具", "脚元"].map((kubun): [string, string] => [
                kubun,
                e.joutai
                  .filter((j) => j.kubun === kubun)
                  .map((j) => j.naiyou)
                  .join("、"),
              ])}
            />
          </Section>

          <Section title="評価">
            <Facts
              items={[
                ["IDM", e.hyouka.idm],
                ["馬体", e.hyouka.batai],
                ["気配", e.hyouka.kehai],
                ["厩舎評価", e.hyouka.kyuushaHyouka],
                ["パドック", e.hyouka.paddock],
                ["脚元", e.hyouka.ashimoto],
                ["馬具・その他", e.hyouka.bagu],
              ]}
            />
          </Section>

          <Section title="予想">
            <Facts
              items={[
                ...e.yosou.shirushi.map((s): [string, string] => [`印 ${s.name}`, s.mark]),
                ["総合指数", e.yosou.sougouShisuu],
                ["IDM", e.yosou.idm],
                ["騎手指数", e.yosou.kishuShisuu],
                ["情報指数", e.yosou.jouhouShisuu],
                ["調教指数", e.yosou.choukyouShisuu],
                ["厩舎指数", e.yosou.kyuushaShisuu],
                ["人気指数", e.yosou.ninkiShisuu],
              ]}
            />
          </Section>

          <Section title="調教">
            <Facts
              items={[
                ["矢印", e.choukyou.yajirushi],
                ["タイプ", e.choukyou.type],
                ["量", e.choukyou.ryou],
                ["量評価", e.choukyou.ryouHyouka],
                ["短評", e.choukyou.tanpyou],
                ["一週前追切指数", e.choukyou.isshuumaeShisuu],
                ["追切指数", e.choukyou.oikiriShisuu],
                ["仕上指数", e.choukyou.shiageShisuu],
                ["仕上指数変化", e.choukyou.shiageHenka],
                ["コメント", e.choukyou.comment],
              ]}
            />
            {e.choukyou.items.length > 0 && (
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
                    <th>矢印</th>
                  </tr>
                </thead>
                <tbody>
                  {e.choukyou.items.map((c) => (
                    <tr key={`${c.date}${c.basho}${c.type}${times(c)}`}>
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
                      <td>{c.yajirushi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </>
      )}
    </Async>
  );
}
