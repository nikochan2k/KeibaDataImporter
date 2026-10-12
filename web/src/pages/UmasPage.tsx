import { Link, useSearchParams } from "react-router";
import { type UmaSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function UmasPage() {
  const { q, inputProps } = useIncrementalSearch();
  const [params, setParams] = useSearchParams();
  const racehorseOnly = params.get("all") !== "1";
  const result = useApi<UmaSummary[]>(
    q ? `/api/umas?q=${encodeURIComponent(q)}&racehorse=${racehorseOnly ? 1 : 0}` : null,
  );
  const toggleRacehorseOnly = (checked: boolean) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (checked) next.delete("all");
        else next.set("all", "1");
        return next;
      },
      { replace: true },
    );

  return (
    <div className="fill">
      <h1>馬</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="馬名の先頭(カナ・英字)"
          {...inputProps}
        />{" "}
        <span className="muted">前方一致(入力した文字で始まる馬名)</span>{" "}
        <label className="check">
          <input
            type="checkbox"
            checked={racehorseOnly}
            onChange={(e) => toggleRacehorseOnly(e.target.checked)}
          />
          競走馬のみ
        </label>
      </form>
      {q && (
        <Async state={result}>
          {(list) =>
            list.length === 0 ? (
              <p className="muted">見つかりませんでした</p>
            ) : (
              <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>馬名</th>
                    <th>英字名</th>
                    <th>性</th>
                    <th className="num">生年</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((uma) => (
                    <tr key={uma.id}>
                      <td>
                        <Link to={`/umas/${uma.id}`}>{uma.bamei}</Link>
                      </td>
                      <td>{uma.eigoBamei}</td>
                      <td>{uma.seibetsu}</td>
                      <td className="num">{uma.seinen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )
          }
        </Async>
      )}
    </div>
  );
}
